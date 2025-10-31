const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tcprodojo-secret-key-change-in-production';

function createToken(data) {
  return jwt.sign(data, JWT_SECRET, { expiresIn: '8h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function getTokenFromHeader(headers) {
  const authHeader = headers.authorization || headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

module.exports = { createToken, verifyToken, getTokenFromHeader };
