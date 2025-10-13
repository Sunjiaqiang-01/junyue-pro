import Image from "next/image";
import { CheckCircle2, AlertCircle } from "lucide-react";
import CustomerServiceButton from "@/components/CustomerServiceButton";
import ResizableNavigation from "@/components/ResizableNavigation";
import PageContainer from "@/components/PageContainer";
import * as PricingCard from "@/components/ui/pricing-card";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "君悦SPA - 高端技师预约服务平台",
  description:
    "专业SPA技师服务，提供基础舒缓、进阶焕活、奢华尊享三大套餐，所有技师均经过专业培训。",
};

async function getAnnouncement() {
  const announcement = await prisma.announcement.findFirst({
    where: {
      isPublished: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
  });

  return announcement;
}

export default async function HomePage() {
  const announcement = await getAnnouncement();

  // 服务套餐数据
  const packages = [
    {
      icon: "💆",
      name: "项目一",
      price: "¥498",
      duration: "60分钟",
      features: ["体推", "全身推油", "肾部保养", "全身按摩", "臀部保养", "私密护理"],
    },
    {
      icon: "💆‍♀️",
      name: "项目二",
      badge: "热门",
      price: "¥598",
      duration: "80分钟",
      features: ["包含项目一全部内容", "额外增加头疗", "激情助浴", "耳边调情", "手指弹滑"],
    },
    {
      icon: "💆‍♂️",
      name: "项目三",
      price: "¥698",
      duration: "90分钟",
      features: ["包含项目一+二全部内容", "额外增加花式滑推", "水晶之恋", "疏通护理", "深度放松"],
    },
  ];

  return (
    <PageContainer className="bg-deep-black">
      {/* 导航栏 */}
      <ResizableNavigation />

      {/* 主容器 */}
      <div className="px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          {/* Logo和标题区域 */}
          <section className="py-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32 md:w-40 md:h-40">
                <Image
                  src="/logo.png"
                  alt="君悦SPA Logo"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-gold via-yellow-400 to-primary-gold bg-clip-text text-transparent mb-4">
              君悦彩虹SPA
            </h1>
          </section>

          {/* 公告栏 */}
          {announcement && (
            <section className="mb-12">
              <div className="bg-primary-gold/10 border border-primary-gold/30 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary-gold flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">{announcement.title}</p>
                    <p className="text-gray-300 text-sm">{announcement.content}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 项目介绍 */}
          <section className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">专业SPA技师服务</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              我们提供专业的SPA技师服务，让您享受放松身心的美好时光。
              所有技师均经过专业培训，为您提供优质的服务体验。
            </p>
          </section>

          {/* 服务套餐卡片 */}
          <section className="mb-16">
            <div className="grid md:grid-cols-3 gap-6">
              {packages.map((pkg, index) => (
                <PricingCard.Card key={index} className="max-w-full">
                  <PricingCard.Header>
                    <PricingCard.Plan>
                      <PricingCard.PlanName>
                        <span className="text-4xl">{pkg.icon}</span>
                        <span>{pkg.name}</span>
                      </PricingCard.PlanName>
                      {pkg.badge && <PricingCard.Badge>{pkg.badge}</PricingCard.Badge>}
                    </PricingCard.Plan>
                    <PricingCard.Price>
                      <PricingCard.MainPrice>{pkg.price}</PricingCard.MainPrice>
                      <PricingCard.Period>/{pkg.duration}</PricingCard.Period>
                    </PricingCard.Price>
                  </PricingCard.Header>

                  <PricingCard.Body>
                    <PricingCard.List>
                      {pkg.features.map((feature, idx) => (
                        <PricingCard.ListItem key={idx}>
                          <CheckCircle2 className="w-4 h-4 text-primary-gold flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </PricingCard.ListItem>
                      ))}
                    </PricingCard.List>
                  </PricingCard.Body>
                </PricingCard.Card>
              ))}
            </div>
          </section>

          {/* 预约说明 */}
          <section className="mb-16">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">💰</span>
                <h3 className="text-2xl font-bold text-white">预约说明</h3>
              </div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-primary-gold">•</span>
                  <span>预约需支付定金100元</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-gold">•</span>
                  <span>支持上门服务（需报销实际路费）</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-gold">•</span>
                  <span>路费标准：滴滴/出租车实际计费</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-gold">•</span>
                  <span>透明消费，不满意可及时反馈</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-gold">•</span>
                  <span>选择好技师，确定项目和时间，联系客服安排即可~</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 底部CTA */}
          <section className="py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              如需预约服务，请联系我们的客服
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              专业客服团队随时为您服务，为您推荐最合适的技师
            </p>
            <p className="text-gray-400 text-sm">点击右下角悬浮按钮联系客服</p>
          </section>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="border-t border-gray-800 py-8 text-center">
        <p className="text-gray-500 text-sm">君悦彩虹SPA © 2024 版权所有</p>
      </footer>

      {/* 悬浮客服按钮 */}
      <CustomerServiceButton variant="floating" />
    </PageContainer>
  );
}
