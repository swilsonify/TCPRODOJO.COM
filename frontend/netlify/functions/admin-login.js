const { connectToDatabase } = require('./utils/db');
const { createToken } = require('./utils/auth');
const bcrypt = require('bcryptjs');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Username and password required' }),
      };
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Find admin user
    const admin = await db.collection('admins').findOne({ username });

    if (!admin) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ detail: 'Incorrect username or password' }),
      };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, admin.password_hash);

    if (!isValid) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ detail: 'Incorrect username or password' }),
      };
    }

    // Create JWT token
    const token = createToken({ sub: username });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        access_token: token,
        token_type: 'bearer',
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
