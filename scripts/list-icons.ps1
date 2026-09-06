# Lists every icon name imported from lucide-react across src/
$root = 'C:\Users\jngon\dev\Real-Estate-Deal-Platform\src'
$files = Get-ChildItem -Path $root -Recurse -File |
  Where-Object { $_.Extension -in @('.tsx','.ts') }

$names = New-Object System.Collections.Generic.HashSet[string]
$perFile = @{}

foreach ($f in $files) {
  $text = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
  if (-not $text) { continue }

  $ms = [regex]::Matches($text, '(?ms)import\s*\{([^}]+)\}\s*from\s*["'']lucide-react["'']')
  $fileIcons = New-Object System.Collections.Generic.HashSet[string]
  foreach ($m in $ms) {
    $body = $m.Groups[1].Value
    foreach ($token in ($body -split '[,\r\n]+')) {
      $t = $token.Trim()
      if ($t -match '^(?<n>[A-Za-z]\w*)(\s+as\s+\w+)?$') {
        $icon = $matches.n
        $null = $names.Add($icon)
        $null = $fileIcons.Add($icon)
      }
    }
  }
  if ($fileIcons.Count -gt 0) {
    $rel = $f.FullName.Substring($root.Length).TrimStart('\','/')
    $perFile[$rel] = ($fileIcons | Sort-Object)
  }
}

Write-Host '=== ALL LUCIDE ICONS IN USE ===' -ForegroundColor Cyan
Write-Host ("Total unique icons: {0}" -f $names.Count)
Write-Host ''
Write-Host '--- Icon name list (alphabetical) ---'
($names | Sort-Object) -join "`n"
Write-Host ''
Write-Host '--- Per-file usage ---'
foreach ($k in ($perFile.Keys | Sort-Object)) {
  Write-Host $k
  Write-Host ('  ' + ($perFile[$k] -join ', '))
}
