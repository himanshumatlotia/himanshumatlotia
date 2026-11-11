Add-Type -AssemblyName System.Drawing
$source = "C:\Users\Deepanshu Matlotia\.gemini\antigravity\scratch\portfolio\test_dazed_settled.png"
$target = "C:\Users\Deepanshu Matlotia\.gemini\antigravity\scratch\portfolio\footer_cat_closeup.png"

$bmp = [System.Drawing.Bitmap]::FromFile($source)
$cropRect = New-Object System.Drawing.Rectangle(0, 2350, 1440, 700)
$cropped = $bmp.Clone($cropRect, $bmp.PixelFormat)
$cropped.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$cropped.Dispose()

Write-Output "Successfully saved cropped image to $target"
