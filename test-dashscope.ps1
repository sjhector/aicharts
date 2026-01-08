$headers = @{
    'Authorization' = 'Bearer sk-cf5d7b1116364fc08d0885adab2cafda'
    'Content-Type' = 'application/json'
}

$body = @{
    model = 'qwen-max'
    messages = @(
        @{
            role = 'user'
            content = 'Hello'
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "Testing DashScope API..." -ForegroundColor Yellow
Write-Host "URL: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions" -ForegroundColor Cyan
Write-Host "Key: sk-cf5d7b1116364fc08d0885adab2cafda" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions' -Method Post -Headers $headers -Body $body
    Write-Host "✓ API Key is VALID!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "✗ API Key is INVALID or API Error!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Details:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }
}
