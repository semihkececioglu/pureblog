import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import Message from "@/models/Message";
import { AdminSidebarDesktop } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();
  const [pendingComments, unreadMessages] = await Promise.all([
    Comment.countDocuments({ status: "pending" }),
    Message.countDocuments({ read: false }),
  ]);

  return (
    <div className="min-h-screen flex">
      <AdminSidebarDesktop pendingComments={pendingComments} unreadMessages={unreadMessages} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader userName={session.user?.name} pendingComments={pendingComments} unreadMessages={unreadMessages} />
        <main className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
