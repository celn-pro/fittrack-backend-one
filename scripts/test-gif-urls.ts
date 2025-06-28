#!/usr/bin/env ts-node

/**
 * Simple script to test GIF fallback and get actual working URLs
 */

import { GifFallbackService } from '../src/services/external-apis/GifFallbackService';
import { CacheService } from '../src/services/CacheService';

async function testGifUrls() {
  console.log('🔍 Testing GIF Fallback URLs...\n');

  const cacheService = new CacheService();
  const gifFallbackService = new GifFallbackService(cacheService);

  // Check if APIs are configured
  const health = await gifFallbackService.healthCheck();
  console.log('API Status:');
  console.log(`GIPHY: ${health.giphy ? '✅' : '❌'}`);
  console.log(`Tenor: ${health.tenor ? '✅' : '❌'}\n`);

  if (!health.giphy && !health.tenor) {
    console.log('❌ No API keys configured!');
    console.log('Please add to your .env file:');
    console.log('GIPHY_API_KEY=your-key-here');
    console.log('TENOR_API_KEY=your-key-here\n');
    
    // Let's try with a mock test anyway to show the structure
    console.log('📝 Mock test (no actual API calls):');
    const mockResult = {
      data: [{
        id: 'mock-123',
        url: 'https://media.giphy.com/media/mock123/giphy.gif',
        title: 'Push Up Exercise',
        width: 480,
        height: 270,
        source: 'giphy' as const,
        previewUrl: 'https://media.giphy.com/media/mock123/giphy_s.gif'
      }],
      success: true,
      source: 'giphy' as const
    };
    
    console.log('Mock GIF result:', JSON.stringify(mockResult, null, 2));
    return;
  }

  // Test with a simple exercise
  console.log('🏋️ Testing with "push up" exercise...');
  
  try {
    const result = await gifFallbackService.searchExerciseGifs(
      'push up',
      ['chest', 'upper arms'],
      3
    );

    console.log(`\n📊 Results from ${result.source.toUpperCase()}:`);
    console.log(`Success: ${result.success}`);
    console.log(`Found: ${result.data.length} GIFs\n`);

    if (result.success && result.data.length > 0) {
      result.data.forEach((gif, index) => {
        console.log(`${index + 1}. ${gif.title}`);
        console.log(`   URL: ${gif.url}`);
        console.log(`   Preview: ${gif.previewUrl || 'N/A'}`);
        console.log(`   Size: ${gif.width}x${gif.height}px`);
        console.log(`   Source: ${gif.source}`);
        console.log('');
      });

      // Test the first URL
      const firstGif = result.data[0];
      if (firstGif) {
        console.log('🌐 Testing first URL accessibility...');

        try {
          const response = await fetch(firstGif.url, { method: 'HEAD' });
          console.log(`Status: ${response.status} ${response.statusText}`);
          console.log(`Content-Type: ${response.headers.get('content-type')}`);
          console.log(`Content-Length: ${response.headers.get('content-length')}`);

          if (response.ok) {
            console.log('✅ URL is accessible!');
            console.log(`\n🎯 TEST THIS URL: ${firstGif.url}`);
          } else {
            console.log('❌ URL returned error status');
          }
        } catch (error) {
          console.log(`❌ URL test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } else {
      console.log('❌ No GIFs found');
    }

  } catch (error) {
    console.log(`❌ Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🔧 Debugging Info:');
  console.log(`GIPHY_API_KEY set: ${!!process.env.GIPHY_API_KEY}`);
  console.log(`TENOR_API_KEY set: ${!!process.env.TENOR_API_KEY}`);
  
  if (process.env.GIPHY_API_KEY) {
    console.log(`GIPHY key length: ${process.env.GIPHY_API_KEY.length}`);
    console.log(`GIPHY key preview: ${process.env.GIPHY_API_KEY.substring(0, 8)}...`);
  }
  
  if (process.env.TENOR_API_KEY) {
    console.log(`Tenor key length: ${process.env.TENOR_API_KEY.length}`);
    console.log(`Tenor key preview: ${process.env.TENOR_API_KEY.substring(0, 8)}...`);
  }
}

// Also test a direct API call to see what's happening
async function testDirectApiCall() {
  console.log('\n🔬 Direct API Test...');

  // Use GIPHY's public demo key for testing
  const giphyKey = process.env.GIPHY_API_KEY || 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65';
  console.log('Using API key for test...');

  try {
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${giphyKey}&q=push%20up%20exercise&limit=1&rating=g`;
    console.log('Testing URL:', url.replace(giphyKey, 'HIDDEN_KEY'));
    
    const response = await fetch(url);
    const data = await response.json() as any;

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (data.data && data.data.length > 0) {
      const gif = data.data[0];
      console.log('\n🎯 Direct API GIF URL:', gif.images?.fixed_height?.url || gif.images?.original?.url);
    }
    
  } catch (error) {
    console.log('❌ Direct API test failed:', error);
  }
}

async function main() {
  await testGifUrls();
  await testDirectApiCall();
}

if (require.main === module) {
  main().catch(console.error);
}
