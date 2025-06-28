import { FeedPostModel } from '../../models/FeedPostSchema';
import { IUserDocument } from '../../models/UserSchema';
import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-express';
import mongoose from 'mongoose';

// Helper function to generate avatar URL
const generateAvatarUrl = (userId: string, name: string): string => {
  // Using a free avatar service that generates avatars based on user data
  // You can replace this with any avatar service you prefer
  const encodedName = encodeURIComponent(name);
  // Using userId as seed for consistent avatar colors
  const seed = userId.slice(-6); // Use last 6 chars of userId for color consistency
  return `https://ui-avatars.com/api/?name=${encodedName}&background=${seed}&color=fff&size=128&rounded=true`;
};

interface Context {
  user?: IUserDocument;
  token?: string;
  isAuthenticated: boolean;
}

interface FeedPostInput {
  content: string;
  image?: string;
  activityType?: 'workout' | 'nutrition' | 'achievement' | 'general';
  activityValue?: string;
}

interface UpdateFeedPostInput {
  content?: string;
  image?: string;
  activityType?: 'workout' | 'nutrition' | 'achievement' | 'general';
  activityValue?: string;
}

export const socialFeedResolvers = {
  Query: {
    getSocialFeed: async (
      _: any,
      { limit = 20, offset = 0 }: { limit?: number; offset?: number },
      { user, isAuthenticated }: Context
    ) => {
      if (!isAuthenticated || !user) {
        throw new AuthenticationError('You must be logged in to view the social feed');
      }

      try {
        const posts = await FeedPostModel
          .find()
          .populate('user', 'firstName lastName email')
          .populate('comments.user', 'firstName lastName email')
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(offset)
          .lean();

        // Add likedByCurrentUser field
        return posts.map((post: any) => ({
          ...post,
          id: post._id.toString(),
          likedByCurrentUser: post.likedBy?.some((userId: mongoose.Types.ObjectId) =>
            userId.toString() === user._id.toString()
          ) || false,
          user: {
            id: post.user._id.toString(),
            firstName: post.user.firstName,
            lastName: post.user.lastName,
            name: `${post.user.firstName} ${post.user.lastName}`,
            avatar: generateAvatarUrl(post.user._id.toString(), `${post.user.firstName} ${post.user.lastName}`)
          },
          comments: post.comments?.map((comment: any) => ({
            ...comment,
            user: {
              id: comment.user._id.toString(),
              firstName: comment.user.firstName,
              lastName: comment.user.lastName,
              name: `${comment.user.firstName} ${comment.user.lastName}`,
              avatar: generateAvatarUrl(comment.user._id.toString(), `${comment.user.firstName} ${comment.user.lastName}`)
            }
          })) || []
        }));
      } catch (error) {
        throw new Error(`Failed to fetch social feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    getFeedPost: async (
      _: any,
      { id }: { id: string },
      { user, isAuthenticated }: Context
    ) => {
      if (!isAuthenticated || !user) {
        throw new AuthenticationError('You must be logged in to view posts');
      }

      try {
        const post = await FeedPostModel
          .findById(id)
          .populate('user', 'firstName lastName email')
          .populate('comments.user', 'firstName lastName email')
          .lean();

        if (!post) {
          throw new UserInputError('Post not found');
        }

        return {
          ...post,
          id: post._id.toString(),
          likedByCurrentUser: post.likedBy?.some((userId: mongoose.Types.ObjectId) =>
            userId.toString() === user._id.toString()
          ) || false,
          user: {
            id: (post.user as any)._id.toString(),
            firstName: (post.user as any).firstName,
            lastName: (post.user as any).lastName,
            name: `${(post.user as any).firstName} ${(post.user as any).lastName}`,
            avatar: generateAvatarUrl((post.user as any)._id.toString(), `${(post.user as any).firstName} ${(post.user as any).lastName}`)
          },
          comments: post.comments?.map((comment: any) => ({
            ...comment,
            user: {
              id: comment.user._id.toString(),
              firstName: comment.user.firstName,
              lastName: comment.user.lastName,
              name: `${comment.user.firstName} ${comment.user.lastName}`,
              avatar: generateAvatarUrl(comment.user._id.toString(), `${comment.user.firstName} ${comment.user.lastName}`)
            }
          })) || []
        };
      } catch (error) {
        throw new Error(`Failed to fetch post: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    getUserFeedPosts: async (
      _: any,
      { userId, limit = 20, offset = 0 }: { userId: string; limit?: number; offset?: number },
      { user, isAuthenticated }: Context
    ) => {
      if (!isAuthenticated || !user) {
        throw new AuthenticationError('You must be logged in to view user posts');
      }

      try {
        const posts = await FeedPostModel
          .find({ user: userId })
          .populate('user', 'firstName lastName email')
          .populate('comments.user', 'firstName lastName email')
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(offset)
          .lean();

        return posts.map((post: any) => ({
          ...post,
          id: post._id.toString(),
          likedByCurrentUser: post.likedBy?.some((likeUserId: mongoose.Types.ObjectId) =>
            likeUserId.toString() === user._id.toString()
          ) || false,
          user: {
            id: post.user._id.toString(),
            firstName: post.user.firstName,
            lastName: post.user.lastName,
            name: `${post.user.firstName} ${post.user.lastName}`,
            avatar: generateAvatarUrl(post.user._id.toString(), `${post.user.firstName} ${post.user.lastName}`)
          },
          comments: post.comments?.map((comment: any) => ({
            ...comment,
            user: {
              id: comment.user._id.toString(),
              firstName: comment.user.firstName,
              lastName: comment.user.lastName,
              name: `${comment.user.firstName} ${comment.user.lastName}`,
              avatar: generateAvatarUrl(comment.user._id.toString(), `${comment.user.firstName} ${comment.user.lastName}`)
            }
          })) || []
        }));
      } catch (error) {
        throw new Error(`Failed to fetch user posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  },

  Mutation: {
    createFeedPost: async (
      _: any,
      { input }: { input: FeedPostInput },
      { user, isAuthenticated }: Context
    ) => {
      if (!isAuthenticated || !user) {
        throw new AuthenticationError('You must be logged in to create a post');
      }

      try {
        // Validate input
        if (!input.content || input.content.trim().length === 0) {
          throw new UserInputError('Post content is required');
        }

        if (input.content.length > 1000) {
          throw new UserInputError('Post content cannot exceed 1000 characters');
        }

        const newPost = new FeedPostModel({
          user: user._id,
          content: input.content.trim(),
          image: input.image,
          activityType: input.activityType || 'general',
          activityValue: input.activityValue
        });

        const savedPost = await newPost.save();
        
        // Populate user data
        await savedPost.populate('user', 'firstName lastName email');

        return {
          ...savedPost.toObject(),
          id: savedPost._id.toString(),
          likedByCurrentUser: false,
          user: {
            id: (savedPost.user as any)._id.toString(),
            firstName: (savedPost.user as any).firstName,
            lastName: (savedPost.user as any).lastName,
            name: `${(savedPost.user as any).firstName} ${(savedPost.user as any).lastName}`,
            avatar: generateAvatarUrl((savedPost.user as any)._id.toString(), `${(savedPost.user as any).firstName} ${(savedPost.user as any).lastName}`)
          },
          comments: []
        };
      } catch (error) {
        if (error instanceof UserInputError) {
          throw error;
        }
        throw new Error(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    updateFeedPost: async (
      _: any,
      { id, input }: { id: string; input: UpdateFeedPostInput },
      { user, isAuthenticated }: Context
    ) => {
      if (!isAuthenticated || !user) {
        throw new AuthenticationError('You must be logged in to update a post');
      }

      try {
        const post = await FeedPostModel.findById(id);
        
        if (!post) {
          throw new UserInputError('Post not found');
        }

        // Check if user owns the post
        if (post.user.toString() !== user._id.toString()) {
          throw new ForbiddenError('You can only update your own posts');
        }

        // Validate input
        if (input.content !== undefined) {
          if (!input.content || input.content.trim().length === 0) {
            throw new UserInputError('Post content cannot be empty');
          }
          if (input.content.length > 1000) {
            throw new UserInputError('Post content cannot exceed 1000 characters');
          }
          post.content = input.content.trim();
        }

        if (input.image !== undefined) {
          post.image = input.image;
        }

        if (input.activityType !== undefined) {
          post.activityType = input.activityType;
        }

        if (input.activityValue !== undefined) {
          post.activityValue = input.activityValue;
        }

        const updatedPost = await post.save();
        await updatedPost.populate('user', 'firstName lastName email');
        await updatedPost.populate('comments.user', 'firstName lastName email');

        return {
          ...updatedPost.toObject(),
          id: updatedPost._id.toString(),
          likedByCurrentUser: updatedPost.likedBy?.some((userId: mongoose.Types.ObjectId) =>
            userId.toString() === user._id.toString()
          ) || false,
          user: {
            id: (updatedPost.user as any)._id.toString(),
            firstName: (updatedPost.user as any).firstName,
            lastName: (updatedPost.user as any).lastName,
            name: `${(updatedPost.user as any).firstName} ${(updatedPost.user as any).lastName}`,
            avatar: generateAvatarUrl((updatedPost.user as any)._id.toString(), `${(updatedPost.user as any).firstName} ${(updatedPost.user as any).lastName}`)
          },
          comments: updatedPost.comments?.map((comment: any) => ({
            ...comment,
            user: {
              id: comment.user._id.toString(),
              firstName: comment.user.firstName,
              lastName: comment.user.lastName,
              name: `${comment.user.firstName} ${comment.user.lastName}`,
              avatar: generateAvatarUrl(comment.user._id.toString(), `${comment.user.firstName} ${comment.user.lastName}`)
            }
          })) || []
        };
      } catch (error) {
        if (error instanceof UserInputError || error instanceof ForbiddenError) {
          throw error;
        }
        throw new Error(`Failed to update post: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    deleteFeedPost: async (
      _: any,
      { id }: { id: string },
      { user, isAuthenticated }: Context
    ) => {
      if (!isAuthenticated || !user) {
        throw new AuthenticationError('You must be logged in to delete a post');
      }

      try {
        const post = await FeedPostModel.findById(id);
        
        if (!post) {
          throw new UserInputError('Post not found');
        }

        // Check if user owns the post
        if (post.user.toString() !== user._id.toString()) {
          throw new ForbiddenError('You can only delete your own posts');
        }

        await FeedPostModel.findByIdAndDelete(id);
        return true;
      } catch (error) {
        if (error instanceof UserInputError || error instanceof ForbiddenError) {
          throw error;
        }
        throw new Error(`Failed to delete post: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    likeFeedPost: async (
      _: any,
      { id }: { id: string },
      { user, isAuthenticated }: Context
    ) => {
      if (!isAuthenticated || !user) {
        throw new AuthenticationError('You must be logged in to like a post');
      }

      try {
        const post = await FeedPostModel.findById(id);
        
        if (!post) {
          throw new UserInputError('Post not found');
        }

        const userObjectId = new mongoose.Types.ObjectId(user._id);
        const isLiked = post.likedBy.some((userId: mongoose.Types.ObjectId) => userId.equals(userObjectId));

        if (isLiked) {
          // Unlike the post
          post.likedBy = post.likedBy.filter((userId: mongoose.Types.ObjectId) => !userId.equals(userObjectId));
        } else {
          // Like the post
          post.likedBy.push(userObjectId);
        }

        post.likes = post.likedBy.length;
        await post.save();

        return {
          id: post._id.toString(),
          likes: post.likes
        };
      } catch (error) {
        if (error instanceof UserInputError) {
          throw error;
        }
        throw new Error(`Failed to like/unlike post: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    commentFeedPost: async (
      _: any,
      { id, comment }: { id: string; comment: string },
      { user, isAuthenticated }: Context
    ) => {
      if (!isAuthenticated || !user) {
        throw new AuthenticationError('You must be logged in to comment on a post');
      }

      try {
        // Validate comment
        if (!comment || comment.trim().length === 0) {
          throw new UserInputError('Comment cannot be empty');
        }

        if (comment.length > 500) {
          throw new UserInputError('Comment cannot exceed 500 characters');
        }

        const post = await FeedPostModel.findById(id);
        
        if (!post) {
          throw new UserInputError('Post not found');
        }

        // Add comment
        post.comments.push({
          user: new mongoose.Types.ObjectId(user._id),
          comment: comment.trim(),
          createdAt: new Date()
        });

        await post.save();
        await post.populate('comments.user', 'firstName lastName email');

        return {
          id: post._id.toString(),
          comments: post.comments.map((comment: any) => ({
            ...comment,
            user: {
              id: comment.user._id.toString(),
              firstName: comment.user.firstName,
              lastName: comment.user.lastName,
              name: `${comment.user.firstName} ${comment.user.lastName}`,
              avatar: generateAvatarUrl(comment.user._id.toString(), `${comment.user.firstName} ${comment.user.lastName}`)
            }
          }))
        };
      } catch (error) {
        if (error instanceof UserInputError) {
          throw error;
        }
        throw new Error(`Failed to add comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }
};
