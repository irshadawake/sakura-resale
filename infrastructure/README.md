# Sakura Resale - AWS Infrastructure

This directory contains Terraform configuration for deploying the Sakura Resale marketplace to AWS.

## Architecture

- **Compute**: ECS Fargate for containerized applications
- **Database**: RDS PostgreSQL 15
- **Storage**: S3 + CloudFront CDN
- **Networking**: VPC with public/private subnets, NAT Gateway
- **Load Balancing**: Application Load Balancer
- **Container Registry**: ECR

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform >= 1.5 installed
3. Docker installed (for building images)

## Setup

### 1. Create S3 Bucket for Terraform State

```bash
aws s3 mb s3://sakura-resale-terraform-state --region ap-northeast-1
aws s3api put-bucket-versioning \
  --bucket sakura-resale-terraform-state \
  --versioning-configuration Status=Enabled
```

### 2. Create terraform.tfvars

```bash
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your values:

```hcl
aws_region        = "ap-northeast-1"
project_name      = "sakura-resale"
environment       = "production"
db_instance_class = "db.t3.micro"
db_username       = "sakura_admin"
db_password       = "CHANGE_THIS_PASSWORD"
```

### 3. Initialize Terraform

```bash
terraform init
```

### 4. Plan and Apply

```bash
# Review changes
terraform plan

# Apply infrastructure
terraform apply
```

This will create:
- VPC with public and private subnets across 2 AZs
- RDS PostgreSQL database
- S3 bucket for uploads with CloudFront distribution
- ECS cluster with ECR repositories
- Application Load Balancer
- Security groups and IAM roles

## Deployment

### 1. Build and Push Docker Images

```bash
# From project root
./scripts/build.sh
```

### 2. Deploy ECS Services

After infrastructure is created, you'll need to create ECS task definitions and services. Example task definition files are provided in the `ecs-task-definitions/` directory.

```bash
# Register task definitions
aws ecs register-task-definition --cli-input-json file://ecs-task-definitions/backend.json
aws ecs register-task-definition --cli-input-json file://ecs-task-definitions/frontend.json

# Create services
aws ecs create-service --cli-input-json file://ecs-services/backend.json
aws ecs create-service --cli-input-json file://ecs-services/frontend.json
```

### 3. Initialize Database

Connect to the RDS instance and run the initialization script:

```bash
# Get RDS endpoint from Terraform output
terraform output rds_endpoint

# Connect using psql
psql -h <RDS_ENDPOINT> -U sakura_admin -d sakura_resale -f ../backend/database/init.sql
```

## Accessing the Application

After deployment, get the ALB DNS name:

```bash
terraform output alb_dns_name
```

Visit the URL in your browser. For production, configure a custom domain with Route53 and ACM certificate.

## Updating

To update the application:

1. Build new Docker images: `./scripts/build.sh`
2. Update ECS services to use new images
3. ECS will perform rolling deployment

## Scaling

### Horizontal Scaling

Update ECS service desired count:

```bash
aws ecs update-service \
  --cluster sakura-resale-cluster \
  --service backend-service \
  --desired-count 3
```

### Vertical Scaling

Update task definition with more CPU/memory and redeploy.

### Database Scaling

Modify `db_instance_class` in `terraform.tfvars` and run `terraform apply`.

## Monitoring

- **CloudWatch Logs**: `/ecs/sakura-resale-backend` and `/ecs/sakura-resale-frontend`
- **Container Insights**: Enabled on ECS cluster
- **RDS Monitoring**: Available in AWS Console

## Cost Optimization

For development/staging:
- Use smaller RDS instance (db.t3.micro)
- Reduce ECS task count to 1
- Use Fargate Spot for cost savings
- Set appropriate log retention periods

For production:
- Enable auto-scaling for ECS services
- Use Reserved Instances or Savings Plans
- Implement CloudFront caching strategy
- Set up S3 lifecycle policies

## Disaster Recovery

- **Database Backups**: Automated daily backups with 7-day retention
- **S3 Versioning**: Enabled on uploads bucket
- **Infrastructure as Code**: All configuration in Terraform

To restore from backup:

```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier sakura-resale-postgres-restored \
  --db-snapshot-identifier <snapshot-id>
```

## Cleanup

To destroy all infrastructure:

```bash
terraform destroy
```

⚠️ **Warning**: This will permanently delete all data. Make sure to backup before destroying.

## Troubleshooting

### ECS Tasks Not Starting

1. Check CloudWatch logs for errors
2. Verify security group rules
3. Ensure RDS is accessible from ECS tasks
4. Check task definition environment variables

### Database Connection Issues

1. Verify security group allows traffic from ECS tasks
2. Check RDS is in available state
3. Verify database credentials
4. Test connection from ECS task using `psql`

### ALB Health Checks Failing

1. Verify target group health check path
2. Ensure application is listening on correct port
3. Check security group rules
4. Review application logs

## Support

For issues or questions, refer to the main project README or open an issue on GitHub.
