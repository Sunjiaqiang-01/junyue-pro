"use client";

import { useState, useEffect } from "react";
import { Loader2, Search } from "lucide-react";
import EnhancedTherapistCard from "@/components/EnhancedTherapistCard";
import TherapistDetailModal from "@/components/TherapistDetailModal";
import CustomerServiceButton from "@/components/CustomerServiceButton";
import ResizableNavigation from "@/components/ResizableNavigation";
import PageContainer from "@/components/PageContainer";
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

  // 获取城市列表
  useEffect(() => {
    fetchCities();
  }, []);

  // 获取技师列表
  useEffect(() => {
    fetchTherapists(1);
  }, [search, selectedCity, selectedArea, showFeaturedOnly, showNewOnly]);

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
    <PageContainer className="bg-gradient-to-b from-black to-gray-900">
      {/* 导航栏 */}
      <ResizableNavigation />

      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 标题 */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-gold to-yellow-600 bg-clip-text text-transparent mb-2">
              技师列表
            </h1>
            <p className="text-gray-400">
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
                className="pl-12 bg-white/5 border-gray-800 text-white placeholder:text-gray-500 focus:border-primary-gold"
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
                  className="px-4 py-2 rounded-lg bg-white/5 border border-gray-800 text-white focus:border-primary-gold focus:outline-none"
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
                className={showFeaturedOnly ? "bg-yellow-600 hover:bg-yellow-700" : ""}
              >
                推荐
              </Button>

              <Button
                variant={showNewOnly ? "default" : "outline"}
                onClick={() => setShowNewOnly(!showNewOnly)}
                className={showNewOnly ? "bg-green-600 hover:bg-green-700" : ""}
              >
                新人
              </Button>
            </div>
          </div>

          {/* 技师列表 */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary-gold" />
            </div>
          ) : therapists.length === 0 ? (
            <div className="text-center py-20 bg-black/20 rounded-2xl border border-gray-800">
              <p className="text-gray-400 text-lg">暂无技师</p>
              <p className="text-gray-500 text-sm mt-2">请尝试调整筛选条件</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {therapists.map((therapist) => (
                  <EnhancedTherapistCard
                    key={therapist.id}
                    therapist={therapist}
                    onClick={() => handleCardClick(therapist.id)}
                  />
                ))}
              </div>

              {/* 加载更多 */}
              {page < totalPages && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="bg-gradient-to-r from-primary-gold to-yellow-600 hover:from-yellow-600 hover:to-primary-gold"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        加载中...
                      </>
                    ) : (
                      "加载更多"
                    )}
                  </Button>
                </div>
              )}
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
