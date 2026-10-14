#!/usr/bin/env bash
# deploy-gcp.sh - Deploy Vyu PQC Scanner backend to GCP Cloud Run
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
# Update environment variables if provided (Cloud Run automatically retains existing environment variables across revisions)
ENV_UPDATE="RESEND_FROM_EMAIL=${RESEND_FROM_EMAIL:-Vyu Security <contact@uelement.in>}"
if [ -n "${RESEND_API_KEY:-}" ]; then
  ENV_UPDATE="${ENV_UPDATE},RESEND_API_KEY=${RESEND_API_KEY}"
fi

gcloud run deploy "${SERVICE_NAME}" \
  --source . \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --update-env-vars "${ENV_UPDATE}"

echo "==> Deployment completed successfully!"
echo "    Live service URL:"
gcloud run services describe "${SERVICE_NAME}" --region "${REGION}" --project "${PROJECT_ID}" --format="value(status.url)"
