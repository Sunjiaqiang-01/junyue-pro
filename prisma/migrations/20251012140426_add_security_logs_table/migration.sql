-- CreateEnum
CREATE TYPE "SecurityAction" AS ENUM ('CODE_VERIFY', 'PASSWORD_RESET', 'LOGIN_ATTEMPT', 'USERNAME_CHECK');

-- CreateTable
CREATE TABLE "security_logs" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "action" "SecurityAction" NOT NULL,
    "success" BOOLEAN NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "security_logs_email_action_createdAt_idx" ON "security_logs"("email", "action", "createdAt");

-- CreateIndex
CREATE INDEX "security_logs_ipAddress_createdAt_idx" ON "security_logs"("ipAddress", "createdAt");
