# FitTrack Backend - Health & Fitness App MVP

A comprehensive health and fitness app backend built with Node.js, TypeScript, GraphQL, and external APIs. This MVP provides personalized workout, nutrition, hydration, and sleep recommendations using rule-based engines and the ExerciseDB API.

## 🚀 Features

- **Personalized Workout Recommendations**: AI-powered workout plans using ExerciseDB API
- **Nutrition Planning**: Rule-based nutrition recommendations with macro calculations
- **Hydration Tracking**: Smart water intake recommendations based on user profile
- **Sleep Optimization**: Personalized sleep recommendations and schedules
- **Health Condition Filtering**: Safe exercise recommendations based on health conditions
- **In-Memory Caching**: Railway-compatible caching for optimal performance
- **Rate Limiting**: Built-in API rate limiting to respect external API limits
- **GraphQL API**: Modern GraphQL interface with type safety

## 🛠 Tech Stack

- **Backend**: Node.js + TypeScript + Express
- **API**: GraphQL with Apollo Server
- **HTTP Client**: Axios with interceptors
- **Caching**: In-memory caching (Railway free tier compatible)
- **External APIs**: ExerciseDB (free tier)
- **Deployment**: Railway-ready configuration

## 📋 Prerequisites

- Node.js 18+ and npm 8+
- ExerciseDB API key from RapidAPI (free tier available)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fittrack-backend-one
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   The project includes environment-specific configuration files:
   - `.env.development` - Development environment settings
   - `.env.production` - Production environment settings
   - `.env.example` - Template for custom configuration

   For development, edit `.env.development` and add your API keys:
   ```bash
   # Edit the development environment file
   nano .env.development
   ```

   Add your RapidAPI key:
   ```env
   RAPIDAPI_KEY=your-rapidapi-key-here
   ```

   For production, edit `.env.production` with production values:
   ```bash
   # Edit the production environment file
   nano .env.production
   ```

4. **Start the server**

   **Development mode:**
   ```bash
   npm run start:dev
   # or
   npm run dev
   ```

   **Production mode:**
   ```bash
   npm run start:prod
   ```

5. **Access the application**
   - GraphQL Playground: http://localhost:4000/graphql
   - Health Check: http://localhost:4000/health
   - API Info: http://localhost:4000/api/info

## 🏗 Project Structure

```
src/
├── config/
│   └── apiConfig.ts              # API configuration and validation
├── services/
│   ├── external-apis/
│   │   ├── BaseApiService.ts     # Base API service with rate limiting
│   │   └── ExerciseApiService.ts # ExerciseDB integration
│   ├── recommendation-engines/
│   │   ├── WorkoutEngine.ts      # Smart workout recommendations
│   │   ├── NutritionEngine.ts    # Rule-based nutrition planning
│   │   ├── HydrationEngine.ts    # Water intake calculations
│   │   └── SleepEngine.ts        # Sleep optimization
│   ├── RecommendationService.ts  # Main orchestrator
│   └── CacheService.ts           # In-memory caching
├── utils/
│   ├── transformers/
│   │   └── exerciseTransformer.ts # API data transformation
│   ├── calculators/
│   │   ├── bmrCalculator.ts      # Metabolic calculations
│   │   ├── hydrationCalculator.ts # Water intake formulas
│   │   └── sleepCalculator.ts    # Sleep recommendations
│   └── validators/
│       └── userProfileValidator.ts # User data validation
├── types/
│   ├── api.types.ts              # External API types
│   ├── recommendation.types.ts   # Internal recommendation types
│   └── user.types.ts             # User-related types
├── graphql/
│   ├── typeDefs/
│   │   └── recommendationTypeDefs.ts # GraphQL schema
│   └── resolvers/
│       └── recommendationResolvers.ts # GraphQL resolvers
└── server.ts                     # Main server file
```

## 🔑 API Usage

### Authentication

For development, use headers to simulate user authentication:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -H "x-user-email: user@example.com" \
  -H "x-user-age: 30" \
  -H "x-user-weight: 70" \
  -H "x-user-height: 175" \
  -H "x-user-gender: male" \
  -H "x-user-fitness-goal: Lose Weight" \
  -H "x-user-activity-level: Moderate" \
  -H "x-user-profile-complete: true" \
  -d '{"query": "query { getRecommendations { id title category description } }"}'
```

### GraphQL Queries

**Get Personalized Recommendations:**
```graphql
query GetRecommendations {
  getRecommendations {
    id
    category
    title
    description
    difficultyLevel
    estimatedDuration
    tips
    personalizedTips
  }
}
```

**Get User Metrics:**
```graphql
query GetUserMetrics {
  getUserMetrics {
    bmr
    tdee
    dailyCalorieGoal
    dailyWaterGoal
    recommendedSleepHours
    bmi
    bmiCategory
  }
}
```

**Refresh Recommendations:**
```graphql
mutation RefreshRecommendations {
  refreshRecommendations(categories: ["workout"]) {
    id
    title
    category
  }
}
```

## 🏥 Health Condition Support

The system automatically filters exercises based on health conditions:

- **Knee Injury**: Excludes squats, lunges, jumping exercises
- **Back Pain**: Excludes deadlifts, heavy lifting
- **Heart Condition**: Excludes high-intensity cardio
- **Hypertension**: Excludes overhead movements, heavy weights
- **Asthma**: Excludes high-intensity running

## 📊 Monitoring

### Health Check Endpoint
```bash
curl http://localhost:4000/health
```

### API Health Status
```graphql
query GetApiHealth {
  getApiHealth {
    status
    exerciseDB {
      configured
      rateLimiter {
        requestsThisMinute
        requestsToday
        minuteLimit
        dailyLimit
      }
    }
    cache {
      totalEntries
      hitRate
    }
  }
}
```

## 🚀 Deployment

### Railway Deployment

1. **Connect to Railway**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   ```

2. **Set environment variables**
   ```bash
   railway variables set RAPIDAPI_KEY=your-key-here
   railway variables set NODE_ENV=production
   ```

3. **Deploy**
   ```bash
   railway up
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `RAPIDAPI_KEY` | ExerciseDB API key from RapidAPI | Yes |
| `PORT` | Server port (default: 4000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `CORS_ORIGIN` | Allowed CORS origin | No |

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 📝 Development

### Code Quality
```bash
npm run lint          # Check code style
npm run lint:fix      # Fix code style issues
```

### Available Scripts

```bash
# Development
npm run start:dev     # Start development server with .env.development
npm run dev           # Alias for start:dev

# Production
npm run start:prod    # Build and start production server with .env.production
npm run build         # Build TypeScript to JavaScript
npm start             # Start production server (requires build first)

# Testing
npm test              # Run test suite
npm run test:watch    # Run tests in watch mode

# Code Quality
npm run lint          # Check code style
npm run lint:fix      # Fix code style issues

# Utilities
npm run clean         # Remove build directory
```

### Environment Configuration

The application automatically loads the appropriate environment file based on `NODE_ENV`:
- **Development**: Loads `.env.development`
- **Production**: Loads `.env.production`
- **Fallback**: Loads `.env` if specific environment file is missing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/graphql` endpoint
- Review the health check at `/health` endpoint

## 🔮 Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- User authentication and authorization
- Real-time recommendations with subscriptions
- Advanced analytics and progress tracking
- Integration with fitness trackers
- Meal planning with recipe suggestions
- Social features and community challenges
