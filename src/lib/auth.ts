import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "USER" | "MODERATOR";

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
  secret: process.env.AUTH_SECRET || "default-secret-key-for-netlify-deploy-123",
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        id: { label: "Email/ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.id as string | undefined;
        const password = credentials?.password as string | undefined;
        
        if (!email || !password) return null;

        // Hardcoded Moderator Login
        if (email === "bcp25398" && password === "Aviral@2007") {
          return {
            id: "moderator_bcp25398",
            name: "Moderator",
            email: "moderator@system.local",
            role: "MODERATOR",
          };
        }

        try {
          const q = query(collection(db, "users"), where("email", "==", email));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) return null;
          
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          
          const isValid = await bcrypt.compare(password, userData.password);
          
          if (isValid) {
            return {
              id: userDoc.id,
              email: userData.email,
              name: userData.name || "User",
              role: (userData.role as UserRole) || "USER",
            };
          }
        } catch (error) {
          console.error("Auth error:", error);
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
