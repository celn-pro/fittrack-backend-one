# 🚀 Railway Deployment Guide for FitTrack Backend

## ✅ Pre-Deployment Checklist

Your backend is **Railway-ready** with the following optimizations:

### **📦 Package.json Scripts:**
- ✅ `build`: Compiles TypeScript to JavaScript
- ✅ `start`: Runs the production server
- ✅ `postinstall`: Automatically builds after npm install
- ✅ Node.js 18+ requirement specified

### **⚙️ Railway Configuration:**
- ✅ `railway.toml`: Railway deployment settings
- ✅ `nixpacks.toml`: Build configuration
- ✅ `.railwayignore`: Excludes dev files from deployment
- ✅ Health check endpoint: `/health`

## 🚀 Deployment Steps

### **1. Push to GitHub**
```bash
git add .
git commit -m "Railway deployment ready"
git push origin main
```

### **2. Deploy on Railway**
1. Go to [railway.app](https://railway.app)
2. Click "Deploy from GitHub repo"
3. Select your repository
4. Railway will automatically detect Node.js and deploy

### **3. Configure Environment Variables**
In Railway dashboard, add these environment variables:

#### **Required:**
```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secure_jwt_secret
```

#### **API Keys (Optional but Recommended):**
```
GIPHY_API_KEY=your_giphy_api_key
TENOR_API_KEY=your_tenor_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

#### **CORS (Update after deployment):**
```
CORS_ORIGIN=https://your-railway-domain.railway.app
```

### **4. Database Setup**
- Use MongoDB Atlas (free tier)
- Or Railway's MongoDB plugin
- Update `MONGODB_URI` with your connection string

## 🔧 Railway-Specific Optimizations

### **Automatic Port Binding:**
- Railway automatically sets `PORT` environment variable
- Your app listens on `process.env.PORT || 4000`

### **Health Checks:**
- Endpoint: `https://your-app.railway.app/health`
- Returns API status and database connectivity

### **Build Process:**
1. `npm ci --only=production` (install dependencies)
2. `npm run build` (compile TypeScript)
3. `npm start` (start production server)

### **Caching:**
- In-memory cache for API responses
- Reduces external API calls
- Improves performance

## 📊 Post-Deployment Testing

### **1. Health Check:**
```bash
curl https://your-app.railway.app/health
```

### **2. GraphQL Playground:**
```bash
https://your-app.railway.app/graphql
```

### **3. Test Workout Recommendations:**
```graphql
query {
  getRecommendations(filter: { category: "workout" }) {
    id
    title
    description
    steps {
      title
      media {
        type
        url
      }
    }
  }
}
```

## 🔒 Security Features

- ✅ JWT authentication
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Input validation
- ✅ Environment variable protection

## 📈 Monitoring

### **Built-in Endpoints:**
- `/health` - API health status
- `/api/info` - API information
- GraphQL introspection enabled in development only

### **Logs:**
- Railway provides real-time logs
- Error tracking and performance monitoring

## 🚨 Troubleshooting

### **Common Issues:**

1. **Build Fails:**
   - Check TypeScript compilation errors
   - Ensure all dependencies are in `dependencies` (not `devDependencies`)

2. **App Crashes:**
   - Check Railway logs
   - Verify environment variables
   - Test MongoDB connection

3. **API Errors:**
   - Verify external API keys
   - Check rate limits
   - Test endpoints individually

### **Debug Commands:**
```bash
# Local production test
npm run start:prod

# Check build output
npm run build
ls -la dist/
```

## 🎯 Performance Tips

1. **Use Railway's CDN** for static assets
2. **Enable caching** for API responses
3. **Monitor memory usage** (Railway provides metrics)
4. **Use connection pooling** for MongoDB

Your FitTrack backend is now **production-ready** for Railway! 🚀
