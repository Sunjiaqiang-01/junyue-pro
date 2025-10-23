"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Modal from "@/components/ui/modal-drop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Eye, EyeOff, Mail, Key } from "lucide-react";

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({ open, onClose, onSwitchToLogin }: RegisterModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [registrationCode, setRegistrationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证用户名
    if (!username || username.length < 3) {
      toast.error("用户名至少需要3位");
      return;
    }

    // 验证密码
    if (!password || password.length < 6) {
      toast.error("密码至少需要6位");
      return;
    }

    // 验证邮箱
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      toast.error("请输入正确的邮箱格式");
      return;
    }

    // 验证注册验证码
    if (!registrationCode) {
      toast.error("请输入注册验证码");
      return;
    }

    if (registrationCode.length !== 6 || !/^\d{6}$/.test(registrationCode)) {
      toast.error("验证码格式错误，应为6位数字");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/therapist/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          email,
          registrationCode,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "注册失败");
        return;
      }

      toast.success("注册成功，请登录");
      onClose();
      onSwitchToLogin();
    } catch (error) {
      toast.error("注册失败，请稍后重试");
      console.error("注册错误:", error);
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
      showEscText={false}
      borderBottom={false}
      className="bg-black/95 backdrop-blur-xl border-gray-800 sm:max-w-md"
    >
      <div className="space-y-6">
        {/* 标题 */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-cyan/10 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-primary-cyan" />
          </div>
          <h2 className="text-3xl font-bold text-primary-cyan mb-2">技师注册</h2>
          <p className="text-gray-400">加入君悦SPA，开启您的职业之旅</p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="register-username" className="text-gray-300">
              用户名
            </Label>
            <Input
              id="register-username"
              placeholder="请输入用户名（至少3位）"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-white/5 border-gray-700 text-white placeholder:text-gray-500"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="register-password" className="text-gray-300">
              密码
            </Label>
            <div className="relative">
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="请输入密码（至少6位）"
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

          <div>
            <Label htmlFor="register-email" className="text-gray-300 mb-2 block">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                邮箱
              </div>
            </Label>
            <Input
              id="register-email"
              type="email"
              placeholder="用于找回密码"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-gray-700 text-white placeholder:text-gray-500"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">💡 支持任意邮箱（QQ、网易、Gmail等）</p>
          </div>

          <div>
            <Label htmlFor="register-code" className="text-gray-300 mb-2 block">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                注册验证码
              </div>
            </Label>
            <Input
              id="register-code"
              placeholder="请输入6位数字验证码"
              value={registrationCode}
              onChange={(e) => setRegistrationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="bg-white/5 border-gray-700 text-white placeholder:text-gray-500 text-center text-lg tracking-widest"
              disabled={loading}
              maxLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">💡 请联系管理员获取注册验证码</p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
            <p className="text-xs text-yellow-400">⚠️ 请务必填写正确的邮箱，用于找回密码</p>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r bg-primary-cyan hover:bg-primary-cyan/90 text-pure-black font-bold"
            disabled={loading}
          >
            {loading ? "注册中..." : "注册"}
          </Button>
        </form>

        {/* 切换到登录 */}
        <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-800">
          已有账号？
          <button
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
            className="text-primary-cyan hover:underline ml-1 font-medium"
          >
            立即登录
          </button>
        </div>
      </div>
    </Modal>
  );
}
