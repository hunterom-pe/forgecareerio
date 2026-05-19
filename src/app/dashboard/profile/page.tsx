import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  let user = null;
  if (session?.user?.email) {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
  }

  return <ProfileClient user={user} />;
}
