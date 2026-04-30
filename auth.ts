import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import MicrosoftEntra from "next-auth/providers/microsoft-entra-id";
import Apple from "next-auth/providers/apple";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

function generateRandomUniversityId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letters = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const numbers = Math.floor(1000 + Math.random() * 9000).toString(); // 1000-9999
  return `${letters}-${numbers}`;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google,
    Facebook,
    MicrosoftEntra,
    Apple,
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
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider && account.provider !== 'credentials') {
        const existingLinkedAccount = await prisma.linkedAccount.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            }
          },
          include: { user: true }
        });

        if (existingLinkedAccount) {
          user.id = existingLinkedAccount.user.universityId;
          user.name = existingLinkedAccount.user.name;
          user.email = existingLinkedAccount.user.email;
          return true;
        }

        const email = user.email || profile?.email;
        let studentAcc;
        
        if (email) {
          studentAcc = await prisma.studentAccount.findUnique({ where: { email } });
        }

        if (!studentAcc) {
          let newId = '';
          let isUnique = false;
          while (!isUnique) {
             newId = generateRandomUniversityId();
             const existing = await prisma.studentAccount.findUnique({ where: { universityId: newId } });
             if (!existing) isUnique = true;
          }

          studentAcc = await prisma.studentAccount.create({
            data: {
              universityId: newId,
              name: user.name || "OAuth User",
              email: email,
              password: "", // No password for OAuth
            }
          });
          
          await prisma.userProgress.create({
            data: { userId: studentAcc.universityId, weakSamples: [] }
          });
        }

        await prisma.linkedAccount.create({
          data: {
            userId: studentAcc.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token as string | null,
            token_type: account.token_type as string | null,
            id_token: account.id_token as string | null,
          }
        });
        
        user.id = studentAcc.universityId;
        user.name = studentAcc.name;
        return true;
      }
      return true;
    }
  }
});
