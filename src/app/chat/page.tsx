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
// import { extractSqlFromMessages } from "lib/extractSqlFromMessages";
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



  const sendToFastAPI = async (pythonCode: string) => {
    setLoading(true);
    if (!pythonCode) {
      console.log("No python code found");
      setLoading(false);
      return;
    }
    // Fetch the SQL code from the latest messages in the chat
    let fullChat = [...chatList];
    let chatIndex = fullChat.findIndex(item => item.id === chatActiveId);

    const messages: ChatMessage[] = fullChat[chatIndex].messages;
    console.log(messages)
    let sql = await extractSQL(messages);
    // if (sql) setsqlCode(sql);
    console.log(sql);

    if (!sql) {
      // Handle case where no SQL code is found in the latest messages
      console.log("No SQL code found");
      let combined_prompt = "Give me the DQL Data Query Language sql code to create as a dataframe first so I could run this python code (Always only give SQL code)" + pythonCode;
      const response = await fetch('/api/sql', {
        method: 'POST',
        body: JSON.stringify({ prompt: combined_prompt }),  // Assuming pythonCode is the prompt
        headers: {
          'Content-Type': 'application/json'
        },
      })

      if (!response.body) {
        console.log("Error", response)
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      setLoading(false);
      const decoder = new TextDecoder('utf-8');
      let responseBody = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        responseBody += decoder.decode(value);
      }

      let sqlCodeResponse: ChatMessage[] = [{ id: uuidv4(), author: 'assistant', content: responseBody }]
      console.log("SQL Code Response", sqlCodeResponse)
      sql = await extractSQL(sqlCodeResponse);
      console.log("SQL Code", sql)
      if (!sql) {
        console.log("Failed to get SQL code from /api/sql");
        return;
      }
      setLoading(true);

    }
    console.log("Python Code", pythonCode)
    console.log("SQL Code", sql)
    const response = await fetch('http://127.0.0.1:8000/execute', {
      method: 'POST',
      body: JSON.stringify({
        script: pythonCode,
        sql: sql
      }),
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      // Handle any errors here
      console.log("Error", response)
      setLoading(false);
      return;
    }
    console.log("Response", response)
    // Assuming the response is base64 encoded image
    const imageData = await response.blob();

    console.log("Response Data", imageData)
    const imageUrl = await uploadToCloudinary(imageData)

    console.log("Image URL", imageUrl)

    // Add new chat message with the image
    let newMessage: ChatMessage = {
      id: uuidv4(),
      author: 'assistant',
      content: imageUrl
    };
    setLoading(false);
    fullChat[chatIndex].messages = [...fullChat[chatIndex].messages, newMessage];
    setChatList([...fullChat]);
    console.log("fullChat List", fullChat)

  }


  const fetchResponse = async () => {
    setLoading(true);
    const decoder = new TextDecoder('utf-8');
    let fullChat = [...chatList];
    let ChatIndex = fullChat.findIndex(item => item.id === chatActiveId);
    if (ChatIndex > -1) {
      let chat = fullChat[ChatIndex];

      // Prepare the history array
      let history: string[] = [];
      for (let i = 0; i < chat.messages.length - 1; i += 2) {
        let question = chat.messages[i].content;
        let answer = chat.messages[i + 1]?.content || '';
        history.push(question, answer);
      }
      let question = chat.messages[chat.messages.length - 1].content;
      console.log("Question", question)

      let endpoint = "/api/sql";
      // let fetchBody = { prompt: question, history: history };
      let keywords = ["data analysis", "visualization", "datanalysis", "visualisation", "vizualisation", "charts", "graphs", "analysis", "plots", "matplot", "seaborn", "plotly", "visual"];

      // Store the history array in chatHistories with the chat id as the key
      if (keywords.some(keyword => question.toLowerCase().includes(keyword))) {
        endpoint = "/api/py";
      }
      const response = await fetch(endpoint, {
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
      fullChat[ChatIndex].messages = [...fullChat[ChatIndex].messages, messageObject]; // Using spread operator instead of concat for array
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Once streaming is done, we handle the message content
          const pythonCodeRegex = /```python([\s\S]*?)```/g;
          let pythonCodeMatch;
          let pythonCode = '';
          while ((pythonCodeMatch = pythonCodeRegex.exec(messageObject.content)) !== null) {
            pythonCode = pythonCodeMatch[1].trim();
          }
          setPythonCode(pythonCode);

          // Call the new function here
          sendToFastAPI(pythonCode);
          fullChat[ChatIndex].messages[fullChat[ChatIndex].messages.length - 1] = messageObject;
          setChatList([...fullChat]);
          break;
        }

        const text = decoder.decode(value);
        messageObject.content += text;
        // Update the last message with updated message
        fullChat[ChatIndex].messages[fullChat[ChatIndex].messages.length - 1] = messageObject;

        setChatList([...fullChat]);
      }
    }
    setTriggerFetch(false);
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
    setChatList(updatedChatList);
    setChatActiveId('');
    router.push('/')
  }

  const handleEditChat = (id: string, newTitle: string) => {
    if (newTitle) {
      let updatedChatList = editChat([...chatList], id, newTitle);
      setChatList(updatedChatList);
    }
  }

  return (
    <main className="flex min-h-screen dark:bg-neutral-900 bg-neutral-200/40">
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
      <section className="flex flex-col w-full">
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

      </section>
    </main>
  );

}

export default Page;