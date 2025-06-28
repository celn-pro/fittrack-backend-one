// ✅ CORRECTED FRONTEND QUERIES - Aligned with User Model Structure
// These queries now properly use firstName, lastName, and computed name fields

export const GET_SOCIAL_FEED = gql`
  query GetSocialFeed {
    getSocialFeed {
      id
      user {
        id
        firstName
        lastName
        name
        avatar
      }
      content
      createdAt
      image
      likes
      likedByCurrentUser
      comments {
        user {
          id
          firstName
          lastName
          name
          avatar
        }
        comment
        createdAt
      }
      activityType
      activityValue
    }
  }
`;

export const CREATE_FEED_POST = gql`
  mutation CreateFeedPost($input: FeedPostInput!) {
    createFeedPost(input: $input) {
      id
      user {
        id
        firstName
        lastName
        name
        avatar
      }
      content
      createdAt
      image
      likes
      likedByCurrentUser
      comments {
        user {
          id
          firstName
          lastName
          name
          avatar
        }
        comment
        createdAt
      }
      activityType
      activityValue
    }
  }
`;

export const UPDATE_FEED_POST = gql`
  mutation UpdateFeedPost($id: ID!, $input: UpdateFeedPostInput!) {
    updateFeedPost(id: $id, input: $input) {
      id
      content
      image
      activityType
      activityValue
      createdAt
      user { 
        id 
        firstName
        lastName
        name 
        avatar 
      }
      likes
      likedByCurrentUser
      comments {
        user { 
          id 
          firstName
          lastName
          name 
          avatar 
        }
        comment
        createdAt
      }
    }
  }
`;

export const DELETE_FEED_POST = gql`
  mutation DeleteFeedPost($id: ID!) {
    deleteFeedPost(id: $id)
  }
`;

export const LIKE_POST = gql`
  mutation LikeFeedPost($id: ID!) {
    likeFeedPost(id: $id) {
      id
      likes
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation CommentFeedPost($id: ID!, $comment: String!) {
    commentFeedPost(id: $id, comment: $comment) {
      id
      comments {
        user {
          id
          firstName
          lastName
          name
          avatar
        }
        comment
        createdAt
      }
    }
  }
`;

// 📝 ALTERNATIVE QUERIES - If you prefer to use only firstName in some places
// You can use these variations depending on your UI needs:

export const GET_SOCIAL_FEED_FIRSTNAME_ONLY = gql`
  query GetSocialFeed {
    getSocialFeed {
      id
      user {
        id
        firstName
        avatar
      }
      content
      createdAt
      image
      likes
      likedByCurrentUser
      comments {
        user {
          id
          firstName
          avatar
        }
        comment
        createdAt
      }
      activityType
      activityValue
    }
  }
`;

export const GET_SOCIAL_FEED_FULL_NAME_ONLY = gql`
  query GetSocialFeed {
    getSocialFeed {
      id
      user {
        id
        name
        avatar
      }
      content
      createdAt
      image
      likes
      likedByCurrentUser
      comments {
        user {
          id
          name
          avatar
        }
        comment
        createdAt
      }
      activityType
      activityValue
    }
  }
`;

// 🎯 RECOMMENDED USAGE:
// 1. Use firstName for compact displays (like comment headers)
// 2. Use name for full displays (like post headers)
// 3. Use both when you need flexibility in your UI components

// 💡 EXAMPLE USAGE IN REACT COMPONENTS:
/*
// For post headers - use full name
<Text>{post.user.name}</Text>

// For comment headers - use first name only
<Text>{comment.user.firstName}</Text>

// For profile links - use full name
<TouchableOpacity onPress={() => navigateToProfile(post.user.id)}>
  <Text>{post.user.name}</Text>
</TouchableOpacity>

// Avatar is always available
<Image source={{ uri: post.user.avatar }} />
*/
