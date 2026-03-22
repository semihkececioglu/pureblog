import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebarDesktop } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex">
      <AdminSidebarDesktop />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader userName={session.user?.name} />
        <main className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
