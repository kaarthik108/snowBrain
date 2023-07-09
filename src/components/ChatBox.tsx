import { Chat } from "chat";
import React, { useEffect, useRef } from "react";
import { ChatPlaceholder } from "./ChatPlaceholder";
import { Message } from "./Message";
import IconOpenAI from "./ui/IconOpenAI";

type Props = {
  chat: Chat | undefined;
  loading: boolean;
  status: string;
};

export const ChatBox = ({ chat, loading, status }: Props) => {
  const scrollArea = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollArea.current?.scrollTo(0, scrollArea.current?.scrollHeight);
  }, [loading, chat?.messages.length]);

  return (
    <section
      ref={scrollArea}
      className="flex-auto h-0 overflow-y-scroll w-full md:overflow-x-hidden"
    >
      <ChatPlaceholder />
      {chat &&
        chat.messages.map((item) => <Message key={item.id} item={item} />)}
      {loading && (
        <div className="md:max-w-2xl lg:max-w-4xl m-auto">
          <div
            className={`grid grid-cols-[auto_1fr] mx-auto  `}
          >
            <div
              className={`w-8 h-8 md:w-10 md:h-10 flex md:ml-0 rounded items-center justify-center `}
            >
              <IconOpenAI className="rounded-full" />
            </div>
            <div className="flex-1 markdown ml-2 mt-1 text-xs sm:text-sm max-w-3xl items-start justify-center dark:text-[#eaeaea] text-[#111] ">
              <div className="flex items-center justify-center gap-2 py-1 text-sm rounded-md max-w-fit ">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-ping" />
                <span>{status ? status : "Thinking"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
