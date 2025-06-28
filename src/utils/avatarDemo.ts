// Demo script to show how avatar URLs are generated
// This demonstrates the avatar functionality without requiring database connection

// Helper function to generate avatar URL (same as in resolvers)
const generateAvatarUrl = (userId: string, name: string): string => {
  const encodedName = encodeURIComponent(name);
  // Using userId as seed for consistent avatar colors
  const seed = userId.slice(-6); // Use last 6 chars of userId for color consistency
  return `https://ui-avatars.com/api/?name=${encodedName}&background=${seed}&color=fff&size=128&rounded=true`;
};

// Demo function to show avatar generation
export const demoAvatarGeneration = () => {
  console.log('🎭 Social Feed Avatar Generation Demo\n');

  const users = [
    { id: '507f1f77bcf86cd799439011', name: 'John Doe' },
    { id: '507f1f77bcf86cd799439012', name: 'Jane Smith' },
    { id: '507f1f77bcf86cd799439013', name: 'Mike Johnson' },
    { id: '507f1f77bcf86cd799439014', name: 'Sarah Wilson' },
    { id: '507f1f77bcf86cd799439015', name: 'José García-López' },
    { id: '507f1f77bcf86cd799439016', name: 'Emma Thompson' }
  ];

  users.forEach((user, index) => {
    const avatarUrl = generateAvatarUrl(user.id, user.name);
    console.log(`${index + 1}. ${user.name}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Avatar URL: ${avatarUrl}`);
    console.log(`   Color Seed: ${user.id.slice(-6)}`);
    console.log('');
  });

  console.log('📝 Notes:');
  console.log('- Each user gets a unique avatar based on their name and user ID');
  console.log('- The same user will always get the same avatar (consistent)');
  console.log('- Avatar colors are based on the last 6 characters of user ID');
  console.log('- Names with special characters are properly URL encoded');
  console.log('- Avatars are 128x128 pixels, rounded, with white text');
  console.log('- Service used: ui-avatars.com (free, no API key required)');
  console.log('\n🔗 You can click any of the URLs above to see the generated avatar!');
};

// Run demo if this file is executed directly
if (require.main === module) {
  demoAvatarGeneration();
}

export { generateAvatarUrl };
