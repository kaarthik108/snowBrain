import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { initPinecone } from "utils/pinecone-client";
import { CODE_PROMPT, CONDENSE_QUESTION_PROMPT } from "utils/prompts";

export const runtime = "edge";

const pyChain = async (question: string, history: []) => {
  const vectorStore = await initPinecone();

  const encoder = new TextEncoder();

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const model = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-4-0613",
    maxTokens: 1500,
    openAIApiKey: process.env.OPENAI_API_KEY,
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

export async function POST(req: Request) {
  const { prompt, history } = await req.json();
  const stream = pyChain(prompt, history);
  return new Response(await stream);
}
