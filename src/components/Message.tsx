"use client";

import { ChatMessage } from "@/types/ChatMessage";
import { useContext, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { TokenCountContext } from "./token";
import IconClipboard from "./ui/IconClipboard";
import IconOpenAI from "./ui/IconOpenAI";
import IconSnow from "./ui/IconSnow";

type Props = {
  item: ChatMessage;
};

const extractTextContent = (children: any): string => {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) {
    return children.map(extractTextContent).join('');
  }
  if (children && 'props' in children && children.props.children) {
    return extractTextContent(children.props.children);
  }
  return '';
};

export const Message = ({ item }: Props) => {
  const { setCurrentMessageToken } = useContext(TokenCountContext);
  const [_, forceUpdate] = useState(0);

  useEffect(() => {
    if (item.content) {
      const approxTokens = item.content.split(/[\s,.!?]+/).length;
      setCurrentMessageToken(approxTokens);
    }
  }, [item.content, setCurrentMessageToken]);

  const isImageMessage =
    item?.content?.startsWith &&
    item.content.startsWith("https://res.cloudinary.com/");
  const copyStatusRef = useRef<{ [key: string]: boolean }>({});

  return (
    <div className={`py-4 md:py-5 ${item.author === "user" ? "dark:bg-neutral-950/60 bg-neutral-100/50" : ""}`}>
      <div className="md:max-w-2xl lg:max-w-4xl m-auto">
        <div className={`grid grid-cols-[auto_1fr] mx-auto`}>
          <div
            className={`w-8 h-8 md:w-10 md:h-10 flex md:ml-0 rounded items-center justify-center ${item.author === "assistant" ? "" : ""}`}
          >
            {item.author === "user" && (
              <IconSnow className="rounded-full" width="28" height="28" />
            )}
            {item.author === "assistant" && <IconOpenAI className="rounded-full" />}
          </div>
          <div className="flex-1 markdown ml-2 mt-1 max-w-xs text-xs md:text-sm lg:text-md md:max-w-2xl lg:max-w-2xl xl:max-w-3xl items-start justify-center dark:text-[#eaeaea] text-[#111] ">
            <div className="md:w-[calc(100%-10px)] break-words w-full">
              <ReactMarkdown
                className="break-words markdown mt-1 space-y-1"
                components={{
                  code: ({ children, inline, className }) => {
                    const language = className?.split("-")[1];
                    const codeText = extractTextContent(children);

                    const id = language + codeText;
                    if (!copyStatusRef.current[id]) {
                      copyStatusRef.current[id] = false;
                    }

                    const handleCopy = () => {
                      navigator.clipboard.writeText(codeText);
                      copyStatusRef.current[id] = true;
                      setTimeout(() => (copyStatusRef.current[id] = false), 3000);
                      forceUpdate(i => i + 1);
                    };

                    if (inline)
                      return (
                        <span className="px-1 py-1 text-xs md:text-sm rounded-md dark:bg-neutral-800 bg-neutral-50">
                          {children}
                        </span>
                      );
                    return (
                      <div className="w-full my-4 md:my-6 overflow-hidden rounded-md dark:bg-neutral-950/60 bg-gray-800 text-white overflow:auto;">
                        <div className="bg-[#1e283880]  py-1 md:py-2 px-2 md:px-3 text-xs flex items-center justify-between">
                          <div>{language ?? "sql"}</div>
                          <button
                            className="flex items-center gap-1"
                            onClick={handleCopy}
                          >
                            <IconClipboard width={8} />
                            {copyStatusRef.current[id] ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <code
                          className={
                            (className ?? "hljs language-javascript ") +
                            " dark:bg-[#1e283880] text-[#eaeaea] block p-3 overflow-auto border-t border-t-gray-300/40"
                          }
                        >
                          {children}
                        </code>
                      </div>
                    );
                  },
                }}
                rehypePlugins={[rehypeHighlight]}
                remarkPlugins={[remarkGfm]}
              >
                {isImageMessage
                  ? `![matplot graph](${item.content})`
                  : item.content ?? ""}
              </ReactMarkdown>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
