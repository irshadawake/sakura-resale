#!/bin/bash
set -e

echo "🌸 Setting up Sakura Resale development environment..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }

# Create environment files
echo "📝 Creating environment files..."

# Backend .env
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "✅ Created backend/.env"
else
  echo "⏭️  backend/.env already exists"
fi

# Frontend .env.local
if [ ! -f frontend/.env.local ]; then
  cp frontend/.env.local.example frontend/.env.local
  echo "✅ Created frontend/.env.local"
else
  echo "⏭️  frontend/.env.local already exists"
fi

# Start Docker services
echo "🐳 Starting Docker services (PostgreSQL, Redis)..."
docker-compose up -d postgres redis

echo "⏳ Waiting for database to be ready..."
sleep 10

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Start the backend:  cd backend && npm run dev"
echo "   2. Start the frontend: cd frontend && npm run dev"
echo "   3. Visit http://localhost:3000"
echo ""
echo "   Or use Docker Compose:"
echo "   docker-compose up"
echo ""
