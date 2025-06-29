#!/usr/bin/env node

/**
 * Railway deployment build script
 * Compiles TypeScript with minimal error checking for production deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Railway build process...');

try {
  // Clean dist directory
  console.log('🧹 Cleaning dist directory...');
  execSync('npx rimraf dist', { stdio: 'inherit' });

  // Create dist directory
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }

  // Compile only essential working files
  console.log('📦 Compiling essential TypeScript files for production...');

  const essentialFiles = [
    'src/server.ts',
    'src/config/database.ts',
    'src/config/environment.ts',
    'src/services/CacheService.ts',
    'src/services/external-apis/ExerciseDBService.ts',
    'src/services/external-apis/GifFallbackService.ts',
    'src/services/recommendation-engines/WorkoutEngine.ts',
    'src/services/RecommendationService.ts',
    'src/graphql/schema.ts',
    'src/graphql/resolvers/index.ts',
    'src/graphql/resolvers/recommendationResolvers.ts',
    'src/utils/transformers/exerciseTransformer.ts',
    'src/types/api.types.ts',
    'src/types/recommendation.types.ts',
    'src/models/UserSchema.ts'
  ];

  execSync(`npx tsc \
    --noEmitOnError false \
    --skipLibCheck true \
    --target ES2020 \
    --module commonjs \
    --outDir dist \
    --rootDir src \
    --esModuleInterop true \
    --allowSyntheticDefaultImports true \
    --resolveJsonModule true \
    --strict false \
    --noImplicitAny false \
    --strictNullChecks false \
    --noUnusedLocals false \
    --noUnusedParameters false \
    ${essentialFiles.join(' ')}`, { stdio: 'inherit' });

  // Copy package.json to dist
  console.log('📋 Copying package.json...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Create production package.json
  const prodPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    main: 'server.js',
    scripts: {
      start: 'node server.js'
    },
    dependencies: packageJson.dependencies,
    engines: packageJson.engines
  };

  fs.writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));

  // Copy .env.production if it exists
  if (fs.existsSync('.env.production')) {
    console.log('🔧 Copying production environment file...');
    fs.copyFileSync('.env.production', 'dist/.env');
  }

  console.log('✅ Railway build completed successfully!');
  console.log('📁 Built files are in the dist/ directory');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
