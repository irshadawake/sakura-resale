# 🚀 Quick Start Guide - Sakura Resale

Get your Sakura Resale marketplace up and running in minutes!

## Option 1: Local Development (Fastest)

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### Steps

1. **Run the setup script**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

2. **Start the services**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/api-docs

## Option 2: Docker Compose (All-in-One)

```bash
docker-compose up
```

That's it! Visit http://localhost:3000

## Option 3: Deploy to AWS

### Prerequisites
- AWS CLI configured
- Terraform installed
- Docker installed

### Steps

1. **Create Terraform state bucket**
```bash
aws s3 mb s3://sakura-resale-terraform-state --region ap-northeast-1
```

2. **Configure infrastructure**
```bash
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

3. **Deploy infrastructure**
```bash
terraform init
terraform apply
```

4. **Build and push Docker images**
```bash
cd ..
./scripts/build.sh
```

5. **Get your application URL**
```bash
cd infrastructure
terraform output alb_dns_name
```

Full deployment guide: [infrastructure/README.md](infrastructure/README.md)

## Next Steps

### Create Your First User

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "username": "testuser",
    "full_name": "Test User"
  }'
```

### Create a Listing

1. Login to get a token
2. Navigate to "+ Post Ad" in the UI
3. Fill in the listing details
4. Upload images
5. Publish!

## Troubleshooting

### Database Connection Failed

Make sure PostgreSQL is running:
```bash
docker-compose ps postgres
```

If not running:
```bash
docker-compose up -d postgres
```

### Frontend Can't Connect to Backend

Check that backend is running on port 4000:
```bash
curl http://localhost:4000/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### Port Already in Use

Change ports in:
- Backend: `backend/.env` (PORT variable)
- Frontend: Run `npm run dev -- -p 3001`
- Docker: Edit `docker-compose.yml`

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://sakura:sakura123@localhost:5432/sakura_resale
JWT_SECRET=your-secret-key
AWS_REGION=ap-northeast-1
PORT=4000
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Common Commands

```bash
# Install dependencies
cd backend && npm install
cd frontend && npm install

# Run tests
cd backend && npm test
cd frontend && npm test

# Build for production
cd backend && npm run build
cd frontend && npm run build

# Type check
cd backend && npm run typecheck
cd frontend && npm run typecheck

# Lint
cd backend && npm run lint
cd frontend && npm run lint
```

## Project Structure

```
sakura-nov2025/
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, validation, etc.
│   │   └── database/     # DB connection & schema
│   └── package.json
├── frontend/             # Next.js React app
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/              # API client, utilities
│   └── package.json
├── infrastructure/       # Terraform AWS config
└── docker-compose.yml    # Local development
```

## Key Features Implemented

✅ User authentication (register, login, JWT)  
✅ Listing CRUD operations  
✅ Category browsing  
✅ Search and filtering  
✅ Featured listings  
✅ Location-based listings  
✅ Free giveaways section  
✅ Responsive design  
✅ Image placeholders (ready for S3 uploads)  
✅ Database with proper indexes  
✅ API documentation (Swagger)  
✅ Docker support  
✅ AWS infrastructure as code  

## Ready for Production

The application is production-ready with:
- Secure authentication
- Database indexing
- CORS configuration
- Error handling
- Logging
- Health checks
- Scalable architecture
- CDN for static assets
- Automated backups

## Need Help?

- 📖 Full documentation: [README.md](README.md)
- 🏗️ AWS deployment: [infrastructure/README.md](infrastructure/README.md)
- 🐛 Report issues: Open a GitHub issue
- 💬 Questions: Check the main README

## What's Next?

1. Customize the branding and colors in `tailwind.config.ts`
2. Add your logo replacing the 🌸 emoji
3. Configure your domain name and SSL certificate
4. Set up monitoring and alerts
5. Add more features!

Happy coding! 🌸
