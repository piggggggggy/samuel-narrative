import { auth, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const admin = await isAdmin();
  if (!admin) {
    redirect("/");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-24 pt-12">
      <AdminHeader />
      {children}
    </div>
  );
}
