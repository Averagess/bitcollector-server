import mongoose from "mongoose";
import mongooseLong from "mongoose-long";

import { PlayerInterface } from "../types";

mongooseLong(mongoose);

const Long = mongoose.Schema.Types.Long;

const PlayerSchema = new mongoose.Schema<PlayerInterface>({
  discordDisplayName: {
    type: String,
    required: true,
  },
  discordId: {
    type: String,
    required: true,
  },
  balance: {
    type: Long,
    required: true,
  },
  cps: {
    type: mongoose.Schema.Types.Number,
    required: true,
    default: 0,
  },
  inventory: [{ name: String, price: Number, cps: Number, amount: Number }],
  lastDaily: {
    type: Date,
    default: null,
  },
  dailyCount: {
    type: Number,
    default: 0
  },
  unopenedCrates: {
    type: Number,
    default: 0
  },
  openedCrates: {
    type: Number,
    default: 0
  },
  blacklisted: {
    type: { reason: String, started: Date },
    default: null
  },
  blacklistHistory: [{ reason: String, started: Date, ended: Date }]
}, { timestamps: true });

PlayerSchema.set("toJSON", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (document: any, returnedObject: any) => {
    returnedObject.balance = returnedObject.balance.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});


export default mongoose.model<PlayerInterface>("Player", PlayerSchema);