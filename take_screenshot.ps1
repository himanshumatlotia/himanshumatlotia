param(
    [string]$Url = "http://localhost:8080/",
    [string]$Output = "verify_home.png",
    [int]$Width = 1440,
    [int]$Height = 1800
)

$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) {
    $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
}

$tempPng = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "snap_" + [System.Guid]::NewGuid().ToString("N") + ".png")
$destPath = Join-Path (Get-Location) $Output

$cmd = "`"$edge`" --headless=new --no-sandbox --disable-gpu --window-size=$Width,$Height --screenshot=`"$tempPng`" $Url"
cmd.exe /c $cmd

Start-Sleep -Seconds 1

if (Test-Path $tempPng) {
    Copy-Item $tempPng $destPath -Force
    Remove-Item $tempPng -Force -ErrorAction SilentlyContinue
    Write-Output "Screenshot captured: $destPath ($((Get-Item $destPath).Length) bytes)"
} else {
    Write-Output "Failed to capture screenshot."
}
