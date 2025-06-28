const fetch = require('node-fetch');

async function testWorkoutRecommendation() {
  console.log('🧪 Testing Workout Recommendation via GraphQL...\n');

  const query = `
    query {
      getRecommendations(filter: { category: "workout" }) {
        id
        title
        description
        category
        difficultyLevel
        estimatedDuration
        steps {
          title
          description
          media {
            type
            url
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ GraphQL Errors:');
      result.errors.forEach(error => {
        console.error(`- ${error.message}`);
      });
    } else {
      console.log('✅ SUCCESS! Workout recommendations generated:');
      const recommendations = result.data.getRecommendations;
      
      console.log(`Found: ${recommendations.length} recommendations\n`);
      
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.title} (${rec.category})`);
        console.log(`   Description: ${rec.description}`);
        console.log(`   Steps: ${rec.steps?.length || 0}`);
        console.log(`   Difficulty: ${rec.difficultyLevel}`);
        console.log(`   Duration: ${rec.estimatedDuration} minutes`);
        
        if (rec.steps && rec.steps.length > 0) {
          console.log('   Sample steps:');
          rec.steps.slice(0, 2).forEach((step, stepIndex) => {
            console.log(`     ${stepIndex + 1}. ${step.title}`);
            if (step.media && step.media.length > 0) {
              const media = step.media[0];
              console.log(`        Media: ${media.type} - ${media.url?.substring(0, 60)}...`);
            }
          });
        }
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testWorkoutRecommendation();
