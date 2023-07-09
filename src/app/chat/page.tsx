"use client";

import { useLocalStorage } from "@/../hooks/use-local-storage";
import {
  appendUserMessage,
  createNewChat,
  deleteChat,
  editChat,
} from "@/../utils/chatHelpers";
import { ChatBox } from "@/components/ChatBox";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SidebarChatFunc } from "@/components/SidebarChatFunc";
import { TokenCountContext } from "@/components/token";
import { Chat } from "@/types/Chat";
import { ChatMessage } from "@/types/ChatMessage";
import { extractSQL } from "lib/extractSQL";
import { toMarkdownTable } from "lib/mdTable";
import { useToast } from "lib/useToast";
import { useCallback, useContext, useEffect, useState } from "react";
import { extractPythonCode, extractSqlCode, fetchData, readResponseBody, setErrorMessage } from "utils/fetchHelpers";
import { defaultChat, initialChatId } from "utils/initialChat";
import { v4 as uuidv4 } from "uuid";

const Page = () => {
  const [sidebarOpened, setSidebarOpened] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [chatList, setChatList] = useLocalStorage<Chat[]>("chatList", [
    defaultChat,
  ]);
  const [activeChatId, setactiveChatId] = useState<string>(defaultChat.id);
  const [activeChat, setactiveChat] = useState<Chat | undefined>(defaultChat);
  const [status, setstatus] = useState("");
  const { setCurrentMessageToken } = useContext(TokenCountContext);
  const [activeChatMessagesCount, setActiveChatMessagesCount] = useState(0);
  const [triggerFetch, setTriggerFetch] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const activeChat = chatList.find((item) => item.id === activeChatId);
    setactiveChat(activeChat);

    if (activeChat) {
      setActiveChatMessagesCount(activeChat.messages.length);
    }
  }, [activeChatId, chatList]);


  const snowsql = useCallback(async (sqlCode: string) => {
    try {
      setLoading(true);
      setstatus("Querying Snowflake. Hang tight! ");

      const response = await fetchData("/api/snow", "POST", { query: sqlCode });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLoading(false);
      return data;

    } catch (error) {
      toast({
        title: "Snowflake Slip-up!",
        description: `Error while querying Snowflake: ${error}`,
        variant: "destructive",
        className: "bg-[#e2e8f0] text-black",
      });
      setLoading(false);
    }
  }, []);

  const sendToFastAPI = useCallback(async (pythonCode: string, initialSqlCode: string) => {
    setLoading(true);
    if (!pythonCode) {
      setLoading(false);
      return;
    }

    let fullChat = [...chatList];
    let chatIndex = fullChat.findIndex((item) => item.id === activeChatId);
    let sqlCode = initialSqlCode;

    if (!sqlCode) {
      try {
        const response = await fetchData("/api/py", "POST", {
          prompt: pythonCode,
        });

        const responseBody = await readResponseBody(response);

        let sqlCodeResponse: ChatMessage[] = [
          { id: uuidv4(), author: "assistant", content: responseBody },
        ];
        const sql = await extractSQL(sqlCodeResponse);

        if (!sql) {
          setLoading(false);
          return;
        }
        sqlCode = sql;
      } catch (error) {
        setLoading(false);
        return;
      }
    }

    try {
      setstatus("Generating visualizations... ");
      const response = await fetchData("/api/modal", "POST", {
        pythonCode: pythonCode,
        sqlCode: sqlCode,
      });
      const data = await response.json();

      let newMessage: ChatMessage = {
        id: uuidv4(),
        author: "assistant",
        content: data.imageUrl,
      };

      fullChat[chatIndex].messages = [
        ...fullChat[chatIndex].messages,
        newMessage,
      ];
      setChatList([...fullChat]);
      setLoading(false);
    }
    catch (error) {
      setLoading(false);
      setErrorMessage(chatList, activeChatId, setChatList);
    }
  }, [activeChatId, chatList, setChatList]);

  const getSql = useCallback(async () => {
    try {
      setLoading(true);
      setstatus("uhmmm... ");
      const decoder = new TextDecoder("utf-8");

      let chatIndex = chatList.findIndex((item) => item.id === activeChatId);
      if (chatIndex > -1) {
        let chat = chatList[chatIndex];

        // Prepare the history array
        let history: string[] = [];
        for (let i = 0; i < chat.messages.length - 1; i += 2) {
          let question = chat.messages[i].content;
          let answer = chat.messages[i + 1]?.content || "";
          history.push(question, answer);
        }
        let question = chat.messages[chat.messages.length - 1].content;

        const response = await fetch("/api/sql", {
          method: "POST",
          body: JSON.stringify({ prompt: question, history: history }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.body) {
          setLoading(false);
          return;
        }

        const reader = response.body.getReader();
        setLoading(false);
        let messageObject: ChatMessage = {
          id: uuidv4(),
          author: "assistant",
          content: "",
        };

        chatList[chatIndex].messages.push(messageObject);
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            let pythonCode = extractPythonCode(messageObject.content);
            let initialSqlCode = extractSqlCode(messageObject.content);
            await sendToFastAPI(pythonCode, initialSqlCode);

            if (!pythonCode && initialSqlCode) {
              const data = await snowsql(initialSqlCode);
              let markdownTable = toMarkdownTable(data);

              let newMessage: ChatMessage = {
                id: uuidv4(),
                author: "assistant",
                content: markdownTable,
              };

              chatList[chatIndex].messages.push(newMessage);
              setLoading(false);
            }

            setChatList([...chatList]);
            break;
          }

          const text = decoder.decode(value);
          messageObject.content += text;

          setChatList([...chatList]);
        }
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage(chatList, activeChatId, setChatList);
    } finally {
      setTriggerFetch(false);
    }
  }, [
    setLoading,
    chatList,
    activeChatId,
    setTriggerFetch,
    setChatList,
    sendToFastAPI,
    snowsql,
  ]);

  useEffect(() => {
    if (triggerFetch) {
      getSql();
      setTriggerFetch(false);
    }
  }, [triggerFetch, getSql]);

  const openSidebar = () => setSidebarOpened(true);
  const closeSidebar = () => setSidebarOpened(false);

  const handleNewChat = () => {
    if (Loading) return;
    if (chatList.length >= 4) {
      toast({
        title: "Oh No, Too Many Chats!",
        description: "You have reached the maximum number of chats. Please delete one to create a new one.",
        variant: "destructive",
        className: "bg-white text-black",
      });
      return;
    }
    setactiveChatId("");
    closeSidebar();
  };

  const handleSendMessage = (message: string) => {
    let activeChatIndex = chatList.findIndex((item) => item.id === activeChatId);

    if (activeChatId === initialChatId) {
      toast({
        title: "oops!",
        description: "You cannot add new messages to the initial chat. Please create a new chat.",
        variant: "destructive",
        className: "bg-[#e2e8f0] text-black",
      })
      return;
    } else if (activeChatMessagesCount >= 20) {
      toast({
        title: "Chat-aholic Alert!",
        description: "You have reached the maximum number of messages for this chat. Please create a new chat.",
        variant: "destructive",
        className: "bg-[#e2e8f0] text-black",
      }
      );

      return;
    } else if (activeChatId && activeChatIndex !== -1) {
      let updatedChatList = appendUserMessage(
        [...chatList],
        activeChatId,
        message
      );
      setChatList(updatedChatList);
      setActiveChatMessagesCount((prev) => prev + 1);
    } else {
      setactiveChatId("");
      let newChat = createNewChat(message);
      setChatList([newChat, ...chatList]);
      setactiveChatId(newChat.id);
      setActiveChatMessagesCount(1);
    }

    setCurrentMessageToken(0);
    setTriggerFetch(true);
  };


  const handleSelectChat = (id: string) => {
    if (Loading) return;
    let item = chatList.find((item) => item.id === id);
    if (item) setactiveChatId(item.id);
    closeSidebar();
  };

  const handleDeleteChat = (id: string) => {
    let updatedChatList = deleteChat([...chatList], id);
    setChatList(updatedChatList);
    setactiveChatId("");
  };

  const handleEditChat = (id: string, newTitle: string) => {
    if (newTitle) {
      let updatedChatList = editChat([...chatList], id, newTitle);
      setChatList(updatedChatList);
    }
  };

  return (
    <main className="flex min-h-screen dark:bg-neutral-900 bg-neutral-200/40">
      <Sidebar
        open={sidebarOpened}
        onClose={closeSidebar}
        onNewChat={handleNewChat}
      >
        {chatList.map((item, index) => (
          <SidebarChatFunc
            key={item.id}
            chatItem={item}
            active={item.id === activeChatId}
            onClick={handleSelectChat}
            onDelete={handleDeleteChat}
            onEdit={handleEditChat}
            sequence={chatList.length - index}
          />
        ))}
      </Sidebar>
      <div
        className={`flex flex-col w-full transition-all duration-200 overflow-x-hidden ${sidebarOpened ? " -z-10 backdrop-blur-blur" : ""
          } `}
      >
        <Header
          openSidebarClick={openSidebar}
          title={activeChat ? activeChat.title : "snowBrain"}
          newChatClick={handleNewChat}
        />

        <ChatBox chat={activeChat} loading={Loading} status={status} />

        <Footer
          onSendMessage={handleSendMessage}
          disabled={Loading || activeChatMessagesCount >= 22}
        />
      </div>
    </main>
  );
};

export default Page;
