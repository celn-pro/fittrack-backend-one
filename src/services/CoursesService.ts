// Courses Service - Provides health and fitness courses with user profile matching
import { 
  Course, 
  CourseCategory, 
  CourseDifficulty,
  CourseFilter,
  CourseRecommendation,
  UserCourseProgress,
  UserProfileForCourses,
  CuratedCourse,
  Lesson,
  Exercise,
  Quiz
} from '../types/courses.types';
import { 
  CURATED_COURSES, 
  getCoursesByCategory, 
  getCoursesByDifficulty,
  getCoursesForUserProfile 
} from '../data/coursesDatabase';
import { CacheService } from './CacheService';

export class CoursesService {
  private cacheService: CacheService;

  constructor(cacheService?: CacheService) {
    this.cacheService = cacheService || new CacheService();
  }

  /**
   * Get personalized course recommendations based on user profile
   */
  async getPersonalizedCourses(userProfile: UserProfileForCourses, limit: number = 6): Promise<CourseRecommendation[]> {
    const cacheKey = `courses:personalized:${this.hashUserProfile(userProfile)}:${limit}`;

    // Try cache first
    const cached = await this.cacheService.get<CourseRecommendation[]>(cacheKey);
    if (cached) {
      console.log(`✅ Returning cached personalized courses for user profile`);
      return cached;
    }

    console.log(`🔄 Generating personalized course recommendations`);

    // Get courses matching user profile
    const matchingCourses = getCoursesForUserProfile(
      userProfile.fitnessLevel,
      userProfile.fitnessGoals,
      userProfile.preferredWorkoutTypes
    );

    // Score and rank courses
    const recommendations = this.scoreAndRankCourses(matchingCourses, userProfile)
      .slice(0, limit)
      .map(scored => ({
        course: this.convertToCourse(scored.course, `personalized_${Date.now()}_${Math.random()}`),
        reason: scored.reason,
        matchScore: scored.matchScore
      }));

    // Cache for 1 hour
    await this.cacheService.set(cacheKey, recommendations, 3600000);

    return recommendations;
  }

  /**
   * Get all available courses with optional filtering
   */
  async getCourses(filter: CourseFilter = {}): Promise<Course[]> {
    const { category, difficulty, maxDuration, tags, instructor, limit = 20 } = filter;
    
    let filteredCourses = [...CURATED_COURSES];

    // Apply filters
    if (category) {
      filteredCourses = filteredCourses.filter(course => course.category === category);
    }

    if (difficulty) {
      filteredCourses = filteredCourses.filter(course => course.difficulty === difficulty);
    }

    if (maxDuration) {
      filteredCourses = filteredCourses.filter(course => course.duration <= maxDuration);
    }

    if (tags && tags.length > 0) {
      filteredCourses = filteredCourses.filter(course => 
        tags.some(tag => course.tags.includes(tag))
      );
    }

    if (instructor) {
      filteredCourses = filteredCourses.filter(course => 
        course.instructor.toLowerCase().includes(instructor.toLowerCase())
      );
    }

    // Convert to Course format and limit results
    return filteredCourses
      .slice(0, limit)
      .map((course, index) => this.convertToCourse(course, `filter_${index}_${Date.now()}`));
  }

  /**
   * Get courses by category
   */
  async getCoursesByCategory(category: CourseCategory, limit: number = 10): Promise<Course[]> {
    const categoryCourses = getCoursesByCategory(category);
    return categoryCourses
      .slice(0, limit)
      .map((course, index) => this.convertToCourse(course, `${category}_${index}_${Date.now()}`));
  }

  /**
   * Search courses by keyword
   */
  async searchCourses(query: string, limit: number = 10): Promise<Course[]> {
    const searchTerm = query.toLowerCase();
    
    const matchingCourses = CURATED_COURSES.filter(course => 
      course.title.toLowerCase().includes(searchTerm) ||
      course.description.toLowerCase().includes(searchTerm) ||
      course.instructor.toLowerCase().includes(searchTerm) ||
      course.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      course.learningObjectives.some(obj => obj.toLowerCase().includes(searchTerm))
    );

    return matchingCourses
      .slice(0, limit)
      .map((course, index) => this.convertToCourse(course, `search_${index}_${Date.now()}`));
  }

  /**
   * Get a specific course by ID (simulated)
   */
  async getCourseById(courseId: string): Promise<Course | null> {
    // In a real implementation, this would query by actual ID
    // For now, we'll use the index as a simple ID system
    const index = parseInt(courseId.split('_')[1]) || 0;
    const curatedCourse = CURATED_COURSES[index];
    
    if (!curatedCourse) {
      return null;
    }

    return this.convertToCourse(curatedCourse, courseId);
  }

  /**
   * Get beginner-friendly courses
   */
  async getBeginnerCourses(limit: number = 5): Promise<Course[]> {
    const beginnerCourses = getCoursesByDifficulty(CourseDifficulty.BEGINNER);
    return beginnerCourses
      .slice(0, limit)
      .map((course, index) => this.convertToCourse(course, `beginner_${index}_${Date.now()}`));
  }

  /**
   * Get featured/popular courses
   */
  async getFeaturedCourses(limit: number = 4): Promise<Course[]> {
    // For now, return a mix of different categories
    const featured = [
      CURATED_COURSES[0], // Fitness Basics
      CURATED_COURSES[1], // Strength Training
      CURATED_COURSES[2], // Nutrition
      CURATED_COURSES[3]  // Yoga
    ].filter(Boolean);

    return featured
      .slice(0, limit)
      .map((course, index) => this.convertToCourse(course, `featured_${index}_${Date.now()}`));
  }

