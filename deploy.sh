#!/usr/bin/env bash
# ==============================================================================
# MindVault AI — Google Cloud Run Deployment Script (Bash)
# ==============================================================================

set -e

PROJECT_ID="${1:-$GOOGLE_CLOUD_PROJECT}"
REGION="${2:-us-central1}"
SERVICE_NAME="${3:-mindvault-ai}"

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: Project ID not specified."
    echo "Usage: ./deploy.sh <PROJECT_ID> [REGION] [SERVICE_NAME]"
    exit 1
fi

echo "🚀 Starting MindVault AI deployment to Google Cloud Run..."
echo "• Project ID:    $PROJECT_ID"
echo "• Region:        $REGION"
echo "• Service Name:  $SERVICE_NAME"

# Set active project
echo ""
echo "🔧 Setting active project..."
gcloud config set project "$PROJECT_ID"

# Enable required GCP APIs
echo ""
echo "🔌 Enabling required Google Cloud APIs..."
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    secretmanager.googleapis.com \
    firestore.googleapis.com \
    aiplatform.googleapis.com \
    artifactregistry.googleapis.com

# Deploy to Cloud Run from source
echo ""
echo "📦 Building and deploying container to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
    --source . \
    --platform managed \
    --region "$REGION" \
    --allow-unauthenticated \
    --set-env-vars NODE_ENV=production \
    --min-instances 0 \
    --max-instances 10 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 300

SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --platform managed --region "$REGION" --format 'value(status.url)')
echo ""
echo "✅ MindVault AI successfully deployed to Google Cloud Run!"
echo "🌐 Live Application URL: $SERVICE_URL"
