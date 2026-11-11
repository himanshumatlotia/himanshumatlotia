$pdfPath = "C:\Users\Deepanshu Matlotia\.gemini\antigravity\brain\e11ba019-194a-40b3-aa23-d1f24a0b15d6\.user_uploaded\media_1794420541026.pdf"
$destDir = "C:\Users\Deepanshu Matlotia\.gemini\antigravity\scratch\portfolio\assets\case-study-recruit-crm"
New-Item -ItemType Directory -Force -Path $destDir | Out-Null

Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | ? { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]

function Await($WinRtTask, $ResultType) {
    $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
    $netTask = $asTask.Invoke($null, @($WinRtTask))
    $netTask.Wait(-1) | Out-Null
    $netTask.Result
}

try {
    [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime] | Out-Null
    
    $file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($pdfPath)) ([Windows.Storage.StorageFile])
    $doc = Await ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])
    Write-Output "PDF Page Count: $($doc.PageCount)"
    
    for ($i = 0; $i -lt $doc.PageCount; $i++) {
        $page = $doc.GetPage($i)
        $outPath = Join-Path $destDir "page_$($i+1).png"
        $outFile = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync((New-Item -Path $outPath -ItemType File -Force).FullName)) ([Windows.Storage.StorageFile])
        $stream = Await ($outFile.OpenAsync([Windows.Storage.FileAccessMode]::ReadWrite)) ([Windows.Storage.Streams.IRandomAccessStream])
        
        $renderOptions = New-Object Windows.Data.Pdf.PdfPageRenderOptions
        $renderOptions.DestinationWidth = [uint32]1600 # crisp high res
        
        $renderTask = $page.RenderToStreamAsync($stream, $renderOptions)
        $asTaskVoid = ([System.WindowsRuntimeSystemExtensions].GetMethods() | ? { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' })[0]
        $netTask = $asTaskVoid.Invoke($null, @($renderTask))
        $netTask.Wait(-1) | Out-Null
        
        Await ($stream.FlushAsync()) ([bool]) | Out-Null
        $stream.Dispose()
        $page.Dispose()
        Write-Output "Exported page $($i+1)"
    }
    Write-Output "All pages exported successfully!"
} catch {
    Write-Output "WinRT PDF error: $_"
}
