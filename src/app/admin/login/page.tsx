"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, User } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("admin", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.ok) {
        toast.success("登录成功");
        router.push("/admin/dashboard");
      }
    } catch (error) {
      toast.error("登录失败，请稍后重试");
      console.error("登录错误:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pure-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-transparent border border-white/5 rounded-lg p-8">
          {/* Logo和标题 */}
          <div className="mb-8 text-center">
            {/* Logo with white core + cyan glow flowing ring effect */}
            <div className="mb-6 flex justify-center">
              <div className="relative inline-block">
                {/* Outer layer - Cyan soft glow */}
                <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary-cyan/20 via-primary-cyan/40 to-primary-cyan/20 blur-2xl opacity-60 animate-pulse" />

                {/* Flowing light ring - White core + Cyan transition */}
                <div
                  className="absolute -inset-1 rounded-full animate-spin"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0%, rgba(255, 255, 255, 1) 5%, rgba(6, 182, 212, 0.8) 10%, transparent 20%, transparent 100%)",
                    animationDuration: "3s",
                    filter: "drop-shadow(0 0 6px rgba(6, 182, 212, 0.8))",
                  }}
                />

                {/* Secondary flowing ring - White to Cyan gradient */}
                <div
                  className="absolute -inset-1 rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 180deg, transparent 0%, rgba(255, 255, 255, 0.7) 8%, rgba(6, 182, 212, 0.5) 15%, transparent 30%, transparent 100%)",
                    animation: "spin 4s linear infinite reverse",
                    filter: "blur(2px)",
                  }}
                />

                {/* Logo container with white ring and cyan shadow */}
                <div className="relative rounded-full ring-1 ring-white/30 shadow-lg shadow-primary-cyan/30">
                  <Image
                    src="/logo.png"
                    alt="君悦SPA Logo"
                    width={100}
                    height={100}
                    className="rounded-full"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Brand name */}
            <h1 className="text-3xl font-semibold text-pure-white mb-2">君悦SPA</h1>
            <p className="text-secondary/50">管理员登录</p>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <User className="w-5 h-5 text-white/60" />
              </div>
              <Input
                type="text"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="pl-10 bg-white/5 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5 text-white/60" />
              </div>
              <Input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 bg-white/5 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-pure-white text-pure-black hover:bg-secondary/90"
            >
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
