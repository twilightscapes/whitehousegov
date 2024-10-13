const { createReader } = require('@keystatic/core/reader');
const keystaticConfig = require('../../keystatic.config');

exports.handler = async function(event, context) {
  const reader = createReader(process.cwd(), keystaticConfig);
  const socialSettings = await reader.singletons.pirateSocial.read();

  if (!socialSettings.autoDeletePiratePosts) {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Auto-delete is disabled" }),
    };
  }

  const deleteTimeInMinutes = socialSettings.autoDeleteTime || 1440; // Default to 24 hours if not set
  const deleteTimeInMs = deleteTimeInMinutes * 60 * 1000;

  const posts = await reader.collections.piratePosts.all();
  const deleteThreshold = new Date(Date.now() - deleteTimeInMs);

  for (const post of posts) {
    const createdAt = new Date(post.entry.createdAt);
    if (createdAt < deleteThreshold) {
      await reader.collections.piratePosts.delete(post.slug);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Old posts deleted successfully" }),
  };
};