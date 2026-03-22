import { Types } from "mongoose";

export interface ISettings {
  _id: Types.ObjectId;
  siteName?: string;
  welcomeTitle?: string;
  welcomeDescription?: string;
  socialLinks: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    facebook?: string;
  };
  footerText?: string;
  metaDescription?: string;
  ogImage?: string;
  googleAnalyticsId?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  views: number;
  reactions: {
    heart: number;
  };
  publishedAt?: Date;
  scheduledAt?: Date;
  previewToken?: string;
  series?: Types.ObjectId;
  seriesOrder?: number;
  readingTime?: number;
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

export interface IPostSeries {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  parentCommentId?: Types.ObjectId;
  name: string;
  email: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

export interface ISubscriber {
  _id: Types.ObjectId;
  email: string;
  status: "active" | "unsubscribed";
  unsubscribeToken?: string;
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
