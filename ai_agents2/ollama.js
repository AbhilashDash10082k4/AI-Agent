// const OLLAMA_API_URL = "http://localhost:11434/api/generate"
// async function* generateResponseStream(prompt) {
//   try {
//     const response = await fetch(OLLAMA_API_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "llama3.2:1b",
//         prompt: prompt,
//         stream: true,
//         format: 'json'
//       }),
//     });
//     if(!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     const reader = response.body.getReader();
//     const decoder = new TextDecoder();
//     let buffer = "";
//     while(true) {
//       const {done, value} = await reader.read();
//       if(done) break;
//       buffer += decoder.decode(value, {stream: true});
//       const lines = buffer.split("\n");
//       buffer = lines.pop()
//       for (const line of lines) {
//         if(line.trim()!== "") {
//           try {
//             const parsed = JSON.parse(line);
//             if(parsed.response) {
//               yield parsed.response;
//             }
//           } catch(e) {
//             console.error("Error in parsing JSON ",e.message);
//           }
//         }
//       }
//     }
//   } catch (e) {
//     console.error("Error : ",e.message);
//   }
// }
// async function main() {
//   const prompt = "What is 23*3?";
//   console.log("Sending request to OLLAMA...")
//   console.log("Response from OLLAMA...");
//   let fullResponse = "";
//   let lastChunk = "";
//   for await(const responsePart of generateResponseStream(model, prompt)) {
//     if (responsePart !== lastChunk) {  // Avoid duplicate responses
//         process.stdout.write(responsePart);
//         fullResponse += responsePart;
//         lastChunk = responsePart;
//       }
//   }
// }
// main()

import ollama from "ollama";
const messages = [
  { role: "user", content: "What is 23*3?" },
  { role: "system", content: "Return Output in JSON format" },
];

// const response = await ollama.chat({
//   model: "llama3.2:1b",
//   messages: messages,
//   stream: false,
//   format: "json",
// });
// const result = response.message?.content;
// if(!result || result == "{}") {
//   console.error("Recieved empty JSON response")
// } else {
//   try {
//     const action =typeof result === 'string' ? JSON.parse(result) : result
//     console.log("actions after parsing: ",action);
//   } catch (error) {
//     console.error("Error parsing json: ",error, "Response: ",result)
//   }
// }

const response = await ollama.chat ({
  model: "llama3.2:1b",
  messages: messages,
  format: 'json',
  stream: false 
})
const result = response.message?.content
console.log(result);
messages.push({role: "assistant", content: result});

if (!result || result == "{}") {
  console.error("Recieved empty JSON response");
}
const action = JSON.parse(result);
console.log("actions after parsing: ", action);