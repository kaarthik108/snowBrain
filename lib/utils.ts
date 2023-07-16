import { Message } from 'ai'
import { clsx, type ClassValue } from 'clsx'
import { customAlphabet } from 'nanoid'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
) // 7-character random string

export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init)

  if (!res.ok) {
    const json = await res.json()
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number
      }
      error.status = res.status
      throw error
    } else {
      throw new Error('An unexpected error occurred')
    }
  }

  return res.json()
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

export function toMarkdownTable(data: any[]) {
  if (!data || data.length === 0) {
    return ''
  }

  const headers = Object.keys(data[0])
  const maxColumns = 5

  const tableHeaders = headers.slice(0, maxColumns).join(' | ')
  const tableDelimiters = headers.fill('---').slice(0, maxColumns).join(' | ')
  const tableRows = data
    .map(row => {
      const values = Object.values(row)
      if (values.length > maxColumns) {
        return [...values.slice(0, 2), '...', ...values.slice(-2)].join(' | ')
      }
      return values.join(' | ')
    })
    .join('\n')

  return `
${tableHeaders}
${tableDelimiters}
${tableRows}
`
}

export const extractSQL = (messages: Message[]): string | null => {
  for (const message of messages) {
    if (message.role === 'assistant') {
      const sqlCode = message.content

      const sqlRegex = /```(?:sql)?\s*([\s\S]*?SELECT[\s\S]*?FROM[\s\S]*?)```/g

      const match = sqlRegex.exec(sqlCode)
      if (match && match[1]) {
        return match[1].trim()
      }
    }
  }

  return null
}
