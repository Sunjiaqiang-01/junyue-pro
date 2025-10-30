"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Location {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface TencentMapWechatStyleProps {
  value?: Location | null;
  onChange?: (location: Location | null) => void;
  className?: string;
  defaultCenter?: { lat: number; lng: number };
}

// 腾讯地图API Key
const TENCENT_MAP_KEY = "XF5BZ-SACWC-J7V27-A36VI-TWGQ3-N2BWX";

// 声明全局TMap类型
declare global {
  interface Window {
    TMap: any;
  }
}

export default function TencentMapWechatStyle({
  value,
  onChange,
  className,
  defaultCenter = { lat: 39.908823, lng: 116.39747 }, // 默认北京
}: TencentMapWechatStyleProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstance = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(value || null);
  const [confirmedLocation, setConfirmedLocation] = useState<Location | null>(value || null);
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(!!value);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // 加载腾讯地图SDK
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 检查是否已加载
    if (window.TMap) {
      setIsMapLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${TENCENT_MAP_KEY}`;
    script.async = true;
    script.onload = () => {
      console.log("✅ 腾讯地图SDK加载成功");
      setIsMapLoaded(true);
    };
    script.onerror = () => {
      console.error("❌ 腾讯地图SDK加载失败");
      toast.error("地图加载失败，请刷新页面重试");
    };
    document.head.appendChild(script);

    return () => {
      // 清理脚本（可选）
    };
  }, []);

  // 初始化地图
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || mapInstance.current) return;

    // 延迟初始化，确保DOM完全渲染
    const timer = setTimeout(() => {
      try {
        const center = value
          ? new window.TMap.LatLng(value.latitude, value.longitude)
          : new window.TMap.LatLng(defaultCenter.lat, defaultCenter.lng);

        console.log("🗺️ 开始初始化地图", {
          container: mapRef.current,
          containerSize: {
            width: mapRef.current?.offsetWidth,
            height: mapRef.current?.offsetHeight,
          },
          center: { lat: center.lat, lng: center.lng },
        });

        const map = new window.TMap.Map(mapRef.current, {
          center: center,
          zoom: 16,
          viewMode: "2D",
          baseMap: {
            type: "vector",
          },
        });

        mapInstance.current = map;
        console.log("✅ 地图初始化成功");

        // 监听地图加载完成事件
        map.on("tilesloaded", () => {
          console.log("✅ 地图瓦片加载完成");
        });

        // 监听地图拖动结束事件
        map.on("dragend", () => {
          const center = map.getCenter();
          handleMapCenterChange(center.lat, center.lng);
        });

        // 初始化时获取中心点位置信息
        handleMapCenterChange(center.lat, center.lng);
      } catch (error) {
        console.error("❌ 地图初始化失败:", error);
        toast.error("地图初始化失败");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isMapLoaded, defaultCenter, value]);

  // 处理地图中心点变化
  const handleMapCenterChange = useCallback(
    async (lat: number, lng: number) => {
      setIsGeocoding(true);
      try {
        const response = await fetch(`/api/tencent-map/geocoder?lat=${lat}&lng=${lng}`);
        const data = await response.json();

        if (data.success) {
          const locationData: Location = {
            name: data.data.formatted_address,
            address: data.data.address,
            latitude: lat,
            longitude: lng,
          };

          setCurrentLocation(locationData);

          // 注意：实时拖动时不通知父组件，只有确认后才通知
        } else {
          console.error("逆地址解析失败:", data.error);
          toast.error("获取位置信息失败");
        }
      } catch (error) {
        console.error("逆地址解析错误:", error);
        toast.error("网络错误，请稍后重试");
      } finally {
        setIsGeocoding(false);
      }
    },
    [onChange]
  );

  // 搜索地点
  const handleSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/tencent-map/search?keyword=${encodeURIComponent(keyword)}`
      );
      const data = await response.json();

      if (data.success) {
        if (data.data.length === 0) {
          toast.warning("未找到相关地点");
        }
        setSearchResults(data.data);
        setShowSearchResults(true);
      } else {
        console.error("搜索失败:", data.error);
        toast.error("搜索失败，请稍后重试");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("搜索错误:", error);
      toast.error("网络错误，请检查网络连接");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // 搜索防抖
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    setSearchKeyword(keyword);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      handleSearch(keyword);
    }, 500);
  };

  // 选择搜索结果
  const handleSelectSearchResult = (location: Location) => {
    if (mapInstance.current) {
      const center = new window.TMap.LatLng(location.latitude, location.longitude);
      mapInstance.current.setCenter(center);
      handleMapCenterChange(location.latitude, location.longitude);
    }
    setSearchKeyword("");
    setShowSearchResults(false);
  };

  // 清空搜索
  const handleClearSearch = () => {
    setSearchKeyword("");
    setSearchResults([]);
    setShowSearchResults(false);
    searchInputRef.current?.focus();
  };

  // 监听ESC键关闭搜索结果
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showSearchResults) {
        setShowSearchResults(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSearchResults]);

  // 确认位置
  const handleConfirmLocation = () => {
    if (currentLocation) {
      setConfirmedLocation(currentLocation);
      setIsLocationConfirmed(true);
      onChange?.(currentLocation); // 确认后才通知父组件
      toast.success("位置已确认");
    }
  };

  // 重新选择位置
  const handleReselect = () => {
    setIsLocationConfirmed(false);
    setConfirmedLocation(null);

    // 主动触发当前地图中心点的位置更新
    if (mapInstance.current) {
      const center = mapInstance.current.getCenter();
      handleMapCenterChange(center.lat, center.lng);
    }

    toast.info("可以重新拖动地图选择位置");
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-gray-900 rounded-lg overflow-hidden relative transition-all duration-300",
        isLocationConfirmed ? "h-[740px]" : "h-[700px]",
        className
      )}
    >
      {/* 搜索框 */}
      <div className="relative p-3 border-b border-gray-800 z-20">
        <div className="relative">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="搜索地点"
            value={searchKeyword}
            onChange={handleSearchChange}
            className="bg-white/5 border-gray-700 text-white placeholder:text-gray-500 pr-20"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {searchKeyword && (
              <button
                onClick={handleClearSearch}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-primary-cyan animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* 地图容器 */}
      <div
        className="relative"
        style={{
          height: "480px",
        }}
      >
        {/* 地图 */}
        <div
          ref={mapRef}
          className={cn(
            "w-full h-full transition-opacity duration-200",
            showSearchResults && "opacity-0"
          )}
          style={{
            width: "100%",
            height: "480px",
            position: "relative",
          }}
        />

        {/* 中心固定标记 */}
        {!showSearchResults && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <div
              className="text-4xl drop-shadow-2xl transform transition-transform duration-200"
              style={{
                marginBottom: "24px",
                filter:
                  "drop-shadow(0 3px 6px rgba(0,0,0,0.4)) drop-shadow(0 1px 3px rgba(0,0,0,0.6))",
                transform: "scaleX(0.85) scaleY(0.9)",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              📍
            </div>
          </div>
        )}

        {/* 加载提示 */}
        {isGeocoding && !showSearchResults && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2 z-20">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">定位中...</span>
          </div>
        )}

        {/* 搜索结果覆盖层 */}
        {showSearchResults && (
          <div className="absolute inset-0 bg-gray-900/98 backdrop-blur-xl z-30 overflow-y-auto custom-scrollbar animate-in fade-in duration-200">
            {searchResults.length > 0 ? (
              <div className="divide-y divide-gray-700/50">
                {searchResults.map((result, index) => (
                  <div
                    key={`search-${index}`}
                    onClick={() => handleSelectSearchResult(result)}
                    className="p-4 hover:bg-primary-cyan/10 active:scale-[0.98] cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">📍</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate text-lg">{result.name}</p>
                        <p className="text-gray-400 text-sm truncate mt-1">{result.address}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Search className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg">未找到相关地点</p>
                <p className="text-sm mt-2">请尝试其他关键词</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 当前位置信息 + 确认功能 */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 border-t border-gray-700 p-2.5 z-20 space-y-2">
        {/* 实时位置 */}
        {currentLocation ? (
          <div className="flex items-start gap-3">
            <div className="text-xl flex-shrink-0">📍</div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-400 text-xs mb-1">当前位置</p>
              <p className="text-white font-medium truncate">{currentLocation.name}</p>
              <p className="text-gray-500 text-sm truncate">{currentLocation.address}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center text-gray-500 py-2">
            <p className="text-sm">拖动地图选择位置</p>
          </div>
        )}

        {/* 确认按钮 */}
        {!isLocationConfirmed && currentLocation && (
          <button
            onClick={handleConfirmLocation}
            className="w-full bg-primary-cyan hover:bg-primary-cyan/90 text-black font-semibold py-2.5 rounded-lg transition-colors duration-200"
          >
            确认此位置
          </button>
        )}

        {/* 已确认位置 */}
        {isLocationConfirmed && confirmedLocation && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2.5">
            <div className="flex items-start gap-2.5">
              <div className="text-lg flex-shrink-0">✅</div>
              <div className="flex-1 min-w-0">
                <p className="text-green-400 text-xs mb-0.5">已确认位置（将显示在前端）</p>
                <p className="text-white font-medium truncate text-sm">{confirmedLocation.name}</p>
                <p className="text-gray-400 text-xs truncate">{confirmedLocation.address}</p>
              </div>
              <button
                onClick={handleReselect}
                className="text-primary-cyan hover:text-primary-cyan/80 text-xs font-medium transition-colors px-2 py-1 rounded"
              >
                重选
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 自定义滚动条样式 */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 215, 0, 0.5);
        }
      `}</style>
    </div>
  );
}
