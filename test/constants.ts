import 'dotenv/config';

export const app = `http://localhost:${process.env.APP_PORT}/api`;
export const database = 'mongodb://localhost:27017/nest-test';
