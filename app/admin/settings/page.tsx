export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";
import { ISettings } from "@/types";
import { SettingsForm } from "./settings-form";

async function getSettings() {
  await connectDB();
  const settings = await Settings.findOne().lean();
  return JSON.parse(JSON.stringify(settings ?? {})) as Partial<ISettings>;
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
        Settings
      </h1>
      <SettingsForm
        initialData={{
          siteName: settings.siteName,
          welcomeTitle: settings.welcomeTitle,
          welcomeDescription: settings.welcomeDescription,
          socialLinks: settings.socialLinks,
          footerText: settings.footerText,
          metaDescription: settings.metaDescription,
          ogImage: settings.ogImage,
          googleAnalyticsId: settings.googleAnalyticsId,
        }}
      />
    </div>
  );
}
