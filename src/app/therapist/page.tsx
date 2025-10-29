"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import PageVisitTracker from "@/components/PageVisitTracker";
import LoginModal from "@/components/therapist/LoginModal";
import RegisterModal from "@/components/therapist/RegisterModal";
import ForgotPasswordModal from "@/components/therapist/ForgotPasswordModal";
import {
  UserPlus,
  LogIn,
  CheckCircle,
  Upload,
  FileCheck,
  Sparkles,
  ArrowRight,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";

function TherapistHomeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const modal = searchParams.get("modal");

  // 如果已登录，跳转到工作台
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "therapist") {
      router.push("/therapist/dashboard");
    }
  }, [status, session, router]);

  const openModal = (type: "login" | "register" | "forgot") => {
    router.push(`/therapist?modal=${type}`);
  };

  const closeModal = () => {
    router.push("/therapist");
  };

  return (
    <div className="min-h-screen bg-pure-black">
      {/* 页面访问追踪 */}
      <PageVisitTracker page="/therapist" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-cyan/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-cyan/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          {/* 标题 */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-cyan/10 border border-primary-cyan/30 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary-cyan" />
              <span className="text-primary-cyan text-sm font-medium">专业技师入驻平台</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-pure-white">
                加入<span className="text-primary-cyan">君悦SPA</span>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-4">开启您的专业服务之旅</p>

            <p className="text-gray-400 max-w-2xl mx-auto">
              我们为专业技师提供展示平台，帮助您获得更多客户，实现职业发展
            </p>
          </div>

          {/* CTA按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              onClick={() => openModal("register")}
              className="bg-primary-cyan hover:bg-primary-cyan/90 text-pure-black font-bold px-8 py-6 text-lg shadow-lg shadow-primary-cyan/30"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              立即注册
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              size="lg"
              variant="ghost"
              onClick={() => openModal("login")}
              className="border border-white/10 text-pure-white hover:text-primary-cyan hover:border-primary-cyan/50 hover:bg-primary-cyan/10 bg-transparent px-8 py-6 text-lg font-bold"
            >
              <LogIn className="w-5 h-5 mr-2" />
              已有账号？登录
            </Button>
          </div>

          {/* 数据统计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <Users className="w-8 h-8 text-primary-cyan mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">1000+</div>
              <div className="text-gray-400 text-sm">注册技师</div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">95%</div>
              <div className="text-gray-400 text-sm">审核通过率</div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <Shield className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">48小时</div>
              <div className="text-gray-400 text-sm">审核时效</div>
            </div>
          </div>
        </div>
      </section>

      {/* 入驻流程 */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              简单<span className="text-primary-cyan">四步</span>，开启您的职业之旅
            </h2>
            <p className="text-gray-400">快速完成入驻，48小时内审核通过即可接单</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 步骤1 */}
            <div className="relative group">
              <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 hover:border-primary-cyan/50 transition-all duration-300">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-primary-cyan to-primary-cyan rounded-full flex items-center justify-center text-pure-black font-bold text-xl">
                  1
                </div>

                <div className="w-16 h-16 bg-primary-cyan/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-8 h-8 text-primary-cyan" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">注册账号</h3>
                <p className="text-gray-400 text-sm">使用手机号快速注册，设置登录密码</p>
              </div>
            </div>

            {/* 步骤2 */}
            <div className="relative group">
              <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 hover:border-primary-cyan/50 transition-all duration-300">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-primary-cyan to-primary-cyan rounded-full flex items-center justify-center text-pure-black font-bold text-xl">
                  2
                </div>

                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-blue-500" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">完善资料</h3>
                <p className="text-gray-400 text-sm">填写基本信息，上传照片和视频（至少3张照片）</p>
              </div>
            </div>

            {/* 步骤3 */}
            <div className="relative group">
              <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 hover:border-primary-cyan/50 transition-all duration-300">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-primary-cyan to-primary-cyan rounded-full flex items-center justify-center text-pure-black font-bold text-xl">
                  3
                </div>

                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileCheck className="w-8 h-8 text-purple-500" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">提交审核</h3>
                <p className="text-gray-400 text-sm">提交资料后，平台将在48小时内完成审核</p>
              </div>
            </div>

            {/* 步骤4 */}
            <div className="relative group">
              <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 hover:border-primary-cyan/50 transition-all duration-300">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-primary-cyan to-primary-cyan rounded-full flex items-center justify-center text-pure-black font-bold text-xl">
                  4
                </div>

                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">开始接单</h3>
                <p className="text-gray-400 text-sm">审核通过后，您的信息将展示在平台，开始接单</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 平台优势 */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              为什么选择<span className="text-primary-cyan">君悦SPA</span>
            </h2>
            <p className="text-gray-400">我们为技师提供专业的展示平台和完善的服务支持</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-black/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
              <div className="w-12 h-12 bg-primary-cyan/10 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary-cyan" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">信息保护</h3>
              <p className="text-gray-400 text-sm">
                您的联系方式仅对平台客服可见，保护您的隐私安全
              </p>
            </div>

            <div className="bg-black/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">客户资源</h3>
              <p className="text-gray-400 text-sm">平台客服为您对接优质客户，无需自己寻找客源</p>
            </div>

            <div className="bg-black/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">收益稳定</h3>
              <p className="text-gray-400 text-sm">
                透明的服务定价，稳定的客户订单，让您专注于服务
              </p>
            </div>

            <div className="bg-black/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">推荐曝光</h3>
              <p className="text-gray-400 text-sm">优质技师可获得推荐位，增加曝光度和接单机会</p>
            </div>

            <div className="bg-black/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">快速审核</h3>
              <p className="text-gray-400 text-sm">48小时内完成审核，快速上线开始接单</p>
            </div>

            <div className="bg-black/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">专业支持</h3>
              <p className="text-gray-400 text-sm">平台客服团队全程支持，解决您的各种问题</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary-cyan/10 via-purple-500/10 to-primary-cyan/10 border border-primary-cyan/30 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4">准备好开始了吗？</h2>
            <p className="text-gray-300 mb-8 text-lg">
              立即注册，加入君悦SPA，开启您的专业服务之旅
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => openModal("register")}
                className="bg-primary-cyan hover:bg-primary-cyan/90 text-pure-black font-bold px-10 py-6 text-lg shadow-lg shadow-primary-cyan/30"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                立即注册
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                size="lg"
                variant="ghost"
                onClick={() => openModal("login")}
                className="border border-white/10 text-pure-white hover:text-primary-cyan hover:border-primary-cyan/50 hover:bg-primary-cyan/10 bg-transparent px-10 py-6 text-lg font-bold"
              >
                <LogIn className="w-5 h-5 mr-2" />
                技师登录
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 温馨提示 */}
      <section className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-yellow-500 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              温馨提示
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• 请确保上传的照片清晰真实，至少上传3张照片</li>
              <li>• 填写真实的联系方式，方便平台客服联系您安排服务</li>
              <li>• 个人介绍请详细描述您的服务特色和优势</li>
              <li>• 资料提交后，平台将在48小时内完成审核</li>
              <li>• 如有疑问，请联系平台客服获取帮助</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 弹窗 */}
      <LoginModal
        open={modal === "login"}
        onClose={closeModal}
        onSwitchToRegister={() => openModal("register")}
        onSwitchToForgot={() => openModal("forgot")}
      />

      <RegisterModal
        open={modal === "register"}
        onClose={closeModal}
        onSwitchToLogin={() => openModal("login")}
      />

      <ForgotPasswordModal
        open={modal === "forgot"}
        onClose={closeModal}
        onSwitchToLogin={() => openModal("login")}
      />
    </div>
  );
}

export default function TherapistHomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-pure-black flex items-center justify-center">
          <div className="text-white">加载中...</div>
        </div>
      }
    >
      <TherapistHomeContent />
    </Suspense>
  );
}
