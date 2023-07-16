import { nanoid, toMarkdownTable } from '@/lib/utils'
import { supabaseClient } from '@/utils/supabase'
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
    max: 100,
    min: 0
  }
)

export async function POST(request: NextRequest) {
  const { getToken, userId } = auth()
  const supabaseAccessToken = await getToken({ template: 'supabase' })
  const supabase = await supabaseClient(supabaseAccessToken as string)

  const requestBody = await request.json()
  const query = requestBody.query
  const messages = requestBody.messages

  let result
  try {
    const clientConnection = await connectionPool.acquire()
    result = await new Promise((resolve, reject) => {
      clientConnection.execute({
        sqlText: query,
        complete: async (err, stmt, rows) => {
          if (err) {
            reject(
              NextResponse.json({
                error:
                  'Failed to execute statement due to the following error: ' +
                  err.message
              })
            )
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
            try {
              await supabase
                .from('chats')
                .upsert({ id, user_id: userId, payload })
                .throwOnError()
              resolve(NextResponse.json(markdownTable))
            } catch (error: any) {
              reject(
                NextResponse.json({ error: "Couldn't save markdown chat" })
              )
            }
          }
        }
      })
    })
    connectionPool.release(clientConnection)
  } catch (error: any) {
    console.error(error.message)
    return NextResponse.json({ error: error.message })
  }
  return result
}
