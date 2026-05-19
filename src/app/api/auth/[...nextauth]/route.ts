/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any, // Cast needed for NextAuth v4
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      if (user.email) {
        await sendWelcomeEmail(user.email, user.name);
      }
    }
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).tier = token.tier;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        // Fetch fresh tier on initial sign in
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        token.tier = dbUser?.tier || "SEEKER";
      }

      // Handle session update triggers (optional but good practice)
      if (trigger === "update" && session?.tier) {
        token.tier = session.tier;
      }
      
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
