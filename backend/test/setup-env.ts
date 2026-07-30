process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??=
  'postgresql://travelguide:travelguide@localhost:5432/travelguide_test';
process.env.API_PORT ??= '3001';
process.env.WEB_ORIGIN ??= 'http://localhost:3000';
