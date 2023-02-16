import { Router } from "express";
import cron from "node-cron";

import { logger } from "../utils/logger";
import { Analytics } from "../models";
import { sendAnalyticsToDiscords, sendAnalyticsToDiscordBotList, sendAnalyticsToTopGG } from "../services/sendAnalyticsToExternalSites";
import { ENABLE_ANALYTIC_SENDING, ENVIRONMENT } from "../utils/config";

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
  else return body as { guildAmount: number; userAmount: number };
};

router.post("/update", async (req, res) => {
  try {
    const { guildAmount, userAmount } = parseAnalyticsBody(req.body);
    await Analytics.create({ guildAmount, userAmount });

    return res.status(200).end();
  } catch (error) {
    if (error instanceof Error)
      return res.status(400).json({ error: error.message });
    else return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const analytics = await Analytics.findOne({}).sort({ createdAt: -1 });

    if (analytics === null)
      return res.status(404).json({ error: "No analytics found" });

    return res.status(200).json(analytics);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const sendAnalytics = async () => {
  logger.info("Beginning to POST analytics to external Discord bot sites");
  const latestAnalytic = await Analytics.findOne({}).sort({ createdAt: -1 });

  if(!latestAnalytic){
    logger.error("Cancelled POST:ing analytics to external Discord bot sites because no analytics were found");
    return;
  }

  const guildAmount = latestAnalytic.guildAmount;

  await Promise.all([
    sendAnalyticsToTopGG(guildAmount),
    sendAnalyticsToDiscordBotList(guildAmount),
    sendAnalyticsToDiscords(guildAmount)
  ]);

  logger.info("Finished POST:ing analytics to external Discord bot sites");
};

if (ENABLE_ANALYTIC_SENDING && ENVIRONMENT !== "test") {
  sendAnalytics();
  logger.info("Scheduling cronjob for POST:ing analytics data to external Discord bot sites");

  // Every 6 hours and 1 minute
  cron.schedule("1 */6 * * *", () => sendAnalytics());
} else logger.info("Not scheduling cronjob for POST:ing analytics data to external Discord bot sites because ENABLE_ANALYTIC_SENDING is false");

export default router;
