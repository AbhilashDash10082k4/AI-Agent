
//params - chat_id - get the id to access the page with that chat
import { Id } from "../../../../../convex/_generated/dataModel"

interface ChatPageProps {
    params: Promise<{chatId: Id<"chats">}>
}

async function ChatPage({params}: ChatPageProps) {
    //in Nextjs 15, await the params
    const {chatId} = await params;

  return (
    <div>
      ChatPage {chatId}
    </div>
  )
}

export default ChatPage