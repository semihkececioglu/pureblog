import mongoose, { Schema, Model } from "mongoose";
import { ICategory } from "@/types";

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true },
);

const Category: Model<ICategory> =
  mongoose.models.Category ??
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
