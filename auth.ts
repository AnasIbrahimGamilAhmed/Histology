import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "University ID",
      credentials: {
        universityId: { label: "University ID", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const universityId = String(credentials.universityId ?? "").trim();
        const password = String(credentials.password ?? "");

        if (!universityId || !password) {
          return null;
        }

        const account = await prisma.studentAccount.findFirst({
          where: {
            OR: [
              { universityId: { equals: universityId, mode: 'insensitive' } },
              { email: { equals: universityId, mode: 'insensitive' } }
            ]
          }
        });

        if (!account || account.password !== password) {
          return null;
        }

        // Safety fallback: Ensure UserProgress exists even for old accounts
        const progress = await prisma.userProgress.findUnique({
          where: { userId: account.universityId }
        });
        
        if (!progress) {
          await prisma.userProgress.create({
            data: { userId: account.universityId, weakSamples: [] }
          });
        }

        return {
          id: account.universityId,
          name: account.name,
          email: account.email
        };
      }
    })
  ]
});
