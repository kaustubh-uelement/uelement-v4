#!/usr/bin/env bash
# deploy-gcp.sh - Deploy Vyuh / Vyu PQC Scanner backend to GCP Cloud Run
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

SERVICE_NAME="${SERVICE_NAME:-pqc-scanner}"
REGION="${REGION:-asia-south1}"
PROJECT_ID="${PROJECT_ID:-uelement-mainstay-deployment}"

echo "==> Deploying ${SERVICE_NAME} to GCP Cloud Run..."
echo "    Project: ${PROJECT_ID}"
echo "    Region:  ${REGION}"
echo "    Source:  ${SCRIPT_DIR}"

# Deploy directly from source to Cloud Run (Cloud Build uses the Dockerfile)
gcloud run deploy "${SERVICE_NAME}" \
  --source . \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 60s \
  --set-env-vars RESEND_FROM_EMAIL="Vyuh Security <contact@uelement.in>"

echo "==> Deployment completed successfully!"
echo "    Live service URL:"
gcloud run services describe "${SERVICE_NAME}" --region "${REGION}" --project "${PROJECT_ID}" --format="value(status.url)"
