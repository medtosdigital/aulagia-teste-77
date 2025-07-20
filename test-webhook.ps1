$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    email = "teste@exemplo.com"
    evento = "compra aprovada"
    produto = "Plano Professor (Mensal)"
    token = "q64w1ncxx2k"
} | ConvertTo-Json

$uri = "https://xmxpteviwcnrljtxvaoo.supabase.co/functions/v1/webhooks-aulagia"

Write-Host "🚀 Testando webhook..."
Write-Host "URL: $uri"
Write-Host "Headers: $($headers | ConvertTo-Json)"
Write-Host "Body: $body"

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "✅ Resposta do webhook:"
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ Erro ao testar webhook:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
} 