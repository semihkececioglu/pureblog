import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) return null;

        const adminEmail = (process.env.AUTH_ADMIN_EMAIL ?? "").trim();
        const isEmailValid = email.trim() === adminEmail;

        const plainPassword = process.env.AUTH_ADMIN_PASSWORD_PLAIN?.trim();
        const hashedPassword = process.env.AUTH_ADMIN_PASSWORD?.trim();
        const isPasswordValid = plainPassword
          ? password.trim() === plainPassword
          : hashedPassword
          ? await bcrypt.compare(password.trim(), hashedPassword)
          : false;

        if (!isEmailValid || !isPasswordValid) return null;

        return { id: "admin", email, name: "Admin" };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
});
