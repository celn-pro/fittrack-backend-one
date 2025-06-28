import express, { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import dotenv from 'dotenv';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { validateApiConfig } from './config/apiConfig';
import { databaseService } from './config/database';
import { authMiddleware } from './middleware/auth';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

// Fallback to .env if specific environment file doesn't exist
if (!process.env.PORT && !process.env.RAPIDAPI_KEY) {
  dotenv.config({ path: '.env' });
}

// Validate configuration
if (!validateApiConfig()) {
  console.error('Invalid API configuration. Please check your environment variables.');
  process.exit(1);
}

async function startServer() {
  const app: Application = express();
  const PORT = process.env.PORT || 4000;

  // Connect to database
  try {
    await databaseService.connect();
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }

  // CORS configuration - Allow all origins
  app.use(cors({
    origin: true, // Allow all origins
    credentials: true
  }));

  // Health check endpoint
  app.get('/health', async (req, res) => {
    const dbHealth = await databaseService.healthCheck();
    res.json({
      status: dbHealth.status === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth
    });
  });

  // Create Apollo Server with authentication
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      // Get authentication context
      const authContext = await authMiddleware.getGraphQLContext(req as any);

      return {
        ...authContext,
        // Add request info for logging/analytics
        requestInfo: {
          ip: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          timestamp: new Date().toISOString()
        }
      };
    },
    introspection: process.env.NODE_ENV !== 'production'
  });

  await server.start();
  server.applyMiddleware({ app: app as any, path: '/graphql' });

  // API info endpoint
  app.get('/api/info', (req, res) => {
    res.json({
      name: 'FitTrack Backend API',
      version: '1.0.0',
      description: 'Health & Fitness App Backend with GraphQL, MongoDB, and External APIs',
      endpoints: {
        graphql: '/graphql',
        health: '/health',
        info: '/api/info'
      },
      features: [
        'Personalized workout recommendations',
        'Nutrition planning',
        'Hydration tracking',
        'Sleep optimization',
        'ExerciseDB integration',
        'Health condition filtering',
        'In-memory caching'
      ],
      documentation: {
        graphql: process.env.NODE_ENV !== 'production' ? `http://localhost:${PORT}/graphql` : null
      }
    });
  });

  // Error handling middleware
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
    console.log(`📊 GraphQL playground at http://localhost:${PORT}/graphql`);
    console.log(`🏥 Health check at http://localhost:${PORT}/health`);
    console.log(`📋 API info at http://localhost:${PORT}/api/info`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    console.log('✅ ExerciseDB API configured');
    console.log(`📡 Using ExerciseDB at: ${process.env.EXERCISEDB_BASE_URL || 'https://exercisedb.dev/api/v1'}`);
  });
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
