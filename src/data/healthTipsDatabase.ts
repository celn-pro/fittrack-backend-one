// Curated Health Tips Database
import { CuratedHealthTip, HealthTipCategory } from '../types/healthTips.types';

export const CURATED_HEALTH_TIPS: CuratedHealthTip[] = [
  // FITNESS TIPS
  {
    title: "Start Your Day with 10 Minutes of Movement",
    content: "Begin each morning with 10 minutes of light exercise like stretching, walking, or basic bodyweight movements. This activates your metabolism, improves circulation, and sets a positive tone for the day.",
    category: HealthTipCategory.FITNESS,
    tags: ["morning routine", "metabolism", "energy"],
    difficulty: "easy",
    estimatedReadTime: 15,
    source: "fitness experts"
  },
  {
    title: "Take the Stairs Instead of Elevators",
    content: "Whenever possible, choose stairs over elevators or escalators. Stair climbing is an excellent cardiovascular exercise that strengthens your legs and glutes while burning calories throughout the day.",
    category: HealthTipCategory.FITNESS,
    tags: ["cardio", "daily activity", "leg strength"],
    difficulty: "easy",
    estimatedReadTime: 12,
    source: "fitness experts"
  },
  {
    title: "Practice the 2-Minute Rule for Exercise",
    content: "If you're struggling to maintain a workout routine, start with just 2 minutes of exercise daily. This builds the habit without overwhelming yourself, and you can gradually increase duration as the habit solidifies.",
    category: HealthTipCategory.FITNESS,
    tags: ["habit building", "consistency", "beginner"],
    difficulty: "easy",
    estimatedReadTime: 18,
    source: "behavioral psychology"
  },
  {
    title: "Incorporate Bodyweight Exercises During TV Time",
    content: "Make your screen time productive by doing squats, push-ups, or planks during commercial breaks or between episodes. This turns passive time into active recovery and fitness building.",
    category: HealthTipCategory.FITNESS,
    tags: ["multitasking", "bodyweight", "home workout"],
    difficulty: "moderate",
    estimatedReadTime: 16,
    source: "fitness experts"
  },

  // NUTRITION TIPS
  {
    title: "Fill Half Your Plate with Vegetables",
    content: "At each meal, aim to fill half your plate with colorful vegetables. This ensures you get essential vitamins, minerals, and fiber while naturally reducing portions of less nutritious foods.",
    category: HealthTipCategory.NUTRITION,
    tags: ["vegetables", "portion control", "vitamins"],
    difficulty: "easy",
    estimatedReadTime: 14,
    source: "nutritionists"
  },
  {
    title: "Eat Protein with Every Meal",
    content: "Include a source of lean protein (chicken, fish, beans, eggs, or tofu) with each meal. Protein helps maintain muscle mass, keeps you feeling full longer, and supports healthy metabolism.",
    category: HealthTipCategory.NUTRITION,
    tags: ["protein", "satiety", "muscle maintenance"],
    difficulty: "easy",
    estimatedReadTime: 16,
    source: "nutritionists"
  },
  {
    title: "Practice Mindful Eating",
    content: "Eat slowly and pay attention to your food. Put down your fork between bites, chew thoroughly, and notice flavors and textures. This improves digestion and helps prevent overeating.",
    category: HealthTipCategory.NUTRITION,
    tags: ["mindfulness", "digestion", "portion control"],
    difficulty: "moderate",
    estimatedReadTime: 20,
    source: "mindful eating experts"
  },
  {
    title: "Prepare Healthy Snacks in Advance",
    content: "Wash and cut fruits and vegetables at the beginning of the week. Having healthy snacks readily available makes it easier to choose nutritious options when hunger strikes.",
    category: HealthTipCategory.NUTRITION,
    tags: ["meal prep", "snacking", "convenience"],
    difficulty: "easy",
    estimatedReadTime: 15,
    source: "meal planning experts"
  },

  // MENTAL HEALTH TIPS
  {
    title: "Practice 5-Minute Daily Meditation",
    content: "Spend 5 minutes each day in quiet meditation or deep breathing. This simple practice can reduce stress, improve focus, and enhance emotional well-being. Start with guided apps if you're new to meditation.",
    category: HealthTipCategory.MENTAL_HEALTH,
    tags: ["meditation", "stress relief", "mindfulness"],
    difficulty: "easy",
    estimatedReadTime: 18,
    source: "mental health professionals"
  },
  {
    title: "Write Down Three Things You're Grateful For",
    content: "Each evening, write down three things you're grateful for from that day. This practice shifts focus to positive aspects of life and has been shown to improve mood and life satisfaction.",
    category: HealthTipCategory.MENTAL_HEALTH,
    tags: ["gratitude", "positivity", "journaling"],
    difficulty: "easy",
    estimatedReadTime: 16,
    source: "positive psychology"
  },
  {
    title: "Limit Social Media Before Bedtime",
    content: "Avoid social media for at least 1 hour before sleep. The blue light and stimulating content can disrupt sleep patterns and increase anxiety. Replace with calming activities like reading or gentle stretching.",
    category: HealthTipCategory.MENTAL_HEALTH,
    tags: ["digital wellness", "sleep hygiene", "anxiety reduction"],
    difficulty: "moderate",
    estimatedReadTime: 20,
    source: "sleep specialists"
  },
  {
    title: "Take Regular Breaks from Work",
    content: "Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds. Also take a 5-10 minute break every hour to stretch, walk, or simply rest your mind.",
    category: HealthTipCategory.MENTAL_HEALTH,
    tags: ["work-life balance", "eye health", "productivity"],
    difficulty: "easy",
    estimatedReadTime: 17,
    source: "occupational health"
  },

  // SLEEP TIPS
  {
    title: "Maintain a Consistent Sleep Schedule",
    content: "Go to bed and wake up at the same time every day, even on weekends. This helps regulate your body's internal clock and improves the quality of your sleep over time.",
    category: HealthTipCategory.SLEEP,
    tags: ["sleep schedule", "circadian rhythm", "consistency"],
    difficulty: "moderate",
    estimatedReadTime: 16,
    source: "sleep specialists"
  },
  {
    title: "Create a Relaxing Bedtime Routine",
    content: "Develop a calming pre-sleep routine 30-60 minutes before bed. This might include dimming lights, reading, gentle stretching, or listening to soft music. Consistent routines signal your body it's time to sleep.",
    category: HealthTipCategory.SLEEP,
    tags: ["bedtime routine", "relaxation", "sleep quality"],
    difficulty: "easy",
    estimatedReadTime: 19,
    source: "sleep specialists"
  },
  {
    title: "Keep Your Bedroom Cool and Dark",
    content: "Maintain your bedroom temperature between 60-67°F (15-19°C) and use blackout curtains or an eye mask. A cool, dark environment promotes deeper, more restorative sleep.",
    category: HealthTipCategory.SLEEP,
    tags: ["sleep environment", "temperature", "darkness"],
    difficulty: "easy",
    estimatedReadTime: 15,
    source: "sleep specialists"
  },
  {
    title: "Avoid Caffeine After 2 PM",
    content: "Caffeine can stay in your system for 6-8 hours, so avoid coffee, tea, and energy drinks after 2 PM. This prevents caffeine from interfering with your ability to fall asleep at night.",
    category: HealthTipCategory.SLEEP,
    tags: ["caffeine", "sleep quality", "timing"],
    difficulty: "moderate",
    estimatedReadTime: 14,
    source: "sleep specialists"
  },

  // HYDRATION TIPS
  {
    title: "Start Your Day with a Glass of Water",
    content: "Drink a full glass of water immediately upon waking. After 6-8 hours without fluids, your body needs rehydration to kickstart metabolism and support organ function.",
    category: HealthTipCategory.HYDRATION,
    tags: ["morning routine", "metabolism", "rehydration"],
    difficulty: "easy",
    estimatedReadTime: 13,
    source: "hydration experts"
  },
  {
    title: "Use a Water Bottle with Time Markers",
    content: "Use a water bottle marked with hourly goals to track your intake throughout the day. Visual reminders help ensure you're drinking water consistently rather than trying to catch up later.",
    category: HealthTipCategory.HYDRATION,
    tags: ["tracking", "consistency", "visual cues"],
    difficulty: "easy",
    estimatedReadTime: 15,
    source: "hydration experts"
  },
  {
    title: "Eat Water-Rich Foods",
    content: "Include foods with high water content like watermelon, cucumber, oranges, and lettuce in your diet. These foods contribute to your daily fluid intake while providing essential nutrients.",
    category: HealthTipCategory.HYDRATION,
    tags: ["water-rich foods", "nutrition", "hydration"],
    difficulty: "easy",
    estimatedReadTime: 16,
    source: "nutritionists"
  },
  {
    title: "Monitor Your Urine Color",
    content: "Check your urine color as a hydration indicator. Pale yellow indicates good hydration, while dark yellow suggests you need more fluids. Aim for light, pale yellow throughout the day.",
    category: HealthTipCategory.HYDRATION,
    tags: ["hydration monitoring", "health indicators", "self-assessment"],
    difficulty: "easy",
    estimatedReadTime: 17,
    source: "medical professionals"
  },

  // GENERAL WELLNESS TIPS
  {
    title: "Take a 10-Minute Walk After Meals",
    content: "A short walk after eating helps with digestion, stabilizes blood sugar levels, and can improve your mood. Even a gentle stroll around the block provides these benefits.",
    category: HealthTipCategory.GENERAL_WELLNESS,
    tags: ["digestion", "blood sugar", "walking"],
    difficulty: "easy",
    estimatedReadTime: 14,
    source: "wellness experts"
  },
  {
    title: "Practice Good Posture Throughout the Day",
    content: "Keep your shoulders back, chin tucked, and core engaged whether sitting or standing. Good posture reduces back pain, improves breathing, and projects confidence.",
    category: HealthTipCategory.GENERAL_WELLNESS,
    tags: ["posture", "back health", "confidence"],
    difficulty: "moderate",
    estimatedReadTime: 15,
    source: "physical therapists"
  },
  {
    title: "Wash Your Hands Regularly",
    content: "Wash your hands with soap and water for at least 20 seconds, especially before eating and after using the bathroom. This simple habit prevents the spread of illness and infections.",
    category: HealthTipCategory.GENERAL_WELLNESS,
    tags: ["hygiene", "disease prevention", "health habits"],
    difficulty: "easy",
    estimatedReadTime: 12,
    source: "health professionals"
  },
  {
    title: "Spend Time in Nature Daily",
    content: "Try to spend at least 15-20 minutes outdoors each day, whether in a park, garden, or simply walking outside. Nature exposure reduces stress and improves mental well-being.",
    category: HealthTipCategory.GENERAL_WELLNESS,
    tags: ["nature", "stress relief", "outdoor time"],
    difficulty: "easy",
    estimatedReadTime: 16,
    source: "environmental psychology"
  },

  // INJURY PREVENTION TIPS
  {
    title: "Warm Up Before Exercise",
    content: "Always spend 5-10 minutes warming up with light cardio and dynamic stretching before intense exercise. This prepares your muscles and joints, reducing injury risk.",
    category: HealthTipCategory.INJURY_PREVENTION,
    tags: ["warm-up", "exercise safety", "muscle preparation"],
    difficulty: "easy",
    estimatedReadTime: 15,
    source: "sports medicine"
  },
  {
    title: "Listen to Your Body's Pain Signals",
    content: "Distinguish between normal exercise discomfort and pain that signals potential injury. Sharp, sudden, or persistent pain means you should stop and rest or seek medical advice.",
    category: HealthTipCategory.INJURY_PREVENTION,
    tags: ["body awareness", "pain management", "exercise safety"],
    difficulty: "moderate",
    estimatedReadTime: 18,
    source: "sports medicine"
  },
  {
    title: "Strengthen Your Core Regularly",
    content: "A strong core supports your spine and improves balance, reducing risk of back injuries and falls. Include planks, bridges, and other core exercises in your routine 2-3 times per week.",
    category: HealthTipCategory.INJURY_PREVENTION,
    tags: ["core strength", "back health", "balance"],
    difficulty: "moderate",
    estimatedReadTime: 17,
    source: "physical therapists"
  },
  {
    title: "Use Proper Form Over Heavy Weights",
    content: "Focus on correct technique rather than lifting the heaviest weight possible. Poor form increases injury risk and reduces exercise effectiveness. Master the movement first, then add weight.",
    category: HealthTipCategory.INJURY_PREVENTION,
    tags: ["proper form", "weight training", "technique"],
    difficulty: "moderate",
    estimatedReadTime: 19,
    source: "fitness trainers"
  },

  // RECOVERY TIPS
  {
    title: "Take Rest Days Between Intense Workouts",
    content: "Allow 24-48 hours of rest between intense training sessions for the same muscle groups. Rest days are when your muscles actually grow stronger and adapt to exercise stress.",
    category: HealthTipCategory.RECOVERY,
    tags: ["rest days", "muscle recovery", "adaptation"],
    difficulty: "easy",
    estimatedReadTime: 16,
    source: "exercise physiologists"
  },
  {
    title: "Use Ice for Acute Injuries, Heat for Muscle Tension",
    content: "Apply ice to new injuries (first 24-48 hours) to reduce swelling. Use heat for chronic muscle tension and stiffness to improve blood flow and relaxation.",
    category: HealthTipCategory.RECOVERY,
    tags: ["ice therapy", "heat therapy", "injury treatment"],
    difficulty: "moderate",
    estimatedReadTime: 18,
    source: "sports medicine"
  },
  {
    title: "Prioritize Sleep for Recovery",
    content: "Aim for 7-9 hours of quality sleep nightly. During sleep, your body releases growth hormone, repairs tissues, and consolidates the benefits of your workouts.",
    category: HealthTipCategory.RECOVERY,
    tags: ["sleep", "growth hormone", "tissue repair"],
    difficulty: "easy",
    estimatedReadTime: 15,
    source: "sleep specialists"
  },
  {
    title: "Stay Hydrated for Optimal Recovery",
    content: "Proper hydration supports nutrient transport, waste removal, and temperature regulation. Drink water consistently throughout the day, not just during workouts.",
    category: HealthTipCategory.RECOVERY,
    tags: ["hydration", "nutrient transport", "recovery"],
    difficulty: "easy",
    estimatedReadTime: 14,
    source: "sports nutritionists"
  }
];

// Helper function to get tips by category
export const getTipsByCategory = (category: HealthTipCategory): CuratedHealthTip[] => {
  return CURATED_HEALTH_TIPS.filter(tip => tip.category === category);
};

// Helper function to get random tips
export const getRandomTips = (count: number, excludeIds: string[] = []): CuratedHealthTip[] => {
  const availableTips = CURATED_HEALTH_TIPS.filter((_, index) => 
    !excludeIds.includes(index.toString())
  );
  
  const shuffled = [...availableTips].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
