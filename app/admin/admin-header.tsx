import { auth } from "@/auth";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export async function AdminHeader() {
  const session = await auth();

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0">
      <p className="text-sm text-muted-foreground">
        Welcome,{" "}
        <span className="text-foreground font-medium">
          {session?.user?.name}
        </span>
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <Button variant="ghost" size="sm" type="submit" aria-label="Sign out">
          <LogOut width={16} height={16} />
          Sign out
        </Button>
      </form>
    </header>
  );
}
