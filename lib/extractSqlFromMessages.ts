// import { ChatMessage } from "@/types/ChatMessage";

// export const extractSqlFromMessages = async (
//   messages: ChatMessage[]
// ): Promise<string | null> => {
//   console.log(messages);
//   for (const message of messages) {
//     console.log(message);
//     if (message.author === "assistant") {
//       const sqlPrompt = {
//         messages: [
//           {
//             role: "user",
//             content: message.content,
//           },
//         ],
//       };
//       // console.log(sqlPrompt);
//       const response = await fetch("/api/chat", {
//         method: "POST",
//         body: JSON.stringify(sqlPrompt),
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//       // console.log(response);
//       if (!response.ok) {
//         console.log("Error", response);
//         return null;
//       }

//       const responseData = await response.json();
//       console.log(responseData);
//       if (!responseData.content) {
//         console.error("Unexpected response data", responseData);
//         return null;
//       }

//       const sqlCode = responseData.content;
//       // Adjusting the regular expression to match the SQL code from the message content
//       // const sqlRegex = /((?:SELECT|WITH)[\s\S]*?;)/g;
//       const sqlRegex = /```sql\n([\s\S]*?)\n```/g;
//       const match = sqlRegex.exec(sqlCode);
//       console.log(match);
//       if (match && match[1]) {
//         // The actual SQL code is the first capture group
//         console.log(match[1]);
//         return match[1].trim();
//       }
//     }
//   }

//   // Return null if no SQL code was found
//   return null;
// };
