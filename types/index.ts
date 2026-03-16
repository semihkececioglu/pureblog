import { Types } from "mongoose";

export interface IPost {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  featured?: boolean;
  category: Types.ObjectId;
  tags: string[];
  status: "draft" | "published";
  readingTime: number;
  views: number;
  reactions: {
    like: number;
    heart: number;
    fire: number;
  };
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
}

export interface IComment {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  name: string;
  email: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

export interface ISubscriber {
  _id: Types.ObjectId;
  name: string;
  email: string;
  status: "active" | "unsubscribed";
  createdAt: Date;
}

export interface IMessage {
  _id: Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  content: string;
  read: boolean;
  createdAt: Date;
}
