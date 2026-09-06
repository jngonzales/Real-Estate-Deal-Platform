# Migrate all `from "lucide-react"` / `from 'lucide-react'` imports
# to `from "@/components/ui/icons"`. Run from the project root.
$root = 'C:\Users\jngon\dev\Real-Estate-Deal-Platform\src'
$files = Get-ChildItem -Path $root -Recurse -File |
  Where-Object { $_.Extension -in @('.tsx','.ts') }

$changed = 0
foreach ($f in $files) {
  $text = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
  if (-not $text) { continue }
  $new = $text `
    -replace 'from "lucide-react"', 'from "@/components/ui/icons"' `
    -replace "from 'lucide-react'", "from '@/components/ui/icons'"
  if ($new -ne $text) {
    Set-Content -LiteralPath $f.FullName -Value $new -NoNewline
    $changed++
  }
}
Write-Host "Touched $changed files."
