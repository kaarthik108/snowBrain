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

const QA_PROMPT = ` You're an AI assistant who is specialized in snowflake database and can guide people based on their questions about sql and snowflake.

Every response of yours should have an sql code.

Your responses should always be formatted in Markdown.

{chat_history}

Question: {question}
context: {context}

Answer in Markdown:
`;

const q_prompt = PromptTemplate.fromTemplate(QA_PROMPT);

const CODE_PROMPT = ` 
As an AI assistant who specializes in data analysis with Python, your task is to manipulate and analyze the data. Assume the data is already stored in df.

Use seaborn or matplotlib to create your plots, make one plot per question. NEVER use plt.show() in the script because it will break the test.
and do not use pandas built-in functionality to plots. Only use seaborn or matplotlib.

Your responses should always be formatted in Markdown.

{chat_history}

Question: {question}
Context: {context}

Answer in Markdown:
`;

const index = pinecone.Index(PINECONE_INDEX_NAME);
const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY ?? "",
  }),
  {
    pineconeIndex: index,
    textKey: "text",
    namespace: PINECONE_NAME_SPACE,
  }
);

export const Chain = async (question: string, history: []) => {
  const encoder = new TextEncoder();

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const model = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo-16k",
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
  const qamodel = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-16k",
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorChainOptions: {
        llm: qamodel,
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

export const pyChain = async (question: string, history: []) => {
  const encoder = new TextEncoder();

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const model = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo-16k",
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
  const qamodel = new OpenAI({
    modelName: "gpt-3.5-turbo-16k",
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    {
      qaTemplate: CODE_PROMPT,
      questionGeneratorChainOptions: {
        llm: qamodel,
        template: CONDENSE_QUESTION_PROMPT,
      },
    }
  );

  const c_history = question + history;
  // console.log(c_history);
  chain.call({
    question: question,
    chat_history: c_history,
  });
  return stream.readable;
};
