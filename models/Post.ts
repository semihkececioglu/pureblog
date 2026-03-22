import mongoose, { Schema, Model } from "mongoose";
import { IPost } from "@/types";

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true, maxlength: 160 },
    coverImage: { type: String },
    featured: { type: Boolean, default: false },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    tags: [{ type: String }],
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    views: { type: Number, default: 0 },
    reactions: {
      heart: { type: Number, default: 0 },
    },
    publishedAt: { type: Date },
    scheduledAt: { type: Date },
    previewToken: { type: String, unique: true, sparse: true },
    series: { type: Schema.Types.ObjectId, ref: "PostSeries" },
    seriesOrder: { type: Number },
    readingTime: { type: Number, default: 0 },
  },
  { timestamps: true },
);

PostSchema.index({ title: "text", content: "text" });
PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ status: 1, featured: 1, publishedAt: -1 });
PostSchema.index({ status: 1, category: 1, publishedAt: -1 });
PostSchema.index({ status: 1, tags: 1, publishedAt: -1 });
PostSchema.index({ status: 1, series: 1, seriesOrder: 1 });
PostSchema.index({ status: 1, scheduledAt: 1 });

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models["Post"];
}

const Post: Model<IPost> = mongoose.models.Post ?? mongoose.model<IPost>("Post", PostSchema);

export default Post;
