// GraphQL Resolvers for Courses
import { CoursesService } from '../../services/CoursesService';
import { CacheService } from '../../services/CacheService';
import { CourseCategory, CourseFilter, UserProfileForCourses } from '../../types/courses.types';

// Initialize services
const cacheService = new CacheService();
const coursesService = new CoursesService(cacheService);

export const coursesResolvers = {
  Query: {
    /**
     * Get personalized course recommendations based on user profile
     */
    getPersonalizedCourses: async (_: any, { userProfile, limit }: { userProfile: UserProfileForCourses; limit?: number }) => {
      try {
        console.log(`🎓 Getting personalized courses for user profile:`, userProfile);
        
        const recommendations = await coursesService.getPersonalizedCourses(userProfile, limit);
        
        console.log(`✅ Retrieved ${recommendations.length} personalized course recommendations`);
        console.log('🎓 Final Personalized Courses being sent to frontend:', JSON.stringify(recommendations, null, 2));
        
        return recommendations;
      } catch (error) {
        console.error('Error getting personalized courses:', error);
        throw new Error(`Failed to get personalized courses: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Get all courses with optional filtering
     */
    getCourses: async (_: any, { filter }: { filter?: CourseFilter }) => {
      try {
        console.log('🔍 Getting courses with filter:', filter);
        
        const courses = await coursesService.getCourses(filter || {});
        
        console.log(`✅ Retrieved ${courses.length} courses`);
        console.log('🔍 Filtered Courses being sent to frontend:', JSON.stringify(courses, null, 2));
        
        return courses;
      } catch (error) {
        console.error('Error getting courses:', error);
        throw new Error(`Failed to get courses: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Get courses by specific category
     */
    getCoursesByCategory: async (_: any, { category, limit }: { category: CourseCategory; limit?: number }) => {
      try {
        console.log(`🎯 Getting courses for category: ${category}, limit: ${limit || 10}`);
        
        const courses = await coursesService.getCoursesByCategory(category, limit);
        
        console.log(`✅ Retrieved ${courses.length} courses for category: ${category}`);
        console.log(`🎯 Category Courses (${category}) being sent to frontend:`, JSON.stringify(courses, null, 2));
        
        return courses;
      } catch (error) {
        console.error('Error getting courses by category:', error);
        throw new Error(`Failed to get courses by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Search courses by keyword
     */
    searchCourses: async (_: any, { query, limit }: { query: string; limit?: number }) => {
      try {
        console.log(`🔎 Searching courses for query: "${query}", limit: ${limit || 10}`);
        
        const courses = await coursesService.searchCourses(query, limit);
        
        console.log(`✅ Found ${courses.length} courses matching query: "${query}"`);
        console.log(`🔎 Search Courses ("${query}") being sent to frontend:`, JSON.stringify(courses, null, 2));
        
        return courses;
      } catch (error) {
        console.error('Error searching courses:', error);
        throw new Error(`Failed to search courses: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Get a specific course by ID
     */
    getCourseById: async (_: any, { courseId }: { courseId: string }) => {
      try {
        console.log(`🎯 Getting course by ID: ${courseId}`);
        
        const course = await coursesService.getCourseById(courseId);
        
        if (course) {
          console.log(`✅ Retrieved course: ${course.title}`);
          console.log(`🎯 Course Details being sent to frontend:`, JSON.stringify(course, null, 2));
        } else {
          console.log(`❌ Course not found with ID: ${courseId}`);
        }
        
        return course;
      } catch (error) {
        console.error('Error getting course by ID:', error);
        throw new Error(`Failed to get course by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Get beginner-friendly courses
     */
    getBeginnerCourses: async (_: any, { limit }: { limit?: number }) => {
      try {
        console.log(`🌱 Getting beginner courses, limit: ${limit || 5}`);
        
        const courses = await coursesService.getBeginnerCourses(limit);
        
        console.log(`✅ Retrieved ${courses.length} beginner courses`);
        console.log('🌱 Beginner Courses being sent to frontend:', JSON.stringify(courses, null, 2));
        
        return courses;
      } catch (error) {
        console.error('Error getting beginner courses:', error);
        throw new Error(`Failed to get beginner courses: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Get featured/popular courses
     */
    getFeaturedCourses: async (_: any, { limit }: { limit?: number }) => {
      try {
        console.log(`⭐ Getting featured courses, limit: ${limit || 4}`);
        
        const courses = await coursesService.getFeaturedCourses(limit);
        
        console.log(`✅ Retrieved ${courses.length} featured courses`);
        console.log('⭐ Featured Courses being sent to frontend:', JSON.stringify(courses, null, 2));
        
        return courses;
      } catch (error) {
        console.error('Error getting featured courses:', error);
        throw new Error(`Failed to get featured courses: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Get available course categories
     */
    getCourseCategories: async () => {
      try {
        console.log('📋 Getting available course categories');
        
        const categories = coursesService.getAvailableCategories();
        
        console.log(`✅ Retrieved ${categories.length} course categories`);
        
        return categories;
      } catch (error) {
        console.error('Error getting course categories:', error);
        throw new Error(`Failed to get course categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Get available difficulty levels
     */
    getCourseDifficulties: async () => {
      try {
        console.log('📊 Getting available course difficulties');
        
        const difficulties = coursesService.getAvailableDifficulties();
        
        console.log(`✅ Retrieved ${difficulties.length} difficulty levels`);
        
        return difficulties;
      } catch (error) {
        console.error('Error getting course difficulties:', error);
        throw new Error(`Failed to get course difficulties: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Get course statistics
     */
    getCourseStatistics: async () => {
      try {
        console.log('📊 Getting course statistics');
        
        const stats = coursesService.getStatistics();
        
        console.log(`✅ Retrieved statistics: ${stats.totalCourses} total courses across ${stats.categoriesCount} categories`);
        
        return stats;
      } catch (error) {
        console.error('Error getting course statistics:', error);
        throw new Error(`Failed to get course statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  },

  // Enum resolvers to ensure proper mapping
  CourseCategory: {
    FITNESS_BASICS: 'fitness_basics',
    STRENGTH_TRAINING: 'strength_training',
    CARDIO: 'cardio',
    FLEXIBILITY: 'flexibility',
    NUTRITION: 'nutrition',
    WEIGHT_LOSS: 'weight_loss',
    MUSCLE_BUILDING: 'muscle_building',
    MENTAL_HEALTH: 'mental_health',
    INJURY_PREVENTION: 'injury_prevention',
    RECOVERY: 'recovery',
    YOGA: 'yoga',
    PILATES: 'pilates'
  },

  CourseDifficulty: {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced'
  },

  LessonContentType: {
    VIDEO: 'video',
    TEXT: 'text',
    IMAGE: 'image',
    EXERCISE: 'exercise',
    QUIZ: 'quiz',
    MIXED: 'mixed'
  }
};
