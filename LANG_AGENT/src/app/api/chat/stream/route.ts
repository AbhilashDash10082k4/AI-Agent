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
import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { submitQuestion } from "@/lib/langgraph";

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
        await convex.mutation(api.messages.send, {
          chatId,
          content: newMsg,
        });

        //In db, the format of msgs changes, so changing the format to LangChain format
        const langChainMessages = [
          ...messages.map((msg) =>
            msg.role === "user" //create HumanMessage or AIMessage instant
              ? new HumanMessage(msg.content)
              : new AIMessage(msg.content)
          ),
          new HumanMessage(newMsg) //last msg is appended to the HumanMessage
        ]
        try {
          //create the stream ->  langChainMsgs and chatId are passed to langgraph, this will have event flowing through it -> events flowing through langchain and getting streamed 
          const eventStream = await submitQuestion(langChainMessages, chatId);

          //processing each of the events
          for await (const event of eventStream) {
            console.log("event: ", event);

            /*on_chat_model_stream ->  LLM streams a chunk to user
            on_tool_start - when LLM starts to use a tool
            on_tool_end - when LLM stops to use a tool
            */
            if (event.event === "on_chat_model_stream") {

              //a token is taken to be a chunk
              const token = event.data.chunk;
              if (token) {

                //access the text property from AIMessage chunk - beneficial for SSE events and for langchain equipped with tools
                const text = token.content.at(0)?.("text");

                //sending the SSE msgs
                if (text) {
                  await sendSSEMsgs(writer, {
                    type: StreamMsgType.Token,
                    token: text,
                  });
                }
              }

            } else if (event.event === "on_tool_start") {
              await sendSSEMsgs(writer, {
                type: StreamMsgType.ToolStart,
                tool: event.name || "unknown",
                input: event.data.input,
              });
            } else if (event.event === "on_tool_end") {
              //on completion of tool calling, extract the msg given by the tool
              const toolMessage = new ToolMessage(event.data.output);
              await sendSSEMsgs(writer, {
                type: StreamMsgType.ToolEnd,
                tool: toolMessage.lc_kwargs.name || "unknown",
                output: event.data.output,
              });
            }

            //sending completion msg
            await sendSSEMsgs(writer, { type: StreamMsgType.Done });
          }

        } catch (streamError) {
          //error in event stream
          console.error("Error in event stream", streamError);
          await sendSSEMsgs(writer, {
            type: StreamMsgType.Error,
            error:
              streamError instanceof Error
                ? streamError.message
                : "Stream processing failed"
          })
        }

      } catch (error) {
        //overall error
        console.error("Error in chat API", error);
        await sendSSEMsgs(writer, {
          type: StreamMsgType.Error,
          error: error instanceof Error ? error.message : "Unknown Error",
        })
      } finally {
        try {
          await writer.close()
        } catch (closeError) {
          console.log("Error in closing writer", closeError);
        };

      };
    }
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
