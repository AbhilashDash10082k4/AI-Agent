import { ChatOllama } from "@langchain/ollama";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import wxflows from "@wxflows/sdk/langchain";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";

//Import these data into wxflows to make a tool to access these data
//Customers at- https://introspection.apis.stepzen.com/customers
//Comments at- https://dummyjson.com/comment
//Yt transcript tools

//tools: - connecting wx flows, these tools will help the LLM to connect to DB, get a YT transcript, etc
//S1- Connect to the tools
//S2 - new wxflows -> toolClient uses this wxflows to access the deployed tool and authorize it with api key
const toolClient = new wxflows({
  endpoint: process.env.WXFLOWS_ENDPOINT || "",
  apikey: process.env.WXFLOWS_APIKEY,
})

//retrieve the tools - 
const tools = await toolClient.lcTools;
const toolNode = new ToolNode(tools)

const initialiseModel = () => {
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
          if (usage) {

          }
        }
      }
    ]
  }).bindTools([tools]);
  return llmForTool
}
// Bind the tool to the model
// const llmWithTools = llmForTool.bindTools([weatherTool]);

//Creating workflow
const createWorkflow = () => {
  const model = initialiseModel();
  
  //state graph - graph of flow for LLM, prepare some memory for us -> aftera prompt it will decide whether to call a tool or whether to or the task is finished, its a flow chart for work that LLM will do to execute the prompt by user -> this graph will have nodes ( like a tools node-  the ability to call a tool, agent node - the start of LLM )
  const stateGraph = new StateGraph(MessagesAnnotation);
  stateGraph.addNode(
    'agent',
    async (state) => {
      //Creating the system message content
       const systemContent = SYSTEM_MESSAGE;
    }
  )

}