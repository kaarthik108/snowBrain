"use client";

import { useAuth } from "@clerk/nextjs";
import { useToast } from "lib/useToast";
import React, { useEffect, useRef, useState } from "react";
import IconSend from "./ui/IconSend";
import { Textarea } from "./ui/textarea";

type Props = {
  disabled: boolean;
  onSend: (message: string) => void;
};

export const MessageInput = ({ disabled, onSend }: Props) => {
  const [text, setText] = useState("");
  const textEl = useRef<HTMLTextAreaElement>(null);
  const { userId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (textEl.current) {
      textEl.current.style.height = "0px";
      let scrollHeight = textEl.current.scrollHeight;
      textEl.current.style.height = scrollHeight + "px";
    }
  }, [text, textEl]);

  const handleSendMessage = () => {
    if (userId) {
      if (!disabled && text.trim() !== "") {
        onSend(text);
        setText("");
      }
    } else {
      toast({
        title: "Ghost Alert!",
        description: "You need to be signed in to send messages",
        variant: "default",
        className: "bg-[#e2e8f0] text-black",

      })
    }
  };


  const handleTextKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.code.toLowerCase() === "enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={`flex items-center w-full py-2 bg-white rounded-lg shadow-sm border-1
             focus-within:ring-neutral-300 dark:focus-within:ring-neutral-500 focus-within:ring-1 dark:bg-neutral-800
            ${disabled && "opacity-50"}`}
    >
      <Textarea
        ref={textEl}
        className="h-auto peer"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyUp={handleTextKeyUp}
        disabled={disabled}
      ></Textarea>

      <div
        onClick={handleSendMessage}
        className={`self-end p-2 mr-2 cursor-pointer rounded ${text.length ? "opacity-100 " : "opacity-20"
          }`}
      >
        <IconSend width={18} height={18} />
      </div>
    </div>
  );
};
