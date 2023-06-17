// utils/chatHelpers.ts

// import { TextDecoder } from 'util'; // or wherever you're importing it from
import { Chat } from "@/types/Chat";
import { ChatMessage } from "@/types/ChatMessage";
import { v4 as uuidv4 } from "uuid";

// export const getAIResponse = async (
//   chatActiveId: string,
//   chatList: Chat[],
//   handleNewData: (newData: string) => void
// ): Promise<Chat[]> => {
//   const decoder = new TextDecoder("utf-8");
//   let fullChat = [...chatList];
//   let chatIndex = fullChat.findIndex((item) => item.id === chatActiveId);
//   let chatHistories: { [key: string]: string[] } = {};

//   if (chatIndex > -1) {
//     let chat = fullChat[chatIndex];
//     let history: string[] = [];
//     for (let i = 0; i < chat.messages.length - 1; i += 2) {
//       let question = chat.messages[i].body;
//       let answer = chat.messages[i + 1]?.body || "";
//       history.push(question, answer);
//     }
//     let question = chat.messages[chat.messages.length - 1].body;
//     chatHistories[chat.id] = history;

//     const response = await fetch("/api/sql", {
//       method: "POST",
//       body: JSON.stringify({
//         prompt: question,
//         history: chatHistories[chat.id],
//       }),
//       headers: { "Content-Type": "application/json" },
//     });

//     if (!response.body) throw new Error("Something went wrong");

//     const reader = response.body.getReader();
//     let messageObject: ChatMessage = { id: uuidv4(), author: "ai", body: "" };
//     fullChat[chatIndex].messages = [
//       ...fullChat[chatIndex].messages,
//       messageObject,
//     ];

//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) break;
//       const text = decoder.decode(value);
//       messageObject.body += text;
//       handleNewData(text); // Call the handleNewData function with the new data
//     }
//   }
//   return fullChat;
// };
