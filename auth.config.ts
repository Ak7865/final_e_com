import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const path = nextUrl.pathname;

      // Admin routes guard
      if (path.startsWith("/admin")) {
        return isLoggedIn && role === "admin";
      }
      // Protected customer routes
      const protectedPaths = ["/profile", "/orders", "/checkout", "/wishlist", "/notifications"];
      if (protectedPaths.some((p) => path.startsWith(p))) {
        return isLoggedIn;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || (user as any)._id?.toString();
        token.role = (user as any).role || "customer";
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  providers: [], // defined in auth.ts
} satisfies NextAuthConfig;