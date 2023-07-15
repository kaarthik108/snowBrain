import { extractSQL } from '@/lib/utils'
import { type Message } from 'ai'
import { nanoid } from 'nanoid'

const pythonCodeRegex = /```python([\s\S]*?)```/g
const sqlRegex = /```(?:sql)?\s*([\s\S]*?SELECT[\s\S]*?FROM[\s\S]*?)```/g
const id = nanoid()

const extractCode = (message: string, regex: RegExp) => {
  let codeMatch
  let code = ''
  while ((codeMatch = regex.exec(message)) !== null) {
    code = codeMatch[1].trim()
  }
  return code
}

const extractPythonCode = (message: string): string => {
  return extractCode(message, pythonCodeRegex)
}

const extractSqlCode = (message: string): string => {
  return extractCode(message, sqlRegex)
}

const fetchData = async (url: string, method: string, data: any) => {
  const response = await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) throw new Error('Response Error')

  return response
}

const snowsql = async (sqlCode: string, messages: Message[]) => {
  try {
    const response = await fetchData('/api/snow', 'POST', {
      query: sqlCode,
      messages: messages
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const markdownTable = await response.json()
    return markdownTable
  } catch (error) {
    console.log(error)
  }
}

const sendToFastAPI = async (
  pythonCode: string,
  initialSqlCode: string,
  messages: Message[]
) => {
  if (!pythonCode) {
    return
  }
  let sqlCode = initialSqlCode

  if (!sqlCode) {
    try {
      const response = await fetchData('/api/py', 'POST', {
        prompt: pythonCode
      })

      const res = await response.json()
      const text = res.text

      let sqlCodeResponse: Message[] = [
        { id: id, role: 'assistant', content: text }
      ]
      const sql = await extractSQL(sqlCodeResponse)
      console.log('sql----\n', sql)
      if (!sql) {
        return
      }
      sqlCode = sql
    } catch (error) {
      return
    }
  }

  try {
    const response = await fetchData('/api/modal', 'POST', {
      pythonCode: pythonCode,
      sqlCode: sqlCode,
      messages: messages
    })
    const data = await response.json()

    console.log(data.imageUrl)
    return data.imageUrl
  } catch (error) {
    console.log(error)
    return
  }
}

export async function snow(
  pythonCode: string,
  initialSqlCode: string,
  messages: Message[]
) {
  if (!pythonCode && initialSqlCode) {
    const markdownTable = await snowsql(initialSqlCode, messages)
    return markdownTable
  }
  const msg = await sendToFastAPI(pythonCode, initialSqlCode, messages)
  return msg
}

export {
  extractCode,
  extractPythonCode,
  extractSqlCode,
  fetchData,
  sendToFastAPI,
  snowsql
}
