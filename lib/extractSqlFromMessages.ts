import { ChatMessage } from "@/types/ChatMessage"; // Assume ChatMessage type is defined here

export const extractSqlFromMessages = (
  messages: ChatMessage[]
): string | null => {
  for (const message of messages) {
    if (message.author === "assistant") {
      // Split the content by newlines and trim each line
      const lines = message.content.split("\n").map((line) => line.trim());

      // Find the start and end of the SQL block
      const sqlStartIndex = lines.findIndex((line) =>
        line.startsWith("```sql")
      );
      const sqlEndIndex = lines.lastIndexOf("```");

      // If a SQL block is found
      if (sqlStartIndex >= 0 && sqlEndIndex > sqlStartIndex) {
        // Extract the SQL query
        const sqlCode = lines.slice(sqlStartIndex + 1, sqlEndIndex).join(" ");
        return sqlCode;
      }
    }
  }

  // Return null if no SQL code was found
  return null;
};
