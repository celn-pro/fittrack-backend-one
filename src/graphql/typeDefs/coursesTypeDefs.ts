// GraphQL Type Definitions for Courses
import { gql } from 'apollo-server-express';

export const coursesTypeDefs = gql`
  # Course Categories
  enum CourseCategory {
    FITNESS_BASICS
    STRENGTH_TRAINING
    CARDIO
    FLEXIBILITY
    NUTRITION
    WEIGHT_LOSS
    MUSCLE_BUILDING
    MENTAL_HEALTH
    INJURY_PREVENTION
    RECOVERY
    YOGA
    PILATES
  }

  # Course Difficulty Levels
  enum CourseDifficulty {
    BEGINNER
    INTERMEDIATE
    ADVANCED
  }

  # Lesson Content Types
  enum LessonContentType {
    VIDEO
    TEXT
    IMAGE
    EXERCISE
    QUIZ
    MIXED
  }

  # Exercise Type
  type Exercise {
    id: ID!
    name: String!
    description: String!
    instructions: [String!]!
    duration: Int!
    reps: Int
    sets: Int
    imageUrl: String
    videoUrl: String
    targetMuscles: [String!]!
    equipment: [String!]!
  }

  # Quiz Question Type
  type QuizQuestion {
    id: ID!
    question: String!
    options: [String!]!
    correctAnswer: Int!
    explanation: String
  }

  # Quiz Type
  type Quiz {
    id: ID!
    questions: [QuizQuestion!]!
    passingScore: Int!
  }

  # Lesson Type
  type Lesson {
    id: ID!
    courseId: String!
    title: String!
    description: String!
    order: Int!
    duration: Int!
    contentType: LessonContentType!
    contentUrl: String
    content: String!
    exercises: [Exercise!]
    quiz: Quiz
    isCompleted: Boolean
  }

  # Course Type
  type Course {
    id: ID!
    title: String!
    description: String!
    category: CourseCategory!
    difficulty: CourseDifficulty!
    duration: Int!
    instructor: String!
    thumbnailUrl: String!
    tags: [String!]!
    lessons: [Lesson!]!
    prerequisites: [String!]!
    learningObjectives: [String!]!
    targetAudience: [String!]!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  # Course Recommendation Type
  type CourseRecommendation {
    course: Course!
    reason: String!
    matchScore: Int!
  }

  # User Course Progress Type
  type UserCourseProgress {
    userId: String!
    courseId: String!
    enrolledAt: String!
    lastAccessedAt: String!
    completedLessons: [String!]!
    currentLessonId: String
    progressPercentage: Int!
    isCompleted: Boolean!
    completedAt: String
  }

  # Course Filter Input
  input CourseFilter {
    category: CourseCategory
    difficulty: CourseDifficulty
    maxDuration: Int
    tags: [String!]
    instructor: String
    limit: Int
  }

  # User Profile for Course Recommendations Input
  input UserProfileForCoursesInput {
    fitnessLevel: String!
    fitnessGoals: [String!]!
    preferredWorkoutTypes: [String!]!
    healthConditions: [String!]
    injuries: [String!]
    availableTime: Int
    experience: [String!]
  }

  # Course Statistics
  type CourseCategoryStats {
    category: CourseCategory!
    count: Int!
  }

  type CourseDifficultyStats {
    difficulty: CourseDifficulty!
    count: Int!
  }

  type CourseStatistics {
    totalCourses: Int!
    categoriesCount: Int!
    categoryBreakdown: [CourseCategoryStats!]!
    difficultyBreakdown: [CourseDifficultyStats!]!
    totalLessons: Int!
    averageDuration: Int!
  }

  # Queries
  extend type Query {
    # Get personalized course recommendations based on user profile
    getPersonalizedCourses(userProfile: UserProfileForCoursesInput!, limit: Int): [CourseRecommendation!]!
    
    # Get all courses with optional filtering
    getCourses(filter: CourseFilter): [Course!]!
    
    # Get courses by specific category
    getCoursesByCategory(category: CourseCategory!, limit: Int): [Course!]!
    
    # Search courses by keyword
    searchCourses(query: String!, limit: Int): [Course!]!
    
    # Get a specific course by ID
    getCourseById(courseId: String!): Course
    
    # Get beginner-friendly courses
    getBeginnerCourses(limit: Int): [Course!]!
    
    # Get featured/popular courses
    getFeaturedCourses(limit: Int): [Course!]!
    
    # Get available course categories
    getCourseCategories: [CourseCategory!]!
    
    # Get available difficulty levels
    getCourseDifficulties: [CourseDifficulty!]!
    
    # Get course statistics
    getCourseStatistics: CourseStatistics!
  }
`;
