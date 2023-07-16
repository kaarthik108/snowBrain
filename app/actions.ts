'use server'

import { revalidatePath } from 'next/cache'

import { type Chat } from '@/lib/types'
import { supabaseClient } from '@/utils/supabaseClient'
import { auth } from '@clerk/nextjs'

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }
  const { getToken } = auth()
  const supabaseAccessToken = await getToken({ template: 'supabase' })
  const supabase = await supabaseClient(supabaseAccessToken as string)

  try {
    const { data } = await supabase
      .from('chats')
      .select('payload')
      .order('payload->createdAt', { ascending: false })
      .throwOnError()
    return (data?.map(entry => entry.payload) as Chat[]) ?? []
  } catch (error) {
    return []
  }
}

export async function getChat(id: string) {
  const { getToken } = auth()
  const supabaseAccessToken = await getToken({ template: 'supabase' })
  const supabase = await supabaseClient(supabaseAccessToken as string)
  const { data } = await supabase
    .from('chats')
    .select('payload')
    .eq('id', id)
    .maybeSingle()
  return (data?.payload as Chat) ?? null
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const { getToken } = auth()
  const supabaseAccessToken = await getToken({ template: 'supabase' })
  const supabase = await supabaseClient(supabaseAccessToken as string)

  try {
    await supabase.from('chats').delete().eq('id', id).throwOnError()

    revalidatePath('/')
    return revalidatePath(path)
  } catch (error) {
    return {
      error: 'Unauthorized'
    }
  }
}

export async function clearChats() {
  const { userId, getToken } = auth()
  const supabaseAccessToken = await getToken({ template: 'supabase' })
  const supabase = await supabaseClient(supabaseAccessToken as string)

  try {
    await supabase.from('chats').delete().eq('user_id', userId).throwOnError()
    return revalidatePath('/')
  } catch (error) {
    console.log('clear chats error', error)
    return {
      error: 'Unauthorized'
    }
  }
}

export async function getSharedChat(id: string) {
  const { getToken } = auth()
  const supabaseAccessToken = await getToken({ template: 'supabase' })
  const supabase = await supabaseClient(supabaseAccessToken as string)
  const { data } = await supabase
    .from('chats')
    .select('payload')
    .eq('id', id)
    .not('payload->sharePath', 'is', null)
    .maybeSingle()
  return (data?.payload as Chat) ?? null
}

export async function shareChat(chat: Chat) {
  const { getToken } = auth()
  const supabaseAccessToken = await getToken({ template: 'supabase' })

  const supabase = await supabaseClient(supabaseAccessToken as string)

  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`
  }

  await supabase
    .from('chats')
    .update({ payload: payload as any })
    .eq('id', chat.id)
    .throwOnError()

  return payload
}
