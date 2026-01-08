const https = require('https');

const data = JSON.stringify({
  model: 'qwen-max',
  messages: [{
    role: 'user',
    content: 'Hello'
  }]
});

const options = {
  hostname: 'dashscope.aliyuncs.com',
  path: '/compatible-mode/v1/chat/completions',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk-cf5d7b1116364fc08d0885adab2cafda',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Testing DashScope API...');
console.log('Key: sk-cf5d7b1116364fc08d0885adab2cafda');
console.log('');

const req = https.request(options, (res) => {
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('');
    
    if (res.statusCode === 200) {
      console.log('✓ API Key is VALID!');
      console.log('');
      console.log('Response:', JSON.stringify(JSON.parse(body), null, 2));
    } else {
      console.log('✗ API Key is INVALID or API Error!');
      console.log('');
      console.log('Response:', body);
    }
  });
});

req.on('error', (e) => {
  console.error('✗ Network Error:', e.message);
});

req.write(data);
req.end();
