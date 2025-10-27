import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "therapist",
      name: "therapist",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("请输入用户名和密码");
        }

        const therapist = await prisma.therapist.findUnique({
          where: { username: credentials.username as string },
        });

        if (!therapist || !therapist.password) {
          throw new Error("用户名或密码错误");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          therapist.password
        );

        if (!isPasswordValid) {
          throw new Error("用户名或密码错误");
        }

        return {
          id: therapist.id,
          username: therapist.username,
          email: therapist.email,
          phone: therapist.phone,
          nickname: therapist.nickname,
          role: "therapist",
        };
      },
    }),
    Credentials({
      id: "admin",
      name: "admin",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("请输入用户名和密码");
        }

        const admin = await prisma.admin.findUnique({
          where: { username: credentials.username as string },
        });

        if (!admin || !admin.password) {
          throw new Error("用户名或密码错误");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          admin.password
        );

        if (!isPasswordValid) {
          throw new Error("用户名或密码错误");
        }

        return {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          role: "admin",
          adminRole: admin.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/therapist?modal=login", // 技师登录弹窗
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        if (user.role === "therapist") {
          token.username = user.username;
          token.email = user.email;
          token.phone = user.phone;
          token.nickname = user.nickname;
        } else if (user.role === "admin") {
          token.username = user.username;
          token.name = user.name;
          token.adminRole = user.adminRole;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        if (token.role === "therapist") {
          session.user.username = token.username as string;
          session.user.email = token.email as string;
          session.user.phone = token.phone as string;
          session.user.nickname = token.nickname as string;
        } else if (token.role === "admin") {
          session.user.username = token.username as string;
          session.user.name = token.name as string;
          session.user.adminRole = token.adminRole as string;
        }
      }
      return session;
    },
  },
});
