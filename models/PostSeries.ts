import mongoose, { Schema, Model } from "mongoose";
import { IPostSeries } from "@/types";

const PostSeriesSchema = new Schema<IPostSeries>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
  },
  { timestamps: true },
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models["PostSeries"];
}

const PostSeries: Model<IPostSeries> =
  mongoose.models.PostSeries ??
  mongoose.model<IPostSeries>("PostSeries", PostSeriesSchema);

export default PostSeries;
