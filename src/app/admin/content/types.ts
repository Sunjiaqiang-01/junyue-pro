export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface City {
  id: string;
  name: string;
}

export interface CustomerServiceCity {
  id: string;
  city: City;
}

export interface CustomerService {
  id: string;
  cityId: string | null;
  city: City | null;
  name: string;
  wechatQrCode: string;
  wechatId: string | null;
  phone: string | null;
  workingHours: string;
  isActive: boolean;
  order: number;
  cities: CustomerServiceCity[];
}

export type TabType = "announcements" | "guide" | "services";
