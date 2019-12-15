import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/modules/app/app.module';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { RegisterDto } from 'src/modules/auth/dto';
import mongoose from 'mongoose';
import { app, database } from './constants';

describe('AppController (e2e)', () => {
  // let app: INestApplication;
  const user: RegisterDto = {
    username: 'username',
    email: 'user999@user.com',
    password: 'password',
    password_confirmation: 'password',
  };

  const user2: RegisterDto = {
    username: 'username',
    email: 'user999@user.com',
    password: 'password',
    password_confirmation: 'password',
  };

  const user3: RegisterDto = {
    username: 'usurname',
    email: 'user999@user.com',
    password: 'password',
    password_confirmation: 'password',
  };

  beforeAll(async () => {
    await mongoose.connect(database, {useNewUrlParser: true, useUnifiedTopology: true});
    await mongoose.connection.db.dropDatabase();
  });

  afterAll(async done => {
    // await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect(done);
    // await app.close();
  });

  // beforeEach(async () => {
  //   const moduleFixture: TestingModule = await Test.createTestingModule({
  //     imports: [AppModule],
  //   }).compile();

  //   app = moduleFixture.createNestApplication();
  //   await app.init();
  // });

  it('/ (GET)', () => {
    return request(app)
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('should register user', () => {
    return request(app)
      .post('/auth/signup')
      .send(user)
      .expect(({ body }) => {
        expect(body.message).toEqual('REGISTRATION_SUCCESS');
      })
      .expect(HttpStatus.CREATED);
  });

  it('should not register user with the same name', () => {
    return request(app)
      .post('/auth/signup')
      .send(user2)
      .expect(({ body }) => {
        expect(body.message).toEqual('VALIDATION_FAILED');
      })
      .expect(HttpStatus.NOT_ACCEPTABLE);
  });

  it('should not register user with the same email', () => {
    return request(app)
      .post('/auth/signup')
      .send(user3)
      .expect(({ body }) => {
        expect(body.message).toEqual('VALIDATION_FAILED');
      })
      .expect(HttpStatus.NOT_ACCEPTABLE);
  });

});
