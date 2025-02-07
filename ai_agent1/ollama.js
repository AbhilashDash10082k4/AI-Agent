import ollama from "ollama";
const response = await ollama.chat({
  model: "deepseek-r1:7b",
  messages: [
    { role: 'system', content: "Respond in JSON format.Example: {\"answer\": \"4\"}." },
    { role: 'user', content: "What is 2+2? Respond in JSON format" },
  ],
  stream: false,
  format: "json",
});
const result = response.message.content.trim();
console.log("result ", result);
try {
    const parsedRes = JSON.parse(result);
    console.log("Parsed Result:", parsedRes);
} catch (e) {
    console.error("Error parsing JSON:", error, "Raw Response:", result);
}