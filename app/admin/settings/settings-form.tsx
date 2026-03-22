"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  AtSign,
  Code2,
  Briefcase,
  Camera,
  Play,
  Users,
} from "lucide-react";

const schema = z.object({
  siteName: z.string().max(60, "Max 60 characters").optional(),
  welcomeTitle: z.string().optional(),
  welcomeDescription: z.string().max(200, "Max 200 characters").optional(),
  socialLinks: z.object({
    twitter: z.string().optional(),
    github: z.string().optional(),
    linkedin: z.string().optional(),
    instagram: z.string().optional(),
    youtube: z.string().optional(),
    facebook: z.string().optional(),
  }),
  footerText: z.string().optional(),
  metaDescription: z.string().max(160, "Max 160 characters").optional(),
  ogImage: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface SettingsFormProps {
  initialData: Partial<FormData>;
}

const socialFields = [
  { key: "twitter" as const, label: "X / Twitter", icon: AtSign, placeholder: "https://x.com/username" },
  { key: "github" as const, label: "GitHub", icon: Code2, placeholder: "https://github.com/username" },
  { key: "linkedin" as const, label: "LinkedIn", icon: Briefcase, placeholder: "https://linkedin.com/in/username" },
  { key: "instagram" as const, label: "Instagram", icon: Camera, placeholder: "https://instagram.com/username" },
  { key: "youtube" as const, label: "YouTube", icon: Play, placeholder: "https://youtube.com/@username" },
  { key: "facebook" as const, label: "Facebook", icon: Users, placeholder: "https://facebook.com/username" },
];

export function SettingsForm({ initialData }: SettingsFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      siteName: initialData.siteName ?? "",
      welcomeTitle: initialData.welcomeTitle ?? "",
      welcomeDescription: initialData.welcomeDescription ?? "",
      socialLinks: {
        twitter: initialData.socialLinks?.twitter ?? "",
        github: initialData.socialLinks?.github ?? "",
        linkedin: initialData.socialLinks?.linkedin ?? "",
        instagram: initialData.socialLinks?.instagram ?? "",
        youtube: initialData.socialLinks?.youtube ?? "",
        facebook: initialData.socialLinks?.facebook ?? "",
      },
      footerText: initialData.footerText ?? "",
      metaDescription: initialData.metaDescription ?? "",
      ogImage: initialData.ogImage ?? "",
      googleAnalyticsId: initialData.googleAnalyticsId ?? "",
    },
  });

  const metaDescription = watch("metaDescription") ?? "";
  const welcomeDescription = watch("welcomeDescription") ?? "";
  const ogImage = watch("ogImage") ?? "";

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved.");
    } catch {
      toast.error("Failed to save settings.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 max-w-xl">
      {/* Site Identity */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base">Site Identity</CardTitle>
          <CardDescription>Basic information about your site.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              {...register("siteName")}
              placeholder="Pureblog"
            />
            {errors.siteName && (
              <p className="text-xs text-destructive">{errors.siteName.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Welcome Section */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base">Welcome Section</CardTitle>
          <CardDescription>Shown on the homepage hero area.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="welcomeTitle">Title</Label>
            <Input
              id="welcomeTitle"
              {...register("welcomeTitle")}
              placeholder="Welcome to Pureblog."
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="welcomeDescription">Description</Label>
              <span className={`text-xs ${welcomeDescription.length > 200 ? "text-destructive" : "text-muted-foreground"}`}>
                {welcomeDescription.length}/200
              </span>
            </div>
            <Input
              id="welcomeDescription"
              {...register("welcomeDescription")}
              placeholder="Thoughts on technology, design, and everything in between."
            />
            {errors.welcomeDescription && (
              <p className="text-xs text-destructive">{errors.welcomeDescription.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base">Social Links</CardTitle>
          <CardDescription>Links shown in the footer and about page.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          {socialFields.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key} className="flex flex-col gap-2">
              <Label htmlFor={key} className="flex items-center gap-2">
                <Icon width={14} height={14} className="text-muted-foreground" />
                {label}
              </Label>
              <Input
                id={key}
                {...register(`socialLinks.${key}`)}
                placeholder={placeholder}
                type="url"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Footer */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base">Footer</CardTitle>
          <CardDescription>Text displayed in the site footer.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="footerText">Footer Text</Label>
            <Input
              id="footerText"
              {...register("footerText")}
              placeholder="© 2026 Pureblog. All rights reserved."
            />
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base">SEO</CardTitle>
          <CardDescription>Default metadata used when page-specific values are absent.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="metaDescription">Default Meta Description</Label>
              <span className={`text-xs ${metaDescription.length > 160 ? "text-destructive" : "text-muted-foreground"}`}>
                {metaDescription.length}/160
              </span>
            </div>
            <Textarea
              id="metaDescription"
              {...register("metaDescription")}
              placeholder="A short description of your site for search engines."
              rows={3}
            />
            {errors.metaDescription ? (
              <p className="text-xs text-destructive">{errors.metaDescription.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Recommended: 50–160 characters.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ogImage">Default OG Image URL</Label>
            <Input
              id="ogImage"
              {...register("ogImage")}
              placeholder="https://example.com/og-image.png"
              type="url"
            />
            {ogImage && (
              <div className="mt-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ogImage}
                  alt="OG image preview"
                  className="max-h-32 max-w-full border border-border object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  onLoad={(e) => { (e.target as HTMLImageElement).style.display = "block"; }}
                />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
            <Input
              id="googleAnalyticsId"
              {...register("googleAnalyticsId")}
              placeholder="G-XXXXXXXXXX"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 bg-background border-t border-border py-4 flex items-center gap-3 -mx-4 md:-mx-6 px-4 md:px-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 width={14} height={14} className="animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </form>
  );
}
