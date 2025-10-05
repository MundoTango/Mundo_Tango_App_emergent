// Test feed query for user 7
const query = `
SELECT id, user_id, content, visibility, is_public, created_at
FROM posts
WHERE user_id = 7
ORDER BY created_at DESC
LIMIT 5;
`;

console.log('Running query for user 7 posts...');
console.log(query);
