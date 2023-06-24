"use client";

import { useLocalStorage } from "@/../hooks/use-local-storage";
import { appendUserMessage, createNewChat, deleteChat, editChat } from '@/../utils/chatHelpers';
import { ChatArea } from "@/components/ChatArea";
import CustomToast from '@/components/CustomToast';
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SidebarChatButton } from "@/components/SidebarChatButton";
import { TokenCountContext } from "@/components/token";
import { Chat } from "@/types/Chat";
import { ChatMessage } from "@/types/ChatMessage";
import { extractSQL } from "lib/extractSQL";
import uploadToCloudinary from "lib/uploadToCloudinary";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { toast } from 'react-hot-toast';
import { defaultChat, initialChatId } from "utils/initialChat";
import { v4 as uuidv4 } from 'uuid';


const Page = () => {
  const [sidebarOpened, setSidebarOpened] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [chatList, setChatList] = useLocalStorage<Chat[]>('chatList', [defaultChat]);
  const [chatActiveId, setChatActiveId] = useState<string>(defaultChat.id);
  const [chatActive, setChatActive] = useState<Chat | undefined>(defaultChat);
  const [pythonCode, setPythonCode] = useState("");
  const { setCurrentMessageToken } = useContext(TokenCountContext);
  const [activeChatMessagesCount, setActiveChatMessagesCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const activeChat = chatList.find(item => item.id === chatActiveId);
    setChatActive(activeChat);

    if (activeChat) {
      setActiveChatMessagesCount(activeChat.messages.length);
    }
  }, [chatActiveId, chatList])

  const [triggerFetch, setTriggerFetch] = useState(false);

  useEffect(() => {
    if (triggerFetch) {
      fetchResponse();
      setTriggerFetch(false);
    }
  }, [triggerFetch]);

  const pythonCodeRegex = /```python([\s\S]*?)```/g;
  const sqlRegex = /```(?:sql)?\s*([\s\S]*?SELECT[\s\S]*?FROM[\s\S]*?)```/g;

  const extractCode = (message: string, regex: RegExp) => {
    let codeMatch;
    let code = '';
    while ((codeMatch = regex.exec(message)) !== null) {
      code = codeMatch[1].trim();
    }
    return code;
  }

  const fetchData = async (url: string, method: string, data: any) => {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Response Error");

    return response;
  };

  const sendToFastAPI = async (pythonCode: string, initialSqlCode: string) => {
    setLoading(true);

    if (!pythonCode) {
      setLoading(false);
      return;
    }

    let fullChat = [...chatList];
    let chatIndex = fullChat.findIndex(item => item.id === chatActiveId);
    const messages: ChatMessage[] = fullChat[chatIndex].messages;
    let sqlCode = initialSqlCode;

    if (!sqlCode) {
      let combined_prompt = "Write the DQL(Data query language) for the data needed here in SQL:\n" + pythonCode;

      try {
        const response = await fetchData('/api/py', 'POST', { prompt: combined_prompt });

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder('utf-8');
        let responseBody = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          responseBody += decoder.decode(value);
        }

        let sqlCodeResponse: ChatMessage[] = [{ id: uuidv4(), author: 'assistant', content: responseBody }];
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
      const response = await fetchData('http://127.0.0.1:8000/execute', 'POST', { script: pythonCode, sql: sqlCode });
      const imageData = await response.blob();
      const imageUrl = await uploadToCloudinary(imageData);

      let newMessage: ChatMessage = {
        id: uuidv4(),
        author: 'assistant',
        content: imageUrl
      };

      fullChat[chatIndex].messages = [...fullChat[chatIndex].messages, newMessage];
      setChatList([...fullChat]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };



  const fetchResponse = async () => {
    try {
      setLoading(true);
      const decoder = new TextDecoder('utf-8');

      let chatIndex = chatList.findIndex(item => item.id === chatActiveId);
      if (chatIndex > -1) {
        let chat = chatList[chatIndex];

        // Prepare the history array
        let history: string[] = [];
        for (let i = 0; i < chat.messages.length - 1; i += 2) {
          let question = chat.messages[i].content;
          let answer = chat.messages[i + 1]?.content || '';
          history.push(question, answer);
        }
        let question = chat.messages[chat.messages.length - 1].content;
        console.log("Question", question)

        const response = await fetch("/api/sql", {
          method: 'POST',
          body: JSON.stringify({ prompt: question, history: history }),
          headers: {
            'Content-Type': 'application/json'
          },
        })
        if (!response.body) {
          setLoading(false);
          return alert('Something went wrong');
        }

        const reader = response.body.getReader();
        setLoading(false);
        let messageObject: ChatMessage = { id: uuidv4(), author: 'assistant', content: "" }; // Fixing author type issue

        // Add a new messageObject for the AI's response
        chatList[chatIndex].messages.push(messageObject);
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // Once streaming is done, we handle the message content
            let pythonCode = extractCode(messageObject.content, pythonCodeRegex);
            let initialSqlCode = extractCode(messageObject.content, sqlRegex);

            setPythonCode(pythonCode);

            // Call the new function here
            sendToFastAPI(pythonCode, initialSqlCode);
            setChatList([...chatList]);
            break;
          }

          const text = decoder.decode(value);
          messageObject.content += text;

          // Update the last message with updated message
          setChatList([...chatList]);
        }
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert('An error occurred');
    } finally {
      setTriggerFetch(false);
    }
  }


  console.log("Python   ", pythonCode)
  console.log("Chat List", chatList)


  const openSidebar = () => setSidebarOpened(true);
  const closeSidebar = () => setSidebarOpened(false);

  const handleNewChat = () => {
    if (Loading) return;
    if (chatList.length >= 4) {
      toast((t) => <CustomToast message='You have reached the maximum number of chats' />, {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }
    setChatActiveId('')
    closeSidebar();
  }


  const handleSendMessage = (message: string) => {
    if (chatActiveId === initialChatId) {
      toast((t) => <CustomToast message='You cannot add new messages to the initial chat. Please create a new chat.' />, {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }
    if (activeChatMessagesCount >= 10) {
      toast((t) => <CustomToast message='You have reached the maximum number of messages for this chat' />, {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }
    if (!chatActiveId) {
      let newChat = createNewChat(message);
      setChatList([newChat, ...chatList]);
      setChatActiveId(newChat.id);
    } else {
      let updatedChatList = appendUserMessage([...chatList], chatActiveId, message);
      setChatList(updatedChatList);

      // Update the message count for the active chat
      setActiveChatMessagesCount(prev => prev + 1);
    }
    setCurrentMessageToken(0); // Reset token count
    // setLoading(true);
    setTriggerFetch(true);
  }


  const handleSelectChat = (id: string) => {
    if (Loading) return;
    let item = chatList.find(item => item.id === id);
    if (item) setChatActiveId(item.id);
    closeSidebar();
  }

  const handleDeleteChat = (id: string) => {
    let updatedChatList = deleteChat([...chatList], id);
    router.push('/')
    setChatList(updatedChatList);
    setChatActiveId('');
  }

  const handleEditChat = (id: string, newTitle: string) => {
    if (newTitle) {
      let updatedChatList = editChat([...chatList], id, newTitle);
      setChatList(updatedChatList);
    }
  }

  return (
    <main className='flex min-h-screen dark:bg-neutral-900 bg-neutral-200/40'>
      <Sidebar
        open={sidebarOpened}
        onClose={closeSidebar}
        onNewChat={handleNewChat}
      >
        {chatList.map(item => (
          <SidebarChatButton
            key={item.id}
            chatItem={item}
            active={item.id === chatActiveId}
            onClick={handleSelectChat}
            onDelete={handleDeleteChat}
            onEdit={handleEditChat}
          />
        ))}
      </Sidebar>
      <div className={`flex flex-col w-full transition-all duration-200 overflow-x-hidden ${sidebarOpened ? ' -z-10 backdrop-blur-blur' : ''} `}>
        <Header
          openSidebarClick={openSidebar}
          title={chatActive ? chatActive.title : 'Chat'}
          newChatClick={handleNewChat}
        />

        <ChatArea chat={chatActive} loading={Loading} />

        <Footer
          onSendMessage={handleSendMessage}
          disabled={Loading || activeChatMessagesCount >= 12}
        />
      </div>
    </main>
  );
}

export default Page;