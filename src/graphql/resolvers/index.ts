import { authResolvers } from './authResolvers';
import { recommendationResolvers } from './recommendationResolvers';
import { healthTipsResolvers } from './healthTipsResolvers';
import { didYouKnowResolvers } from './didYouKnowResolvers';
import { coursesResolvers } from './coursesResolvers';
import { socialFeedResolvers } from './socialFeedResolvers';
import { mergeResolvers } from '@graphql-tools/merge';

// Combine all resolvers
export const resolvers = mergeResolvers([
  authResolvers,
  recommendationResolvers,
  healthTipsResolvers,
  didYouKnowResolvers,
  coursesResolvers,
  socialFeedResolvers
]);
