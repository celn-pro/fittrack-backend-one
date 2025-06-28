# GraphQL Query Examples

This file contains example GraphQL queries and mutations for testing the FitTrack Backend API.

## Authentication Headers

For development testing, include these headers with your requests:

```
x-user-id: user123
x-user-email: user@example.com
x-user-age: 30
x-user-weight: 70
x-user-height: 175
x-user-gender: male
x-user-fitness-goal: Lose Weight
x-user-activity-level: Moderate
x-user-health-conditions: None
x-user-dietary-preference: None
x-user-profile-complete: true
```

## Queries

### Get All Recommendations

```graphql
query GetRecommendations {
  getRecommendations {
    id
    category
    title
    description
    image
    difficultyLevel
    estimatedDuration
    calculatedCalories
    tips
    personalizedTips
    createdAt
    steps {
      title
      description
      duration
      media {
        type
        url
        caption
      }
    }
    macros {
      protein {
        grams
        calories
        percentage
      }
      carbohydrates {
        grams
        calories
        percentage
      }
      fats {
        grams
        calories
        percentage
      }
    }
    dailyGoalMl
    sleepGoalHours
    reminders
  }
}
```

### Get Filtered Recommendations

```graphql
query GetWorkoutRecommendations {
  getRecommendations(filter: { category: "workout" }) {
    id
    category
    title
    description
    difficultyLevel
    estimatedDuration
    calculatedCalories
    steps {
      title
      description
      duration
    }
    tips
    personalizedTips
  }
}
```

### Get Specific Recommendation

```graphql
query GetRecommendation($id: ID!) {
  getRecommendation(id: $id) {
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

### Get User Metrics

```graphql
query GetUserMetrics {
  getUserMetrics {
    bmr
    tdee
    dailyCalorieGoal
    dailyWaterGoal
    recommendedSleepHours
    activityMultiplier
    bmi
    bmiCategory
    idealWeightRange {
      min
      max
    }
  }
}
```

### Get API Health Status

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
      lastCheck
    }
    cache {
      totalEntries
      totalSize
      hitRate
      missRate
    }
    timestamp
  }
}
```

### Get Available Body Parts

```graphql
query GetBodyParts {
  getBodyParts
}
```

### Get Available Equipment Types

```graphql
query GetEquipmentTypes {
  getEquipmentTypes
}
```

## Mutations

### Refresh Recommendations

```graphql
mutation RefreshRecommendations {
  refreshRecommendations {
    id
    category
    title
    description
    difficultyLevel
  }
}
```

### Refresh Specific Category

```graphql
mutation RefreshWorkoutRecommendations {
  refreshRecommendations(categories: ["workout"]) {
    id
    category
    title
    description
    difficultyLevel
    estimatedDuration
  }
}
```

### Rate Recommendation

```graphql
mutation RateRecommendation($id: ID!, $rating: Int!) {
  rateRecommendation(id: $id, rating: $rating)
}
```

### Complete Recommendation

```graphql
mutation CompleteRecommendation($id: ID!, $feedback: String) {
  completeRecommendation(id: $id, feedback: $feedback)
}
```

## Example Variables

For queries that require variables, use these examples:

```json
{
  "id": "workout_1234567890_abc123def",
  "rating": 5,
  "feedback": "Great workout! Really enjoyed the variety of exercises."
}
```

## cURL Examples

### Get Recommendations with cURL

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
  -d '{
    "query": "query { getRecommendations { id title category description difficultyLevel } }"
  }'
```

### Get User Metrics with cURL

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
  -d '{
    "query": "query { getUserMetrics { bmr tdee dailyCalorieGoal dailyWaterGoal bmi bmiCategory } }"
  }'
```

## Testing Different User Profiles

### Beginner User with Health Conditions

```
x-user-age: 45
x-user-weight: 85
x-user-height: 170
x-user-gender: female
x-user-fitness-goal: Lose Weight
x-user-activity-level: Sedentary
x-user-health-conditions: Knee Injury,Back Pain
```

### Advanced Athlete

```
x-user-age: 25
x-user-weight: 75
x-user-height: 180
x-user-gender: male
x-user-fitness-goal: Gain Muscle
x-user-activity-level: Active
x-user-health-conditions: None
x-user-preferred-workouts: Strength,HIIT
```

### Older Adult

```
x-user-age: 65
x-user-weight: 70
x-user-height: 165
x-user-gender: female
x-user-fitness-goal: Maintain Health
x-user-activity-level: Moderate
x-user-health-conditions: Hypertension
x-user-dietary-preference: Vegetarian
```
