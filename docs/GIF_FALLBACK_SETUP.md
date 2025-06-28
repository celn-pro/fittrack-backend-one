# GIF Fallback Service Setup Guide

## Overview

The GIF Fallback Service provides alternative exercise GIFs when ExerciseDB GIFs are broken or unavailable. It uses GIPHY and Tenor APIs as fallback sources to ensure users always see relevant exercise demonstrations.

## Features

- **Automatic Fallback**: Detects broken ExerciseDB GIFs and automatically searches for alternatives
- **Multiple Sources**: Uses both GIPHY and Tenor APIs for maximum coverage
- **Smart Search**: Combines exercise names and body parts for relevant results
- **Caching**: Caches fallback GIFs to reduce API calls and improve performance
- **Safe Content**: Only returns G-rated, safe-for-work exercise content

## API Key Setup

### 1. GIPHY API Key (Recommended)

1. Visit [GIPHY Developers](https://developers.giphy.com/dashboard/)
2. Create a free account
3. Click "Create an API Key"
4. Choose "API" (not SDK)
5. Fill in your app details
6. Copy your API key

**Free Tier Limits:**
- 100 searches per hour
- Can be upgraded to production for higher limits

### 2. Tenor API Key (Alternative/Backup)

1. Visit [Tenor Developer Dashboard](https://tenor.com/developer/dashboard)
2. Create a free account
3. Create a new project
4. Copy your API key

**Free Tier Limits:**
- Good rate limits for most applications
- Global CDN with edge caching

## Environment Configuration

Add the following to your `.env.development` and `.env.production` files:

```bash
# GIF Fallback API Keys
GIPHY_API_KEY=your-giphy-api-key-here
TENOR_API_KEY=your-tenor-api-key-here
```

## How It Works

### 1. Automatic Integration

The GIF fallback is automatically integrated into the workout recommendation engine:

```typescript
// In WorkoutEngine.ts
const enhancedExercises = await this.enhanceExercisesWithFallbackGifs(safeExercises);
```

### 2. Fallback Process

1. **Check Original GIF**: Attempts to validate the ExerciseDB GIF URL
2. **Search Fallback**: If broken, searches GIPHY first, then Tenor
3. **Smart Query**: Combines exercise name + body parts + "exercise" for better results
4. **Cache Results**: Caches successful fallbacks for 1 hour
5. **Metadata**: Adds fallback source information to the exercise

### 3. Search Query Examples

- `"push up chest upper arms exercise"`
- `"squat upper legs exercise"`
- `"plank waist chest exercise"`

## Usage Examples

### Direct Service Usage

```typescript
import { GifFallbackService } from './services/external-apis/GifFallbackService';

const gifService = new GifFallbackService();

// Search for exercise GIFs
const result = await gifService.searchExerciseGifs(
  'push up',
  ['chest', 'upper arms'],
  3 // limit to 3 results
);

if (result.success) {
  console.log(`Found ${result.data.length} GIFs from ${result.source}`);
  result.data.forEach(gif => {
    console.log(`- ${gif.title}: ${gif.url}`);
  });
}
```

### Health Check

```typescript
const health = await gifService.healthCheck();
console.log('API Status:', health);
// Output: { giphy: true, tenor: true }
```

## Response Format

### GifResult Interface

```typescript
interface GifResult {
  id: string;           // Unique GIF ID from the source
  url: string;          // Direct GIF URL
  title: string;        // GIF title/description
  width: number;        // GIF width in pixels
  height: number;       // GIF height in pixels
  size?: number;        // File size in bytes (if available)
  source: 'giphy' | 'tenor';  // Which API provided this GIF
  previewUrl?: string;  // Static preview image URL
}
```

### Enhanced Exercise Format

When a fallback GIF is used, the exercise object gets additional fields:

```typescript
{
  ...originalExercise,
  gifUrl: "https://media.giphy.com/media/abc123/giphy.gif",  // New working URL
  fallbackGifSource: "giphy",  // Which service provided the fallback
  fallbackGifId: "abc123"      // Original GIF ID from the service
}
```

## Testing

Run the GIF fallback tests:

```bash
npm test src/tests/gif-fallback.test.ts
```

The test suite includes:
- Basic search functionality
- Multiple exercise types
- Caching behavior
- Health checks
- Integration demo

## Monitoring

### Health Check Endpoint

The workout engine health check now includes GIF fallback status:

```json
{
  "status": "healthy",
  "details": {
    "exerciseApi": { ... },
    "gifFallback": {
      "giphy": "configured",
      "tenor": "configured"
    },
    "cacheStats": { ... }
  }
}
```

### Logs

Look for these log messages:

```
🔄 Original GIF broken for "Push Up", searching for fallback...
✅ Found fallback GIF from giphy for "Push Up"
⚠️ No fallback GIF found for "Obscure Exercise"
```

## Best Practices

### 1. API Key Management

- Use different API keys for development and production
- Keep API keys secure and never commit them to version control
- Monitor your API usage to avoid rate limits

### 2. Caching Strategy

- Fallback GIFs are cached for 1 hour by default
- Successful searches reduce subsequent API calls
- Cache keys include exercise name and body parts for specificity

### 3. Error Handling

- Service gracefully handles API failures
- Returns original exercise even if fallback search fails
- Logs errors for monitoring and debugging

### 4. Content Safety

- Both APIs are configured for safe, G-rated content only
- Filters ensure exercise-appropriate results
- No adult or inappropriate content

## Troubleshooting

### Common Issues

1. **No API Keys Configured**
   - Check environment variables are set correctly
   - Verify API keys are valid and active

2. **Rate Limits Exceeded**
   - GIPHY: Upgrade to production key for higher limits
   - Tenor: Monitor usage and implement request throttling

3. **No Results Found**
   - Some obscure exercises may not have relevant GIFs
   - Service will return original exercise with broken GIF
   - Consider adding more generic search terms

4. **Slow Performance**
   - GIF validation adds ~3 seconds per exercise
   - Caching reduces subsequent lookup times
   - Consider disabling validation for development

### Debug Mode

Enable debug logging to see detailed fallback process:

```bash
LOG_LEVEL=debug npm start
```

## Future Enhancements

- **Custom GIF Upload**: Allow users to upload custom exercise GIFs
- **AI-Powered Matching**: Use AI to better match exercises with relevant GIFs
- **Video Support**: Extend to support exercise videos from YouTube API
- **User Preferences**: Let users choose preferred GIF sources
- **Offline Fallbacks**: Cache popular exercise GIFs locally
