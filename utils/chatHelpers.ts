// utils/chatHelpers.ts

import { Chat } from "@/types/Chat";
import { Dispatch, SetStateAction } from "react";
import { v4 as uuidv4 } from "uuid";

export const handleSelectChat =
  (
    Loading: boolean,
    setChatActiveId: Dispatch<SetStateAction<string>>,
    closeSidebar: () => void
  ) =>
  (id: string) => {
    if (Loading) return;
    setChatActiveId(id);
    closeSidebar();
  };

export const prepareChatHistories = (chat: Chat) => {
  let history: string[] = [];
  for (let i = 0; i < chat.messages.length - 1; i += 2) {
    let question = chat.messages[i].content;
    let answer = chat.messages[i + 1]?.content || "";
    history.push(question, answer);
  }
  return history;
};

export const createNewChat = (message: string) => {
  return {
    id: uuidv4(),
    title: message,
    messages: [{ id: uuidv4(), author: "user" as "user", content: message }],
  };
};

export const appendUserMessage = (
  fullChat: Chat[],
  chatActiveId: string,
  message: string
) => {
  let chatIndex = fullChat.findIndex((item) => item.id === chatActiveId);
  fullChat[chatIndex].messages.push({
    id: uuidv4(),
    author: "user",
    content: message,
  });
  return fullChat;
};

export const deleteChat = (fullChat: Chat[], chatId: string) => {
  let chatIndex = fullChat.findIndex((item) => item.id === chatId);
  fullChat.splice(chatIndex, 1);
  return fullChat;
};

export const editChat = (
  fullChat: Chat[],
  chatId: string,
  newTitle: string
) => {
  let chatIndex = fullChat.findIndex((item) => item.id === chatId);
  fullChat[chatIndex].title = newTitle;
  return fullChat;
};
