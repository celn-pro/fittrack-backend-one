// Curated Courses Database
import { 
  CuratedCourse, 
  CourseCategory, 
  CourseDifficulty, 
  LessonContentType 
} from '../types/courses.types';

export const CURATED_COURSES: CuratedCourse[] = [
  // FITNESS BASICS COURSE
  {
    title: "Fitness Fundamentals: Your Journey Begins",
    description: "Master the basics of fitness with this comprehensive beginner course covering exercise principles, proper form, and building healthy habits.",
    category: CourseCategory.FITNESS_BASICS,
    difficulty: CourseDifficulty.BEGINNER,
    duration: 120, // 2 hours total
    instructor: "Sarah Johnson, Certified Personal Trainer",
    thumbnailUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    tags: ["beginner", "fundamentals", "exercise basics", "healthy habits"],
    prerequisites: [],
    learningObjectives: [
      "Understand basic exercise principles",
      "Learn proper warm-up and cool-down techniques",
      "Master fundamental movement patterns",
      "Develop a sustainable fitness routine"
    ],
    targetAudience: ["Complete beginners", "People returning to fitness", "Anyone wanting to build strong foundations"],
    lessons: [
      {
        title: "Introduction to Fitness",
        description: "Understanding what fitness means and setting realistic goals",
        order: 1,
        duration: 15,
        contentType: LessonContentType.TEXT,
        content: "Welcome to your fitness journey! Fitness isn't just about looking good - it's about feeling strong, healthy, and confident. In this lesson, we'll explore what fitness really means and how to set achievable goals that will keep you motivated throughout your journey.",
        contentUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop"
      },
      {
        title: "The Importance of Warm-Up",
        description: "Learn why warming up is crucial and how to do it properly",
        order: 2,
        duration: 20,
        contentType: LessonContentType.EXERCISE,
        content: "A proper warm-up prepares your body for exercise by gradually increasing your heart rate and loosening your muscles. This reduces injury risk and improves performance.",
        exercises: [
          {
            name: "Arm Circles",
            description: "Gentle shoulder mobility exercise",
            instructions: [
              "Stand with feet shoulder-width apart",
              "Extend arms out to sides",
              "Make small circles forward for 10 reps",
              "Reverse direction for 10 reps"
            ],
            duration: 30,
            reps: 10,
            sets: 2,
            imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
            targetMuscles: ["shoulders", "arms"],
            equipment: ["none"]
          },
          {
            name: "Marching in Place",
            description: "Low-impact cardio warm-up",
            instructions: [
              "Stand tall with good posture",
              "Lift one knee up toward chest",
              "Lower and repeat with other leg",
              "Keep a steady rhythm"
            ],
            duration: 60,
            targetMuscles: ["legs", "core"],
            equipment: ["none"]
          }
        ]
      },
      {
        title: "Basic Movement Patterns",
        description: "Master the fundamental movements that form the basis of all exercises",
        order: 3,
        duration: 25,
        contentType: LessonContentType.EXERCISE,
        content: "These basic movement patterns are the foundation of all exercise. Master these and you'll be ready for any workout!",
        exercises: [
          {
            name: "Bodyweight Squat",
            description: "The king of lower body exercises",
            instructions: [
              "Stand with feet shoulder-width apart",
              "Lower your body as if sitting in a chair",
              "Keep your chest up and knees behind toes",
              "Return to starting position"
            ],
            duration: 30,
            reps: 10,
            sets: 3,
            imageUrl: "https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=400&h=300&fit=crop",
            targetMuscles: ["quadriceps", "glutes", "hamstrings"],
            equipment: ["none"]
          }
        ]
      },
      {
        title: "Creating Your Routine",
        description: "Learn how to build a sustainable fitness routine that fits your lifestyle",
        order: 4,
        duration: 20,
        contentType: LessonContentType.TEXT,
        content: "The best workout routine is the one you'll actually stick to. Let's create a plan that works for your schedule, preferences, and goals.",
        quiz: {
          questions: [
            {
              question: "How many days per week should a beginner exercise?",
              options: ["Every day", "3-4 days", "Once a week", "Only weekends"],
              correctAnswer: 1,
              explanation: "3-4 days per week allows for adequate recovery while building consistency."
            },
            {
              question: "What's the most important factor in a successful fitness routine?",
              options: ["Intensity", "Consistency", "Duration", "Equipment"],
              correctAnswer: 1,
              explanation: "Consistency is key - it's better to do moderate exercise regularly than intense exercise sporadically."
            }
          ],
          passingScore: 70
        }
      }
    ]
  },

  // STRENGTH TRAINING COURSE
  {
    title: "Strength Training Essentials",
    description: "Build muscle, increase strength, and boost metabolism with this comprehensive strength training course for all levels.",
    category: CourseCategory.STRENGTH_TRAINING,
    difficulty: CourseDifficulty.INTERMEDIATE,
    duration: 180, // 3 hours total
    instructor: "Mike Rodriguez, Strength & Conditioning Coach",
    thumbnailUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop",
    tags: ["strength", "muscle building", "resistance training", "progressive overload"],
    prerequisites: ["Basic exercise knowledge", "Completed Fitness Fundamentals course"],
    learningObjectives: [
      "Understand progressive overload principles",
      "Learn proper lifting techniques",
      "Master compound movements",
      "Design effective strength programs"
    ],
    targetAudience: ["Intermediate fitness enthusiasts", "People wanting to build muscle", "Athletes looking to improve strength"],
    lessons: [
      {
        title: "Principles of Strength Training",
        description: "Understanding how muscles grow and adapt to resistance training",
        order: 1,
        duration: 25,
        contentType: LessonContentType.TEXT,
        content: "Strength training is based on the principle of progressive overload - gradually increasing the demands on your muscles to stimulate growth and strength gains.",
        contentUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=600&fit=crop"
      },
      {
        title: "The Big Three: Squat, Bench, Deadlift",
        description: "Master the three fundamental compound movements",
        order: 2,
        duration: 45,
        contentType: LessonContentType.EXERCISE,
        content: "These three exercises work multiple muscle groups and form the foundation of any strength program.",
        exercises: [
          {
            name: "Goblet Squat",
            description: "Beginner-friendly squat variation",
            instructions: [
              "Hold a dumbbell at chest level",
              "Feet shoulder-width apart",
              "Squat down keeping chest up",
              "Drive through heels to stand"
            ],
            duration: 45,
            reps: 12,
            sets: 3,
            imageUrl: "https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=400&h=300&fit=crop",
            targetMuscles: ["quadriceps", "glutes", "core"],
            equipment: ["dumbbell"]
          }
        ]
      }
    ]
  },

  // NUTRITION COURSE
  {
    title: "Nutrition for Fitness Success",
    description: "Learn how to fuel your body for optimal performance, recovery, and results with evidence-based nutrition strategies.",
    category: CourseCategory.NUTRITION,
    difficulty: CourseDifficulty.BEGINNER,
    duration: 150, // 2.5 hours total
    instructor: "Dr. Lisa Chen, Registered Dietitian",
    thumbnailUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop",
    tags: ["nutrition", "meal planning", "macronutrients", "healthy eating"],
    prerequisites: [],
    learningObjectives: [
      "Understand macronutrients and their roles",
      "Learn meal timing strategies",
      "Master portion control",
      "Create sustainable eating habits"
    ],
    targetAudience: ["Anyone wanting to improve their diet", "Fitness enthusiasts", "People with weight goals"],
    lessons: [
      {
        title: "Macronutrients Explained",
        description: "Understanding proteins, carbohydrates, and fats",
        order: 1,
        duration: 30,
        contentType: LessonContentType.TEXT,
        content: "Macronutrients are the building blocks of nutrition. Understanding how proteins, carbohydrates, and fats work in your body is essential for achieving your fitness goals.",
        contentUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop"
      },
      {
        title: "Meal Planning Made Simple",
        description: "Practical strategies for planning and preparing healthy meals",
        order: 2,
        duration: 35,
        contentType: LessonContentType.TEXT,
        content: "Successful nutrition starts with planning. Learn how to create meal plans that fit your lifestyle and support your goals.",
        quiz: {
          questions: [
            {
              question: "Which macronutrient is most important for muscle building?",
              options: ["Carbohydrates", "Protein", "Fat", "Vitamins"],
              correctAnswer: 1,
              explanation: "Protein provides the amino acids necessary for muscle protein synthesis and repair."
            }
          ],
          passingScore: 80
        }
      }
    ]
  },

  // YOGA COURSE
  {
    title: "Yoga for Beginners: Mind, Body, Spirit",
    description: "Discover the transformative power of yoga with gentle poses, breathing techniques, and mindfulness practices.",
    category: CourseCategory.YOGA,
    difficulty: CourseDifficulty.BEGINNER,
    duration: 200, // 3.3 hours total
    instructor: "Emma Thompson, Certified Yoga Instructor",
    thumbnailUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
    tags: ["yoga", "flexibility", "mindfulness", "stress relief"],
    prerequisites: [],
    learningObjectives: [
      "Learn basic yoga poses",
      "Understand breathing techniques",
      "Develop flexibility and balance",
      "Practice mindfulness and relaxation"
    ],
    targetAudience: ["Yoga beginners", "People seeking stress relief", "Anyone wanting to improve flexibility"],
    lessons: [
      {
        title: "Introduction to Yoga",
        description: "Understanding the philosophy and benefits of yoga practice",
        order: 1,
        duration: 20,
        contentType: LessonContentType.TEXT,
        content: "Yoga is more than just physical exercise - it's a practice that unites mind, body, and spirit. Discover how yoga can transform your life.",
        contentUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop"
      },
      {
        title: "Basic Yoga Poses",
        description: "Learn fundamental yoga asanas with proper alignment",
        order: 2,
        duration: 40,
        contentType: LessonContentType.EXERCISE,
        content: "These basic poses form the foundation of your yoga practice. Focus on proper alignment and breathing.",
        exercises: [
          {
            name: "Mountain Pose (Tadasana)",
            description: "The foundation of all standing poses",
            instructions: [
              "Stand with feet hip-width apart",
              "Engage your leg muscles",
              "Lengthen your spine",
              "Relax your shoulders",
              "Breathe deeply"
            ],
            duration: 60,
            imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
            targetMuscles: ["core", "legs"],
            equipment: ["yoga mat"]
          }
        ]
      }
    ]
  }
];

// Helper functions
export const getCoursesByCategory = (category: CourseCategory): CuratedCourse[] => {
  return CURATED_COURSES.filter(course => course.category === category);
};

export const getCoursesByDifficulty = (difficulty: CourseDifficulty): CuratedCourse[] => {
  return CURATED_COURSES.filter(course => course.difficulty === difficulty);
};

export const getCoursesForUserProfile = (
  fitnessLevel: string,
  goals: string[],
  preferredTypes: string[]
): CuratedCourse[] => {
  return CURATED_COURSES.filter(course => {
    // Match difficulty to fitness level
    const difficultyMatch = 
      (fitnessLevel === 'beginner' && course.difficulty === CourseDifficulty.BEGINNER) ||
      (fitnessLevel === 'intermediate' && [CourseDifficulty.BEGINNER, CourseDifficulty.INTERMEDIATE].includes(course.difficulty)) ||
      (fitnessLevel === 'advanced');

    // Match course category to user preferences
    const categoryMatch = preferredTypes.some(type => 
      course.tags.includes(type.toLowerCase()) || 
      course.category.includes(type.toLowerCase())
    );

    return difficultyMatch && (categoryMatch || preferredTypes.length === 0);
  });
};
