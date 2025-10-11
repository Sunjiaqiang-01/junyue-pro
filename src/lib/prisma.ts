import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// 同时支持默认导出和命名导出
export default prisma;
export { prisma };

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

