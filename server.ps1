$port = 8080
$prefix = "http://localhost:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Output "Server running at $prefix"

$baseDir = "C:\Users\Deepanshu Matlotia\.gemini\antigravity\scratch\portfolio"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($urlPath) -or $urlPath -eq '/') {
            $urlPath = 'index.html'
        }

        $localPath = [System.IO.Path]::Combine($baseDir, $urlPath.Replace('/', '\'))

        if ([System.IO.File]::Exists($localPath)) {
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $contentType = switch ($ext) {
                '.html' { 'text/html; charset=utf-8' }
                '.css'  { 'text/css; charset=utf-8' }
                '.js'   { 'application/javascript; charset=utf-8' }
                '.svg'  { 'image/svg+xml' }
                '.png'  { 'image/png' }
                '.jpg'  { 'image/jpeg' }
                '.pdf'  { 'application/pdf' }
                '.mp3'  { 'audio/mpeg' }
                Default { 'application/octet-stream' }
            }

            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            $response.ContentLength64 = $errBytes.Length
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # continue on client disconnect
    }
}
