import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

export interface ChatGPTFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: {
      [key: string]: {
        type: string;
        description: string;
        enum?: string[];
      };
    };
    required: string[];
  };
}

const functions: ChatGPTFunction[] = [
  {
    name: "get_sql",
    description: "To extract SQL code from a message",
    parameters: {
      type: "object",
      properties: {
        sql: {
          type: "string",
          description:
            "The SQL code needed to run the python code. The SQL code should be wrapped in a code block. ```sql ... ```",
        },
      },
      required: ["sql"],
    },
  },
];

export async function POST(request: Request) {
  const body = await request.json();
  console.log(body);
  const { messages } = body;
  console.log(messages);
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  try {
    console.log("Creating chat completion...");
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "system",
          content:
            "Given a python code, you are supposed to write a sql code so users can make a dataframe (df). The SQL code should be wrapped in a code block. ```sql ... ```",
        },
        ...messages,
      ],
      functions,
      temperature: 0,
      max_tokens: 1000,
      /* function_call: "auto" */
    });
    console.log(completion);
    return NextResponse.json(completion.data.choices[0].message);
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
      return NextResponse.json({
        message: error.response.data?.error?.message ?? "Unknown error",
      });
    } else {
      console.log(error);
      return NextResponse.json({
        message: error.error?.message ?? "Unknown error",
      });
    }
  }
}
