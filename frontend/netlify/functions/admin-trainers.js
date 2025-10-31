const { connectToDatabase } = require('./utils/db');
const { verifyToken, getTokenFromHeader } = require('./utils/auth');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const token = getTokenFromHeader(event.headers);
    if (!token || !verifyToken(token)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const { db } = await connectToDatabase();
    const trainersCollection = db.collection('trainers');

    if (event.httpMethod === 'GET') {
      const trainers = await trainersCollection.find({}).toArray();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(trainers.map(t => ({ ...t, _id: undefined }))),
      };
    }

    if (event.httpMethod === 'POST') {
      const trainerData = JSON.parse(event.body);
      const newTrainer = {
        id: uuidv4(),
        ...trainerData,
        created_at: new Date().toISOString(),
      };
      await trainersCollection.insertOne(newTrainer);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ...newTrainer, _id: undefined }),
      };
    }

    if (event.httpMethod === 'PUT') {
      const pathParts = event.path.split('/');
      const trainerId = pathParts[pathParts.length - 1];
      const trainerData = JSON.parse(event.body);
      await trainersCollection.updateOne({ id: trainerId }, { $set: trainerData });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(trainerData),
      };
    }

    if (event.httpMethod === 'DELETE') {
      const pathParts = event.path.split('/');
      const trainerId = pathParts[pathParts.length - 1];
      const result = await trainersCollection.deleteOne({ id: trainerId });
      if (result.deletedCount === 0) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Trainer not found' }) };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Trainer deleted successfully' }),
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (error) {
    console.error('Trainers error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};