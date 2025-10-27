"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Search } from "lucide-react";
import EnhancedTherapistCard from "@/components/EnhancedTherapistCard";
import { TherapistCardSkeleton } from "@/components/TherapistCardSkeleton";
import TherapistDetailModal from "@/components/TherapistDetailModal";
import CustomerServiceButton from "@/components/CustomerServiceButton";
import ResizableNavigation from "@/components/ResizableNavigation";
import PageContainer from "@/components/PageContainer";
import PageVisitTracker from "@/components/PageVisitTracker";
import ProvinceCitySelector from "@/components/ProvinceCitySelector";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Therapist {
  id: string;
  nickname: string;
  age: number;
  height: number;
  weight: number;
  cardValue?: string; // 🆕 牌值
  city: string;
  areas: string[];
  location?: {
    // 🆕 位置信息
    name: string;
    street: string;
    latitude: number;
    longitude: number;
  };
  isNew: boolean;
  isFeatured: boolean;
  avatar: string;
  introduction?: string;
  specialties?: string[];
}

interface City {
  id: string;
  name: string;
  code: string;
  areas: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

export default function TherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 筛选条件
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showNewOnly, setShowNewOnly] = useState(false);

  // Modal状态
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 🆕 无限滚动观察目标
  const observerTarget = useRef<HTMLDivElement>(null);

  // 获取城市列表
  useEffect(() => {
    fetchCities();
  }, []);

  // 获取技师列表
  useEffect(() => {
    fetchTherapists(1);
  }, [search, selectedCity, selectedArea, showFeaturedOnly, showNewOnly]);

  // 🆕 无限滚动监听
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && page < totalPages && !loading) {
          handleLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadingMore, page, totalPages, loading]);

  const fetchCities = async () => {
    try {
      const response = await fetch("/api/cities");
      const data = await response.json();

      if (data.success) {
        setCities(data.data);
      }
    } catch (error) {
      console.error("获取城市列表失败:", error);
    }
  };

  const fetchTherapists = async (pageNum: number, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "20",
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (search) params.append("search", search);
      if (selectedCity) params.append("city", selectedCity);
      if (selectedArea) params.append("area", selectedArea);
      if (showFeaturedOnly) params.append("isFeatured", "true");
      if (showNewOnly) params.append("isNew", "true");

      const response = await fetch(`/api/therapists?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        if (append) {
          setTherapists([...therapists, ...data.data.therapists]);
        } else {
          setTherapists(data.data.therapists);
        }
        setPage(data.data.pagination.page);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        toast.error("获取技师列表失败");
      }
    } catch (error) {
      console.error("获取技师列表失败:", error);
      toast.error("网络错误");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchTherapists(page + 1, true);
    }
  };

  const handleCardClick = (therapistId: string) => {
    setSelectedTherapistId(therapistId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTherapistId(null);
  };

  const selectedCityData = cities.find((c) => c.name === selectedCity);

  return (
    <PageContainer className="bg-pure-black">
      {/* 页面访问追踪 */}
      <PageVisitTracker page="/therapists" />

      {/* 导航栏 */}
      <ResizableNavigation />

      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 标题 */}
          <div className="mb-8">
            <h1 className="text-4xl font-semibold text-pure-white mb-2 tracking-tight">技师列表</h1>
            <p className="text-secondary/60">
              {loading ? "加载中..." : `共 ${therapists.length} 位技师`}
            </p>
          </div>

          {/* 筛选器 */}
          <div className="mb-8 space-y-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="搜索技师姓名/年龄/身高/体重/牌值/关键词"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 bg-transparent border-white/5 text-white placeholder:text-secondary/30 focus:border-primary-cyan"
              />
            </div>

            {/* 快速筛选 */}
            <div className="flex flex-wrap gap-3">
              <div className="min-w-[200px]">
                <ProvinceCitySelector
                  value={selectedCity}
                  onChange={(value) => {
                    setSelectedCity(value);
                    setSelectedArea("");
                  }}
                  placeholder="选择城市"
                />
              </div>

              {selectedCityData && selectedCityData.areas.length > 0 && (
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-pure-black border border-white/5 text-white focus:border-primary-cyan focus:outline-none [&>option]:bg-pure-black [&>option]:text-white"
                >
                  <option value="">全部区域</option>
                  {selectedCityData.areas.map((area) => (
                    <option key={area.id} value={area.name}>
                      {area.name}
                    </option>
                  ))}
                </select>
              )}

              <Button
                variant={showFeaturedOnly ? "default" : "outline"}
                onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                className={
                  showFeaturedOnly
                    ? "bg-primary-cyan/10 border-primary-cyan/30 text-primary-cyan"
                    : ""
                }
              >
                推荐
              </Button>

              <Button
                variant={showNewOnly ? "default" : "outline"}
                onClick={() => setShowNewOnly(!showNewOnly)}
                className={
                  showNewOnly ? "bg-primary-cyan/10 border-primary-cyan/30 text-primary-cyan" : ""
                }
              >
                新人
              </Button>
            </div>
          </div>

          {/* 技师列表 */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <TherapistCardSkeleton key={i} />
              ))}
            </div>
          ) : therapists.length === 0 ? (
            <div className="text-center py-20 bg-transparent rounded-lg border border-white/5">
              <p className="text-secondary/60 text-lg">暂无技师</p>
              <p className="text-secondary/40 text-sm mt-2">请尝试调整筛选条件</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {therapists.map((therapist) => (
                  <EnhancedTherapistCard
                    key={therapist.id}
                    therapist={therapist}
                    onClick={() => handleCardClick(therapist.id)}
                  />
                ))}
              </div>

              {/* 🆕 无限滚动触发器 */}
              <div ref={observerTarget} className="mt-8 py-8 text-center">
                {loadingMore && (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-cyan" />
                    <span className="text-secondary/60">加载中...</span>
                  </div>
                )}
                {page >= totalPages && therapists.length > 0 && (
                  <p className="text-secondary/40">已加载全部技师</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 技师详情弹窗 */}
      <TherapistDetailModal
        therapistId={selectedTherapistId}
        open={modalOpen}
        onClose={handleCloseModal}
      />

      {/* 悬浮客服按钮 */}
      <CustomerServiceButton variant="floating" />
    </PageContainer>
  );
}
