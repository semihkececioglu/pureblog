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

        const isEmailValid = email === process.env.AUTH_ADMIN_EMAIL;
        const isPasswordValid = await bcrypt.compare(
          password,
          process.env.AUTH_ADMIN_PASSWORD as string,
        );

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
});
