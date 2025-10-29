"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, Upload, X, Camera, Video as VideoIcon, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { ProfileValidator } from "@/lib/profile-validator";
import ProvinceCitySelector from "@/components/ProvinceCitySelector";
import TencentMapWechatStyle from "@/components/TencentMapWechatStyle";
import { compressFiles } from "@/lib/client-compress";
import {
  processVideo,
  dataUrlToBlob,
  formatDuration,
  formatFileSize,
} from "@/lib/client-video-processor";

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
  email: string | null;
  location: Location | null;
  status: string;
  photos: Array<{
    id: string;
    url: string;
    order: number;
    isPrimary: boolean;
    isVideo: boolean;
    thumbnailUrl?: string;
    mediumUrl?: string;
    largeUrl?: string;
    videoUrl?: string;
    coverUrl?: string;
    duration?: number;
  }>;
  videos: Array<{ id: string; url: string; coverUrl: string | null }>;
  profile: {
    introduction: string;
    serviceAddress: string | null;
  } | null;
}

interface UploadProgress {
  [fileName: string]: number;
}

export default function AdminTherapistEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const therapistId = params.id as string;

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
  const [areas, setAreas] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [introduction, setIntroduction] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");

  // 文件上传
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [totalFiles, setTotalFiles] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState(0);
  const [currentUploadType, setCurrentUploadType] = useState<"image" | "video" | null>(null);

  // 视频预览相关
  const [videoPreview, setVideoPreview] = useState<{
    file: File;
    thumbnail: string;
    info: { duration: number; width: number; height: number; size: number; type: string };
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated" && session?.user?.role === "admin") {
      fetchTherapistData();
    }
  }, [status, session, router, therapistId]);

  const fetchTherapistData = async () => {
    try {
      const res = await fetch(`/api/admin/therapists/${therapistId}`);
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
        setAreas(t.areas || []);
        setPhone(t.phone || "");
        setEmail(t.email || "");
        setLocation(t.location);
        setIntroduction(t.profile?.introduction || "");
        setServiceAddress(t.profile?.serviceAddress || "");
        setPhotoPreview(t.photos.map((p: any) => p.url));
      } else {
        toast.error("获取技师资料失败");
      }
    } catch (error) {
      console.error("获取技师资料失败:", error);
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  // 使用XMLHttpRequest上传单个文件并追踪进度
  const uploadFileWithProgress = (
    file: File,
    apiEndpoint: string = "/api/upload/images",
    additionalData?: { [key: string]: string | Blob }
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      // 根据API端点设置类型
      if (apiEndpoint.includes("/videos")) {
        formData.append("type", "therapist-videos");
      } else {
        formData.append("type", "therapist-photos");
      }

      // 添加额外数据（如缩略图、时长等）
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      // 监听上传进度
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: percent,
          }));
        }
      });

      // 监听完成
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              // 返回完整的响应数据
              resolve(response);
            } else {
              reject(new Error(response.error || "上传失败"));
            }
          } catch (error) {
            reject(new Error("解析响应失败"));
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}`));
        }
      });

      // 监听错误
      xhr.addEventListener("error", () => {
        reject(new Error("网络错误"));
      });

      xhr.open("POST", apiEndpoint);
      xhr.send(formData);
    });
  };

  // 专门的图片上传处理
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setCurrentUploadType("image");

    let fileArray = Array.from(files);

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = fileArray.filter((file) => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      const invalidNames = invalidFiles.map((f) => f.name).join(", ");
      toast.error(`不支持的文件格式: ${invalidNames}。请选择JPG、PNG或WebP格式的图片。`);
      e.target.value = "";
      return;
    }

    // 验证文件大小
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = fileArray.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      const oversizedNames = oversizedFiles.map((f) => f.name).join(", ");
      toast.error(`文件过大: ${oversizedNames}。图片大小不能超过10MB。`);
      e.target.value = "";
      return;
    }

    // 重置进度状态
    setUploadProgress({});
    setUploadingPhoto(true);

    // 客户端预压缩
    console.log("📦 开始客户端预压缩...");
    const compressedFiles = await compressFiles(fileArray);
    console.log(`✅ 预压缩完成: ${files.length} → ${compressedFiles.length} 个文件`);

    setTotalFiles(compressedFiles.length);
    setUploadedFiles(0);

    const results = {
      success: [] as string[],
      failed: [] as { name: string; error: string }[],
    };

    // 逐个上传文件
    for (const file of compressedFiles) {
      try {
        // 1. 上传到服务器
        const uploadData = await uploadFileWithProgress(file, "/api/upload/images");

        // 2. 保存到数据库 - 使用管理员API
        const dbRes = await fetch(`/api/admin/therapists/${therapistId}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: uploadData.url,
            fileType: "image",
          }),
        });

        const dbData = await dbRes.json();
        if (dbData.success) {
          results.success.push(file.name);
          setUploadedFiles((prev) => prev + 1);
        } else {
          results.failed.push({ name: file.name, error: dbData.error || "数据库保存失败" });
        }
      } catch (error) {
        console.error(`上传 ${file.name} 失败:`, error);
        results.failed.push({
          name: file.name,
          error: error instanceof Error ? error.message : "上传失败",
        });
      }
    }

    // 显示结果
    if (results.success.length > 0) {
      toast.success(`成功上传 ${results.success.length} 张图片`);
      fetchTherapistData(); // 刷新数据
    }

    if (results.failed.length > 0) {
      toast.error(
        `${results.failed.length} 张图片上传失败: ${results.failed.map((f) => f.name).join(", ")}`
      );
    }

    // 清理状态
    setUploadingPhoto(false);
    setUploadProgress({});
    setTotalFiles(0);
    setUploadedFiles(0);
    setCurrentUploadType(null);
    e.target.value = "";
  };

  // 专门的视频上传处理
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]; // 视频只支持单个上传
    setCurrentUploadType("video");

    // 验证文件类型
    const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(`不支持的视频格式: ${file.name}。请选择MP4、MOV或AVI格式的视频文件。`);
      e.target.value = "";
      return;
    }

    // 验证文件大小 (100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(
        `视频文件过大: ${file.name} (${formatFileSize(file.size)})。视频大小不能超过100MB。`
      );
      e.target.value = "";
      return;
    }

    setUploadingPhoto(true);
    setUploadProgress({ [file.name]: 0 });

    try {
      // 🎬 前端处理视频：生成缩略图和获取信息
      toast.info("正在处理视频，请稍候...");
      console.log("🎬 开始前端视频处理...");

      const { thumbnail, info } = await processVideo(file);
      console.log("✅ 视频处理完成:", {
        duration: info.duration,
        size: `${info.width}x${info.height}`,
        fileSize: formatFileSize(info.size),
      });

      // 设置预览
      setVideoPreview({
        file,
        thumbnail,
        info,
      });

      // 将缩略图转换为Blob
      const thumbnailBlob = dataUrlToBlob(thumbnail);

      // 上传视频和缩略图
      const uploadData = await uploadFileWithProgress(file, "/api/upload/videos", {
        thumbnail: thumbnailBlob,
        duration: info.duration.toString(),
      });

      // 保存到数据库 - 使用管理员API
      const dbRes = await fetch(`/api/admin/therapists/${therapistId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: uploadData.url,
          videoUrl: uploadData.videoUrl,
          coverUrl: uploadData.coverUrl,
          duration: uploadData.duration,
          fileType: "video",
        }),
      });

      const dbData = await dbRes.json();
      if (dbData.success) {
        toast.success(`视频上传成功！时长: ${formatDuration(info.duration)}`);
        fetchTherapistData(); // 刷新数据
        setVideoPreview(null); // 清除预览
      } else {
        toast.error(dbData.error || "视频保存失败");
      }
    } catch (error) {
      console.error("视频上传失败:", error);
      toast.error(error instanceof Error ? error.message : "视频上传失败");
      setVideoPreview(null);
    } finally {
      setUploadingPhoto(false);
      setUploadProgress({});
      setCurrentUploadType(null);
      e.target.value = "";
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const res = await fetch(`/api/admin/therapists/${therapistId}/photos/${photoId}`, {
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

  const handleSetPrimaryPhoto = async (photoId: string) => {
    try {
      const res = await fetch(`/api/admin/therapists/${therapistId}/photos/${photoId}/primary`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (data.success) {
        toast.success("主图设置成功");
        fetchTherapistData();
      } else {
        toast.error(data.error || "设置失败");
      }
    } catch (error) {
      console.error("设置主图失败:", error);
      toast.error("网络错误");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证照片数量（仅提示，不阻止保存）
    if (!therapist || therapist.photos.length < 3) {
      const confirmed = window.confirm(
        `当前已上传${therapist?.photos.length || 0}张照片，建议至少上传3张。\n\n` +
          `照片不足3张将无法提交审核。\n\n` +
          `是否继续保存？`
      );
      if (!confirmed) {
        return;
      }
    }

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
      const res = await fetch(`/api/admin/therapists/${therapistId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          age: ageNum,
          height: heightNum,
          weight: weightNum,
          cardValue: cardValue.trim() || null,
          city: city.trim(),
          areas,
          phone: phone.trim() || null,
          email: email.trim() || null,
          location,
          profile: {
            introduction,
            serviceAddress,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("技师资料更新成功");
        router.push("/admin/therapists-center");
      } else {
        toast.error(data.error || "更新失败");
      }
    } catch (error) {
      console.error("更新技师资料失败:", error);
      toast.error("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-pure-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-cyan" />
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-pure-black p-4 md:p-8 pt-24 md:pt-28">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin/therapists-center">
            <Button
              variant="ghost"
              size="sm"
              className="border border-white/10 text-white hover:text-primary-cyan hover:border-primary-cyan/50 hover:bg-primary-cyan/10 bg-transparent font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回列表
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-pure-white mb-2">编辑技师资料</h1>
            <p className="text-secondary/60">管理员编辑技师资料 - {therapist?.nickname}</p>
          </div>
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

              <div className="md:col-span-2">
                <Label htmlFor="areas" className="text-white">
                  服务区域
                </Label>
                <Input
                  id="areas"
                  type="text"
                  value={areas.join(", ")}
                  onChange={(e) =>
                    setAreas(
                      e.target.value
                        .split(",")
                        .map((area) => area.trim())
                        .filter((area) => area)
                    )
                  }
                  placeholder="请输入服务区域，用逗号分隔"
                  className="bg-white/5 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* 个人介绍 */}
          <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">个人介绍</h2>
            <Textarea
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="请介绍技师的服务特色、专业技能、从业经验等..."
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div>
                <Label htmlFor="email" className="text-white">
                  邮箱
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  className="bg-white/5 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
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
            <p className="text-gray-400 text-sm mb-4">
              至少上传3张照片，展示技师的形象和服务环境
              {therapist && (
                <span
                  className={
                    therapist.photos.length >= 3 ? "text-green-400 ml-2" : "text-yellow-400 ml-2"
                  }
                >
                  （已上传 {therapist.photos.length}/3 张）
                </span>
              )}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {therapist?.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-700 group"
                >
                  {/* 区分图片和视频展示 */}
                  {photo.isVideo ? (
                    <video
                      src={photo.videoUrl || photo.url}
                      poster={photo.coverUrl || undefined}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                  ) : (
                    <Image
                      src={photo.url}
                      alt="技师照片"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  )}

                  {/* 视频标识 */}
                  {photo.isVideo && (
                    <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded-md flex items-center gap-1">
                      <VideoIcon className="w-3 h-3 text-white" />
                      {photo.duration && (
                        <span className="text-white text-xs">{formatDuration(photo.duration)}</span>
                      )}
                    </div>
                  )}

                  {/* 主图标识 */}
                  {photo.isPrimary && (
                    <div
                      className={`absolute top-2 bg-primary-cyan px-2 py-1 rounded-md flex items-center gap-1 shadow-lg ${photo.isVideo ? "left-2 top-10" : "left-2"}`}
                    >
                      <Star className="w-3 h-3 text-pure-black fill-pure-black" />
                      <span className="text-pure-black text-xs font-bold">主图</span>
                    </div>
                  )}

                  {/* 始终可见的操作图标 - 移动端友好 */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {/* 主图切换按钮 */}
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryPhoto(photo.id)}
                      className={`w-8 h-8 md:w-7 md:h-7 rounded-full backdrop-blur-sm border transition-all duration-200 flex items-center justify-center ${
                        photo.isPrimary
                          ? "bg-yellow-500/90 border-yellow-400 text-white shadow-lg"
                          : "bg-black/50 border-gray-400 text-white hover:bg-yellow-500/80 hover:border-yellow-400"
                      }`}
                      title={photo.isPrimary ? "已是主图" : "设为主图"}
                    >
                      <Star
                        className={`w-4 h-4 md:w-3 md:h-3 ${photo.isPrimary ? "fill-white" : ""}`}
                      />
                    </button>

                    {/* 删除按钮 */}
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="w-8 h-8 md:w-7 md:h-7 rounded-full bg-red-500/90 border border-red-400 text-white hover:bg-red-600/90 transition-all duration-200 flex items-center justify-center shadow-lg"
                      title="删除照片"
                    >
                      <X className="w-4 h-4 md:w-3 md:h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {/* 分离的上传按钮 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 图片上传 */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingPhoto}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex items-center justify-center gap-2 w-full py-4 px-4 border-2 border-dashed border-blue-500/50 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-500/10 transition-all ${uploadingPhoto ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {uploadingPhoto && currentUploadType === "image" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                        <span className="text-white">
                          处理图片 {uploadedFiles}/{totalFiles}
                        </span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-6 h-6 text-blue-400" />
                        <div className="text-center">
                          <div className="text-white font-medium">上传图片</div>
                          <div className="text-xs text-gray-400">支持JPG、PNG、WebP</div>
                        </div>
                      </>
                    )}
                  </label>
                  <p className="text-xs text-gray-500 mt-2 text-center">最大10MB，自动优化压缩</p>
                </div>

                {/* 视频上传 */}
                <div className="relative">
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime,video/x-msvideo"
                    onChange={handleVideoUpload}
                    disabled={uploadingPhoto}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className={`flex items-center justify-center gap-2 w-full py-4 px-4 border-2 border-dashed border-purple-500/50 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-500/10 transition-all ${uploadingPhoto ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {uploadingPhoto && currentUploadType === "video" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                        <span className="text-white">处理视频中...</span>
                      </>
                    ) : (
                      <>
                        <VideoIcon className="w-6 h-6 text-purple-400" />
                        <div className="text-center">
                          <div className="text-white font-medium">上传视频</div>
                          <div className="text-xs text-gray-400">支持MP4、MOV、AVI</div>
                        </div>
                      </>
                    )}
                  </label>
                  <p className="text-xs text-gray-500 mt-2 text-center">最大100MB，自动生成封面</p>
                </div>
              </div>

              {/* 视频预览 */}
              {videoPreview && (
                <div className="bg-white/10 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">视频预览</h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setVideoPreview(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 缩略图预览 */}
                    <div className="relative">
                      <img
                        src={videoPreview.thumbnail}
                        alt="视频缩略图"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/70 rounded-full p-2">
                          <VideoIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* 视频信息 */}
                    <div className="space-y-2 text-sm">
                      <div className="text-white">
                        <span className="text-gray-400">文件名:</span> {videoPreview.file.name}
                      </div>
                      <div className="text-white">
                        <span className="text-gray-400">时长:</span>{" "}
                        {formatDuration(videoPreview.info.duration)}
                      </div>
                      <div className="text-white">
                        <span className="text-gray-400">分辨率:</span> {videoPreview.info.width}x
                        {videoPreview.info.height}
                      </div>
                      <div className="text-white">
                        <span className="text-gray-400">大小:</span>{" "}
                        {formatFileSize(videoPreview.info.size)}
                      </div>
                      <div className="text-white">
                        <span className="text-gray-400">格式:</span> {videoPreview.info.type}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 上传进度条 */}
              {uploadingPhoto && Object.keys(uploadProgress).length > 0 && (
                <div className="bg-white/10 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm text-white mb-2">
                    <span>总体进度</span>
                    <span>{Math.round((uploadedFiles / totalFiles) * 100)}%</span>
                  </div>
                  <Progress value={(uploadedFiles / totalFiles) * 100} className="h-2" />

                  {/* 每个文件的进度 */}
                  <div className="space-y-2 mt-4 max-h-40 overflow-y-auto">
                    {Object.entries(uploadProgress).map(([fileName, progress]) => (
                      <div key={fileName} className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-300">
                          <span className="truncate max-w-[200px]">{fileName}</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              className="flex-1 bg-primary-cyan text-pure-black hover:bg-primary-cyan/90 font-semibold shadow-lg shadow-primary-cyan/30"
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
