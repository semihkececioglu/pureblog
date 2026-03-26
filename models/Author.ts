import mongoose, { Schema, Model } from "mongoose";
import { IAuthor } from "@/types";

const AuthorSchema = new Schema<IAuthor>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    bio: { type: String },
    avatar: { type: String },
    social: {
      twitter: { type: String },
      instagram: { type: String },
      linkedin: { type: String },
      github: { type: String },
      website: { type: String },
    },
  },
  { timestamps: true },
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models["Author"];
}

const Author: Model<IAuthor> =
  mongoose.models.Author ?? mongoose.model<IAuthor>("Author", AuthorSchema);

export default Author;
