import mongoose, { Schema, Model } from "mongoose";
import { ISettings } from "@/types";

const SettingsSchema = new Schema<ISettings>(
  {
    siteName: { type: String, default: "" },
    welcomeTitle: { type: String, default: "" },
    welcomeDescription: { type: String, default: "" },
    socialLinks: {
      twitter: { type: String, default: "" },
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
      facebook: { type: String, default: "" },
    },
    footerText: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    favicon: { type: String, default: "" },
    googleAnalyticsId: { type: String, default: "" },
  },
  { timestamps: true },
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models["Settings"];
}

const Settings: Model<ISettings> = mongoose.models.Settings ?? mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
