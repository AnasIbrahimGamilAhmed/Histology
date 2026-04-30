import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import MicrosoftEntra from "next-auth/providers/microsoft-entra-id";
import Apple from "next-auth/providers/apple";
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
              { email: { equals: universityId, mode: 'insensitive' } },
              { phone: { equals: universityId, mode: 'insensitive' } },
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
        let sessionToken = '';
        let salt = '';
        const cookieNames = [
          "authjs.session-token",
          "__Secure-authjs.session-token",
          "next-auth.session-token",
          "__Secure-next-auth.session-token"
        ];
        
        for (const name of cookieNames) {
          const val = cookieStore.get(name)?.value;
          if (val) {
            sessionToken = val;
            salt = name;
            break;
          }
        }
        
        // This part is a bit tricky in v5, so we rely on the session token in cookies
        // if the user is already logged in, we link this new provider to their current account.

        const email = user.email || profile?.email;
        if (!email) return false;

        // 2. JWT Linking Logic: Check if there's an active session in the cookies
        if (sessionToken) {
          try {
            // Securely decode the session token using the secret and salt
            const payload = await decode({ 
              token: sessionToken, 
              secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "",
              salt: salt
            });
            const currentUniversityId = payload?.sub as string;

            if (currentUniversityId) {
              const currentUser = await prisma.studentAccount.findUnique({
                where: { universityId: currentUniversityId }
              });

              if (currentUser) {
                // Link to the account the student is CURRENTLY logged into
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
            }
          } catch (e) {
            console.error("JWT Linking Error:", e);
          }
        }

        // 3. Fallback: Check if an account with this email already exists
        const existingStudent = await prisma.studentAccount.findUnique({
          where: { email }
        });

        if (existingStudent) {
          // Auto-link social account to this existing HistoPro account
          await prisma.linkedAccount.upsert({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              }
            },
            update: {
              userId: existingStudent.id,
              access_token: account.access_token as string | null,
            },
            create: {
              userId: existingStudent.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              email: email,
              access_token: account.access_token as string | null,
            }
          });
          user.id = existingStudent.universityId;
          user.name = existingStudent.name;
          return true;
        }

        // 4. New User Case: Save data temporarily and redirect to "Complete Profile"
        const pending = await prisma.pendingOAuth.create({
          data: {
            email: email,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            name: user.name || "",
            image: user.image || ""
          }
        });

        // Redirect to a page to ask for Name and Password
        return `/signup/complete-profile?pendingId=${pending.id}`;
      }
      return true;
    }
  }
});
