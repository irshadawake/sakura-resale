# How to Run Sakura Resale

## ✅ All TypeScript Issues Fixed!
## ✅ PostgreSQL Running Without Docker!
## ✅ Backend Working Perfectly!

## Start the Application

### Terminal 1 - Backend
```bash
cd /Users/irshad.k/projects/sakura-nov2025/backend
npm run dev
```

Wait until you see:
```
🌸 Sakura Resale API running on port 4000
📚 API Docs available at http://localhost:4000/api-docs
```

### Terminal 2 - Frontend
```bash
cd /Users/irshad.k/projects/sakura-nov2025/frontend
npm run dev
```

Wait until you see:
```
✓ Ready in XXXms
- Local:        http://localhost:3000
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api-docs

## What's Working

✅ Backend connects to PostgreSQL successfully
✅ Database has all tables and seed data (6 categories)
✅ All API endpoints working
✅ TypeScript compiles without errors
✅ Frontend displays UI matching your screenshot
✅ Real API integration ready

## Stop the Application

In each terminal, press `Ctrl+C`

## Troubleshooting

If port is in use:
```bash
lsof -ti :4000 | xargs kill -9
lsof -ti :3000 | xargs kill -9
```

Then start again.
