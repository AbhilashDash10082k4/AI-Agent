//params - chat_id - get the id to access the page with that chat
import { auth } from "@clerk/nextjs/server";
import { Id } from "../../../../../convex/_generated/dataModel";
import { redirect } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import getConvexClient from "@/lib/convex";
import ChatInterface from "@/components/ChatInterface";

interface ChatPageProps {
  params: Promise<{ chatId: Id<"chats"> }>;
}

async function ChatPage({ params }: ChatPageProps) {
  //in Nextjs 15, await the params
  const { chatId } = await params;
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  try {
    //getting the intial msgs
    //convex client
    const convex = getConvexClient();
    const initialMsgs = await convex.query(api.messages.list, { chatId });

    return <div className="flex-1 overflow-hidden">
        <ChatInterface chatId={chatId} initialMessages={[]} />
    </div>;
  } catch (error) {
    console.log("Error in loading chats", error);
    redirect("/dashboard");
  }
}

export default ChatPage;
