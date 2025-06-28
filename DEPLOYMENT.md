# Deployment Guide

This guide covers deploying the FitTrack Backend to Railway and other platforms.

## 🚀 Railway Deployment (Recommended)

Railway is the recommended deployment platform for this application due to its simplicity and free tier compatibility.

### Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **ExerciseDB API Key**: Get a free API key from [RapidAPI ExerciseDB](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb)
3. **Git Repository**: Your code should be in a Git repository

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

### Step 3: Initialize Railway Project

```bash
railway init
```

Choose "Deploy from GitHub repo" and select your repository.

### Step 4: Set Environment Variables

```bash
# Required
railway variables set RAPIDAPI_KEY=your-rapidapi-key-here

# Optional (with defaults)
railway variables set NODE_ENV=production
railway variables set PORT=4000
railway variables set CORS_ORIGIN=https://your-frontend-domain.com
```

### Step 5: Deploy

```bash
railway up
```

Your application will be deployed and you'll receive a URL like `https://your-app.railway.app`.

### Step 6: Verify Deployment

Test your deployment:

```bash
# Health check
curl https://your-app.railway.app/health

# API info
curl https://your-app.railway.app/api/info

# GraphQL endpoint
curl -X POST https://your-app.railway.app/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getApiHealth { status } }"}'
```

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `RAPIDAPI_KEY` | ExerciseDB API key from RapidAPI | `abc123def456...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment | `production` |
| `CORS_ORIGIN` | Allowed CORS origin | `*` |
| `EXERCISEDB_RATE_LIMIT_PER_MINUTE` | API rate limit per minute | `100` |
| `EXERCISEDB_RATE_LIMIT_PER_DAY` | API rate limit per day | `10000` |
| `CACHE_TTL_EXERCISES` | Exercise cache TTL (ms) | `86400000` |
| `CACHE_TTL_RECOMMENDATIONS` | Recommendation cache TTL (ms) | `7200000` |
| `CACHE_TTL_USER_METRICS` | User metrics cache TTL (ms) | `1800000` |
| `CACHE_MAX_SIZE` | Maximum cache entries | `100` |

## 🐳 Docker Deployment

### Dockerfile

Create a `Dockerfile` in your project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start the application
CMD ["npm", "start"]
```

### Build and Run

```bash
# Build the image
docker build -t fittrack-backend .

# Run the container
docker run -p 4000:4000 \
  -e RAPIDAPI_KEY=your-api-key \
  -e NODE_ENV=production \
  fittrack-backend
```

### Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  fittrack-backend:
    build: .
    ports:
      - "4000:4000"
    environment:
      - RAPIDAPI_KEY=${RAPIDAPI_KEY}
      - NODE_ENV=production
      - PORT=4000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
```

Run with:

```bash
RAPIDAPI_KEY=your-api-key docker-compose up -d
```

## ☁️ Other Cloud Platforms

### Heroku

1. **Create Heroku app**:
   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables**:
   ```bash
   heroku config:set RAPIDAPI_KEY=your-api-key
   heroku config:set NODE_ENV=production
   ```

3. **Deploy**:
   ```bash
   git push heroku main
   ```

### Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set environment variables** in the Vercel dashboard.

### AWS Lambda (Serverless)

For serverless deployment, you'll need to modify the application to work with AWS Lambda. Consider using the Serverless Framework or AWS SAM.

## 🔍 Monitoring and Logging

### Health Checks

The application provides several health check endpoints:

- `/health` - Basic health check
- `/api/info` - API information
- GraphQL `getApiHealth` query - Detailed health status

### Logging

The application logs to stdout/stderr. In production:

- **Railway**: Logs are available in the Railway dashboard
- **Docker**: Use `docker logs container-name`
- **Heroku**: Use `heroku logs --tail`

### Monitoring

Consider adding monitoring services:

- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry, Bugsnag
- **Performance monitoring**: New Relic, DataDog

## 🔒 Security Considerations

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS in production
- [ ] Set appropriate CORS origins
- [ ] Keep API keys secure
- [ ] Enable rate limiting
- [ ] Monitor API usage
- [ ] Regular security updates

### API Key Security

- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly
- Monitor API usage for anomalies

## 🚨 Troubleshooting

### Common Issues

1. **API Key Issues**:
   ```bash
   # Check if API key is set
   railway variables
   
   # Test API key
   curl -H "X-RapidAPI-Key: your-key" \
        -H "X-RapidAPI-Host: exercisedb.p.rapidapi.com" \
        https://exercisedb.p.rapidapi.com/exercises/bodyPartList
   ```

2. **Memory Issues**:
   - Reduce cache size: `CACHE_MAX_SIZE=50`
   - Lower cache TTL values
   - Monitor memory usage

3. **Rate Limiting**:
   - Check rate limiter status via GraphQL
   - Reduce concurrent requests
   - Implement exponential backoff

4. **Build Failures**:
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Debug Mode

Enable debug logging:

```bash
railway variables set LOG_LEVEL=debug
```

### Performance Optimization

1. **Cache Optimization**:
   - Increase cache TTL for stable data
   - Monitor cache hit rates
   - Implement cache warming

2. **API Optimization**:
   - Batch API requests where possible
   - Implement request deduplication
   - Use compression

## 📊 Scaling

### Horizontal Scaling

The application is stateless and can be horizontally scaled:

- **Railway**: Automatic scaling available on paid plans
- **Docker**: Use container orchestration (Kubernetes, Docker Swarm)
- **Serverless**: Automatic scaling with AWS Lambda

### Vertical Scaling

For single-instance scaling:

- Increase memory allocation
- Optimize cache size
- Use clustering for multi-core utilization

### Database Integration

For production use, consider adding:

- **MongoDB**: User profiles and recommendation history
- **Redis**: Distributed caching
- **PostgreSQL**: Analytics and reporting

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Deploy to Railway
        uses: railway-app/railway-deploy-action@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

This deployment guide should help you successfully deploy the FitTrack Backend to your preferred platform!
