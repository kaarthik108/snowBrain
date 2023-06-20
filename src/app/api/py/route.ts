import { pyChain } from "@/../utils/chain";

// export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt, history } = await req.json();
  console.log("prompt", prompt);
  console.log("history", history);
  const stream = pyChain(prompt, history);
  return new Response(await stream);
}
