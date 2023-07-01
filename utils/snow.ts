import snowflake from "snowflake-sdk";

export const snow = snowflake.createConnection({
  account: process.env.ACCOUNT as string,
  username: process.env.USER_NAME as string,
  password: process.env.PASSWORD,
  role: process.env.ROLE,
  warehouse: process.env.WAREHOUSE,
  database: process.env.DATABASE,
  schema: process.env.SCHEMA,
});
