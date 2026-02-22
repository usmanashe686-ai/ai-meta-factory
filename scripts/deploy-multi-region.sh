#!/bin/bash
# Deploy API gateway to multiple Render regions
# Requires RENDER_API_KEY environment variable

REGIONS=("oregon" "frankfurt" "singapore")
SERVICE_ID="srv-xxxxx"  # your API gateway service ID

for region in "${REGIONS[@]}"; do
  echo "Deploying to region: $region"
  curl -X POST "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"region\":\"$region\"}"
done
