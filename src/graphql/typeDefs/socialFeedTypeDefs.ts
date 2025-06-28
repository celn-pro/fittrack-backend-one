import { gql } from 'apollo-server-express';

export const socialFeedTypeDefs = gql`
  # Social Feed Types
  type FeedPost {
    id: ID!
    user: SocialFeedUser!
    content: String!
    image: String
    likes: Int!
    likedByCurrentUser: Boolean!
    comments: [Comment!]!
    activityType: ActivityType
    activityValue: String
    createdAt: String!
    updatedAt: String!
  }

  type Comment {
    user: SocialFeedUser!
    comment: String!
    createdAt: String!
  }

  # Simplified user type for social feed with avatar support
  type SocialFeedUser {
    id: ID!
    firstName: String!
    lastName: String!
    name: String!
    avatar: String
  }

  # Enums
  enum ActivityType {
    workout
    nutrition
    achievement
    general
  }

  # Input Types
  input FeedPostInput {
    content: String!
    image: String
    activityType: ActivityType
    activityValue: String
  }

  input UpdateFeedPostInput {
    content: String
    image: String
    activityType: ActivityType
    activityValue: String
  }

  # Extend Query type
  extend type Query {
    getSocialFeed(limit: Int = 20, offset: Int = 0): [FeedPost!]!
    getFeedPost(id: ID!): FeedPost
    getUserFeedPosts(userId: ID!, limit: Int = 20, offset: Int = 0): [FeedPost!]!
  }

  # Extend Mutation type
  extend type Mutation {
    createFeedPost(input: FeedPostInput!): FeedPost!
    updateFeedPost(id: ID!, input: UpdateFeedPostInput!): FeedPost!
    deleteFeedPost(id: ID!): Boolean!
    likeFeedPost(id: ID!): FeedPost!
    commentFeedPost(id: ID!, comment: String!): FeedPost!
  }
`;
