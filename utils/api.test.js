const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');

describe('API Tests', () => {
  let token;

  beforeAll(async () => {
    // Wait for mongoose connection
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
    });

    // Drop test collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name).catch(() => {});
    }
  });

  afterAll(async () => {
    await mongoose.connection.close(); // Ensure the database connection is closed
  });

  test('Register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        email: 'testuser@example.com',
        password: 'SecurePass123',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  test('Login user and generate token', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'testuser@example.com',
        password: 'SecurePass123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token; // Save token for subsequent tests
  });

  test('Create a subscription', async () => {
    const res = await request(app)
      .post('/api/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: '676a7b3c781a47341f08403a', // Replace with valid ObjectId
        serviceName: 'Netflix',
        startDate: '2024-12-25T00:00:00.000Z',
        endDate: '2024-12-31T00:00:00.000Z',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Subscription created successfully');
  });

  test('Fetch subscriptions', async () => {
    const res = await request(app)
      .get('/api/subscriptions')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
