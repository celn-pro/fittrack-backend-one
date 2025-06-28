// GraphQL Integration Test for Social Feed
// This file demonstrates how to test the social feed GraphQL operations

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

describe('Social Feed GraphQL Resolvers', () => {
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

  test('createFeedPost mutation should create a new post', async () => {
    // Create a test user
    const user = new UserModel(mockUser);
    await user.save();

    const context = createMockContext(user);
    const input = {
      content: 'Just finished a great workout! 💪',
      activityType: 'workout' as const,
      activityValue: '45 minutes strength training'
    };

    const result = await socialFeedResolvers.Mutation.createFeedPost(
      null,
      { input },
      context
    );

    expect(result).toBeDefined();
    expect(result.content).toBe(input.content);
    expect(result.activityType).toBe(input.activityType);
    expect(result.activityValue).toBe(input.activityValue);
    expect(result.likes).toBe(0);
    expect(result.likedByCurrentUser).toBe(false);
    expect(result.user.name).toBe('John Doe');
  });

  test('getSocialFeed query should return posts', async () => {
    // Create a test user
    const user = new UserModel(mockUser);
    await user.save();

    // Create a test post
    const feedPost = new FeedPostModel({
      user: user._id,
      content: 'Test post content',
      activityType: 'general'
    });
    await feedPost.save();

    const context = createMockContext(user);

    const result = await socialFeedResolvers.Query.getSocialFeed(
      null,
      { limit: 10, offset: 0 },
      context
    );

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].content).toBe('Test post content');
    expect(result[0].user.name).toBe('John Doe');
  });

  test('likeFeedPost mutation should toggle like status', async () => {
    // Create a test user
    const user = new UserModel(mockUser);
    await user.save();

    // Create a test post
    const feedPost = new FeedPostModel({
      user: user._id,
      content: 'Test post for liking',
      activityType: 'general'
    });
    await feedPost.save();

    const context = createMockContext(user);

    // Like the post
    const likeResult = await socialFeedResolvers.Mutation.likeFeedPost(
      null,
      { id: feedPost._id.toString() },
      context
    );

    expect(likeResult.likes).toBe(1);

    // Unlike the post
    const unlikeResult = await socialFeedResolvers.Mutation.likeFeedPost(
      null,
      { id: feedPost._id.toString() },
      context
    );

    expect(unlikeResult.likes).toBe(0);
  });

  test('commentFeedPost mutation should add a comment', async () => {
    // Create a test user
    const user = new UserModel(mockUser);
    await user.save();

    // Create a test post
    const feedPost = new FeedPostModel({
      user: user._id,
      content: 'Test post for commenting',
      activityType: 'general'
    });
    await feedPost.save();

    const context = createMockContext(user);
    const commentText = 'Great post! Keep it up!';

    const result = await socialFeedResolvers.Mutation.commentFeedPost(
      null,
      { id: feedPost._id.toString(), comment: commentText },
      context
    );

    expect(result.comments).toBeDefined();
    expect(result.comments.length).toBe(1);
    expect(result.comments[0].comment).toBe(commentText);
    expect(result.comments[0].user.name).toBe('John Doe');
  });

  test('updateFeedPost mutation should update post content', async () => {
    // Create a test user
    const user = new UserModel(mockUser);
    await user.save();

    // Create a test post
    const feedPost = new FeedPostModel({
      user: user._id,
      content: 'Original content',
      activityType: 'general'
    });
    await feedPost.save();

    const context = createMockContext(user);
    const updatedContent = 'Updated content';

    const result = await socialFeedResolvers.Mutation.updateFeedPost(
      null,
      { 
        id: feedPost._id.toString(), 
        input: { content: updatedContent } 
      },
      context
    );

    expect(result.content).toBe(updatedContent);
    expect(result.user.name).toBe('John Doe');
  });

  test('deleteFeedPost mutation should delete a post', async () => {
    // Create a test user
    const user = new UserModel(mockUser);
    await user.save();

    // Create a test post
    const feedPost = new FeedPostModel({
      user: user._id,
      content: 'Post to be deleted',
      activityType: 'general'
    });
    await feedPost.save();

    const context = createMockContext(user);

    const result = await socialFeedResolvers.Mutation.deleteFeedPost(
      null,
      { id: feedPost._id.toString() },
      context
    );

    expect(result).toBe(true);

    // Verify post is deleted
    const deletedPost = await FeedPostModel.findById(feedPost._id);
    expect(deletedPost).toBeNull();
  });

  test('should require authentication for all operations', async () => {
    const unauthenticatedContext = {
      user: null,
      token: null,
      isAuthenticated: false
    };

    // Test getSocialFeed
    await expect(
      socialFeedResolvers.Query.getSocialFeed(null, {}, unauthenticatedContext)
    ).rejects.toThrow('You must be logged in');

    // Test createFeedPost
    await expect(
      socialFeedResolvers.Mutation.createFeedPost(
        null, 
        { input: { content: 'Test' } }, 
        unauthenticatedContext
      )
    ).rejects.toThrow('You must be logged in');
  });
});

console.log('Social Feed GraphQL Test Suite Created');
console.log('Run with: npm test src/tests/socialFeedGraphQL.test.ts');
