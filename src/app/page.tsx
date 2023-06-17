"use client";

import { ChatArea } from "@/components/ChatArea";
import { Footer } from "@/components/Footer";
import { SidebarChatButton } from "@/components/SidebarChatButton";
import { Chat } from "@/types/Chat";
import { ChatMessage } from "@/types/ChatMessage";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import useLocalStorage from "../../hooks/use-local-storage";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { appendUserMessage, createNewChat, deleteChat, editChat } from './../../utils/chatHelpers';

const Page = () => {
  const [sidebarOpened, setSidebarOpened] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [chatList, setChatList] = useLocalStorage<Chat[]>('chatList', []);
  const [chatActiveId, setChatActiveId] = useLocalStorage<string>('chatActiveId', '');
  const [chatActive, setChatActive] = useState<Chat>();
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    setChatActive(chatList.find(item => item.id === chatActiveId));

  }, [chatActiveId, chatList])

  useEffect(() => {
    if (Loading) fetchResponse();
  }, [Loading]);

  const fetchResponse = async () => {
    const decoder = new TextDecoder('utf-8');
    let fullChat = [...chatList];
    let ChatIndex = fullChat.findIndex(item => item.id === chatActiveId);
    // console.log("index--", ChatIndex);
    console.log("fullChat: ", fullChat)
    let chatHistories: { [key: string]: string[] } = {};
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
      // Store the history array in chatHistories with the chat id as the key
      chatHistories[chat.id] = history;
      const response = await fetch('/api/sql', {
        method: 'POST',
        body: JSON.stringify({ prompt: question, history: chatHistories[chat.id] }),
        headers: {
          'Content-Type': 'application/json'
        },
      })
      // console.log("response--", response);
      if (!response.body) {
        return alert('Something went wrong');
      }

      const reader = response.body.getReader();
      let messageObject: ChatMessage = { id: uuidv4(), author: 'assistant', content: "" }; // Fixing author type issue
      // Add a new messageObject for the AI's response
      fullChat[ChatIndex].messages = [...fullChat[ChatIndex].messages, messageObject]; // Using spread operator instead of concat for array
      console.log("fullChatafterrrr--", fullChat);
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const text = decoder.decode(value);
        messageObject.content += text;

        // Update the last message with updated message
        fullChat[ChatIndex].messages[fullChat[ChatIndex].messages.length - 1] = messageObject;
        console.log("fullChatafter insertion--", fullChat);
        setChatList([...fullChat]);
      }
    }
    setLoading(false);
  }



  const openSidebar = () => setSidebarOpened(true);
  const closeSidebar = () => setSidebarOpened(false);

  const handleClearConversations = () => {
    if (Loading) return;
    setChatList([]);
    setChatActiveId('');
  }

  const handleNewChat = () => {
    if (Loading) return;
    setChatActiveId('')
    closeSidebar();

  }

  const handleSendMessage = (message: string) => {
    if (!chatActiveId) {
      let newChat = createNewChat(message);
      setChatList([newChat, ...chatList]);
      setChatActiveId(newChat.id);
    } else {
      let updatedChatList = appendUserMessage([...chatList], chatActiveId, message);
      setChatList(updatedChatList);
    }
    setLoading(true);
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
  }

  const handleEditChat = (id: string, newTitle: string) => {
    if (newTitle) {
      let updatedChatList = editChat([...chatList], id, newTitle);
      setChatList(updatedChatList);
    }
  }

  const handleTestOpenAI = async () => {
    const response = await fetch('/api/py');
    const data = await response.json();

    console.log(data); // Add this line to check the data


    let image = new Image();
    image.src = 'data:image/png;base64,' + data.base64String;
    console.log(image);
    console.log("image--", image.src);
    document.body.appendChild(image);
    setImage(image.src);

  }

  return (
    <main className="flex min-h-screen dark:bg-neutral-900 bg-neutral-200/40">
      <Sidebar
        open={sidebarOpened}
        onClose={closeSidebar}
        onClear={handleClearConversations}
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

        {/* <button onClick={handleTestOpenAI}>Test AI</button> */}

        {/* Display the image if it's loaded */}
        {image && <img src={image} alt="Plot" />}        {/* {streamedData} */}
        <Footer
          onSendMessage={handleSendMessage}
          disabled={Loading}
        />

      </section>
    </main>
  );
}

export default Page;