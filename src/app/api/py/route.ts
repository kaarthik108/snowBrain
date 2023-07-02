import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { initPinecone } from "utils/pinecone-client";
import { CODE_PROMPT } from "utils/prompts";

export const runtime = "edge";

const pyChain = async (question: string, history: []) => {
  const vectorStore = await initPinecone();

  const encoder = new TextEncoder();

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const model = new ChatOpenAI({
    temperature: 0.6,
    modelName: "gpt-4",
    maxTokens: 1000,
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

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    {
      qaTemplate: CODE_PROMPT,
    }
  );

  chain.call({
    question: question,
    chat_history: "",
  });
  return stream.readable;
};

export async function POST(req: Request) {
  const { prompt, history } = await req.json();
  const stream = pyChain(prompt, history);
  return new Response(await stream);
}
