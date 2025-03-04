import { ChatOllama } from "@langchain/ollama";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import wxflows from "@wxflows/sdk/langchain";
import { MessagesAnnotation, START, StateGraph, END, MemorySaver } from "@langchain/langgraph";
import SYSTEM_MESSAGE from "@/constants/sysMsg";
import { AIMessage, BaseMessage, HumanMessage, SystemMessage, trimMessages } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts"
import { text } from "stream/consumers";


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

//trimming the messages - trim the last messages
const trimmer = trimMessages({
  maxTokens: 10,
  strategy: "last",
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: "human",
})

//whether the agent should continue
function shouldContinue(state: typeof MessagesAnnotation.State) {
  //getting the last message
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;

  //if the message has toolCall , we direct the agent to toolNode
  if (lastMessage.tool_calls?.length) {
    return 'tools';
  }

  // if the last msg has tool msg, then redirect it to agent so that the agent will use the tool
  if (lastMessage.content && lastMessage._getType() == 'tool') {
    return "agent";
  }

  //else, stop reply to browser
  return END;

}

//Creating workflow
const createWorkflow = () => {
  const model = initialiseModel();

  //state graph - graph of flow for LLM, prepare some memory for us -> aftera prompt it will decide whether to call a tool or whether to or the task is finished, its a flow chart for work that LLM will do to execute the prompt by user -> this graph will have nodes ( like a tools node-  the ability to call a tool, agent node - the start of LLM ) and edges
  const stateGraph = new StateGraph(MessagesAnnotation);
  stateGraph.addNode(
    'agent',
    async (state) => {
      //Creating the system message content
      const systemContent = SYSTEM_MESSAGE;

      //Prompt template
      const promptTemplate = ChatPromptTemplate.fromMessages([
        new SystemMessage(systemContent, {
          cache_control: { type: "ephemeral" }, //setting a cache breakpoint
        }),
        new MessagesPlaceholder("messages")
      ]);
      //Trimming the msgs to manage conversation history
      const trimmedMessages = await trimmer.invoke(state.messages);

      // Format the prompt with the current messages -> passing the trimmedMessage to promptTemplate to format the prompt
      const prompt = await promptTemplate.invoke({ messages: trimmedMessages })

      //Get response from the model -> passing the prompt to get the response
      const response = await model.invoke(prompt);

      return { messages: [response] };
    }
  )
    .addEdge(START, "agent")
    .addNode("tools", toolNode) //after the agent node is executed it will go to the tool node and try to call tools
    .addConditionalEdges("agent", shouldContinue) //the agent decides whether to call teh tool or not
    .addEdge("tools", "agent") //an agent can call and use the tools

  return stateGraph;

}
//type of messages - user, assistant, system

//caching headers for turn-by-turn conversation
function addCachingHeaders(messages: BaseMessage[]): BaseMessage[] {
  /*rules for caching - 
  1.cache the first SYSTEM_MESSAGE
  2. cache the LAST message
  3. cache the second to last human message*/

  if (!messages) return messages;

  //create copy of msgs to avoid mutating of original
  const cachedMessages = [...messages];

  //helper to add cache control
  const addCache = (message: BaseMessage) => {
    message.content = [
      {
        type: "text",
        text: message.content as string,
        cache_control: { type: "ephemeral" }
      }
    ]
  }
  //cache the last msg
  addCache(cachedMessages.at(-1)!);

  //caching the 2nd last human msg
  let humanCount = 0;
  for (let i = cachedMessages.length - 1; i >= 0; i--) {
    if (cachedMessages[i] instanceof HumanMessage) {
      humanCount++;
      if (humanCount === 2) {
        addCache(cachedMessages[i]);
        break;
      }
    }
  }
  return cachedMessages;
}

//submit qsn
export async function submitQuestion(messages: BaseMessage[], chatId: string) {
  //adding caching to every msg sent by the user
  const cachedMessages = addCachingHeaders(messages);

  //create workflow
  const workflow = createWorkflow();

  const checkpointer = new MemorySaver(); //saves the state of conversation

  //using the caching - 
  const app = workflow.compile({ checkpointer });

  //running the graph and stream -
  const stream = await app.streamEvents(
    { messages: cachedMessages, },
    {
      version: "v2",
      configurable: {
        thread_id: chatId
      },
      streamMode: "messages",
      runId: chatId,
    }
  )
  //to route
  return stream;
}
