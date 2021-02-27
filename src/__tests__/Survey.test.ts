import request from 'supertest';
import {getConnection} from 'typeorm';
import {app} from '../app'
import createConnection from '../database'

describe('Surveys', () => {
  beforeAll(async () => {
    const connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    const connection = getConnection();
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new survey', async () => {
    const response = await request(app).post('/surveys').send({
      title: "title example",
      description: "description example"
    });

    expect(response.status).toBe(201);
  });

  it('should be able to get all surveys', async () => {
    await request(app).post('/surveys').send({
      title: "title example 2",
      description: "description example 2"
    });

    const response = await request(app).get('/surveys');

    expect (response.body.length).toBe(2);
  });
});

