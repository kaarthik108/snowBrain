export interface ChatMessage {
  id: string;
  author: "user" | "assistant";
  content: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
}

export interface Column {
  name: string;
  type: string;
  constraints: string;
}

export interface Table {
  name: string;
  description: string;
  columns: Column[];
}

export interface DatabaseSchemaProps {
  tables: Table[];
}
