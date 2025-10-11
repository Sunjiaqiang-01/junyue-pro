'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface TherapistCardProps {
  therapist: {
    id: string;
    nickname: string;
    age: number;
    height: number;
    weight: number;
    city: string;
    areas: string[];
    isOnline: boolean;
    isNew: boolean;
    isFeatured: boolean;
    avatar: string;
    specialties?: string[];
  };
}

export default function TherapistCard({ therapist }: TherapistCardProps) {
  return (
    <Link href={`/therapists/${therapist.id}`}>
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-primary-gold transition-all duration-500 hover:scale-105">
        {/* 头像 */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={therapist.avatar}
            alt={therapist.nickname}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          
          {/* 状态标签 */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {therapist.isFeatured && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0">
                推荐
              </Badge>
            )}
            {therapist.isNew && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 border-0">
                新人
              </Badge>
            )}
            {therapist.isOnline && (
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 border-0">
                在线
              </Badge>
            )}
          </div>
        </div>

        {/* 信息区域 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary-gold transition-colors">
            {therapist.nickname}
          </h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-300 mb-2">
            <span>{therapist.age}岁</span>
            <span>{therapist.height}cm</span>
            <span>{therapist.weight}kg</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{therapist.city}</span>
            {therapist.areas.length > 0 && (
              <>
                <span>·</span>
                <span>{therapist.areas[0]}</span>
              </>
            )}
          </div>

          {/* 特色标签 */}
          {therapist.specialties && therapist.specialties.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {therapist.specialties.slice(0, 3).map((specialty, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full bg-white/10 backdrop-blur-sm text-gray-300"
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

