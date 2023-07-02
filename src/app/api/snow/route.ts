import { NextRequest, NextResponse } from "next/server";
import snowflake from "snowflake-sdk";

const connectionPool = snowflake.createPool(
  {
    account: process.env.ACCOUNT as string,
    username: process.env.USER_NAME as string,
    password: process.env.PASSWORD,
    role: process.env.ROLE,
    warehouse: process.env.WAREHOUSE,
    database: process.env.DATABASE,
    schema: process.env.SCHEMA,
  },
  {
    max: 10,
    min: 0,
  }
);

export async function POST(request: NextRequest) {
  const requestBody = await request.json();
  const query = requestBody.query;

  return new Promise((resolve) => {
    connectionPool.use(async (clientConnection) => {
      const statement = await clientConnection.execute({
        sqlText: query,
        complete: (err, stmt, rows) => {
          if (err) {
            resolve(
              NextResponse.json({
                error:
                  "Failed to execute statement due to the following error: " +
                  err.message,
              })
            );
          } else {
            resolve(NextResponse.json(rows));
          }
        },
      });
    });
  });
}
