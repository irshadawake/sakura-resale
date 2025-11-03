#!/bin/bash
set -e

# Configuration
AWS_REGION="${AWS_REGION:-ap-northeast-1}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
PROJECT_NAME="sakura-resale"

echo "🔨 Building Docker images..."

# Build backend
echo "Building backend..."
docker build -t ${PROJECT_NAME}-backend:latest -f backend/Dockerfile backend/

# Build frontend
echo "Building frontend..."
docker build -t ${PROJECT_NAME}-frontend:latest -f frontend/Dockerfile frontend/

echo "✅ Images built successfully!"

# Tag and push to ECR if AWS credentials are configured
if [ -n "$AWS_ACCOUNT_ID" ]; then
  echo "🚀 Pushing to ECR..."
  
  # Login to ECR
  aws ecr get-login-password --region ${AWS_REGION} | \
    docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
  
  # Tag and push backend
  docker tag ${PROJECT_NAME}-backend:latest \
    ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_NAME}-backend:latest
  docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_NAME}-backend:latest
  
  # Tag and push frontend
  docker tag ${PROJECT_NAME}-frontend:latest \
    ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_NAME}-frontend:latest
  docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_NAME}-frontend:latest
  
  echo "✅ Images pushed to ECR!"
else
  echo "⏭️  Skipping ECR push (AWS not configured)"
fi

echo "✅ Build complete!"
