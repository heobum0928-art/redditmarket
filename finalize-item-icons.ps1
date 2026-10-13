# kie.ai 원본(.raw, 1024px)을 앱용 256px PNG로 줄이고, 앱이 읽을 목록(src/itemIcons.ts)을 만든다
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'
$dir = Join-Path $PSScriptRoot '..\app\assets\items'
$keep = Join-Path $PSScriptRoot 'images\items-original'
New-Item -ItemType Directory -Force $keep | Out-Null
foreach ($raw in Get-ChildItem $dir -Filter *.raw) {
  $im = [Drawing.Image]::FromStream((New-Object IO.MemoryStream(,[IO.File]::ReadAllBytes($raw.FullName))))
  $bm = New-Object Drawing.Bitmap 256, 256
  $g = [Drawing.Graphics]::FromImage($bm)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.DrawImage($im, 0, 0, 256, 256)
  $g.Dispose(); $im.Dispose()
  $png = Join-Path $dir ($raw.BaseName + '.png')
  $bm.Save($png, [Drawing.Imaging.ImageFormat]::Png)
  $bm.Dispose()
  # 변환된 PNG가 실제로 생겼을 때만 원본을 옮겨 둔다 (지우지 않고 보관)
  if ((Test-Path $png) -and (Get-Item $png).Length -gt 1000) { Move-Item $raw.FullName (Join-Path $keep $raw.Name) -Force }
  else { throw "$($raw.Name) 변환 실패 — 원본은 그대로 둬요" }
}
# 번들러는 require 경로를 정적으로 알아야 해서, 그림 목록을 코드로 만들어 둔다
$keys = (Get-ChildItem $dir -Filter *.png).BaseName | Sort-Object
$lines = $keys | ForEach-Object { "  '$_': require('../assets/items/$_.png')," }
$ts = "// finalize-item-icons.ps1이 자동으로 만든 파일이에요. 직접 고치지 마세요.`nexport const ITEM_ICONS: Record<string, number> = {`n" + ($lines -join "`n") + "`n};`n"
[IO.File]::WriteAllText((Join-Path $PSScriptRoot '..\app\src\itemIcons.ts'), $ts)
"아이콘 $($keys.Count)개 준비 완료"
