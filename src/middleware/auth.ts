import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { IUserDocument } from '../models/UserSchema';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
      token?: string;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: IUserDocument;
  token: string;
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Extract token from request headers
   */
  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // Also check for token in query params (for GraphQL subscriptions)
    if (req.query.token && typeof req.query.token === 'string') {
      return req.query.token;
    }
    
    return null;
  }

  /**
   * Middleware to authenticate user (required)
   */
  public authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        res.status(401).json({
          error: 'Access denied. No token provided.',
          code: 'NO_TOKEN'
        });
        return;
      }

      // Verify token
      const decoded = this.authService.verifyToken(token);
      
      // Get user from database
      const user = await this.authService.getUserById(decoded.userId);
      if (!user) {
        res.status(401).json({
          error: 'Access denied. User not found.',
          code: 'USER_NOT_FOUND'
        });
        return;
      }

      // Attach user and token to request
      req.user = user;
      req.token = token;
      
      next();
    } catch (error) {
      res.status(401).json({
        error: 'Access denied. Invalid token.',
        code: 'INVALID_TOKEN',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Middleware to optionally authenticate user (not required)
   */
  public optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);
      
      if (token) {
        try {
          // Verify token
          const decoded = this.authService.verifyToken(token);
          
          // Get user from database
          const user = await this.authService.getUserById(decoded.userId);
          if (user) {
            req.user = user;
            req.token = token;
          }
        } catch (error) {
          // Token is invalid, but we continue without user
          console.warn('Invalid token in optional auth:', error);
        }
      }
      
      next();
    } catch (error) {
      // In optional auth, we don't fail the request
      next();
    }
  };

  /**
   * Middleware to check if user profile is complete
   */
  public requireCompleteProfile = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    if (!req.user.isProfileComplete) {
      res.status(403).json({
        error: 'Complete profile required to access this resource',
        code: 'INCOMPLETE_PROFILE'
      });
      return;
    }

    next();
  };

  /**
   * Middleware to check if email is verified
   */
  public requireVerifiedEmail = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    if (!req.user.isEmailVerified) {
      res.status(403).json({
        error: 'Email verification required to access this resource',
        code: 'EMAIL_NOT_VERIFIED'
      });
      return;
    }

    next();
  };

  /**
   * GraphQL context function for authentication
   */
  public getGraphQLContext = async (req: Request): Promise<{
    user?: IUserDocument;
    token?: string;
    isAuthenticated: boolean;
  }> => {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        return { isAuthenticated: false };
      }

      // Verify token
      const decoded = this.authService.verifyToken(token);
      
      // Get user from database
      const user = await this.authService.getUserById(decoded.userId);
      if (!user) {
        return { isAuthenticated: false };
      }

      return {
        user,
        token,
        isAuthenticated: true
      };
    } catch (error) {
      return { isAuthenticated: false };
    }
  };
}

// Export singleton instance
export const authMiddleware = new AuthMiddleware();
