import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }

  interface User {
    role: UserRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: UserRole;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        id: { label: "Admin ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.id === "bcp25398" &&
          credentials?.password === "Aviral@2007"
        ) {
          return {
            id: "admin-1",
            email: "admin@personallibrary.com",
            name: "Super Admin",
            role: "SUPER_ADMIN" as UserRole,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role;
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isLoginPage = nextUrl.pathname === "/admin/login";

      if (isLoginPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      if (isAdminRoute) {
        if (!isLoggedIn) {
          return Response.redirect(
            new URL(`/admin/login?callbackUrl=${nextUrl.pathname}`, nextUrl)
          );
        }
        // Only SUPER_ADMIN and ADMIN can access admin routes
        const role = auth?.user?.role;
        if (role !== "SUPER_ADMIN" && role !== "ADMIN" && role !== "EDITOR") {
          return Response.redirect(new URL("/403", nextUrl));
        }
        return true;
      }

      return true;
    },
  },
});
