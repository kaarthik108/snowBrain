import { ChatMessage } from "./ChatMessage";

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
}
