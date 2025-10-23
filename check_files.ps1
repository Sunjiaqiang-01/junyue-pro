Write-Host "=== 检查内容管理中心文件结构 ===" -ForegroundColor Green
Write-Host ""

 = @(
    "src/components/ui/sliding-tabs.tsx",
    "src/app/admin/content/page.tsx",
    "src/app/admin/content/types.ts",
    "src/app/admin/content/components/AnnouncementsTab.tsx",
    "src/app/admin/content/components/GuideTab.tsx",
    "src/app/admin/content/components/ServicesTab.tsx",
    "src/app/admin/announcements/page.tsx",
    "src/app/admin/guide/page.tsx",
    "src/app/admin/customer-services/page.tsx"
)

 | ForEach-Object {
     = Test-Path 
     = if () { " EXISTS" } else { " MISSING" }
    Write-Host " : "
}
