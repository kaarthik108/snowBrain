import { Chat, ChatMessage } from "chat";
import { v4 as uuidv4 } from "uuid";

const pythonCodeRegex = /```python([\s\S]*?)```/g;
const sqlRegex = /```(?:sql)?\s*([\s\S]*?SELECT[\s\S]*?FROM[\s\S]*?)```/g;

const extractCode = (message: string, regex: RegExp) => {
  let codeMatch;
  let code = "";
  while ((codeMatch = regex.exec(message)) !== null) {
    code = codeMatch[1].trim();
  }
  return code;
};

const extractPythonCode = (message: string): string => {
  return extractCode(message, pythonCodeRegex);
};

const extractSqlCode = (message: string): string => {
  return extractCode(message, sqlRegex);
};

const fetchData = async (url: string, method: string, data: any) => {
  const response = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Response Error");

  return response;
};

const readResponseBody = async (response: Response): Promise<string> => {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder("utf-8");
  let responseBody = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    responseBody += decoder.decode(value);
  }

  return responseBody;
};

const setErrorMessage = (
  chatList: Chat[],
  activeChatId: string,
  setChatList: (value: Chat[]) => void
) => {
  let chatIndex = chatList.findIndex((item) => item.id === activeChatId);
  if (chatIndex > -1) {
    let errorMessage: ChatMessage = {
      id: uuidv4(),
      author: "assistant",
      content: "An error occurred",
    };
    chatList[chatIndex].messages.push(errorMessage);
    setChatList([...chatList]);
  }
};

export {
  extractCode,
  extractPythonCode,
  extractSqlCode,
  fetchData,
  readResponseBody,
  setErrorMessage,
};
