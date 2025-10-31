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
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const { db } = await connectToDatabase();
    const testimonialsCollection = db.collection('testimonials');

    if (event.httpMethod === 'GET') {
      const testimonials = await testimonialsCollection.find({}).toArray();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(testimonials.map(t => ({ ...t, _id: undefined }))),
      };
    }

    if (event.httpMethod === 'POST') {
      const testimonialData = JSON.parse(event.body);
      const newTestimonial = {
        id: uuidv4(),
        ...testimonialData,
        created_at: new Date().toISOString(),
      };
      await testimonialsCollection.insertOne(newTestimonial);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ...newTestimonial, _id: undefined }),
      };
    }

    if (event.httpMethod === 'PUT') {
      const pathParts = event.path.split('/');
      const testimonialId = pathParts[pathParts.length - 1];
      const testimonialData = JSON.parse(event.body);
      await testimonialsCollection.updateOne({ id: testimonialId }, { $set: testimonialData });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(testimonialData),
      };
    }

    if (event.httpMethod === 'DELETE') {
      const pathParts = event.path.split('/');
      const testimonialId = pathParts[pathParts.length - 1];
      const result = await testimonialsCollection.deleteOne({ id: testimonialId });
      if (result.deletedCount === 0) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Testimonial not found' }) };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Testimonial deleted successfully' }),
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (error) {
    console.error('Testimonials error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};