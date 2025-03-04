//this route is completely for backend which will send streamed response to our i/ps

import getConvexClient from "@/lib/convex";
import {
  ChatReqBody,
  SSE_DATA_PREFIX,
  SSE_LINE_DELIMITER,
  StreamMsgs,
  StreamMsgType,
} from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";

//helper function to be able to write into that stream and send stream from frontend
function sendSSEMsgs(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  data: StreamMsgs
) {
  const encoder = new TextEncoder();
  return writer.write(
    encoder.encode(
      `${SSE_DATA_PREFIX}${JSON.stringify(data)}${SSE_LINE_DELIMITER}`
    )
  );
}

export default async function POST(req: Request) {
  const { userId } = auth();
  try {
    if (!userId) return new Response("Unaothorized", { status: 401 });

    // extracting the chat req body
    const { messages, newMsg, chatId } = (await req.json()) as ChatReqBody;

    const convex = getConvexClient();

    //telling the BE to keep stream open to stream the entire response. Creating a stream with larger response strategy for better performance
    const stream = new TransformStream({}, { highWaterMark: 1024 });

    //writer allows the browser to send msgs through stream
    const writer = stream.writable.getWriter();

    //preparing a response structure that supports our stream
    const response = new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        // "Cache-control": "no cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-buffering": "no", //disables buffering for nginx which is required for SSE to work properly
      },
    });

    //starting the stream of responses
    const startStream = async () => {
      try {
        //stream logic
        //1st connection - setting up the 1st conncetion of SSE
        await sendSSEMsgs(writer, { type: StreamMsgType.Connected });

        //send the user msg to convex DB
        await convex.mutation(api.messages.send,{
            chatId,
            content: newMsg,
        });

      } catch (error) {
        console.log("Error in chat API", error);
        return NextResponse.json(
          { error: "Failed to process chat request" },
          { status: 500 }
        );
      }
    };
    startStream();

    return response;
  } catch (error) {
    console.log("Error in chat API", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
