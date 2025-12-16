import type { Metadata } from "next";
import { generateMetadata } from "@/lib/seo";

export const metadata: Metadata = generateMetadata({
  title: "AI数学对话 - Chat with GeoGebra",
  description: "与AI助手对话，实时生成GeoGebra数学图形。支持多种AI模型，智能理解数学问题，自动生成可视化图形。",
  locale: 'zh-CN',
  path: '/chat',
});
