import { ChatMessage } from "@/types/ChatMessage"; // Assume ChatMessage type is defined here

export const extractSqlFromMessages = (
  messages: ChatMessage[]
): string | null => {
  // Define SQL starting keywords
  const sqlKeywords = ["SELECT", "WITH", "UPDATE", "DELETE", "INSERT"];

  for (const message of messages) {
    if (message.author === "assistant") {
      // Split the content by newlines and trim each line
      const lines = message.content.split("\n").map((line) => line.trim());
      console.log(lines);
      // Find the start and end of the code block
      const codeStartIndex = lines.findIndex((line) => line.startsWith("```"));
      const codeEndIndex = lines.lastIndexOf("```");

      // If a code block is found
      if (codeStartIndex >= 0 && codeEndIndex > codeStartIndex) {
        // Extract the code block
        const codeBlock = lines
          .slice(codeStartIndex + 1, codeEndIndex)
          .join("\n");

        console.log(codeBlock);
        // If the code block starts with any SQL keyword, assume it's SQL
        if (
          sqlKeywords.some((keyword) => codeBlock.trim().startsWith(keyword))
        ) {
          return codeBlock;
        }
      }
    }
  }
  console.log(messages);
  // Return null if no SQL code was found
  return null;
};
