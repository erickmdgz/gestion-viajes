import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Operators (exec board) authenticate with email + password (NF-8).
// Passwords are stored hashed (bcrypt); we never compare plaintext (NFR-001).
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const operator = await prisma.operator.findUnique({ where: { email } });
        if (!operator) return null;

        const passwordMatches = await bcrypt.compare(
          password,
          operator.passwordHash,
        );
        if (!passwordMatches) return null;

        return { id: operator.id, email: operator.email, name: operator.name };
      },
    }),
  ],
});
