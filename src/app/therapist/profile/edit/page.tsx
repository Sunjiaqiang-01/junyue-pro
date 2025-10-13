"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X, Camera, Video as VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";
import { ProfileValidator } from "@/lib/profile-validator";
import ProvinceCitySelector from "@/components/ProvinceCitySelector";
import TencentMapWechatStyle from "@/components/TencentMapWechatStyle";

interface Location {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface TherapistData {
  id: string;
  nickname: string;
  age: number;
  height: number;
  weight: number;
  cardValue: string | null;
  city: string;
  areas: string[];
  phone: string | null;
  location: Location | null;
  status: string;
  photos: Array<{ id: string; url: string; order: number }>;
  videos: Array<{ id: string; url: string; coverUrl: string | null }>;
  profile: {
    introduction: string;
    specialties: string[];
    serviceType: string[];
    serviceAddress: string | null;
  } | null;
}

export default function TherapistProfileEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [therapist, setTherapist] = useState<TherapistData | null>(null);

  // 表单数据
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [cardValue, setCardValue] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [introduction, setIntroduction] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");

  // 文件上传
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/therapist?modal=login");
    } else if (status === "authenticated" && session?.user?.role === "therapist") {
      fetchTherapistData();
    }
  }, [status, session, router]);

  const fetchTherapistData = async () => {
    try {
      const res = await fetch(`/api/therapist/profile`);
      const data = await res.json();

      if (data.success) {
        const t = data.data;
        setTherapist(t);
        setNickname(t.nickname);
        // 如果是未填写状态（0值），显示为空字符串便于用户输入
        setAge(ProfileValidator.isFieldFilled("age", t.age) ? t.age.toString() : "");
        setHeight(ProfileValidator.isFieldFilled("height", t.height) ? t.height.toString() : "");
        setWeight(ProfileValidator.isFieldFilled("weight", t.weight) ? t.weight.toString() : "");
        setCardValue(t.cardValue || "");
        setCity(ProfileValidator.isFieldFilled("city", t.city) ? t.city : "");
        setPhone(t.phone || "");
        setLocation(t.location);
        setIntroduction(t.profile?.introduction || "");
        setServiceAddress(t.profile?.serviceAddress || "");
        setPhotoPreview(t.photos.map((p: any) => p.url));
      } else {
        toast.error("获取资料失败");
      }
    } catch (error) {
      console.error("获取资料失败:", error);
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhoto(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "therapist-photo");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.success) {
          // 上传照片到数据库
          await fetch("/api/therapist/profile/photos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: data.data.url }),
          });

          setPhotoPreview((prev) => [...prev, data.data.url]);
          toast.success("照片上传成功");
        } else {
          toast.error("照片上传失败");
        }
      }

      // 刷新数据
      fetchTherapistData();
    } catch (error) {
      console.error("上传照片失败:", error);
      toast.error("网络错误");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const res = await fetch(`/api/therapist/profile/photos/${photoId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("照片删除成功");
        fetchTherapistData();
      } else {
        toast.error("删除失败");
      }
    } catch (error) {
      console.error("删除照片失败:", error);
      toast.error("网络错误");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证基本信息
    const ageNum = parseInt(age);
    const heightNum = parseInt(height);
    const weightNum = parseInt(weight);

    const validation = ProfileValidator.validateBasicInfo({
      age: ageNum,
      height: heightNum,
      weight: weightNum,
      city: city.trim(),
    });

    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/therapist/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          age: ageNum,
          height: heightNum,
          weight: weightNum,
          cardValue: cardValue.trim() || null,
          city: city.trim(),
          phone: phone.trim() || null,
          location,
          introduction,
          serviceAddress,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("资料更新成功");
        router.push("/therapist/dashboard");
      } else {
        toast.error(data.error || "更新失败");
      }
    } catch (error) {
      console.error("更新资料失败:", error);
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

  if (!session || session.user.role !== "therapist") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-gold mb-2">编辑资料</h1>
          <p className="text-gray-400">完善您的技师资料，让客户更了解您</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本信息 */}
          <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">基本信息</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="nickname" className="text-white">
                  昵称
                </Label>
                <Input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                  className="bg-white/5 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="age" className="text-white">
                  年龄
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  min="18"
                  max="60"
                  className="bg-white/5 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="height" className="text-white">
                  身高 (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  required
                  min="140"
                  max="200"
                  className="bg-white/5 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="weight" className="text-white">
                  体重 (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  min="35"
                  max="100"
                  className="bg-white/5 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="cardValue" className="text-white">
                  牌值
                </Label>
                <Input
                  id="cardValue"
                  type="text"
                  value={cardValue}
                  onChange={(e) => setCardValue(e.target.value)}
                  placeholder="例如：17cm"
                  className="bg-white/5 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-white">所在城市</Label>
                <ProvinceCitySelector value={city} onChange={setCity} placeholder="选择城市" />
              </div>
            </div>
          </div>

          {/* 个人介绍 */}
          <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">个人介绍</h2>
            <Textarea
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="请介绍您的服务特色、专业技能、从业经验等..."
              rows={6}
              className="bg-white/5 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          {/* 联系方式 */}
          <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">联系方式</h2>
            <p className="text-gray-400 text-sm mb-4">
              ⚠️ 联系方式仅对平台客服可见，用于安排预约服务
            </p>

            <div>
              <Label htmlFor="phone" className="text-white">
                手机号
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                className="bg-white/5 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* 服务地址 */}
          <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-6 pb-0">
              <h2 className="text-2xl font-bold text-white mb-6">服务地址</h2>
            </div>
            <div className="px-6 pb-6">
              <TencentMapWechatStyle
                value={location}
                onChange={setLocation}
                defaultCenter={
                  location ? { lat: location.latitude, lng: location.longitude } : undefined
                }
              />
            </div>
          </div>

          {/* 照片管理 */}
          <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">照片管理</h2>
            <p className="text-gray-400 text-sm mb-4">至少上传3张照片，展示您的形象和服务环境</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {therapist?.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-700 group"
                >
                  <Image src={photo.url} alt="技师照片" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-2 right-2 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className={`flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-primary-gold transition-colors ${uploadingPhoto ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {uploadingPhoto ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-primary-gold" />
                    <span className="text-white">上传中...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-primary-gold" />
                    <span className="text-white">点击上传照片</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-primary-gold to-yellow-600"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                "保存资料"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
