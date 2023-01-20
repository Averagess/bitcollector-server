import mongoose from "mongoose"


interface BlacklistItemInterface {
  discordId: string
  reason: string
  createdAt: Date
  updatedAt: Date
}

const BlacklistItemSchema = new mongoose.Schema<BlacklistItemInterface>({
  discordId: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
}, { timestamps: true, collection: "blacklist" })

export default mongoose.model<BlacklistItemInterface>("BlacklistItem", BlacklistItemSchema)