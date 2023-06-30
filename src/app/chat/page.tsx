"use client";

import { useLocalStorage } from "@/../hooks/use-local-storage";
import {
  appendUserMessage,
  createNewChat,
  deleteChat,
  editChat,
} from "@/../utils/chatHelpers";
import { ChatBox } from "@/components/ChatBox";
import CustomToast from "@/components/CustomToast";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SidebarChatFunc } from "@/components/SidebarChatFunc";
import { TokenCountContext } from "@/components/token";
import { Chat } from "@/types/Chat";
import { ChatMessage } from "@/types/ChatMessage";
import { extractSQL } from "lib/extractSQL";
import { toMarkdownTable } from "lib/mdTable";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
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
  const router = useRouter();
  const pythonCodeRegex = /```python([\s\S]*?)```/g;
  const sqlRegex = /```(?:sql)?\s*([\s\S]*?SELECT[\s\S]*?FROM[\s\S]*?)```/g;

  useEffect(() => {
    const activeChat = chatList.find((item) => item.id === activeChatId);
    setactiveChat(activeChat);

    if (activeChat) {
      setActiveChatMessagesCount(activeChat.messages.length);
    }
  }, [activeChatId, chatList]);

  const extractCode = (message: string, regex: RegExp) => {
    let codeMatch;
    let code = "";
    while ((codeMatch = regex.exec(message)) !== null) {
      code = codeMatch[1].trim();
    }
    return code;
  };

  const fetchData = async (url: string, method: string, data: any) => {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Response Error");

    return response;
  };

  const snowsql = async (sqlCode: string) => {
    setLoading(true);
    setstatus("Querying Snowflake. Hang tight! ");
    const response = await fetchData("/api/snow", "POST", { query: sqlCode });
    const data = response.json();
    setLoading(false);
    return data;
  };

  const sendToFastAPI = async (pythonCode: string, initialSqlCode: string) => {
    setLoading(true);
    if (!pythonCode) {
      setLoading(false);
      return;
    }

    let fullChat = [...chatList];
    let chatIndex = fullChat.findIndex((item) => item.id === activeChatId);
    const messages: ChatMessage[] = fullChat[chatIndex].messages;
    let sqlCode = initialSqlCode;

    if (!sqlCode) {
      let combined_prompt =
        "Write the DQL(Data query language) for the data needed here in SQL:\n" +
        pythonCode;

      try {
        const response = await fetchData("/api/py", "POST", {
          prompt: combined_prompt,
        });

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder("utf-8");
        let responseBody = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          responseBody += decoder.decode(value);
        }

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
      // console.log("pythonCode", pythonCode);
      // console.log("sqlCode", sqlCode);
      setstatus("Generating visualizations... ");
      const response = await fetchData("/api/modal", "POST", {
        pythonCode: pythonCode,
        sqlCode: sqlCode,
      });
      const data = await response.json();
      // console.log("data", data);
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
    } catch (error) {
      setLoading(false);
    }
  };

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
          return alert("Something went wrong");
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
            let pythonCode = extractCode(
              messageObject.content,
              pythonCodeRegex
            );
            let initialSqlCode = extractCode(messageObject.content, sqlRegex);

            sendToFastAPI(pythonCode, initialSqlCode);

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
      // console.error(error);
      setLoading(false);
      alert("An error occurred");
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
      toast(
        (t) => (
          <CustomToast message="You have reached the maximum number of chats" />
        ),
        {
          duration: 4000,
          position: "top-center",
        }
      );
      return;
    }
    setactiveChatId("");
    closeSidebar();
  };

  const handleSendMessage = (message: string) => {
    if (activeChatId === initialChatId) {
      toast(
        (t) => (
          <CustomToast message="You cannot add new messages to the initial chat. Please create a new chat." />
        ),
        {
          duration: 4000,
          position: "top-center",
        }
      );
      return;
    }
    if (activeChatMessagesCount >= 12) {
      toast(
        (t) => (
          <CustomToast message="You have reached the maximum number of messages for this chat" />
        ),
        {
          duration: 4000,
          position: "top-center",
        }
      );
      return;
    }
    if (!activeChatId) {
      let newChat = createNewChat(message);
      setChatList([newChat, ...chatList]);
      setactiveChatId(newChat.id);
    } else {
      let updatedChatList = appendUserMessage(
        [...chatList],
        activeChatId,
        message
      );
      setChatList(updatedChatList);

      // Update the message count for the active chat
      setActiveChatMessagesCount((prev) => prev + 1);
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
    router.push("/");
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
          title={activeChat ? activeChat.title : "snowbrain"}
          newChatClick={handleNewChat}
        />

        <ChatBox chat={activeChat} loading={Loading} status={status} />

        <Footer
          onSendMessage={handleSendMessage}
          disabled={Loading || activeChatMessagesCount >= 10}
        />
      </div>
    </main>
  );
};

export default Page;
