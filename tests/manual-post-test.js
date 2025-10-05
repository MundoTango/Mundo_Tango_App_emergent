// Quick manual test for post creation
const testPost = async () => {
  const response = await fetch('http://localhost:5000/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'connect.sid=test'
    },
    body: JSON.stringify({
      content: 'Manual test post',
      visibility: 'public'
    })
  });
  
  console.log('Response status:', response.status);
  const data = await response.json();
  console.log('Response data:', JSON.stringify(data, null, 2));
};

testPost().catch(console.error);
