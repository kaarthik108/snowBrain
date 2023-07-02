import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAI } from "langchain/llms/openai";
import { initPinecone } from "utils/pinecone-client";
import { CONDENSE_QUESTION_PROMPT, QA_PROMPT } from "utils/prompts";

export const runtime = "edge";

const Chain = async (question: string, history: []) => {
  const vectorStore = await initPinecone();
  const encoder = new TextEncoder();

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const model = new ChatOpenAI({
    temperature: 0.5,
    modelName: "gpt-3.5-turbo-16k",
    openAIApiKey: process.env.OPENAI_API_KEY,
    streaming: true,
    maxTokens: 1000,
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
    temperature: 0.1,
    maxTokens: 1000,
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

export async function POST(req: Request) {
  const { prompt, history } = await req.json();
  const stream = Chain(prompt, history);
  return new Response(await stream);
}
