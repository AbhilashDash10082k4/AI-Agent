//changing, retrieving a chat from table

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


//creating a chat
//convex docs - mutation, ctx, args, getUserIdentity
export const createChat = mutation({
    args: { title: v.string() },
    handler: async (ctx, args) => {
        //acessing user's authentication
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated")
        }
        const chats = await ctx.db.insert("chats", {
            title: args.title,
            userId: identity.subject,
            createdAt: Date.now(),
        })
        //userId: identity, id based on their token
        return chats;
    }
})

export const deleteChat = mutation({
    args: { id: v.id("chats") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const chat = await ctx.db.get(args.id);
        if (!chat || chat.userId !== identity.subject) {
            throw new Error("Not authorized");
        }

        //dlt all msgs in chat
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_chat", (q) => q.eq("chatId", args.id))
            .collect();

        //collect gives all the document

        for (const msg of messages) {
            await (ctx.db.delete(msg._id));
        }

        //dlt the chat
        await ctx.db.delete(args.id);
    }
})

//querying chats from DB
export const listChats = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        //querying chats
        const chats = await ctx.db
            .query("chats")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .collect();
        return chats;
    },
})