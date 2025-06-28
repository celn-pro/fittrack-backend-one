import { FeedPostModel } from '../models/FeedPostSchema';
import { UserModel } from '../models/UserSchema';
import mongoose from 'mongoose';

// Mock data for testing
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

const mockFeedPost = {
  user: mockUser._id,
  content: 'Just completed an amazing workout! 💪',
  activityType: 'workout',
  activityValue: '45 minutes strength training',
  likes: 0,
  likedBy: [],
  comments: []
};

describe('Social Feed Functionality', () => {
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

  test('should create a new feed post', async () => {
    // Create a test user first
    const user = new UserModel(mockUser);
    await user.save();

    // Create a feed post
    const feedPost = new FeedPostModel({
      ...mockFeedPost,
      user: user._id
    });

    const savedPost = await feedPost.save();

    expect(savedPost).toBeDefined();
    expect(savedPost.content).toBe(mockFeedPost.content);
    expect(savedPost.activityType).toBe(mockFeedPost.activityType);
    expect(savedPost.likes).toBe(0);
    expect(savedPost.likedBy).toHaveLength(0);
    expect(savedPost.comments).toHaveLength(0);
  });

  test('should add a like to a feed post', async () => {
    // Create a test user
    const user = new UserModel(mockUser);
    await user.save();

    // Create a feed post
    const feedPost = new FeedPostModel({
      ...mockFeedPost,
      user: user._id
    });
    await feedPost.save();

    // Add a like
    await feedPost.addLike(user._id.toString());

    expect(feedPost.likes).toBe(1);
    expect(feedPost.likedBy).toHaveLength(1);
    expect(feedPost.likedBy[0].toString()).toBe(user._id.toString());
  });

  test('should add a comment to a feed post', async () => {
    // Create a test user
    const user = new UserModel(mockUser);
    await user.save();

    // Create a feed post
    const feedPost = new FeedPostModel({
      ...mockFeedPost,
      user: user._id
    });
    await feedPost.save();

    // Add a comment
    const commentText = 'Great job! Keep it up!';
    await feedPost.addComment(user._id.toString(), commentText);

    expect(feedPost.comments).toHaveLength(1);
    expect(feedPost.comments[0].comment).toBe(commentText);
    expect(feedPost.comments[0].user.toString()).toBe(user._id.toString());
  });

  test('should remove a like from a feed post', async () => {
    // Create a test user
    const user = new UserModel(mockUser);
    await user.save();

    // Create a feed post
    const feedPost = new FeedPostModel({
      ...mockFeedPost,
      user: user._id
    });
    await feedPost.save();

    // Add a like first
    await feedPost.addLike(user._id.toString());
    expect(feedPost.likes).toBe(1);

    // Remove the like
    await feedPost.removeLike(user._id.toString());
    expect(feedPost.likes).toBe(0);
    expect(feedPost.likedBy).toHaveLength(0);
  });

  test('should validate post content length', async () => {
    // Create a test user
    const user = new UserModel(mockUser);
    await user.save();

    // Try to create a post with content that's too long
    const longContent = 'a'.repeat(1001); // Exceeds 1000 character limit
    const feedPost = new FeedPostModel({
      user: user._id,
      content: longContent
    });

    await expect(feedPost.save()).rejects.toThrow();
  });

  test('should validate comment length', async () => {
    // Create a test user
    const user = new UserModel(mockUser);
    await user.save();

    // Create a feed post
    const feedPost = new FeedPostModel({
      ...mockFeedPost,
      user: user._id
    });
    await feedPost.save();

    // Try to add a comment that's too long
    const longComment = 'a'.repeat(501); // Exceeds 500 character limit
    
    await expect(feedPost.addComment(user._id.toString(), longComment)).rejects.toThrow();
  });
});

console.log('Social Feed Test Suite Created');
console.log('Run with: npm test src/tests/socialFeed.test.ts');
