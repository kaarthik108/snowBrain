// stream.ts
import { LangChainStream } from "ai";
import { CallbackManager } from "langchain/callbacks";

export function getStreamAndHandlers() {
  const { stream, handlers } = LangChainStream();
  return { stream, CallbackManager: CallbackManager.fromHandlers(handlers) };
}
