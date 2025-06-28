// Courses Types and Interfaces
export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  duration: number; // in minutes
  instructor: string;
  thumbnailUrl: string;
  tags: string[];
  lessons: Lesson[];
  prerequisites: string[];
  learningObjectives: string[];
  targetAudience: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  duration: number; // in minutes
  contentType: LessonContentType;
  contentUrl?: string; // video, image, or document URL
  content: string; // text content or instructions
  exercises?: Exercise[];
  quiz?: Quiz;
  isCompleted?: boolean; // for user progress
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  duration: number; // in seconds
  reps?: number;
  sets?: number;
  imageUrl?: string;
  videoUrl?: string;
  targetMuscles: string[];
  equipment: string[];
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
  passingScore: number; // percentage
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
}

export enum CourseCategory {
  FITNESS_BASICS = 'fitness_basics',
  STRENGTH_TRAINING = 'strength_training',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  NUTRITION = 'nutrition',
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_BUILDING = 'muscle_building',
  MENTAL_HEALTH = 'mental_health',
  INJURY_PREVENTION = 'injury_prevention',
  RECOVERY = 'recovery',
  YOGA = 'yoga',
  PILATES = 'pilates'
}

export enum CourseDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum LessonContentType {
  VIDEO = 'video',
  TEXT = 'text',
  IMAGE = 'image',
  EXERCISE = 'exercise',
  QUIZ = 'quiz',
  MIXED = 'mixed'
}

// User Progress Tracking
export interface UserCourseProgress {
  userId: string;
  courseId: string;
  enrolledAt: Date;
  lastAccessedAt: Date;
  completedLessons: string[]; // lesson IDs
  currentLessonId?: string;
  progressPercentage: number;
  isCompleted: boolean;
  completedAt?: Date;
  quizScores: { [lessonId: string]: number };
}

export interface UserLessonProgress {
  userId: string;
  lessonId: string;
  courseId: string;
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number; // in seconds
  isCompleted: boolean;
  quizScore?: number;
  notes?: string;
}

// Course Recommendations
export interface CourseRecommendation {
  course: Course;
  reason: string;
  matchScore: number; // 0-100
  userProgress?: UserCourseProgress;
}

// Filters and Search
export interface CourseFilter {
  category?: CourseCategory;
  difficulty?: CourseDifficulty;
  maxDuration?: number; // in minutes
  tags?: string[];
  instructor?: string;
  limit?: number;
}

export interface CourseSearchResult {
  courses: Course[];
  totalCount: number;
  hasMore: boolean;
}

// API Response Types
export interface CoursesResponse {
  success: boolean;
  data: Course[] | CourseRecommendation[];
  message?: string;
  cached?: boolean;
}

// For curated courses database
export interface CuratedCourse {
  title: string;
  description: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  duration: number;
  instructor: string;
  thumbnailUrl: string;
  tags: string[];
  lessons: CuratedLesson[];
  prerequisites: string[];
  learningObjectives: string[];
  targetAudience: string[];
}

export interface CuratedLesson {
  title: string;
  description: string;
  order: number;
  duration: number;
  contentType: LessonContentType;
  contentUrl?: string;
  content: string;
  exercises?: CuratedExercise[];
  quiz?: CuratedQuiz;
}

export interface CuratedExercise {
  name: string;
  description: string;
  instructions: string[];
  duration: number;
  reps?: number;
  sets?: number;
  imageUrl?: string;
  videoUrl?: string;
  targetMuscles: string[];
  equipment: string[];
}

export interface CuratedQuiz {
  questions: CuratedQuizQuestion[];
  passingScore: number;
}

export interface CuratedQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// External API Integration Types
export interface ExternalCourseContent {
  source: 'youtube' | 'vimeo' | 'custom';
  videoId?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
}

// User Profile Matching
export interface UserProfileForCourses {
  fitnessLevel: string;
  fitnessGoals: string[];
  preferredWorkoutTypes: string[];
  healthConditions: string[];
  injuries: string[];
  availableTime: number; // minutes per session
  experience: string[];
}
