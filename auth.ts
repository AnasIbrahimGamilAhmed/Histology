import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import MicrosoftEntra from "next-auth/providers/microsoft-entra-id";
import Apple from "next-auth/providers/apple";
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
        const sessionToken = cookieStore.get("authjs.session-token")?.value || 
                            cookieStore.get("__Secure-authjs.session-token")?.value;
        
        // This part is a bit tricky in v5, so we rely on the email match as a solid fallback
        // but if we have an active student account in the DB with the same email, we link it.

        // 2. Check if an account with this email already exists manually
        const existingStudent = await prisma.studentAccount.findUnique({
          where: { email }
        });

        if (existingStudent) {
          // Auto-link Google to this existing HistoPro account
          await prisma.linkedAccount.create({
            data: {
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

        // 3. New User Case: Save data temporarily and redirect to "Complete Profile"
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
