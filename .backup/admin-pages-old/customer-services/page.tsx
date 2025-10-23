"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Save, Upload, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

interface CustomerServiceData {
  id: string;
  wechatQrCode: string;
  wechatId: string | null;
  phone: string | null;
  workingHours: string;
}

export default function CustomerServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [service, setService] = useState<CustomerServiceData | null>(null);

  const [wechatQrCode, setWechatQrCode] = useState("");
  const [wechatId, setWechatId] = useState("");
  const [phone, setPhone] = useState("");
  const [workingHours, setWorkingHours] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated" && session?.user?.role === "admin") {
      fetchCustomerService();
    }
  }, [status, session, router]);

  const fetchCustomerService = async () => {
    try {
      const res = await fetch("/api/admin/customer-services");
      const data = await res.json();

      if (data.success && data.data) {
        setService(data.data);
        setWechatQrCode(data.data.wechatQrCode);
        setWechatId(data.data.wechatId || "");
        setPhone(data.data.phone || "");
        setWorkingHours(data.data.workingHours);
      }
    } catch (error) {
      console.error("获取客服配置失败:", error);
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  const handleQrCodeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQr(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "customer-service-qr");

      const res = await fetch("/api/upload/images", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setWechatQrCode(data.data.url);
        toast.success("二维码上传成功");
      } else {
        toast.error("上传失败");
      }
    } catch (error) {
      console.error("上传二维码失败:", error);
      toast.error("网络错误");
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/customer-services", {
        method: service ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wechatQrCode,
          wechatId,
          phone,
          workingHours,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("保存成功");
        fetchCustomerService();
      } else {
        toast.error(data.error || "保存失败");
      }
    } catch (error) {
      console.error("保存客服配置失败:", error);
      toast.error("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-gold" />
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 顶部标题栏 */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-primary-gold mb-2">客服配置管理</h1>
            <p className="text-gray-400">管理客服信息和微信二维码</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 微信二维码 */}
          <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">微信二维码</h2>

            <div className="space-y-4">
              {wechatQrCode && (
                <div className="relative w-64 h-64 mx-auto rounded-lg overflow-hidden border-2 border-primary-gold/30">
                  <Image src={wechatQrCode} alt="客服微信二维码" fill className="object-cover" />
                </div>
              )}

              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrCodeUpload}
                  disabled={uploadingQr}
                  className="hidden"
                  id="qr-upload"
                />
                <label
                  htmlFor="qr-upload"
                  className={`flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-primary-gold transition-colors ${uploadingQr ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {uploadingQr ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-primary-gold" />
                      <span className="text-white">上传中...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-primary-gold" />
                      <span className="text-white">
                        {wechatQrCode ? "更换二维码" : "上传二维码"}
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* 客服信息 */}
          <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">客服信息</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="wechatId" className="text-white">
                  微信号
                </Label>
                <Input
                  id="wechatId"
                  type="text"
                  value={wechatId}
                  onChange={(e) => setWechatId(e.target.value)}
                  placeholder="请输入客服微信号"
                  className="bg-white/5 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-white">
                  客服电话
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入客服电话"
                  className="bg-white/5 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="workingHours" className="text-white">
                  工作时间
                </Label>
                <Input
                  id="workingHours"
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="例如：9:00 - 22:00"
                  required
                  className="bg-white/5 border-gray-700 text-white"
                />
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <Button
            type="submit"
            disabled={submitting || !wechatQrCode}
            className="w-full bg-gradient-to-r from-primary-gold to-yellow-600"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存配置
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
