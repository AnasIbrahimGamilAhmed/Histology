import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import MicrosoftEntra from "next-auth/providers/microsoft-entra-id";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";

function generateRandomUniversityId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letters = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const numbers = Math.floor(1000 + Math.random() * 9000).toString(); // 1000-9999
  return `${letters}-${numbers}`;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: false,
      authorization: { params: { prompt: "select_account" } }
    }),
    MicrosoftEntra({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      allowDangerousEmailAccountLinking: false,
      authorization: { params: { prompt: "select_account" } }
    }),
    Credentials({
      name: "University ID",
      credentials: {
        universityId: { label: "University ID", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        let universityId = String(credentials.universityId ?? "").replace(/_/g, '-').toUpperCase().trim();
        const password = String(credentials.password ?? "");

        if (!universityId || !password) {
          return null;
        }

        const account = await prisma.studentAccount.findFirst({
          where: {
            OR: [
              { universityId: { equals: universityId, mode: 'insensitive' } },
              { email: { equals: universityId, mode: 'insensitive' } },
              { accounts: { some: { email: { equals: universityId, mode: 'insensitive' } } } }
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
        // 1. Check if this social account is already linked to a HistoPro ID
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
          // If linked, sign in directly to that HistoPro ID
          user.id = existingLinkedAccount.user.universityId;
          user.name = existingLinkedAccount.user.name;
          user.email = existingLinkedAccount.user.email;
          return true;
        }

        // 1.5 Check if user is already logged in (Linking Flow)
        // We use the cookies to check if there is an active session
        const cookieStore = await cookies();
        const linkingId = cookieStore.get("linking_id")?.value;
        
        const email = user.email || profile?.email;
        if (!email) return false;

        // 2. Linking Logic: ONLY allow linking if the explicit 'linking_id' cookie exists
        // This prevents auto-relinking when a user has an old session active
        const targetUniversityId = linkingId;

        if (targetUniversityId) {
          try {
            const currentUser = await prisma.studentAccount.findUnique({
              where: { universityId: targetUniversityId }
            });

              if (currentUser) {
                // Link to the account identified by linkingId or sessionToken
                await prisma.linkedAccount.upsert({
                  where: {
                    provider_providerAccountId: {
                      provider: account.provider,
                      providerAccountId: account.providerAccountId,
                    }
                  },
                  update: {
                    userId: currentUser.id,
                    access_token: account.access_token as string | null,
                  },
                  create: {
                    userId: currentUser.id,
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    email: email,
                    access_token: account.access_token as string | null,
                  }
                });
                // CRITICAL: Force the session to use the EXISTING universityId
                user.id = currentUser.universityId;
                user.name = currentUser.name;
                return true;
              }
            } catch (e) {
              console.error("JWT Linking Error:", e);
            }
        }

        // 3. Deny login if not linked and no linking session
        return `/login?error=NotLinked&provider=${account.provider}`;
      }
      return true;
    }
  }
});
