import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { connectToDb } from "@utils/database";
import User from "@models/user";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // Updating session with user ID
    async session({ session }) {
      try {
        const sessionUser = await User.findOne({
          email: session.user.email,
        });

        if (sessionUser) {
          session.user.id = sessionUser._id.toString();
        }

        return session;
      } catch (error) {
        console.error("Error fetching user in session callback:", error);
        return session; // Ensure session is returned even if an error occurs
      }
    },
    // Sign in callback
    async signIn({ profile }) {
      try {
        await connectToDb();

        // Check if a user already exists
        const userExists = await User.findOne({
          email: profile.email,
        });

        // If user doesn't exist, create a new user
        if (!userExists) {
          await User.create({
            email: profile.email,
            username: profile.name.toLowerCase().replace(/\s+/g, ""), // Removing spaces and lowercasing username
            image: profile.picture,
          });
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false; // Return false if an error occurs during sign-in
      }
    },
  },
});

export { handler as GET, handler as POST };
