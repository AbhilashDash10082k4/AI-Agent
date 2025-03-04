import { ChatOllama } from "@langchain/ollama";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import wxflows from "@wxflows/sdk/langchain";

//Import these data into wxflows to make a tool to access these data
//Customers at- https://introspection.apis.stepzen.com/customers
//Comments at- https://dummyjson.com/comment
//Yt transcript tools

//tools: - connecting wx flows, these tools will help the LLM to connect to DB, get a YT transcript, etc
//S1- Connect to the tools
const toolClient = new wxflows({
  endpoint: process.env.WXFLOWS_ENDPOINT || "",
  apikey: process.env.WXFLOWS_APIKEY,
})

//retrieve the tools - 
const tools = await toolClient.lcTools;
const toolNode = new ToolNode(tools)

// Define the model
// callbacks- define the state of LLM app, handleLLMStart & handleLLMEnd are event handlers, these implement the BaseCallbackHandler events interface
const llmForTool = new ChatOllama({
  model: "llama3-groq-tool-use",
  temperature: 0.7,
  streaming: true,
  cache: true,
  callbacks: [
    {
      handleLLMStart: async () => {
        //starting llm call
      },
      handleLLMEnd: async (output) => {
        console.log("End LLM call", output);
        const usage = output.llmOutput?.usage;
        console.log("usage: ", usage);
        if(usage) {
          
        }
      }
    }
  ]
}).bindTools([tools]);

// Bind the tool to the model
// const llmWithTools = llmForTool.bindTools([weatherTool]);

const resultFromTool = await llmForTool.invoke(
  "What's the weather like today in San Francisco? Ensure you use the 'get_current_weather' tool."
);

console.log(resultFromTool);