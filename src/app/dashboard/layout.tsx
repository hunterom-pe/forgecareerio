import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { DashboardLayoutClient } from "@/components/DashboardLayoutClient";
import { NotificationProvider } from "@/lib/NotificationContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user?.jobTitle || !user?.location) {
    redirect("/onboarding");
  }

  return (
    <NotificationProvider>
      <DashboardLayoutClient user={user as any}>{children}</DashboardLayoutClient>

    </NotificationProvider>
  );
}
