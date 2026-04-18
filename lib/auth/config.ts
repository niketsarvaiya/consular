import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/utils/validators";

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
    userType: "customer" | "ops";
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role?: string;
      userType: "customer" | "ops";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    userType: "customer" | "ops";
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    // Customer login
    CredentialsProvider({
      id: "customer-credentials",
      name: "Customer Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const customer = await prisma.customer.findUnique({
          where: { email: parsed.data.email, deletedAt: null },
        });

        if (!customer) return null;

        const passwordMatch = await bcrypt.compare(
          parsed.data.password,
          customer.passwordHash
        );
        if (!passwordMatch) return null;

        return {
          id: customer.id,
          email: customer.email,
          name: customer.fullName,
          userType: "customer",
        };
      },
    }),

    // Ops team login
    CredentialsProvider({
      id: "ops-credentials",
      name: "Ops Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const opsUser = await prisma.opsUser.findUnique({
          where: { email: parsed.data.email, isActive: true, deletedAt: null },
        });

        if (!opsUser) return null;

        const passwordMatch = await bcrypt.compare(
          parsed.data.password,
          opsUser.passwordHash
        );
        if (!passwordMatch) return null;

        return {
          id: opsUser.id,
          email: opsUser.email,
          name: opsUser.fullName,
          role: opsUser.role,
          userType: "ops",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.userType = user.userType;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.userType = token.userType;
      }
      return session;
    },
  },
};
