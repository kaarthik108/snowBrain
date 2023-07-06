import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { initPinecone } from "utils/pinecone-client";
import { CODE_PROMPT } from "utils/prompts";

export const runtime = "edge";

const prompt = PromptTemplate.fromTemplate(CODE_PROMPT);

const pyChain = async (question: string) => {
  const vectorStore = await initPinecone();

  const encoder = new TextEncoder();

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const model = new ChatOpenAI({
    temperature: 0.6,
    modelName: "gpt-4",
    maxTokens: 800,
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

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
    prompt: prompt,
  });

  chain.call({
    query: question,
  });
  return stream.readable;
};

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const stream = pyChain(prompt);
  return new Response(await stream);
}
