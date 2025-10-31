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
    // Verify authentication
    const token = getTokenFromHeader(event.headers);
    if (!token) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'No authorization token provided' }),
      };
    }

    const payload = verifyToken(token);
    if (!payload) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired token' }),
      };
    }

    const { db } = await connectToDatabase();
    const eventsCollection = db.collection('events');

    // GET - List all events
    if (event.httpMethod === 'GET') {
      const events = await eventsCollection.find({}).toArray();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(events.map(e => ({ ...e, _id: undefined }))),
      };
    }

    // POST - Create new event
    if (event.httpMethod === 'POST') {
      const eventData = JSON.parse(event.body);
      const newEvent = {
        id: uuidv4(),
        ...eventData,
        created_at: new Date().toISOString(),
      };
      await eventsCollection.insertOne(newEvent);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ...newEvent, _id: undefined }),
      };
    }

    // PUT - Update event
    if (event.httpMethod === 'PUT') {
      const pathParts = event.path.split('/');
      const eventId = pathParts[pathParts.length - 1];
      const eventData = JSON.parse(event.body);
      
      await eventsCollection.updateOne(
        { id: eventId },
        { $set: { ...eventData, created_at: eventData.created_at || new Date().toISOString() } }
      );
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(eventData),
      };
    }

    // DELETE - Remove event
    if (event.httpMethod === 'DELETE') {
      const pathParts = event.path.split('/');
      const eventId = pathParts[pathParts.length - 1];
      
      const result = await eventsCollection.deleteOne({ id: eventId });
      
      if (result.deletedCount === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Event not found' }),
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Event deleted successfully' }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Events error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
