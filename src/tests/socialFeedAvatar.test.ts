// Test to verify avatar functionality in social feed
import { socialFeedResolvers } from '../graphql/resolvers/socialFeedResolvers';
import { FeedPostModel } from '../models/FeedPostSchema';
import { UserModel } from '../models/UserSchema';
import mongoose from 'mongoose';

// Mock context for testing
const createMockContext = (user: any) => ({
  user,
  token: 'mock-token',
  isAuthenticated: true
});

const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  password: 'hashedpassword',
  isEmailVerified: true,
  isProfileComplete: true,
  notificationSettings: {
    workoutReminders: true,
    nutritionTips: true,
    progressUpdates: true,
    emailNotifications: true
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('Social Feed Avatar Functionality', () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fittrack-test');
    }
  });

  afterAll(async () => {
    // Clean up test data
    await FeedPostModel.deleteMany({});
    await UserModel.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await FeedPostModel.deleteMany({});
    await UserModel.deleteMany({});
  });

  test('should generate avatar URL for user in feed post', async () => {
    // Create a test user
    const user = new UserModel(mockUser);
    await user.save();

    const context = createMockContext(user);
    const input = {
      content: 'Testing avatar functionality! 🎭',
      activityType: 'general' as const
    };

    const result = await socialFeedResolvers.Mutation.createFeedPost(
      null,
      { input },
      context
    );

    expect(result).toBeDefined();
    expect(result.user.avatar).toBeDefined();
    expect(result.user.avatar).toContain('ui-avatars.com');
    expect(result.user.avatar).toContain('name=John%20Doe');
    expect(result.user.name).toBe('John Doe');
    
    console.log('Generated avatar URL:', result.user.avatar);
  });

  test('should generate avatar URL for user in comments', async () => {
    // Create a test user
    const user = new UserModel(mockUser);
    await user.save();

    // Create a test post
    const feedPost = new FeedPostModel({
      user: user._id,
      content: 'Test post for avatar in comments',
      activityType: 'general'
    });
    await feedPost.save();

    const context = createMockContext(user);
    const commentText = 'Testing avatar in comments! 💬';

    const result = await socialFeedResolvers.Mutation.commentFeedPost(
      null,
      { id: feedPost._id.toString(), comment: commentText },
      context
    );

    expect(result.comments).toBeDefined();
    expect(result.comments.length).toBe(1);
    expect(result.comments[0].user.avatar).toBeDefined();
    expect(result.comments[0].user.avatar).toContain('ui-avatars.com');
    expect(result.comments[0].user.avatar).toContain('name=John%20Doe');
    expect(result.comments[0].user.name).toBe('John Doe');
    
    console.log('Generated comment avatar URL:', result.comments[0].user.avatar);
  });

  test('should generate consistent avatar URLs for same user', async () => {
    // Create a test user
    const user = new UserModel(mockUser);
    await user.save();

    // Create multiple posts
    const context = createMockContext(user);
    
    const post1 = await socialFeedResolvers.Mutation.createFeedPost(
      null,
      { input: { content: 'First post', activityType: 'general' as const } },
      context
    );

    const post2 = await socialFeedResolvers.Mutation.createFeedPost(
      null,
      { input: { content: 'Second post', activityType: 'workout' as const } },
      context
    );

    // Avatar URLs should be consistent for the same user
    expect(post1.user.avatar).toBe(post2.user.avatar);
    
    console.log('Consistent avatar URL:', post1.user.avatar);
  });

  test('should generate different avatar URLs for different users', async () => {
    // Create first test user
    const user1 = new UserModel(mockUser);
    await user1.save();

    // Create second test user
    const user2Data = {
      ...mockUser,
      _id: new mongoose.Types.ObjectId(),
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith'
    };
    const user2 = new UserModel(user2Data);
    await user2.save();

    // Create posts for both users
    const context1 = createMockContext(user1);
    const context2 = createMockContext(user2);
    
    const post1 = await socialFeedResolvers.Mutation.createFeedPost(
      null,
      { input: { content: 'John\'s post', activityType: 'general' as const } },
      context1
    );

    const post2 = await socialFeedResolvers.Mutation.createFeedPost(
      null,
      { input: { content: 'Jane\'s post', activityType: 'general' as const } },
      context2
    );

    // Avatar URLs should be different for different users
    expect(post1.user.avatar).not.toBe(post2.user.avatar);
    expect(post1.user.name).toBe('John Doe');
    expect(post2.user.name).toBe('Jane Smith');
    
    console.log('John\'s avatar URL:', post1.user.avatar);
    console.log('Jane\'s avatar URL:', post2.user.avatar);
  });

  test('should handle special characters in names for avatar generation', async () => {
    // Create user with special characters in name
    const specialUser = {
      ...mockUser,
      _id: new mongoose.Types.ObjectId(),
      firstName: 'José',
      lastName: 'García-López',
      email: 'jose@example.com'
    };
    
    const user = new UserModel(specialUser);
    await user.save();

    const context = createMockContext(user);
    const input = {
      content: 'Testing special characters in name! 🌟',
      activityType: 'general' as const
    };

    const result = await socialFeedResolvers.Mutation.createFeedPost(
      null,
      { input },
      context
    );

    expect(result.user.avatar).toBeDefined();
    expect(result.user.avatar).toContain('ui-avatars.com');
    expect(result.user.name).toBe('José García-López');
    
    console.log('Special character name avatar URL:', result.user.avatar);
  });
});

console.log('Social Feed Avatar Test Suite Created');
console.log('Run with: npm test src/tests/socialFeedAvatar.test.ts');
