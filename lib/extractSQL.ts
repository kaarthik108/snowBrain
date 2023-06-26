import { ChatMessage } from "@/types/ChatMessage";

export const extractSQL = (messages: ChatMessage[]): string | null => {
  console.log(messages);
  for (const message of messages) {
    console.log(message);
    if (message.author === "assistant") {
      const sqlCode = message.content;

      const sqlRegex = /```(?:sql)?\s*([\s\S]*?SELECT[\s\S]*?FROM[\s\S]*?)```/g;

      const match = sqlRegex.exec(sqlCode);
      console.log(match);
      if (match && match[1]) {
        console.log(match[1]);
        return match[1].trim();
      }
    }
  }

  return null;
};
