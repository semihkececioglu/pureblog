import mongoose, { Schema, Model } from "mongoose";
import { IPost } from "@/types";

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true, maxlength: 160 },
    coverImage: { type: String },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    tags: [{ type: String }],
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    readingTime: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    reactions: {
      like: { type: Number, default: 0 },
      heart: { type: Number, default: 0 },
      fire: { type: Number, default: 0 },
    },
    publishedAt: { type: Date },
  },
  { timestamps: true },
);

PostSchema.index({ title: "text", content: "text" });

const Post: Model<IPost> =
  mongoose.models.Post ?? mongoose.model<IPost>("Post", PostSchema);

export default Post;
