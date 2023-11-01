import { nanoid, toMarkdownTable } from '@/lib/utils'
import { supabaseClient } from '@/utils/supabaseClient'
import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import snowflake from 'snowflake-sdk'

const connectionPool = snowflake.createPool(
  {
    account: process.env.ACCOUNT as string,
    username: process.env.USER_NAME as string,
    password: process.env.PASSWORD,
    role: process.env.ROLE,
    warehouse: process.env.WAREHOUSE,
    database: process.env.DATABASE,
    schema: process.env.SCHEMA
  },
  {
    max: 10,
    min: 0
  }
)

export async function POST(request: NextRequest): Promise<NextResponse> {  // specify the return type
  const { getToken, userId } = auth()
  const supabaseAccessToken = await getToken({
    template: 'supabase'
  })
  const supabase = await supabaseClient(supabaseAccessToken as string)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const requestBody = await request.json()
  const query = requestBody.query
  const messages = requestBody.messages

  let result
  try {
    const clientConnection = await connectionPool.acquire();
    const result: NextResponse = await new Promise((resolve, reject) => {  // specify the type of result
      clientConnection.execute({
        sqlText: query,
        complete: async (err, stmt, rows) => {
          if (err) {
            reject(
              NextResponse.json({
                error: 'Failed to execute statement in Snowflake.',
              })
            );
          } else {
            const markdownTable = toMarkdownTable(rows as any[])
            const title = 'snowflake-results'
            const id = messages[0].id ?? nanoid()
            const createdAt = Date.now()
            const path = `/chat/${id}`
            const payload = {
              id,
              title,
              userId,
              createdAt,
              path,
              messages: [
                ...messages,
                {
                  content: markdownTable,
                  role: 'assistant'
                }
              ]
            }
            await supabase
              .from('chats')
              .upsert({ id, user_id: userId, payload })
              .throwOnError()
            resolve(NextResponse.json(markdownTable))
          }
        }
      })
    })
    connectionPool.release(clientConnection)
    return result;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}