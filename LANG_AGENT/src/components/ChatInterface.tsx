/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useRef, useState } from "react";
//interface of the entire app

import { Doc, Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { ChatReqBody } from "@/lib/types";

interface ChatInterfaceProps {
  chatId: Id<"chats">;
  initialMessages: Doc<"messages">[];
}

const ChatInterface = ({ chatId, initialMessages }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Doc<"messages">[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [currentTool, setCurrentTool] = useState<{
    name: string;
    input: unknown;
  } | null>(null);

  //scrolling to bottom of the page every time the i/p is displayed'
  const msgEndRef = useRef<HTMLDivElement>(null);
  //if a msg ever changes or the response is streamed, scroll to the bottom
  
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedResponse]);

  //e = object from form submission, e.preventDefault - prevents default submission of the form that refreshes the page,
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    //removing white space
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    //reset UI state for new msgs

    //after 1st i/p, the i/p section is set to null
    setInput("");

    //after the 1st res, the res is set to null
    setStreamedResponse("");

    setCurrentTool(null);

    setIsLoading(true);

    //optimistic UI -> once the i/p msg is sent, the UI should be updated optimistically, _id is temporarily used
    const optimisticUserMsg: Doc<"messages"> = {
      _id: `temp_${Date.now()}`,
      chatId,
      content: trimmedInput,
      role: "user",
      createdAt: Date.now(),
    } as Doc<"messages">;

    //taking the prev msg and concatenating it with optimisticUserMsg
    setMessages((prev) => [...prev, optimisticUserMsg]);

    //tracking complete res to save it to DB

    //the full res-
    const fullRes = "";

    //streaming -
    try {
      //the reqBody which will contain the i/p which will be sent to backend for res streaming, chatId=contains address to every chat, ID of chat tables
      const reqBody: ChatReqBody = {
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        newMsg: trimmedInput,
        chatId,
      };
      //calling SSE connection - Sending req form BE to client, "api/chat/stream will be created using file sysytem route in nextjs"
      const response = await fetch("api/chat/stream", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(reqBody),
      });

      if (!response.ok) throw new Error(await response.text());
      if (!response.body) throw new Error("NO response body was found");

      //----streaming the res from BE----
    } catch (error) {
      console.error("Error in sending msg to BE", error);

      //removing the optimistic user msg
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== optimisticUserMsg._id)
      );

      setStreamedResponse("error");
    } finally {
      setIsLoading(false);
    }
  }

  //h-[calc(100vh-theme(spacing.14))] = 100% of screen - 14.4px, flex-1 will take max space of flex container
  return (
    <main className="flex flex-col h-[calc(100vh-theme(spacing.14))]">
      {/*Messages */}
      <section className="flex-1">
        {/**response streaming */}
        <div>
          {/*messages , below div will show our i/p msg, msg._id comes from optimistic UI*/}
          {messages.map((msg) => (
            <div key={msg._id} className="">
              {msg.content}
            </div>
          ))}

          {/**last messages - always at the end of the screen*/}
          <div ref={msgEndRef}></div>
        </div>
      </section>

      {/**input , mx-auto- centering(margin-left:0, margin-right:0, works if th eelme has defined width) ,relative - */}
      <footer className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your message"
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent pr-12 bg-gray-50 placeholder:text-gray-500"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`absolute right-1.5 rounded-xl h-9 w-9 p-0 flex items-center justify-center transition-all ${
                input.trim()
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <ArrowRight />
            </Button>
          </div>
        </form>
      </footer>
    </main>
  );
};

export default ChatInterface;
