export type ChatMessage = {
  id: string;
  author: "user" | "assistant";
  content: string;
};
