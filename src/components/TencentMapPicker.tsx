"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Location {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface TencentMapPickerProps {
  value?: Location | null;
  onChange?: (location: Location | null) => void;
  className?: string;
}

interface SearchResult {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

// 腾讯地图API Key
const TENCENT_MAP_KEY = "XF5BZ-SACWC-J7V27-A36VI-TWGQ3-N2BWX";

export default function TencentMapPicker({ value, onChange, className }: TencentMapPickerProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(value || null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // 防抖搜索
  useEffect(() => {
    if (!searchKeyword.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch(searchKeyword);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const handleSearch = async (keyword: string) => {
    if (!keyword.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/tencent-map/search?keyword=${encodeURIComponent(keyword)}`
      );
      const data = await response.json();

      if (data.success) {
        if (data.data.length === 0) {
          toast.warning("未找到相关地点，请尝试其他关键词");
        }
        setSearchResults(data.data);
        setShowResults(true);
      } else {
        console.error("搜索失败:", data.error, data.message);
        toast.error(data.message || "搜索失败，请稍后重试");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("搜索错误:", error);
      toast.error("网络错误，请检查网络连接");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (result: SearchResult) => {
    const location: Location = {
      name: result.name,
      address: result.address,
      latitude: result.latitude,
      longitude: result.longitude,
    };

    setSelectedLocation(location);
    onChange?.(location);
    setShowResults(false);
    setSearchKeyword("");
  };

  const handleClearLocation = () => {
    setSelectedLocation(null);
    onChange?.(null);
    setSearchKeyword("");
    setSearchResults([]);
  };

  // 生成静态地图URL
  const getStaticMapUrl = (location: Location) => {
    return `https://apis.map.qq.com/ws/staticmap/v2/?center=${location.latitude},${location.longitude}&zoom=16&size=600*400&markers=color:0xff0000|${location.latitude},${location.longitude}&key=${TENCENT_MAP_KEY}`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <Label className="text-white">服务地址</Label>
        <p className="text-xs text-gray-500 mb-2">搜索并选择您的服务地址，将在地图上展示给客户</p>

        {/* 搜索框 */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="搜索地点，如：华贸中心、建国路118号"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              className="pl-10 pr-10 bg-white/5 border-gray-700 text-white placeholder:text-gray-500"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-cyan animate-spin" />
            )}
          </div>

          {/* 搜索结果下拉列表 */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-h-80 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={`${result.name}-${result.latitude}-${result.longitude}-${index}`}
                  onClick={() => handleSelectLocation(result)}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-gray-800 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-primary-cyan flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{result.name}</p>
                      <p className="text-gray-400 text-sm truncate">{result.address}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 已选择的位置 */}
      {selectedLocation && (
        <div className="space-y-4">
          {/* 地图预览 */}
          <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden border-2 border-gray-800">
            <img
              src={getStaticMapUrl(selectedLocation)}
              alt={`${selectedLocation.name}的位置`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          </div>

          {/* 位置信息 */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-gray-800">
            <MapPin className="w-5 h-5 text-primary-cyan flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-base mb-1">{selectedLocation.name}</p>
              <p className="text-gray-400 text-sm">{selectedLocation.address}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearLocation}
              className="text-gray-400 hover:text-red-500 hover:bg-red-500/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 提示信息 */}
      {!selectedLocation && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <p className="text-blue-400 text-sm">
            💡 提示：搜索并选择您的服务地址后，客户可以在地图上看到您的位置
          </p>
        </div>
      )}
    </div>
  );
}
