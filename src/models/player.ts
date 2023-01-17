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


interface Player {
  discordDisplayName: string
  discordId: string
  balance: typeof Long | string
  cps: number
  inventory: InventoryItem[]
  createdAt: Date
  updatedAt: Date
}

const PlayerSchema = new mongoose.Schema<Player>({
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
    type: Number,
    required: true,
    default: 0,
  },
  inventory: [{ name: String, price: Number, cps: Number, amount: Number }],
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
})

PlayerSchema.set("toJSON", {
  transform: (document: any, returnedObject: any) => {
    returnedObject.balance = returnedObject.balance.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});


export default mongoose.model<Player>('Player', PlayerSchema)
