import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import MicrosoftEntra from "next-auth/providers/microsoft-entra-id";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { cookies } from "next/headers";

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
      authorization: { params: { prompt: "select_account", access_type: "offline" } }
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

        // 1.5 Check cookies for linking flow or signup flow
        const cookieStore = await cookies();
        const linkingId = cookieStore.get("linking_id")?.value;
        const isSignupFlow = cookieStore.get("oauth_signup")?.value === "true";

        // Clean up the signup cookie immediately
        if (isSignupFlow) {
          cookieStore.delete("oauth_signup");
        }

        const email = user.email || profile?.email;
        if (!email) return false;

        // 2. Linking Logic: ONLY allow linking if the explicit 'linking_id' cookie exists
        if (linkingId) {
          try {
            const currentUser = await prisma.studentAccount.findUnique({
              where: { universityId: linkingId }
            });

            if (currentUser) {
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
              user.id = currentUser.universityId;
              user.name = currentUser.name;
              return true;
            }
          } catch (e) {
            console.error("JWT Linking Error:", e);
          }
        }

        // 3. Signup Flow: Create PendingOAuth and redirect to complete-profile
        if (isSignupFlow) {
          try {
            // Check if email already has an account
            const existingByEmail = await prisma.studentAccount.findUnique({
              where: { email }
            });
            if (existingByEmail) {
              return `/signup?error=EmailExists`;
            }

            // Delete any old pending records for this provider+account combo
            await prisma.pendingOAuth.deleteMany({
              where: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              }
            });

            // Create a new PendingOAuth record
            const pending = await prisma.pendingOAuth.create({
              data: {
                email,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                name: user.name || profile?.name || null,
                image: (user as any).image || (profile as any)?.picture || null,
              }
            });

            // Redirect to complete-profile page (return false + redirect URL)
            return `/signup/complete-profile?pendingId=${pending.id}`;
          } catch (e) {
            console.error("OAuth Signup Error:", e);
            return `/signup?error=OAuthFailed`;
          }
        }

        // 4. Normal login flow: Deny if not linked
        return `/login?error=NotLinked&provider=${account.provider}`;
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        const universityId = token.sub as string;

        // Lightweight check to ensure the user wasn't deleted in a DB reset
        const userExists = await prisma.studentAccount.findUnique({
          where: { universityId },
          select: { id: true }
        });

        if (!userExists) {
          // Force logout for deleted accounts (forces them to Sign Up properly)
          return null as any;
        }

        session.user.id = universityId;
      }
      return session;
    },
  }
});
