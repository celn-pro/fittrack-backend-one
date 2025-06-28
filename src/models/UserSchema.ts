import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// User interface for MongoDB
export interface IUserDocument extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  
  // Physical stats
  height?: number; // cm
  weight?: number; // kg
  
  // Fitness profile
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitnessGoals?: string[];
  
  // Health information
  healthConditions?: string[];
  injuries?: string[];
  
  // Preferences
  dietaryPreferences?: 'none' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'mediterranean';
  dietaryRestrictions?: string[];
  preferredWorkoutTypes?: string[];
  
  // App settings
  isEmailVerified: boolean;
  isProfileComplete: boolean;
  notificationSettings: {
    workoutReminders: boolean;
    nutritionTips: boolean;
    progressUpdates: boolean;
    emailNotifications: boolean;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  getAge(): number;
  getBMI(): number | null;
  isProfileCompleteCheck(): boolean;
}

// User schema for MongoDB
const userSchema = new Schema<IUserDocument>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(value: Date) {
        return !value || value < new Date();
      },
      message: 'Date of birth must be in the past'
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  
  // Physical stats
  height: {
    type: Number,
    min: [50, 'Height must be at least 50 cm'],
    max: [300, 'Height cannot exceed 300 cm']
  },
  weight: {
    type: Number,
    min: [20, 'Weight must be at least 20 kg'],
    max: [500, 'Weight cannot exceed 500 kg']
  },
  
  // Fitness profile
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active']
  },
  fitnessGoals: [{
    type: String,
    trim: true
  }],
  
  // Health information
  healthConditions: [{
    type: String,
    trim: true
  }],
  injuries: [{
    type: String,
    trim: true
  }],
  
  // Preferences
  dietaryPreferences: {
    type: String,
    enum: ['none', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean'],
    default: 'none'
  },
  dietaryRestrictions: [{
    type: String,
    trim: true
  }],
  preferredWorkoutTypes: [{
    type: String,
    trim: true
  }],
  
  // App settings
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  notificationSettings: {
    workoutReminders: {
      type: Boolean,
      default: true
    },
    nutritionTips: {
      type: Boolean,
      default: true
    },
    progressUpdates: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    }
  },
  
  lastLoginAt: Date
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      return ret;
    }
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get age
userSchema.methods.getAge = function(): number {
  if (!this.dateOfBirth) return 0;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Method to calculate BMI
userSchema.methods.getBMI = function(): number | null {
  if (!this.height || !this.weight) return null;
  const heightInMeters = this.height / 100;
  return Math.round((this.weight / (heightInMeters * heightInMeters)) * 10) / 10;
};

// Method to check if profile is complete
userSchema.methods.isProfileCompleteCheck = function(): boolean {
  return !!(
    this.firstName &&
    this.lastName &&
    this.dateOfBirth &&
    this.gender &&
    this.height &&
    this.weight &&
    this.fitnessLevel &&
    this.activityLevel &&
    this.fitnessGoals?.length > 0
  );
};

// Update isProfileComplete before saving
userSchema.pre('save', function(next) {
  this.isProfileComplete = this.isProfileCompleteCheck();
  next();
});

export const UserModel = mongoose.model<IUserDocument>('User', userSchema);
