import { Id } from "../../convex/_generated/dataModel";

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
