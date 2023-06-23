import { ChatMessage } from "@/types/ChatMessage";

export const extractSQL = (messages: ChatMessage[]): string | null => {
  console.log(messages);
  for (const message of messages) {
    console.log(message);
    if (message.author === "assistant") {
      // Remove the API call and directly parse the message content
      const sqlCode = message.content;

      // Adjusting the regular expression to match the SQL code from the message content
      const sqlRegex = /```(?:sql)?\s*([\s\S]*?SELECT[\s\S]*?FROM[\s\S]*?)```/g;

      const match = sqlRegex.exec(sqlCode);
      console.log(match);
      if (match && match[1]) {
        // The actual SQL code is the first capture group
        console.log(match[1]);
        return match[1].trim();
      }
    }
  }

  // Return null if no SQL code was found
  return null;
};
