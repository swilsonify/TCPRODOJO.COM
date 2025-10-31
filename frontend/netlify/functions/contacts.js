const { connectToDatabase } = require('./utils/db');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { db } = await connectToDatabase();
    const contactsCollection = db.collection('contacts');

    if (event.httpMethod === 'GET') {
      const contacts = await contactsCollection.find({}).toArray();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(contacts.map(c => ({ ...c, _id: undefined }))),
      };
    }

    if (event.httpMethod === 'POST') {
      const contactData = JSON.parse(event.body);
      const newContact = {
        id: uuidv4(),
        ...contactData,
        created_at: new Date().toISOString(),
      };
      await contactsCollection.insertOne(newContact);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ...newContact, _id: undefined }),
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (error) {
    console.error('Contacts error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};