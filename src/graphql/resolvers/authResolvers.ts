import { AuthService, RegisterInput, LoginInput } from '../../services/AuthService';
import { IUserDocument } from '../../models/UserSchema';
import { AuthenticationError, UserInputError } from 'apollo-server-express';

// Initialize auth service
const authService = new AuthService();

interface Context {
  user?: IUserDocument;
  token?: string;
  isAuthenticated: boolean;
}

export const authResolvers = {
  Query: {
    me: async (_: any, __: any, { user, isAuthenticated }: Context) => {
      if (!isAuthenticated || !user) {
        throw new AuthenticationError('You must be logged in to view your profile');
      }

      return {
        ...user.toJSON(),
        age: user.getAge(),
        bmi: user.getBMI()
      };
    },

    userStats: async (_: any, __: any, { user, isAuthenticated }: Context) => {
      if (!isAuthenticated || !user) {
        throw new AuthenticationError('You must be logged in to view user statistics');
      }

      // In a real app, you might want to restrict this to admin users
      // For now, any authenticated user can see basic stats
      try {
        return await authService.getUserStats();
      } catch (error) {
        throw new Error(`Failed to get user statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  },

  Mutation: {
    register: async (_: any, { input }: { input: RegisterInput }) => {
      try {
        // Validate input
        if (!input.email || !input.password || !input.firstName || !input.lastName) {
          throw new UserInputError('Email, password, first name, and last name are required');
        }

        if (input.password.length < 6) {
          throw new UserInputError('Password must be at least 6 characters long');
        }

        // Email validation
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(input.email)) {
          throw new UserInputError('Please enter a valid email address');
        }

        const result = await authService.register(input);
        
        return {
          user: {
            ...result.user,
            age: result.user.dateOfBirth ? new Date().getFullYear() - new Date(result.user.dateOfBirth).getFullYear() : null,
            bmi: result.user.height && result.user.weight ? 
              Math.round((result.user.weight / Math.pow(result.user.height / 100, 2)) * 10) / 10 : null
          },
          token: result.token
        };
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('already exists')) {
            throw new UserInputError(error.message);
          }
          throw new Error(error.message);
        }
        throw new Error('Registration failed');
      }
    },

    login: async (_: any, { input }: { input: LoginInput }) => {
      try {
        if (!input.email || !input.password) {
          throw new UserInputError('Email and password are required');
        }

        const result = await authService.login(input);
        
        return {
          user: {
            ...result.user,
            age: result.user.dateOfBirth ? new Date().getFullYear() - new Date(result.user.dateOfBirth).getFullYear() : null,
            bmi: result.user.height && result.user.weight ? 
              Math.round((result.user.weight / Math.pow(result.user.height / 100, 2)) * 10) / 10 : null
          },
          token: result.token
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new AuthenticationError(error.message);
        }
        throw new AuthenticationError('Login failed');
      }
    },
    

    updateProfile: async (_: any, { input }: { input: any }, { user, isAuthenticated }: Context) => {
      if (!isAuthenticated || !user) {
        throw new AuthenticationError('You must be logged in to update your profile');
      }

      try {
        // Validate input
        if (input.height && (input.height < 50 || input.height > 300)) {
          throw new UserInputError('Height must be between 50 and 300 cm');
        }

        if (input.weight && (input.weight < 20 || input.weight > 500)) {
          throw new UserInputError('Weight must be between 20 and 500 kg');
        }

        if (input.dateOfBirth && new Date(input.dateOfBirth) >= new Date()) {
          throw new UserInputError('Date of birth must be in the past');
        }

        const updatedUser = await authService.updateProfile(user._id, input);
        if (!updatedUser) {
          throw new Error('Failed to update profile');
        }

        // Log profile completion status change
        const wasProfileComplete = user.isProfileComplete;
        const isNowProfileComplete = updatedUser.isProfileComplete;

        if (!wasProfileComplete && isNowProfileComplete) {
          console.log(`✅ Profile completed for user ${updatedUser.email}`);
        }

        return {
          ...updatedUser.toJSON(),
          age: updatedUser.getAge(),
          bmi: updatedUser.getBMI()
        };
      } catch (error) {
        if (error instanceof UserInputError || error instanceof Error) {
          throw error;
        }
        throw new Error('Failed to update profile');
      }
    },

    updateNotificationSettings: async (_: any, { input }: { input: any }, { user, isAuthenticated }: Context) => {
      if (!isAuthenticated || !user) {
        throw new AuthenticationError('You must be logged in to update notification settings');
      }

      try {
        const updatedUser = await authService.updateProfile(user._id, {
          notificationSettings: {
            ...user.notificationSettings,
            ...input
          }
        });

        if (!updatedUser) {
          throw new Error('Failed to update notification settings');
        }

        return {
          ...updatedUser.toJSON(),
          age: updatedUser.getAge(),
          bmi: updatedUser.getBMI()
        };
      } catch (error) {
        throw new Error('Failed to update notification settings');
      }
    },

    changePassword: async (_: any, { input }: { input: { currentPassword: string; newPassword: string } }, { user, isAuthenticated }: Context) => {
      if (!isAuthenticated || !user) {
        throw new AuthenticationError('You must be logged in to change your password');
      }

      try {
        if (!input.currentPassword || !input.newPassword) {
          throw new UserInputError('Current password and new password are required');
        }

        if (input.newPassword.length < 6) {
          throw new UserInputError('New password must be at least 6 characters long');
        }

        await authService.changePassword(user._id, input.currentPassword, input.newPassword);
        return true;
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('incorrect')) {
            throw new AuthenticationError(error.message);
          }
          throw new UserInputError(error.message);
        }
        throw new Error('Failed to change password');
      }
    },

    deleteAccount: async (_: any, __: any, { user, isAuthenticated }: Context) => {
      if (!isAuthenticated || !user) {
        throw new AuthenticationError('You must be logged in to delete your account');
      }

      try {
        await authService.deleteAccount(user._id);
        return true;
      } catch (error) {
        throw new Error('Failed to delete account');
      }
    }
  }
};
