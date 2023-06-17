import { LangChainStream, Message, StreamingTextResponse } from "ai";
import { CallbackManager } from "langchain/callbacks";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { BufferMemory } from "langchain/memory";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { pinecone } from "../utils/pinecone-client";

const PINECONE_INDEX_NAME = "test-index";

const QA_PROMPT = ` You're a senior SQL developer. You have to write sql code in snowflake database based on the following question. Give a one or two sentences about how did you arrive at that sql code. display the sql code in the SQL code format (do not assume anything if the column is not available, do not make up code). ALSO if you are asked to FIX the sql code, then look what was the error and try to fix that by searching the schema definition.
If you don't know the answer, just say "Hmm, I'm not sure. I am trained only to answer sql related queries. Please try again." Don't try to make up an answer.
ALWAYS answer in Markdown format

{chat_history}

Question: {question}
{context}
SQL: \n
Explanation: `;

const index = pinecone.Index(PINECONE_INDEX_NAME);
const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY ?? "",
  }),
  {
    pineconeIndex: index,
    textKey: "text",
    // namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
  }
);

export const vchain = async (question: string) => {
  // const encoder = new TextEncoder();

  // const stream = new TransformStream();
  // const writer = stream.writable.getWriter();

  const { stream, handlers } = LangChainStream();

  const model = new OpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    modelName: "gpt-3.5-turbo", //change this to gpt-4 if you have access
    openAIApiKey: process.env.OPENAI_API_KEY ?? "",
    streaming: true,
    callbackManager: CallbackManager.fromHandlers(handlers),
  });
  const memory = new BufferMemory({
    memoryKey: "chat_history",
    inputKey: "question",
    outputKey: "text",
  });
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      memory: memory,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
    }
  );

  chain.call({
    question: question,
    chat_history: [],
  });
  return new StreamingTextResponse(stream);
};
