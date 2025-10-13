import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "therapist" | "admin";
    // 技师字段
    username?: string | null;
    email?: string | null;
    phone?: string | null;
    nickname?: string | null;
    // 管理员字段
    name?: string | null;
    adminRole?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: "therapist" | "admin";
      // 技师字段
      username?: string | null;
      email?: string | null;
      phone?: string | null;
      nickname?: string | null;
      // 管理员字段
      name?: string | null;
      adminRole?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "therapist" | "admin";
    // 技师字段
    username?: string | null;
    email?: string | null;
    phone?: string | null;
    nickname?: string | null;
    // 管理员字段
    name?: string | null;
    adminRole?: string | null;
  }
}
