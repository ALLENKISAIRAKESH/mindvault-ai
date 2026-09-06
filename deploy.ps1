# ==============================================================================
# MindVault AI — Google Cloud Run Deployment Script (PowerShell)
# ==============================================================================

param (
    [string]$ProjectId = $env:GOOGLE_CLOUD_PROJECT,
    [string]$Region = "us-central1",
    [string]$ServiceName = "mindvault-ai"
)

if (-not $ProjectId) {
    Write-Host "❌ Error: Project ID not specified." -ForegroundColor Red
    Write-Host "Usage: .\deploy.ps1 -ProjectId YOUR_GCP_PROJECT_ID [-Region us-central1] [-ServiceName mindvault-ai]" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Starting MindVault AI deployment to Google Cloud Run..." -ForegroundColor Cyan
Write-Host "• Project ID:    $ProjectId" -ForegroundColor Gray
Write-Host "• Region:        $Region" -ForegroundColor Gray
Write-Host "• Service Name:  $ServiceName" -ForegroundColor Gray

# Set active GCP project
Write-Host "`n🔧 Setting active project..." -ForegroundColor Cyan
gcloud config set project $ProjectId

# Enable required GCP APIs
Write-Host "`n🔌 Enabling required Google Cloud APIs..." -ForegroundColor Cyan
gcloud services enable `
    run.googleapis.com `
    cloudbuild.googleapis.com `
    secretmanager.googleapis.com `
    firestore.googleapis.com `
    aiplatform.googleapis.com `
    artifactregistry.googleapis.com

# Deploy directly to Cloud Run from source (builds with Cloud Build using Dockerfile)
Write-Host "`n📦 Building and deploying container to Cloud Run..." -ForegroundColor Cyan
gcloud run deploy $ServiceName `
    --source . `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --set-env-vars NODE_ENV=production `
    --min-instances 0 `
    --max-instances 10 `
    --memory 512Mi `
    --cpu 1 `
    --timeout 300

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ MindVault AI successfully deployed to Google Cloud Run!" -ForegroundColor Green
    $ServiceUrl = gcloud run services describe $ServiceName --platform managed --region $Region --format 'value(status.url)'
    Write-Host "🌐 Live Application URL: $ServiceUrl" -ForegroundColor Green
} else {
    Write-Host "`n❌ Deployment failed. Please check the logs above." -ForegroundColor Red
}
