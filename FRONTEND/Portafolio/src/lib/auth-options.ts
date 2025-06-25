// src/lib/auth-options.ts
import { AuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login", // Opcional, tu ruta personalizada de login
  },
  secret: process.env.NEXTAUTH_SECRET,
};
