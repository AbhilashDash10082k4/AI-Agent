import { Id } from "../../convex/_generated/dataModel";

//SSE Constants, prefix =prefixing the response from BE with data: to cntrl the response, don = send done msg from BE to browser, DELIMETER = preserve each line 
export const SSE_DATA_PREFIX = "data:" as const;
export const SSE_DONE_MESSAGE = "[DONE]" as const;
export const SSE_LINE_DELIMITER = "\n\n" as const;

type MessageRole = "user" | "assistant";

export interface Message {
  role: MessageRole;
  content: string;
}

export interface ChatReqBody {
  messages: Message[];
  newMsg: string;
  chatId: Id<"chats">;
}


export enum StreamMsgType {
  Token = "token",
  Error = "error",
  Connected = "connected",
  Done = "done",
  ToolStart = "tool_start",
  ToolEnd = "tool_end",
}

//every type pf message is going to be an extension of BaseStreamMsg
export interface BaseStreamMsg {
  type: StreamMsgType,
}
export interface TokenMessage extends BaseStreamMsg {
  type: StreamMsgType.Token,
  token: string,
}
export interface ErrorMessage extends BaseStreamMsg {
  type: StreamMsgType.Error,
  error: string,
}
export interface ConnectedMessage extends BaseStreamMsg {
  type: StreamMsgType.Connected,
}
export interface DoneMessage extends BaseStreamMsg {
  type: StreamMsgType.Done,
}
export interface ToolStartMessage extends BaseStreamMsg {
  type: StreamMsgType.ToolStart,
  tool: string,
  input: unknown,
}
export interface ToolEndMessage extends BaseStreamMsg {
  type: StreamMsgType.ToolEnd,
  tool: string,
  output: unknown,
}


//these messages are extension of the StreamMsgType
export type StreamMsgs = 
  | TokenMessage
  | ErrorMessage
  | ConnectedMessage
  | DoneMessage
  | ToolStartMessage
  | ToolEndMessage