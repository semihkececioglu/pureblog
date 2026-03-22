import mongoose, { Schema, Model } from "mongoose";
import { IComment } from "@/types";

const CommentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    parentCommentId: { type: Schema.Types.ObjectId, ref: "Comment", sparse: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

CommentSchema.index({ postId: 1, status: 1 });

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models["Comment"];
}

const Comment: Model<IComment> = mongoose.models.Comment ?? mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