  /**
   * Score and rank courses based on user profile
   */
  private scoreAndRankCourses(
    courses: CuratedCourse[], 
    userProfile: UserProfileForCourses
  ): Array<{ course: CuratedCourse; matchScore: number; reason: string }> {
    return courses.map(course => {
      let score = 0;
      let reasons: string[] = [];

      // Difficulty matching (40% of score)
      if (userProfile.fitnessLevel === 'beginner' && course.difficulty === CourseDifficulty.BEGINNER) {
        score += 40;
        reasons.push("Perfect for beginners");
      } else if (userProfile.fitnessLevel === 'intermediate' && course.difficulty === CourseDifficulty.INTERMEDIATE) {
        score += 40;
        reasons.push("Matches your intermediate level");
      } else if (userProfile.fitnessLevel === 'advanced' && course.difficulty === CourseDifficulty.ADVANCED) {
        score += 40;
        reasons.push("Advanced level content");
      } else if (userProfile.fitnessLevel === 'intermediate' && course.difficulty === CourseDifficulty.BEGINNER) {
        score += 25;
        reasons.push("Good for reviewing fundamentals");
      }

      // Goals matching (30% of score)
      const goalMatches = userProfile.fitnessGoals.filter(goal => 
        course.tags.includes(goal.toLowerCase()) || 
        course.learningObjectives.some(obj => obj.toLowerCase().includes(goal.toLowerCase()))
      );
      if (goalMatches.length > 0) {
        score += 30 * (goalMatches.length / userProfile.fitnessGoals.length);
        reasons.push(`Aligns with your ${goalMatches.join(', ')} goals`);
      }

      // Workout type preferences (20% of score)
      const typeMatches = userProfile.preferredWorkoutTypes.filter(type => 
        course.category.includes(type.toLowerCase()) || 
        course.tags.includes(type.toLowerCase())
      );
      if (typeMatches.length > 0) {
        score += 20 * (typeMatches.length / userProfile.preferredWorkoutTypes.length);
        reasons.push(`Matches your interest in ${typeMatches.join(', ')}`);
      }

      // Duration matching (10% of score)
      if (userProfile.availableTime && course.duration <= userProfile.availableTime * 2) {
        score += 10;
        reasons.push("Fits your available time");
      }

      return {
        course,
        matchScore: Math.min(100, Math.round(score)),
        reason: reasons.length > 0 ? reasons[0] : "Recommended for you"
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Convert CuratedCourse to Course
   */
  private convertToCourse(curatedCourse: CuratedCourse, id: string): Course {
    return {
      id,
      title: curatedCourse.title,
      description: curatedCourse.description,
      category: curatedCourse.category,
      difficulty: curatedCourse.difficulty,
      duration: curatedCourse.duration,
      instructor: curatedCourse.instructor,
      thumbnailUrl: curatedCourse.thumbnailUrl,
      tags: curatedCourse.tags,
      lessons: curatedCourse.lessons.map((lesson, index) => ({
        id: `${id}_lesson_${index}`,
        courseId: id,
        title: lesson.title,
        description: lesson.description,
        order: lesson.order,
        duration: lesson.duration,
        contentType: lesson.contentType,
        contentUrl: lesson.contentUrl,
        content: lesson.content,
        exercises: lesson.exercises?.map((exercise, exIndex) => ({
          id: `${id}_lesson_${index}_exercise_${exIndex}`,
          name: exercise.name,
          description: exercise.description,
          instructions: exercise.instructions,
          duration: exercise.duration,
          reps: exercise.reps,
          sets: exercise.sets,
          imageUrl: exercise.imageUrl,
          videoUrl: exercise.videoUrl,
          targetMuscles: exercise.targetMuscles,
          equipment: exercise.equipment
        })),
        quiz: lesson.quiz ? {
          id: `${id}_lesson_${index}_quiz`,
          questions: lesson.quiz.questions.map((q, qIndex) => ({
            id: `${id}_lesson_${index}_quiz_${qIndex}`,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          })),
          passingScore: lesson.quiz.passingScore
        } : undefined
      })),
      prerequisites: curatedCourse.prerequisites,
      learningObjectives: curatedCourse.learningObjectives,
      targetAudience: curatedCourse.targetAudience,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Generate hash of user profile for cache key
   */
  private hashUserProfile(profile: UserProfileForCourses): string {
    const keyAttributes = {
      fitnessLevel: profile.fitnessLevel,
      fitnessGoals: profile.fitnessGoals?.sort(),
      preferredWorkoutTypes: profile.preferredWorkoutTypes?.sort(),
      availableTime: profile.availableTime
    };

    return Buffer.from(JSON.stringify(keyAttributes)).toString('base64').slice(0, 16);
  }

  /**
   * Get available categories
   */
  getAvailableCategories(): CourseCategory[] {
    return Object.values(CourseCategory);
  }

  /**
   * Get available difficulty levels
   */
  getAvailableDifficulties(): CourseDifficulty[] {
    return Object.values(CourseDifficulty);
  }

  /**
   * Get statistics about the courses database
   */
  getStatistics() {
    const categories = this.getAvailableCategories();
    const difficulties = this.getAvailableDifficulties();
    
    const categoryStats = categories.map(category => ({
      category,
      count: getCoursesByCategory(category).length
    }));

    const difficultyStats = difficulties.map(difficulty => ({
      difficulty,
      count: getCoursesByDifficulty(difficulty).length
    }));

    return {
      totalCourses: CURATED_COURSES.length,
      categoriesCount: categories.length,
      categoryBreakdown: categoryStats,
      difficultyBreakdown: difficultyStats,
      totalLessons: CURATED_COURSES.reduce((total, course) => total + course.lessons.length, 0),
      averageDuration: Math.round(CURATED_COURSES.reduce((total, course) => total + course.duration, 0) / CURATED_COURSES.length)
    };
  }
}
