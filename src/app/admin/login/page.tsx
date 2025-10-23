"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, User } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
          {/* Logo和标题 */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary-gold mb-2">君悦SPA</h1>
            <p className="text-gray-400">管理员登录</p>
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
              className="w-full bg-gradient-to-r from-primary-gold to-yellow-600 hover:from-yellow-600 hover:to-primary-gold"
            >
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
