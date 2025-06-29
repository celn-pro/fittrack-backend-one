import jwt from 'jsonwebtoken';
import { UserModel, IUserDocument } from '../models/UserSchema';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Partial<IUserDocument>;
  token: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️  JWT_SECRET not set in environment variables. Using default secret.');
    }
  }

  /**
   * Generate JWT token for user
   */
  private generateToken(userId: string, email: string): string {
    const payload: JWTPayload = {
      userId,
      email
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn as string
    });
  }

  /**
   * Verify JWT token
   */
  public verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Register a new user
   */
  public async register(input: RegisterInput): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await UserModel.findOne({ email: input.email.toLowerCase() });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Validate password strength
      if (input.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Create new user
      const user = new UserModel({
        email: input.email.toLowerCase(),
        password: input.password,
        firstName: input.firstName,
        lastName: input.lastName,
        dateOfBirth: input.dateOfBirth,
        gender: input.gender
      });

      await user.save();

      // Generate token
      const token = this.generateToken(user._id.toString(), user.email);

      // Return user without password
      const userResponse = user.toJSON();

      return {
        user: userResponse,
        token
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Registration failed');
    }
  }

  /**
   * Login user
   */
  public async login(input: LoginInput): Promise<AuthResponse> {
    try {
      // Find user and include password for comparison
      const user = await UserModel.findOne({ email: input.email.toLowerCase() }).select('+password');
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(input.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      // Generate token
      const token = this.generateToken(user._id.toString(), user.email);

      // Return user without password
      const userResponse = user.toJSON();

      return {
        user: userResponse,
        token
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed');
    }
  }

  /**
   * Get user by ID
   */
  public async getUserById(userId: string): Promise<IUserDocument | null> {
    try {
      return await UserModel.findById(userId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Update user profile
   */
  public async updateProfile(userId: string, updates: Partial<IUserDocument>): Promise<IUserDocument | null> {
    try {
      // Remove sensitive fields that shouldn't be updated this way
      const { password, email, _id, ...safeUpdates } = updates as any;

      // Find the user first
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update the user fields
      Object.assign(user, safeUpdates);
      user.updatedAt = new Date();

      // Save the user (this will trigger pre('save') middleware to update isProfileComplete)
      await user.save();

      return user;
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Change user password
   */
  public async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = await UserModel.findById(userId).select('+password');
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password
      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to change password');
    }
  }

  /**
   * Delete user account
   */
  public async deleteAccount(userId: string): Promise<boolean> {
    try {
      const result = await UserModel.findByIdAndDelete(userId);
      return !!result;
    } catch (error) {
      throw new Error('Failed to delete account');
    }
  }

  /**
   * Get user statistics
   */
  public async getUserStats(): Promise<{
    totalUsers: number;
    verifiedUsers: number;
    completeProfiles: number;
    recentSignups: number;
  }> {
    try {
      const totalUsers = await UserModel.countDocuments();
      const verifiedUsers = await UserModel.countDocuments({ isEmailVerified: true });
      const completeProfiles = await UserModel.countDocuments({ isProfileComplete: true });
      
      // Users who signed up in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentSignups = await UserModel.countDocuments({ 
        createdAt: { $gte: sevenDaysAgo } 
      });

      return {
        totalUsers,
        verifiedUsers,
        completeProfiles,
        recentSignups
      };
    } catch (error) {
      throw new Error('Failed to get user statistics');
    }
  }
}
