import { gql } from 'apollo-server-express';
import { authTypeDefs } from './authTypeDefs';
import { recommendationTypeDefs } from './recommendationTypeDefs';
import { healthTipsTypeDefs } from './healthTipsTypeDefs';
import { didYouKnowTypeDefs } from './didYouKnowTypeDefs';
import { coursesTypeDefs } from './coursesTypeDefs';
import { socialFeedTypeDefs } from './socialFeedTypeDefs';

// Base schema with root Query and Mutation types
const baseTypeDefs = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

// Combine all type definitions
export const typeDefs = [
  baseTypeDefs,
  authTypeDefs,
  recommendationTypeDefs,
  healthTipsTypeDefs,
  didYouKnowTypeDefs,
  coursesTypeDefs,
  socialFeedTypeDefs
];
