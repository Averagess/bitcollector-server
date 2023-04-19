import { Router } from "express";
import cron from "node-cron";

import { logger } from "../utils/logger";
import { Analytics } from "../models";
import {
  sendAnalyticsToDiscords,
  sendAnalyticsToDiscordBotList,
  sendAnalyticsToTopGG,
  sendAnalyticsToDiscordBots,
} from "../services/sendAnalyticsToExternalSites";
import { ENABLE_ANALYTIC_SENDING, ENVIRONMENT } from "../utils/config";
import isString from "../utils/isString";

const router = Router();

const parseAnalyticsBody = (body: unknown) => {
  if (typeof body !== "object" || body === null)
    throw new Error("Body wasnt an object or was null");
  else if (!("guildAmount" in body) || !("userAmount" in body))
    throw new Error("Body was missing guildAmount or userAmount");
  else if (
    typeof body.guildAmount !== "number" ||
    typeof body.userAmount !== "number"
  )
    throw new Error("Body had invalid type guildAmount or userAmount");
  else return { guildAmount: body.guildAmount, userAmount: body.userAmount };
};

router.post("/update", async (req, res) => {
  try {
    const { guildAmount, userAmount } = parseAnalyticsBody(req.body);

    const mostRecent = await Analytics.findOne({}).sort({ createdAt: -1 });

    if (
      mostRecent &&
      mostRecent.guildAmount === guildAmount &&
      mostRecent.userAmount === userAmount
    ) {
      logger.info(
        "Analytics data was the same as the most recent data in database, not creating a new document."
      );
      logger.info(
        `New analytics data: { guildAmount: ${guildAmount}, userAmount: ${userAmount} }, most recent analytics data: { guildAmount: ${mostRecent.guildAmount}, userAmount: ${mostRecent.userAmount} }`
      );
      return res.status(200).end();
    }

    await Analytics.create({ guildAmount, userAmount });

    return res.status(201).end();
  } catch (error) {
    if (error instanceof Error)
      return res.status(400).json({ error: error.message });
    else return res.status(500).json({ error: "Internal Server Error" });
  }
});

const parseAmount = (amount: unknown) => {
  if (
    (typeof amount === "number" && amount > 0) ||
    (typeof amount === "string" && !isNaN(Number(amount)))
  ) {
    return Number(amount);
  } else throw new Error("Invalid amount specified");
};

const parseDate = (date: unknown) => {
  if (isString(date) && !isNaN(Date.parse(date))) {
    return new Date(date);
  }
  throw new Error("Invalid date specified");
};

router.get("/", async (req, res) => {
  const { amount, before, after } = req.query;

  let numAmount: number | undefined;
  let beforeDate: Date | undefined;
  let afterDate: Date | undefined;

  try {
    numAmount = amount && parseAmount(amount);
    beforeDate = before && parseDate(before);
    afterDate = after && parseDate(after);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    const params =
      beforeDate || afterDate
        ? {
          createdAt: {},
        }
        : {};

    beforeDate && (params.createdAt["$lte"] = beforeDate);
    afterDate && (params.createdAt["$gte"] = afterDate);

    const analytics = await Analytics.find(params)
      .sort({ createdAt: -1 })
      .limit(numAmount && numAmount);

    if (analytics.length === 0)
      return res.status(404).json({ error: "No analytics found" });

    return res.status(200).json(analytics);
  } catch (error) {
    console.log(`Unexpected error happened when an user tried to fetch analytics: ${error}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const sendAnalytics = async () => {
  logger.info("Beginning to POST analytics to external Discord bot sites");
  const latestAnalytic = await Analytics.findOne({}).sort({ createdAt: -1 });

  if (!latestAnalytic) {
    logger.error(
      "Cancelled POST:ing analytics to external Discord bot sites because no analytics were found"
    );
    return;
  }

  const guildAmount = latestAnalytic.guildAmount;

  await Promise.all([
    sendAnalyticsToTopGG(guildAmount),
    sendAnalyticsToDiscordBotList(guildAmount),
    sendAnalyticsToDiscords(guildAmount),
    sendAnalyticsToDiscordBots(guildAmount),
  ]);

  logger.info("Finished POST:ing analytics to external Discord bot sites");
};

if (ENABLE_ANALYTIC_SENDING && ENVIRONMENT !== "test") {
  sendAnalytics();
  logger.info(
    "Scheduling cronjob for POST:ing analytics data to external Discord bot sites"
  );

  // Every 6 hours and 1 minute
  cron.schedule("1 */6 * * *", () => sendAnalytics());
} else
  logger.info(
    "Not scheduling cronjob for POST:ing analytics data to external Discord bot sites because ENABLE_ANALYTIC_SENDING is false"
  );

export default router;
