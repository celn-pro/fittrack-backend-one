import mongoose, { Document, Schema } from 'mongoose';

// Comment interface for MongoDB
export interface IComment {
  user: mongoose.Types.ObjectId;
  comment: string;
  createdAt: Date;
}

// FeedPost interface for MongoDB
export interface IFeedPostDocument extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  content: string;
  image?: string;
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  comments: IComment[];
  activityType?: 'workout' | 'nutrition' | 'achievement' | 'general';
  activityValue?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Comment schema
const commentSchema = new Schema<IComment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// FeedPost schema
const feedPostSchema = new Schema<IFeedPostDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Post content cannot exceed 1000 characters']
  },
  image: {
    type: String,
    trim: true,
    validate: {
      validator: function(value: string) {
        if (!value) return true;
        // Basic URL validation
        const urlRegex = /^https?:\/\/.+/;
        return urlRegex.test(value);
      },
      message: 'Image must be a valid URL'
    }
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  likedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  activityType: {
    type: String,
    enum: ['workout', 'nutrition', 'achievement', 'general'],
    default: 'general'
  },
  activityValue: {
    type: String,
    trim: true,
    maxlength: [200, 'Activity value cannot exceed 200 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
feedPostSchema.index({ createdAt: -1 }); // For chronological sorting
feedPostSchema.index({ user: 1, createdAt: -1 }); // For user's posts
feedPostSchema.index({ activityType: 1, createdAt: -1 }); // For filtering by activity type

// Virtual for checking if current user liked the post
feedPostSchema.virtual('likedByCurrentUser').get(function() {
  // This will be set in the resolver based on current user
  return false;
});

// Pre-save middleware to update likes count
feedPostSchema.pre('save', function(next) {
  if (this.isModified('likedBy')) {
    this.likes = this.likedBy.length;
  }
  next();
});

// Instance methods
feedPostSchema.methods.addLike = function(userId: string) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  if (!this.likedBy.includes(userObjectId)) {
    this.likedBy.push(userObjectId);
    this.likes = this.likedBy.length;
  }
  return this.save();
};

feedPostSchema.methods.removeLike = function(userId: string) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  this.likedBy = this.likedBy.filter((id: mongoose.Types.ObjectId) => !id.equals(userObjectId));
  this.likes = this.likedBy.length;
  return this.save();
};

feedPostSchema.methods.addComment = function(userId: string, comment: string) {
  this.comments.push({
    user: new mongoose.Types.ObjectId(userId),
    comment,
    createdAt: new Date()
  });
  return this.save();
};

export const FeedPostModel = mongoose.model<IFeedPostDocument>('FeedPost', feedPostSchema);
