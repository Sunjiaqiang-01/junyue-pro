import { redirect } from "next/navigation";

export default function HomeRedirect() {
  // 重定向到根路径，保持向后兼容
  redirect("/");
}
