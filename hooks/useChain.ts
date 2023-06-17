import { Chat } from "@/types/Chat";
import { ChatMessage } from "@/types/ChatMessage";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const useChain = (
  chatActiveId: string,
  chatList: Chat[],
  setChatList: (chatList: Chat[]) => void
) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAIResponse = async () => {
      const decoder = new TextDecoder("utf-8");
      let fullChat = [...chatList];
      let chatIndex = fullChat.findIndex((item) => item.id === chatActiveId);

      if (chatIndex > -1) {
        let chat = fullChat[chatIndex];
        let question = chat.messages[chat.messages.length - 1].content;

        const response = await fetch("/api/sql", {
          method: "POST",
          body: JSON.stringify({ prompt: question }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.body) {
          return alert("Something went wrong");
        }

        const reader = response.body.getReader();
        let messageObject: ChatMessage = {
          id: uuidv4(),
          author: "assistant",
          content: "",
        };

        // Add a new messageObject for the AI's response
        fullChat[chatIndex].messages = [
          ...fullChat[chatIndex].messages,
          messageObject,
        ];

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          const text = decoder.decode(value);
          messageObject.content += text;
          // Update the last message with updated message
          fullChat[chatIndex].messages[
            fullChat[chatIndex].messages.length - 1
          ] = messageObject;
          setChatList([...fullChat]);
        }
      }
      setIsLoading(false);
    };

    if (isLoading) {
      fetchAIResponse();
    }
  }, [isLoading, chatActiveId, chatList, setChatList]);

  const startLoading = () => setIsLoading(true);

  return { isLoading, startLoading };
};

export default useChain;
