import { Request } from "express";
import mongoose, { Document, Types } from "mongoose";
import mongooseLong from 'mongoose-long'

mongooseLong(mongoose)

const Long = mongoose.Schema.Types.Long

export interface Item {
  name: string
  price: number
  cps: number
}

interface InventoryItem extends Item {
  amount: number
}
export interface PlayerInterface {
  discordDisplayName: string
  discordId: string
  balance: typeof Long | string
  cps: number
  inventory: InventoryItem[]
  lastDaily: Date | null
  dailyCount: number
  unopenedCrates: number
  openedCrates: number
  blacklisted: { reason: string, started: Date }
  blacklistHistory?: { reason: string, started: Date, ended: Date }[]
  createdAt: Date
  updatedAt: Date
}

export interface ExtendedRequest extends Request {
  player?: Document<unknown, any, PlayerInterface> &
    PlayerInterface & {
      _id: Types.ObjectId;
    };
}

export interface BalanceUpdaterArguments {
  oldBalance: bigint;
  cps: number;
  updatedAt: Date;
}

export interface PlayerInLeaderboard {
  discordDisplayName: string;
  discordId: string;
  cps: number;
  balance: string;
}

export interface LeaderboardObject {
  players: PlayerInLeaderboard[] | null;
  createdAt: Date | null;
  nextUpdate: Date | null;
}