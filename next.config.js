/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig




  // const getAIResponse = async () => {
  //   let response = await fetch('/api/chat', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       question: 'Whats the weather like?',
  //       history: [''],
  //     }),
  //   });

  //   const reader = response.body?.getReader();
  //   // let result = '';

  //   if (!reader) {
  //     return '';
  //   }

  //   while (true) {
  //     const { done, value } = await reader.read();

  //     if (done) {
  //       break;
  //     }
  //     const text = new TextDecoder().decode(value);

  //     setStreamedData((prevData) => prevData + text);

  //     let chatListClone = [...chatList];
  //     let ChatIndex = chatListClone.findIndex(item => item.id === chatActiveId);
  //     if (ChatIndex > -1) {
  //       chatListClone[ChatIndex].messages.push({
  //         id: uuidv4(),
  //         author: 'ai',
  //         body: streamedData
  //       });
  //     }
  //     setChatList(chatListClone);
  //   }
  //   setAILoading(false);
  // }