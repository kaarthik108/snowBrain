export interface ChatMessage {
  id: string;
  author: "user" | "assistant";
  content: string;
}
