# Script tự động sửa các pattern phổ biến trong migration Nuxt 3

Write-Host "Bắt đầu migration files..." -ForegroundColor Green

# 1. Thay router-link thành NuxtLink
Write-Host "Thay router-link thành NuxtLink..." -ForegroundColor Yellow
Get-ChildItem -Path pages,components -Recurse -Filter *.vue | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $newContent = $content -replace '<router-link', '<NuxtLink' -replace '</router-link>', '</NuxtLink>'
    if ($content -ne $newContent) {
        Set-Content -Path $_.FullName -Value $newContent -NoNewline
        Write-Host "  Đã sửa: $($_.FullName)" -ForegroundColor Cyan
    }
}

# 2. Thay router.push('/path') thành navigateTo('/path')
Write-Host "Thay router.push thành navigateTo..." -ForegroundColor Yellow
Get-ChildItem -Path pages,components -Recurse -Filter *.vue | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $newContent = $content -replace "router\.push\(['`"]([^'`"]+)['`"]\)", 'navigateTo(''$1'')'
    if ($content -ne $newContent) {
        Set-Content -Path $_.FullName -Value $newContent -NoNewline
        Write-Host "  Đã sửa: $($_.FullName)" -ForegroundColor Cyan
    }
}

# 3. Thay @css thành ~/assets/css
Write-Host "Thay @css thành ~/assets/css..." -ForegroundColor Yellow
Get-ChildItem -Path pages,components -Recurse -Filter *.vue | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $newContent = $content -replace "@css/", "~/assets/css/"
    if ($content -ne $newContent) {
        Set-Content -Path $_.FullName -Value $newContent -NoNewline
        Write-Host "  Đã sửa: $($_.FullName)" -ForegroundColor Cyan
    }
}

# 4. Thay @/config thành ~/config
Write-Host "Thay @/config thành ~/config..." -ForegroundColor Yellow
Get-ChildItem -Path pages,components -Recurse -Filter *.vue,*.js | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $newContent = $content -replace "@/config", "~/config" -replace "'@/config", "'~/config" -replace '"@/config', '"~/config'
    if ($content -ne $newContent) {
        Set-Content -Path $_.FullName -Value $newContent -NoNewline
        Write-Host "  Đã sửa: $($_.FullName)" -ForegroundColor Cyan
    }
}

Write-Host "`nHoàn thành! Vui lòng kiểm tra và sửa thủ công các pattern còn lại." -ForegroundColor Green
Write-Host "Xem MIGRATION_PATTERNS.md để biết các pattern cần sửa." -ForegroundColor Yellow

