//changing, retrieving a chat from table

import { v } from "convex/values";
import { mutation } from "./_generated/server";


//creating a chat
//convex docs - mutation, ctx, args, getUserIdentity
export const createChat = mutation({
    args: {title: v.string()},
    handler: async (ctx, args) => {
        //acessing user's authentication
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) {
            throw new Error("Not authenticated")
        }
        const chats = await ctx.db.insert("chats",{
            title: args.title,
            userId: identity.subject,
            createdAt: Date.now(),
        })
        //userId: identity, id based on their token
        return chats;
    }
})