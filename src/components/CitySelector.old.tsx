'use client';

import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { chinaCities, citiesByProvince, provinces } from '@/lib/china-cities';

interface CitySelectorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CitySelector({
  value,
  onChange,
  placeholder = '选择城市',
  className,
}: CitySelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between bg-white/5 border-gray-800 text-white hover:bg-white/10 hover:text-white font-normal',
            !value && 'text-gray-400',
            className
          )}
        >
          <span className="truncate">
            {value
              ? chinaCities.find((city) => city.value === value)?.label
              : placeholder}
          </span>
          <ChevronDown
            size={16}
            strokeWidth={2}
            className="ml-2 shrink-0 opacity-50"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 bg-black/95 border-gray-800 backdrop-blur-lg"
        align="start"
      >
        <Command className="bg-transparent">
          <CommandInput 
            placeholder="搜索城市..." 
            className="bg-white/5 text-white placeholder:text-gray-500"
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty className="text-gray-400 py-6 text-center text-sm">
              未找到城市
            </CommandEmpty>
            
            {/* 全部选项 */}
            <CommandGroup heading="全部" className="text-gray-400">
              <CommandItem
                value="all"
                onSelect={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="text-gray-300 aria-selected:text-primary-gold aria-selected:bg-primary-gold/10"
              >
                全部城市
                {!value && (
                  <Check 
                    size={16} 
                    strokeWidth={2} 
                    className="ml-auto text-primary-gold" 
                  />
                )}
              </CommandItem>
            </CommandGroup>

            {/* 按省份分组 */}
            {provinces.map((province) => (
              <CommandGroup 
                key={province} 
                heading={province}
                className="text-gray-400"
              >
                {citiesByProvince[province].map((city) => (
                  <CommandItem
                    key={city.value}
                    value={city.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? '' : currentValue);
                      setOpen(false);
                    }}
                    className="text-gray-300 aria-selected:text-primary-gold aria-selected:bg-primary-gold/10"
                  >
                    {city.label}
                    {value === city.value && (
                      <Check 
                        size={16} 
                        strokeWidth={2} 
                        className="ml-auto text-primary-gold" 
                      />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

