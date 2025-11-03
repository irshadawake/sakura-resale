# Sakura Resale - Japanese Marketplace Platform

A modern, scalable resale marketplace platform for Japan, built with React, Node.js, PostgreSQL, and AWS.

## 🌸 Features

- User authentication and authorization
- Product listings with image uploads
- Category browsing (Electronics, Furniture, Clothing, Books, Sports, Free Giveaways)
- Advanced search and filtering
- Location-based listings
- Condition ratings
- Responsive design
- Japanese language support ready

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS
- **State Management**: React Query + Context API
- **Language**: TypeScript

### Backend
- **Framework**: Node.js with Express
- **Database**: PostgreSQL 15
- **Authentication**: JWT
- **File Storage**: AWS S3
- **Language**: TypeScript

### Infrastructure (AWS)
- **Compute**: ECS Fargate
- **Database**: RDS PostgreSQL
- **Storage**: S3 + CloudFront
- **Load Balancer**: Application Load Balancer
- **Container Registry**: ECR
- **Monitoring**: CloudWatch

## 📁 Project Structure

```
sakura-nov2025/
├── frontend/          # Next.js React application
├── backend/           # Node.js Express API
├── infrastructure/    # Terraform configuration for AWS
├── docker-compose.yml # Local development setup
└── README.md
```

## 🚀 Local Development Setup

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (via Docker)
- AWS CLI configured (for deployment)

### Quick Start

1. **Clone and setup**
```bash
cd /Users/irshad.k/projects/sakura-nov2025
```

2. **Start services with Docker Compose**
```bash
docker-compose up -d
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
npm run dev
```

4. **Install backend dependencies**
```bash
cd backend
npm install
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- PostgreSQL: localhost:5432

## 🔧 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_S3_BUCKET_URL=
```

### Backend (.env)
```
DATABASE_URL=postgresql://sakura:sakura123@localhost:5432/sakura_resale
JWT_SECRET=your-secret-key-change-in-production
AWS_REGION=ap-northeast-1
AWS_S3_BUCKET=
PORT=4000
NODE_ENV=development
```

## 📦 Deployment to AWS

### Step 1: Build Docker Images
```bash
./scripts/build.sh
```

### Step 2: Deploy Infrastructure
```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

### Step 3: Deploy Application
```bash
./scripts/deploy.sh
```

Detailed deployment instructions in `/infrastructure/README.md`

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

## 📝 API Documentation

API endpoints documentation available at `http://localhost:4000/api-docs` when running locally.

## 🌐 Localization

The application is prepared for Japanese language support. Translation files are located in:
- Frontend: `frontend/locales/ja.json`
- Backend: `backend/locales/ja.json`

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- SQL injection prevention with parameterized queries
- CORS configuration
- Rate limiting
- Input validation

## 📊 Monitoring

- CloudWatch for logs and metrics
- Application Performance Monitoring ready
- Error tracking configured

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For issues and questions, please open a GitHub issue.
