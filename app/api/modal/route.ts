import uploadToCloudinary from '@/lib/uploadToCloudinary'
import { nanoid } from '@/lib/utils'
import { supabaseClient } from '@/utils/supabaseClient'
import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'

const MODAL_API =
  process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:8000/execute'
    : process.env.MODAL_API_ENDPOINT!

export const runtime = 'edge'

export async function POST(req: NextRequest): Promise<Response> {
  const { pythonCode, sqlCode, messages } = await req.json()
  const { getToken, userId } = auth()
  const supabaseAccessToken = await getToken({
    template: 'supabase'
  })
  const supabase = await supabaseClient(supabaseAccessToken as string)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const response = await fetch(MODAL_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MODAL_AUTH_TOKEN}`
    },
    body: JSON.stringify({ script: pythonCode, sql: sqlCode })
  })
  console.log('response ---- ', response.ok)
  if (!response.ok) {
    return NextResponse.json({ error: `Script Error ${response.status}` })
  }

  const imageData = await response.blob()

  const imageUrl = await uploadToCloudinary(imageData)

  if (!imageUrl) {
    return NextResponse.json({ error: 'Upload Error' }, { status: 500 })
  }

  const title = 'Modal cloudinary'
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
        content: imageUrl,
        role: 'assistant'
      }
    ]
  }

  await supabase
    .from('chats')
    .upsert({ id, user_id: userId, payload })
    .throwOnError()

  return NextResponse.json({ imageUrl }, { status: 200 })
}
