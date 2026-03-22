import mongoose, { Schema, Model } from "mongoose";
import { ISubscriber } from "@/types";

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["active", "unsubscribed"],
      default: "active",
    },
    unsubscribeToken: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models["Subscriber"];
}

const Subscriber: Model<ISubscriber> = mongoose.models.Subscriber ?? mongoose.model<ISubscriber>("Subscriber", SubscriberSchema);

export default Subscriber;
