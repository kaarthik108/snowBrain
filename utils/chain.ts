import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
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

const QA_PROMPT = ` You're an AI assistant specializing in data analysis with Snowflake SQL. Based on the question provided, you must generate SQL code that is compatible with the Snowflake environment. Additionally, offer a brief explanation about how you arrived at the SQL code. If the required column isn't explicitly stated in the context, suggest an alternative using available columns, but do not assume the existence of any not mentioned. 

If a user seeks assistance with ANALYSIS or VISUALIZATION, your response should consist of both the appropriate DQL (Data Query Language) to gather the necessary data, and a corresponding Python script to generate matplotlib graphs.

Please follow these specific guidelines:

- Always assume that the data required for visualization is already stored in a DataFrame object named df. Do not reinitialize this DataFrame, i.e., avoid using df = ... in your script.

- Use the pandas, seaborn, or matplotlib libraries to generate your plots. Each question should be answered with a separate plot.

- Your Python script must be written in a way that it doesn't produce any errors when run.

- To prevent interrupting the testing process, please refrain from using plt.show() in your scripts as it may interfere with the system operations.



Your responses should always be formatted in Markdown.

{chat_history}

Question: {question}
context: {context}

Answer in Markdown:
`;

const CODE_PROMPT = ` 
As an AI assistant you are only allowed to write DQL(Data query language) for the data needed to run the below python code.

Your responses should always be formatted in Markdown.

{chat_history}

Question: {question}
Context: {context}

python answer :
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
    temperature: 0.02,
    modelName: "gpt-3.5-turbo-16k",
    openAIApiKey: process.env.OPENAI_API_KEY ?? "",
    streaming: true,
    maxTokens: 1500,
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
    temperature: 0,
    maxTokens: 1500,
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
    modelName: "gpt-4-0613",
    maxTokens: 1500,
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
    temperature: 0,
    maxTokens: 1500,
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
  chain.call({
    question: question,
    chat_history: c_history,
  });
  return stream.readable;
};
