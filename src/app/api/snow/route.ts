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
    max: 100,
    min: 0,
  }
);

export async function POST(request: NextRequest) {
  const requestBody = await request.json();
  const query = requestBody.query;

  let result;
  try {
    const clientConnection = await connectionPool.acquire();
    result = await new Promise((resolve, reject) => {
      clientConnection.execute({
        sqlText: query,
        complete: (err, stmt, rows) => {
          if (err) {
            reject(
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
    connectionPool.release(clientConnection);
  } catch (error) {
    return NextResponse.json({ error: error });
  }
  return result;
}
