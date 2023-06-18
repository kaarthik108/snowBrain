import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { pinecone } from "../utils/pinecone-client";

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? "";
const PINECONE_NAME_SPACE = process.env.PINECONE_NAME_SPACE ?? "";

const CONDENSE_QUESTION_PROMPT = `Given the following chat history and a follow up question, rephrase the follow up input question to be a standalone question.
Or end the conversation if it seems like it's done.
Chat History:\"""
{chat_history}
\"""
Follow Up Input: \"""
{question}
\"""
Standalone question:`;

const prompt = PromptTemplate.fromTemplate(CONDENSE_QUESTION_PROMPT);

const QA_PROMPT = ` You're an AI assistant who can guide people based on their questions about sql
{chat_history}

Question: {question}
{context}

Answer:
 `;

const q_prompt = PromptTemplate.fromTemplate(QA_PROMPT);

const index = pinecone.Index(PINECONE_INDEX_NAME);
const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY ?? "",
  }),
  {
    pineconeIndex: index,
    textKey: "text",
    namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
  }
);

export const Chain = async (question: string, history: []) => {
  const encoder = new TextEncoder();

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const model = new ChatOpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    modelName: "gpt-3.5-turbo", //change this to gpt-4 if you have access
    openAIApiKey: process.env.OPENAI_API_KEY ?? "",
    streaming: true,
    callbacks: [
      {
        async handleLLMNewToken(token) {
          await writer.ready;
          await writer.write(encoder.encode(`${token}`));
        },
        async handleLLMEnd() {
          await writer.ready;
          await writer.close();
        },
      },
    ],
  });
  const fasterModel = new OpenAI({
    modelName: "gpt-3.5-turbo",
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      // memory: memory,
      // returnSourceDocuments: true, //The number of source documents returned is 4 by default
      questionGeneratorChainOptions: {
        llm: fasterModel,
        template: CONDENSE_QUESTION_PROMPT,
      },
    }
  );

  const c_history = question + history;

  chain.call({
    question: question,
    chat_history: c_history,
  });
  return stream.readable;
};
