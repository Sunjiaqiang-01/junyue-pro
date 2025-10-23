"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { provinces, citiesByProvince } from "@/lib/china-cities";
import { ChevronDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProvinceCitySelectorProps {
  value?: string;
  onChange?: (city: string) => void;
  placeholder?: string;
  className?: string;
}

export default function ProvinceCitySelector({
  value,
  onChange,
  placeholder = "选择城市",
  className,
}: ProvinceCitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>(provinces[0]);
  const [selectedCity, setSelectedCity] = useState<string>(value || "");

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    onChange?.(city);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between bg-white/5 border-white/5 text-white hover:bg-white/10 hover:text-white hover:border-primary-cyan/30",
            className
          )}
        >
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary-cyan" />
            {selectedCity || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-pure-black/95 backdrop-blur-sm border-white/5">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-semibold text-pure-white">
            选择城市
          </DialogTitle>
        </DialogHeader>

        {/* 移动端优化：更紧凑的布局 + 更大的显示区域 */}
        <div className="grid grid-cols-[100px_1fr] md:grid-cols-[200px_1fr] gap-3 md:gap-4 h-[80vh] md:h-[500px] max-h-[600px]">
          {/* 左侧：省份列表 */}
          <div className="border-r border-white/10 pr-2 md:pr-4 overflow-y-auto custom-scrollbar">
            <div className="space-y-1">
              {provinces.map((province) => (
                <button
                  key={province}
                  onClick={() => setSelectedProvince(province)}
                  className={cn(
                    "w-full text-left px-2 md:px-4 py-3 md:py-3 rounded-lg transition-all duration-200 text-sm md:text-base",
                    "hover:bg-white/5",
                    selectedProvince === province
                      ? "bg-primary-cyan/10 text-primary-cyan border-l-4 border-primary-cyan font-semibold"
                      : "text-secondary/60 hover:text-white"
                  )}
                >
                  {province}
                </button>
              ))}
            </div>
          </div>

          {/* 右侧：城市列表 - 移动端2列，Web端3列 */}
          <div className="overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-2">
              {citiesByProvince[selectedProvince]?.map((city) => (
                <button
                  key={city.value}
                  onClick={() => handleCitySelect(city.value)}
                  className={cn(
                    "px-2 md:px-4 py-3 md:py-3 rounded-lg text-center transition-all duration-200 text-sm md:text-base",
                    "hover:bg-white/10 hover:scale-105",
                    selectedCity === city.value
                      ? "bg-primary-cyan text-pure-black font-semibold shadow-lg shadow-primary-cyan/30"
                      : "bg-white/5 text-secondary/60 hover:text-white border border-white/5"
                  )}
                >
                  {city.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 md:pt-4 border-t border-white/10">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCity("");
              onChange?.("");
              setOpen(false);
            }}
            className="bg-white/5 border-white/5 text-secondary/60 hover:bg-white/10 hover:text-white text-sm md:text-base px-3 md:px-4 py-2 md:py-2"
          >
            清除选择
          </Button>
          <Button
            onClick={() => setOpen(false)}
            className="bg-primary-cyan hover:bg-primary-cyan/90 text-pure-black font-medium shadow-lg shadow-primary-cyan/30 text-sm md:text-base px-4 md:px-6 py-2 md:py-2"
          >
            确定
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
