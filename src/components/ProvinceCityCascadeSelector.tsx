"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { provinces, citiesByProvince } from "@/lib/china-cities";

interface ProvinceCityCascadeSelectorProps {
  value: string; // 氓聼聨氓赂聜氓聬聧莽搂掳
  onChange: (city: string) => void;
  placeholder?: string;
  className?: string;
}

export default function ProvinceCityCascadeSelector({
  value,
  onChange,
  placeholder = "茅聙聣忙聥漏氓聼聨氓赂聜",
  className = "",
}: ProvinceCityCascadeSelectorProps) {
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [availableCities, setAvailableCities] = useState<{ value: string; label: string }[]>([]);

  // 氓陆聯value忙聰鹿氓聫聵忙聴露茂录聦氓聫聧氓聬聭忙聼楼忙聣戮氓炉鹿氓潞聰莽職聞莽聹聛盲禄?
  useEffect(() => {
    if (value) {
      for (const provinceName of provinces) {
        const cities = citiesByProvince[provinceName] || [];
        if (cities.some((city) => city.value === value)) {
          setSelectedProvince(provinceName);
          setAvailableCities(cities);
          break;
        }
      }
    } else {
      setSelectedProvince("");
      setAvailableCities([]);
    }
  }, [value]);

  const handleProvinceChange = (provinceValue: string) => {
    setSelectedProvince(provinceValue);
    const cities = citiesByProvince[provinceValue] || [];
    setAvailableCities(cities);

    // 忙赂聟莽漏潞氓路虏茅聙聣氓聼聨氓赂?
    onChange("");
  };

  const handleCityChange = (cityValue: string) => {
    onChange(cityValue);
  };

  return (
    <div className="flex gap-2">
      {/* 莽聹聛盲禄陆茅聙聣忙聥漏 */}
      <Select value={selectedProvince} onValueChange={handleProvinceChange}>
        <SelectTrigger className={`w-40 ${className}`}>
          <SelectValue placeholder="茅聙聣忙聥漏莽聹聛盲禄陆" />
        </SelectTrigger>
        <SelectContent className="bg-space-3 border-gray-600 max-h-[300px]">
          {provinces.map((provinceName) => (
            <SelectItem
              key={provinceName}
              value={provinceName}
              className="text-white font-medium hover:bg-gray-700 cursor-pointer"
            >
              {provinceName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 氓聼聨氓赂聜茅聙聣忙聥漏 */}
      <Select value={value} onValueChange={handleCityChange} disabled={!selectedProvince}>
        <SelectTrigger className={`w-40 ${className}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-space-3 border-gray-600 max-h-[300px]">
          {availableCities.map((city) => (
            <SelectItem
              key={city.value}
              value={city.value}
              className="text-white font-medium hover:bg-gray-700 cursor-pointer"
            >
              {city.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
