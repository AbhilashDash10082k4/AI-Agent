import ollama from "ollama";
import readLineSync from 'readline-sync';


//a fn containing the weather details
function getWeatherDetails(city='') {
  if (city.toLowerCase() === "BBSR") return "10°C";
  if (city.toLowerCase() === "Agra") return "19°C";
  if (city.toLowerCase() === "Delhi") return "30°C";
  if (city.toLowerCase() === "CTC") return "14°C";
}
const SYSTEM_PROMPT = `
Your are an AI Assistant with START, PLAN , ACTION, Observation and Output state.
Wait for user prompt and firt PLAN using available tools.
After planning, take the action with appropriate tools and wait for Observation based on Action.
Once you get the Observations, return the AI response based on START prompt and Observation.

Strictly follow the JSON output format.

Available Tools:
-function getWeatherDetails(city: string) : string 
This function takes name of city as an input and return its weather details

Example
START
{"type": "user", "user": "What is the temperature in BBSR?"}
{"type": "plan", "plan": "I will call getWeatherDetails function for the BBSR as asked by user in query"}
{"type": "observation", "observation": "the temperature of the city as asked by user in query in °C which is 10°C"}
{"type": "output", "output": "weather of the city asked by the user in query in °C which in this case is 10°C"}
`;
// {"type": "plan", "plan": "I will call getWeatherDetails function for the city asked by the user in query which in this case is BBSR."}
// {"type": "action", "function": "getWeatherDetails", "input": "the city asked by user in query which in this case is BBSR."}
// {"type": "observation", "observation": "weather of the city asked by the user in query"}

const tools = {'getWeatherDetails':getWeatherDetails};

const messages = [{ role: "system", content: `${SYSTEM_PROMPT}. Give your response in JSON format` }];

while(true) {
  const query = readLineSync.question("=>");
  const userQuery = {type: "user", user: query};
  
  messages.push(userQuery);
  
  //autoprompt
  while(true) {
    const response = await ollama.chat({
      model: "deepseek-r1:7b",
      messages: messages,
      stream: false,
      format: "json",
    });
    const result = response.message.content.trim();
    // console.log("result ", result);
    // try {
    //     const parsedRes = JSON.parse(result);
    //     console.log("Parsed Result:", parsedRes);
    //     break;
    // } catch (e) {
    //     console.error("Error parsing JSON:", error, "Raw Response:", result);
    // }
    console.log('\n\n-------START AI--------');
    console.log(result);
    console.log('-------END AI--------\n\n');
    messages.push({role: 'assistant', content: result})
    
    const action = JSON.parse(result);
    
    if(action.type == 'output') {
      console.log(`🤖: ${action.output}`)
      break;
    } else if (action.type == 'action'){
      const fn = tools[action.function];
      
      //o/p of this fn
      const observation = fn(action.input);
      const obs = {type: "observation", "observation": observation};
      messages.push({ role: 'developer', content: JSON.stringify(obs) });
    }
  }
}