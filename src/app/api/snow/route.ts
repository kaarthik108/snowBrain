import { NextRequest, NextResponse } from "next/server";
import snowflake from "snowflake-sdk";

// export const runtime = "edge";

export async function POST(request: NextRequest) {
  const requestBody = await request.json();
  const query = requestBody.query;

  const connection = snowflake.createConnection({
    account: process.env.ACCOUNT as string,
    username: process.env.USER_NAME as string,
    password: process.env.PASSWORD,
    role: process.env.ROLE,
    warehouse: process.env.WAREHOUSE,
    database: process.env.DATABASE,
    schema: process.env.SCHEMA,
  });

  return new Promise((resolve, reject) => {
    connection.connect((err, conn) => {
      if (err) {
        reject(
          NextResponse.json({ error: "Unable to connect: " + err.message })
        );
      } else {
        conn.execute({
          sqlText: query,
          complete: (err, stmt, rows) => {
            // Close the connection after executing the query
            conn.destroy(function (err, conn) {
              if (err) {
                console.error("Unable to disconnect: " + err.message);
              } else {
                console.log(
                  "Disconnected connection with id: " + connection.getId()
                );
              }
            });

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
      }
    });
  });
}
