import { createCanvas, loadImage } from "canvas";

import { calcMinutesAfterDate, calcMinutesToDate } from "./calcMinutesHelper";
import { PlayerInLeaderboard, PlayerInterface } from "../types";

const autoCropName = (text: string): string => {
  const tag = text.slice(-5);
  const nameWithoutTag = text.slice(0, -5);
  if (nameWithoutTag.length >= 18) return nameWithoutTag + "..." + tag;
  return text;
};

const autoFontSize = (text: string, normalSize: number): string => {
  if (text.length > 15) return Math.round(400 / text.length) + "px";
  return normalSize + "px";
};

const readableNumber = (value: string): string => {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

interface generateLeaderboardParams {
  players: PlayerInterface[] | PlayerInLeaderboard[]
  createdAt: Date
  nextUpdate: Date
}

export const generateLeaderboard = async ({
  players,
  createdAt,
  nextUpdate,
}: generateLeaderboardParams): Promise<Buffer> => {
  const canvas = createCanvas(800, 500);
  const ctx = canvas.getContext("2d");

  const bg = await loadImage("./src/resources/backdrop-wide.png");
  ctx.drawImage(bg, 0, 0, 800, 500);

  players.forEach((player, index) => {
    const capitalizedUsername = (player.discordDisplayName.split(""))[0].toUpperCase() + player.discordDisplayName.slice(1);
    const croppedUsername = autoCropName(capitalizedUsername);

    const balanceReadable = readableNumber(player.balance.toString());
    const cpsReadable = readableNumber(player.cps.toString());
    const usernameFontSize = autoFontSize(croppedUsername, 25);

    if (index < 5) {
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `${36}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText(`${index + 1}.`, 50, 70 + index * 80);

      ctx.font = `${usernameFontSize} Arial`;
      ctx.textAlign = "left";
      ctx.fillText(`${croppedUsername}`, 90, 70 + index * 80);

      ctx.textAlign = "center";
      ctx.font = `${15}px Arial`;

      ctx.fillText("Balance", 50, 90 + index * 80);
      ctx.textAlign = "left";
      ctx.fillText(`${balanceReadable} Bits`, 90, 90 + index * 80);
      ctx.textAlign = "center";
      ctx.fillText("CPS", 50, 110 + index * 80);
      ctx.textAlign = "left";
      ctx.fillText(`${cpsReadable} Bits/s`, 90, 110 + index * 80);
    } else {
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `${36}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText(`${index + 1}.`, 500, 70 + (index - 5) * 80);

      ctx.font = `${usernameFontSize} Arial`;
      ctx.textAlign = "left";
      ctx.fillText(`${croppedUsername}`, 540, 70 + (index - 5) * 80);

      ctx.font = `${15}px Arial`;
      ctx.textAlign = "center";

      ctx.fillText("Balance", 500, 90 + (index - 5) * 80);
      ctx.textAlign = "left";
      ctx.fillText(`${balanceReadable} Bits`, 540, 90 + (index - 5) * 80);
      ctx.textAlign = "center";
      ctx.fillText("CPS", 500, 110 + (index - 5) * 80);
      ctx.textAlign = "left";
      ctx.fillText(`${cpsReadable} Bits/s`, 540, 110 + (index - 5) * 80);
    }
  });
  ctx.fillStyle = "#808080";
  ctx.font = `${15}px Arial`;
  ctx.textAlign = "center";

  const now = new Date();
  const minutesSinceCreation = calcMinutesAfterDate(createdAt);
  const minutesToUpdate = calcMinutesToDate(now, nextUpdate);

  ctx.fillText(
    `Leaderboard updated ${minutesSinceCreation} minutes ago, next update in ${minutesToUpdate} minutes`,
    400,
    470
  );

  return canvas.toBuffer("image/png");
};