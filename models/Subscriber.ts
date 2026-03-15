import mongoose, { Schema, Model } from "mongoose";
import { ISubscriber } from "@/types";

const SubscriberSchema = new Schema<ISubscriber>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["active", "unsubscribed"],
      default: "active",
    },
  },
  { timestamps: true },
);

const Subscriber: Model<ISubscriber> =
  mongoose.models.Subscriber ??
  mongoose.model<ISubscriber>("Subscriber", SubscriberSchema);

export default Subscriber;
