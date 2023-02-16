import mongoose from "mongoose";

interface Analytics {
  guildAmount: number;
  userAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema = new mongoose.Schema<Analytics>(
  {
    guildAmount: {
      type: Number,
      required: true,
    },
    userAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<Analytics>("Analytics", AnalyticsSchema);
