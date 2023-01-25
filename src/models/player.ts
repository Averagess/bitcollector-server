import mongoose from 'mongoose'
import mongooseLong from 'mongoose-long'

mongooseLong(mongoose)

export interface Item {
  name: string
  price: number
  cps: number
}

interface InventoryItem extends Item {
  amount: number
}

const Long = mongoose.Schema.Types.Long


export interface PlayerInterface {
  discordDisplayName: string
  discordId: string
  balance: typeof Long | string
  cps: number
  inventory: InventoryItem[]
  lastDaily: Date
  dailyCount: number
  unopenedCrates: number
  openedCrates: number
  blacklisted: { reason: string, started: Date }
  blacklistHistory?: { reason: string, started: Date, ended: Date }[]
  createdAt: Date
  updatedAt: Date
}

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
}, { timestamps: true })

PlayerSchema.set("toJSON", {
  transform: (document: any, returnedObject: any) => {
    returnedObject.balance = returnedObject.balance.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});


export default mongoose.model<PlayerInterface>('Player', PlayerSchema)