import { Chain } from "@/../utils/chain";

// export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt, history } = await req.json();

  const stream = Chain(prompt, history);
  // console.log("streamapi--", stream);
  return new Response(await stream);
}

// import { Chain } from "../../../../utils/chain";

// export async function POST(req: Request) {
//   const { prompt } = await req.json();

//   const stream = Chain(prompt);
//   // console.log("streamapi--", stream);
//   return new Response(await stream);
// }
