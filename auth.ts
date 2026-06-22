import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { dbConnect } from "./lib/db";
import User from "./models/User";
import { sanitizeNoSQL } from "./lib/utils";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        await dbConnect();
        const sanitizedCreds = sanitizeNoSQL(creds);
        const user = await User.findOne({ email: sanitizedCreds?.email }).select("+password");
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(creds!.password as string, user.password);
        if (!valid) return null;
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Auto-create customer account for Google sign-in
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await dbConnect();
          const existing = await User.findOne({ email: user.email });
          if (!existing) {
            await User.create({
              name: profile?.name,
              email: user.email,
              image: profile?.picture,
              provider: "google",
              role: "customer",
              emailVerified: new Date(),
            });
          }
        } catch (err) {
          console.error("[auth] Google signIn callback failed:", err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      try {
        if (user && user.email) {
          await dbConnect();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            token.picture = dbUser.image;
          }
        } else if (token?.email && (!token.id || !/^[0-9a-fA-F]{24}$/.test(token.id as string))) {
          await dbConnect();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            token.picture = dbUser.image;
          }
        }
      } catch (err) {
        console.error("[auth] JWT callback failed:", err);
      }
      return token;
    },
  },
});
