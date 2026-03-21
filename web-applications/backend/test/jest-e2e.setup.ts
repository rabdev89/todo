process.env.DATABASE_URL ??=
  'mysql://root:password@localhost:3307/acn_todo_app';
process.env.JWT_SECRET ??= 'e2e_test_secret';
process.env.JWT_EXPIRES_IN_SECONDS ??= '3600';
