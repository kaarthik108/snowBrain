import { Chain } from "@/../utils/chain";

// export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt, history } = await req.json();
  const stream = Chain(prompt, history);
  return new Response(await stream);
}
