const FormData = require('form-data');
const fetch = require('node-fetch');

const testPostWithFormData = async () => {
  const formData = new FormData();
  formData.append('content', 'Debug test post with FormData');
  formData.append('visibility', 'public');
  
  const response = await fetch('http://localhost:5000/api/posts', {
    method: 'POST',
    body: formData
  });
  
  console.log('Response status:', response.status);
  const data = await response.json();
  console.log('Response data:', JSON.stringify(data, null, 2));
};

testPostWithFormData().catch(console.error);
