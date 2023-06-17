// setup.ts
import { LangChainStream } from "ai";
import { CallbackManager } from "langchain/callbacks";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { BufferMemory } from "langchain/memory";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { pinecone } from "./utils/pinecone-client";

const PINECONE_INDEX_NAME = "test-index";

export const index = pinecone.Index(PINECONE_INDEX_NAME);
export const vectorStore = PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY ?? "",
  }),
  {
    pineconeIndex: index,
    textKey: "text",
    // namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
  }
);

const { stream, handlers } = LangChainStream();
const callbackManager = CallbackManager.fromHandlers(handlers);

export const model = new OpenAI({
  temperature: 0, // increase temepreature to get more creative answers
  modelName: "gpt-3.5-turbo", //change this to gpt-4 if you have access
  openAIApiKey: process.env.OPENAI_API_KEY ?? "",
  streaming: true,
  callbackManager: callbackManager,
});

export const memory = new BufferMemory({
  memoryKey: "chat_history",
  inputKey: "question",
  outputKey: "text",
});
