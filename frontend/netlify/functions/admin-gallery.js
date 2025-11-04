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
    const galleryCollection = db.collection('gallery');

    // GET - List all media items
    if (event.httpMethod === 'GET') {
      const items = await galleryCollection.find({}).sort({ displayOrder: 1 }).toArray();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(items.map(item => ({ ...item, _id: undefined }))),
      };
    }

    // POST - Create new media item
    if (event.httpMethod === 'POST') {
      const itemData = JSON.parse(event.body);
      const newItem = {
        id: uuidv4(),
        ...itemData,
        displayOrder: itemData.displayOrder || 0,
        created_at: new Date().toISOString(),
      };
      await galleryCollection.insertOne(newItem);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ...newItem, _id: undefined }),
      };
    }

    // PUT - Update media item
    if (event.httpMethod === 'PUT') {
      const pathParts = event.path.split('/');
      const itemId = pathParts[pathParts.length - 1];
      const itemData = JSON.parse(event.body);
      
      await galleryCollection.updateOne(
        { id: itemId },
        { $set: { ...itemData, updated_at: new Date().toISOString() } }
      );
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(itemData),
      };
    }

    // DELETE - Remove media item
    if (event.httpMethod === 'DELETE') {
      const pathParts = event.path.split('/');
      const itemId = pathParts[pathParts.length - 1];
      
      const result = await galleryCollection.deleteOne({ id: itemId });
      
      if (result.deletedCount === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Media item not found' }),
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Media item deleted successfully' }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Gallery error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
