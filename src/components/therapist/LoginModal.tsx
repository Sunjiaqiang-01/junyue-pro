"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Modal from "@/components/ui/modal-drop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}

export default function LoginModal({
  open,
  onClose,
  onSwitchToRegister,
  onSwitchToForgot,
}: LoginModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("请填写完整信息");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("therapist", {
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
        onClose();
        router.push("/therapist/dashboard");
      }
    } catch (error) {
      toast.error("登录失败，请稍后重试");
      console.error("登录错误:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      type="blur"
      animationType="scale"
      showCloseButton
      showEscText
      borderBottom={false}
      className="bg-black/95 backdrop-blur-xl border-gray-800 sm:max-w-md"
    >
      <div className="space-y-6">
        {/* 标题 */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-gold/10 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-primary-gold" />
          </div>
          <h2 className="text-3xl font-bold text-primary-gold mb-2">技师登录</h2>
          <p className="text-gray-400">欢迎回来，登录您的账号</p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="login-username" className="text-gray-300">
              用户名
            </Label>
            <Input
              id="login-username"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-white/5 border-gray-700 text-white placeholder:text-gray-500"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="login-password" className="text-gray-300">
              密码
            </Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-gray-700 text-white placeholder:text-gray-500 pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-white/5 text-primary-gold focus:ring-primary-gold"
              />
              记住我
            </label>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToForgot();
              }}
              className="text-primary-gold hover:underline"
            >
              忘记密码？
            </button>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-gold to-yellow-600 hover:from-yellow-600 hover:to-primary-gold text-black font-bold"
            disabled={loading}
          >
            {loading ? "登录中..." : "登录"}
          </Button>
        </form>

        {/* 切换到注册 */}
        <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-800">
          还没有账号？
          <button
            onClick={() => {
              onClose();
              onSwitchToRegister();
            }}
            className="text-primary-gold hover:underline ml-1 font-medium"
          >
            立即注册
          </button>
        </div>
      </div>
    </Modal>
  );
}
