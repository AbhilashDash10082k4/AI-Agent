//this file contains the sidebar - sidebar has some navigation endpoints

import { NavigationContext } from "@/lib/NavigationProvider";
import { useRouter } from "next/navigation"
import { use } from "react";
import { Button } from "./ui/button";
import { PlusIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import ChatRow from "./ChatRow";

export default function Sidebar() {
    const router = useRouter();

    //destructuringt the vals from NavigationContext object
    const {isMobileNavOpen, closeMobileNav} = use(NavigationContext);

    //listing all the chats in the DB
    //in all these, "CHAT" can create errors
    const chats = useQuery(api.chat.listChats);
    const createChat = useMutation(api.chat.createChat);
    const deleteChat = useMutation(api.chat.deleteChat);
    
    //this fn will close the mobilenav and will redirect the user to dashboard 
    function handleClick () {
        router.push("/dashboard/chat");
        closeMobileNav();
    }
    
    //function that handles creation of new chat
    async function handleNewChat() {
        const chatId = await createChat({title: "New Chat"})
        //redirecting the user to new chat just created and closing mobileNav
        router.push(`/dashboard/chat/${chatId}`);
        closeMobileNav();
    }

    async function handleDeleteChat(id: Id<"chats">) {
        await deleteChat({id});
        //if the chat is viewed currently, redirect it to dashboard
        if(window.location.pathname.includes(id)) {
            router.push("/dashboard");
        }
    }

    return (
        <>
            {/* overlaying */}
            {isMobileNavOpen &&  (
                <div className="fixed inset-0 bg-black/20 z-40 md:hidden" 
                onClick={closeMobileNav}></div>
            )}

            {/* Sidebar */}
            <div className={cn(
                "fixed md:inset-y-0 top-14 bottom-0 left-0 z-50 w-72 bg-gray-50/80 backdrop-blur-xl border-r border-gray-200/50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:top-0 flex flex-col", isMobileNavOpen ? "translate-x-0": "-translate-x-full"
            )}>
                <div className="p-4 border-b border-gray-200/50">
                <Button 
                onClick={handleNewChat}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/50 shadow-sm hover:shadow transition-all duration-200">
                <PlusIcon className="mr-2 h-4 w-4"/> New Chat
                </Button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5 p-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    {chats?.map((chat) => (
                        <ChatRow key={chat._id} chat={chat} onDelete={handleDeleteChat}/>
                    ))}
                </div>
            </div>
        </>
    )
}