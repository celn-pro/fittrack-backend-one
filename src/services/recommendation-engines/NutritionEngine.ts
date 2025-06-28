// Rule-based nutrition recommendation logic
import { bmrCalculator, UserMetrics } from '../../utils/calculators/bmrCalculator';
import { EnhancedRecommendation } from '../../utils/transformers/exerciseTransformer';

export interface IUser {
  id?: string;
  email: string;
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  fitnessGoal?: string;
  dietaryPreference?: string;
  healthConditions?: string[];
  activityLevel?: string;
  preferredWorkoutTypes?: string[];
  dietaryRestrictions?: string[];
  bmi?: number;
  role?: 'user' | 'admin';
  isProfileComplete: boolean;
}

export class NutritionEngine {
  /**
   * Generate nutrition recommendations based on user profile
   */
  async generateNutritionRecommendation(user: IUser): Promise<EnhancedRecommendation> {
    try {
      // Validate user profile
      this.validateUserProfile(user);

      // Calculate user metrics
      const physicalStats = {
        weight: user.weight || 70,
        height: user.height || 170,
        age: user.age || 30,
        gender: (user.gender as 'male' | 'female' | 'other') || 'other'
      };

      const userMetrics = bmrCalculator.calculateUserMetrics(
        physicalStats,
        user.activityLevel || 'Moderate',
        user.fitnessGoal || 'Maintain Health'
      );

      // Calculate macro targets
      const macroTargets = this.calculateMacroTargets(userMetrics, user.fitnessGoal || 'Maintain Health');

      // Generate meal suggestions
      const mealSuggestions = this.generateMealSuggestions(
        user.dietaryPreference || 'None',
        user.dietaryRestrictions || [],
        userMetrics.dailyCalorieGoal
      );

      // Create nutrition recommendation
      const recommendation: EnhancedRecommendation = {
        id: this.generateRecommendationId(),
        category: 'nutrition',
        title: this.generateNutritionTitle(user.fitnessGoal || 'Maintain Health'),
        description: this.generateNutritionDescription(user, userMetrics),
        calories: userMetrics.dailyCalorieGoal,
        macros: macroTargets,
        tips: this.generateNutritionTips(user, userMetrics),
        reminders: this.generateNutritionReminders(),
        personalizedTips: this.generatePersonalizedNutritionTips(user, userMetrics)
      };

      return recommendation;
    } catch (error) {
      console.error('Error generating nutrition recommendation:', error);
      throw new Error(`Failed to generate nutrition recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate user profile for nutrition generation
   */
  private validateUserProfile(user: IUser): void {
    if (!user.age || user.age < 13 || user.age > 120) {
      throw new Error('Invalid age: must be between 13 and 120');
    }
    if (!user.weight || user.weight < 30 || user.weight > 300) {
      throw new Error('Invalid weight: must be between 30 and 300 kg');
    }
    if (!user.height || user.height < 100 || user.height > 250) {
      throw new Error('Invalid height: must be between 100 and 250 cm');
    }
  }

  /**
   * Calculate macro targets based on user metrics and goals
   */
  private calculateMacroTargets(userMetrics: UserMetrics, fitnessGoal: string): any {
    const calories = userMetrics.dailyCalorieGoal;
    let proteinPercentage = 0.25;
    let carbPercentage = 0.45;
    let fatPercentage = 0.30;

    // Adjust macros based on fitness goal
    switch (fitnessGoal) {
      case 'Lose Weight':
        proteinPercentage = 0.35;
        carbPercentage = 0.35;
        fatPercentage = 0.30;
        break;
      case 'Gain Muscle':
        proteinPercentage = 0.30;
        carbPercentage = 0.40;
        fatPercentage = 0.30;
        break;
      case 'Maintain Health':
      default:
        proteinPercentage = 0.25;
        carbPercentage = 0.45;
        fatPercentage = 0.30;
        break;
    }

    return {
      protein: {
        grams: Math.round((calories * proteinPercentage) / 4),
        calories: Math.round(calories * proteinPercentage),
        percentage: Math.round(proteinPercentage * 100)
      },
      carbohydrates: {
        grams: Math.round((calories * carbPercentage) / 4),
        calories: Math.round(calories * carbPercentage),
        percentage: Math.round(carbPercentage * 100)
      },
      fats: {
        grams: Math.round((calories * fatPercentage) / 9),
        calories: Math.round(calories * fatPercentage),
        percentage: Math.round(fatPercentage * 100)
      }
    };
  }

  private calculateMacroTargets(dailyCalories: number, goals: string[]): MacroTargets {
    let proteinPercent = 0.25; // Default 25%
    let carbPercent = 0.45;    // Default 45%
    let fatPercent = 0.30;     // Default 30%

    // Adjust based on goals
    if (goals.includes('muscle_gain')) {
      proteinPercent = 0.30;
      carbPercent = 0.40;
      fatPercent = 0.30;
    } else if (goals.includes('weight_loss')) {
      proteinPercent = 0.35;
      carbPercent = 0.35;
      fatPercent = 0.30;
    } else if (goals.includes('endurance')) {
      proteinPercent = 0.20;
      carbPercent = 0.55;
      fatPercent = 0.25;
    }

    return {
      calories: dailyCalories,
      protein: {
        grams: Math.round((dailyCalories * proteinPercent) / 4),
        calories: Math.round(dailyCalories * proteinPercent),
        percentage: Math.round(proteinPercent * 100)
      },
      carbohydrates: {
        grams: Math.round((dailyCalories * carbPercent) / 4),
        calories: Math.round(dailyCalories * carbPercent),
        percentage: Math.round(carbPercent * 100)
      },
      fats: {
        grams: Math.round((dailyCalories * fatPercent) / 9),
        calories: Math.round(dailyCalories * fatPercent),
        percentage: Math.round(fatPercent * 100)
      }
    };
  }

  private generateMealPlan(macroTargets: MacroTargets, dietaryRestrictions?: string[]): MealPlan {
    const mealDistribution = {
      breakfast: 0.25,
      lunch: 0.30,
      dinner: 0.30,
      snacks: 0.15
    };

    const meals = Object.entries(mealDistribution).map(([mealType, percentage]) => ({
      type: mealType,
      targetCalories: Math.round(macroTargets.calories * percentage),
      targetProtein: Math.round(macroTargets.protein.grams * percentage),
      targetCarbs: Math.round(macroTargets.carbohydrates.grams * percentage),
      targetFats: Math.round(macroTargets.fats.grams * percentage),
      suggestions: this.generateMealSuggestions(mealType, dietaryRestrictions)
    }));

    return {
      totalCalories: macroTargets.calories,
      meals,
      guidelines: this.generateNutritionGuidelines(dietaryRestrictions)
    };
  }

  private generateMealSuggestions(mealType: string, dietaryRestrictions?: string[]): string[] {
    const mealSuggestions: Record<string, string[]> = {
      breakfast: [
        'Oatmeal with berries and nuts',
        'Greek yogurt with granola',
        'Scrambled eggs with vegetables',
        'Protein smoothie with banana',
        'Whole grain toast with avocado'
      ],
      lunch: [
        'Grilled chicken salad',
        'Quinoa bowl with vegetables',
        'Turkey and hummus wrap',
        'Lentil soup with whole grain bread',
        'Salmon with sweet potato'
      ],
      dinner: [
        'Lean protein with roasted vegetables',
        'Stir-fry with brown rice',
        'Grilled fish with quinoa',
        'Chicken breast with steamed broccoli',
        'Turkey meatballs with pasta'
      ],
      snacks: [
        'Apple with almond butter',
        'Greek yogurt with berries',
        'Mixed nuts and seeds',
        'Protein bar',
        'Vegetable sticks with hummus'
      ]
    };

    let suggestions = mealSuggestions[mealType] || [];

    // Filter based on dietary restrictions
    if (dietaryRestrictions?.includes('vegetarian')) {
      suggestions = suggestions.filter(suggestion => 
        !suggestion.toLowerCase().includes('chicken') &&
        !suggestion.toLowerCase().includes('turkey') &&
        !suggestion.toLowerCase().includes('fish') &&
        !suggestion.toLowerCase().includes('salmon')
      );
    }

    if (dietaryRestrictions?.includes('vegan')) {
      suggestions = suggestions.filter(suggestion => 
        !suggestion.toLowerCase().includes('chicken') &&
        !suggestion.toLowerCase().includes('turkey') &&
        !suggestion.toLowerCase().includes('fish') &&
        !suggestion.toLowerCase().includes('salmon') &&
        !suggestion.toLowerCase().includes('yogurt') &&
        !suggestion.toLowerCase().includes('eggs')
      );
    }

    if (dietaryRestrictions?.includes('gluten_free')) {
      suggestions = suggestions.filter(suggestion => 
        !suggestion.toLowerCase().includes('bread') &&
        !suggestion.toLowerCase().includes('pasta') &&
        !suggestion.toLowerCase().includes('oatmeal')
      );
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  private calculateHydrationGoal(physicalStats: any, activityLevel: string): number {
    const baseWater = physicalStats.weight * 0.033; // 33ml per kg body weight
    
    const activityMultipliers: Record<string, number> = {
      'sedentary': 1.0,
      'lightly_active': 1.1,
      'moderately_active': 1.2,
      'very_active': 1.3,
      'extremely_active': 1.4
    };

    const multiplier = activityMultipliers[activityLevel] || 1.2;
    return Math.round(baseWater * multiplier * 100) / 100; // Round to 2 decimal places
  }

  private recommendSupplements(goals: string[], dietaryRestrictions?: string[]): string[] {
    const supplements: string[] = [];

    if (goals.includes('muscle_gain')) {
      supplements.push('Whey Protein', 'Creatine', 'Vitamin D');
    }

    if (goals.includes('weight_loss')) {
      supplements.push('Multivitamin', 'Omega-3', 'Green Tea Extract');
    }

    if (goals.includes('endurance')) {
      supplements.push('B-Complex', 'Iron', 'Electrolytes');
    }

    if (dietaryRestrictions?.includes('vegetarian') || dietaryRestrictions?.includes('vegan')) {
      supplements.push('B12', 'Iron', 'Plant Protein');
    }

    // Remove duplicates and return
    return [...new Set(supplements)];
  }

  private generateNutritionGuidelines(dietaryRestrictions?: string[]): string[] {
    const guidelines = [
      'Eat regular meals throughout the day',
      'Include a variety of colorful fruits and vegetables',
      'Choose whole grains over refined grains',
      'Stay hydrated throughout the day',
      'Practice portion control'
    ];

    if (dietaryRestrictions?.includes('vegetarian')) {
      guidelines.push('Combine different protein sources for complete amino acids');
    }

    if (dietaryRestrictions?.includes('vegan')) {
      guidelines.push('Ensure adequate B12 and iron intake');
    }

    return guidelines;
  }

  private generateRecommendationId(): string {
    return `nutrition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateNutritionTitle(goals: string[]): string {
    const primaryGoal = goals[0];
    const titleMap: Record<string, string> = {
      'weight_loss': 'Weight Loss Nutrition Plan',
      'muscle_gain': 'Muscle Building Diet',
      'strength': 'Strength Training Nutrition',
      'endurance': 'Endurance Athlete Diet',
      'general_fitness': 'Balanced Nutrition Plan'
    };
    
    return titleMap[primaryGoal] || 'Custom Nutrition Plan';
  }

  /**
   * Generate meal suggestions based on dietary preferences
   */
  private generateMealSuggestions(
    dietaryPreference: string,
    dietaryRestrictions: string[],
    dailyCalories: number
  ): string[] {
    const suggestions: string[] = [];
    const caloriesPerMeal = Math.round(dailyCalories / 3);

    // Base meal suggestions
    const baseMeals = [
      'Grilled chicken with quinoa and vegetables',
      'Salmon with sweet potato and broccoli',
      'Lean beef with brown rice and mixed vegetables',
      'Turkey and avocado wrap with whole grain tortilla',
      'Greek yogurt with berries and nuts',
      'Oatmeal with banana and almond butter'
    ];

    // Filter based on dietary preferences
    let filteredMeals = [...baseMeals];

    if (dietaryPreference === 'Vegetarian' || dietaryRestrictions.includes('Vegetarian')) {
      filteredMeals = [
        'Quinoa bowl with black beans and vegetables',
        'Greek yogurt with berries and granola',
        'Vegetable stir-fry with tofu and brown rice',
        'Lentil soup with whole grain bread',
        'Chickpea salad with mixed greens',
        'Oatmeal with nuts and fruit'
      ];
    }

    if (dietaryPreference === 'Vegan' || dietaryRestrictions.includes('Vegan')) {
      filteredMeals = [
        'Quinoa bowl with black beans and vegetables',
        'Tofu stir-fry with brown rice',
        'Lentil curry with vegetables',
        'Chickpea and vegetable curry',
        'Smoothie bowl with plant-based protein',
        'Oatmeal with almond milk and fruit'
      ];
    }

    if (dietaryPreference === 'Keto' || dietaryRestrictions.includes('Keto')) {
      filteredMeals = [
        'Grilled salmon with avocado and leafy greens',
        'Chicken thighs with cauliflower rice',
        'Beef and vegetable stir-fry (no rice)',
        'Egg and vegetable omelet',
        'Tuna salad with olive oil dressing',
        'Nuts and cheese snack plate'
      ];
    }

    return filteredMeals.slice(0, 6);
  }

  /**
   * Generate nutrition tips
   */
  private generateNutritionTips(user: IUser, userMetrics: UserMetrics): string[] {
    const tips: string[] = [
      'Eat regular meals throughout the day',
      'Include protein with every meal',
      'Choose whole grains over refined grains',
      'Eat plenty of fruits and vegetables',
      'Stay hydrated throughout the day'
    ];

    // Goal-specific tips
    if (user.fitnessGoal === 'Lose Weight') {
      tips.push('Create a moderate caloric deficit');
      tips.push('Focus on high-protein, high-fiber foods');
    } else if (user.fitnessGoal === 'Gain Muscle') {
      tips.push('Eat in a slight caloric surplus');
      tips.push('Consume protein within 2 hours of workouts');
    }

    // Health condition tips
    if (user.healthConditions?.includes('Diabetes')) {
      tips.push('Monitor carbohydrate intake and timing');
      tips.push('Choose low glycemic index foods');
    }

    if (user.healthConditions?.includes('Hypertension')) {
      tips.push('Limit sodium intake');
      tips.push('Include potassium-rich foods');
    }

    return tips;
  }

  /**
   * Generate nutrition reminders
   */
  private generateNutritionReminders(): string[] {
    return [
      'Plan your meals in advance',
      'Prep healthy snacks for busy days',
      'Read nutrition labels carefully',
      'Listen to your hunger and fullness cues',
      'Allow yourself occasional treats in moderation'
    ];
  }

  /**
   * Generate personalized nutrition tips
   */
  private generatePersonalizedNutritionTips(user: IUser, userMetrics: UserMetrics): string[] {
    const tips: string[] = [];
    const age = user.age || 30;
    const bmi = userMetrics.bmi;

    // Age-specific tips
    if (age > 50) {
      tips.push('Focus on calcium and vitamin D for bone health');
      tips.push('Consider B12 supplementation');
    }

    // BMI-specific tips
    if (bmi < 18.5) {
      tips.push('Focus on nutrient-dense, calorie-rich foods');
    } else if (bmi > 25) {
      tips.push('Emphasize portion control and mindful eating');
    }

    // Activity level tips
    if (user.activityLevel === 'Active') {
      tips.push('Increase carbohydrate intake on workout days');
      tips.push('Consider post-workout protein timing');
    }

    return tips;
  }

  /**
   * Generate nutrition title
   */
  private generateNutritionTitle(fitnessGoal: string): string {
    const titleMap: Record<string, string> = {
      'Lose Weight': 'Weight Loss Nutrition Plan',
      'Gain Muscle': 'Muscle Building Diet Plan',
      'Maintain Health': 'Balanced Nutrition Plan'
    };

    return titleMap[fitnessGoal] || 'Personalized Nutrition Plan';
  }

  /**
   * Generate nutrition description
   */
  private generateNutritionDescription(user: IUser, userMetrics: UserMetrics): string {
    const goal = user.fitnessGoal || 'health';
    const calories = userMetrics.dailyCalorieGoal;

    return `A personalized ${calories}-calorie nutrition plan designed to support your ${goal.toLowerCase()} goals.`;
  }

  /**
   * Generate recommendation ID
   */
  private generateRecommendationId(): string {
    return `nutrition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
