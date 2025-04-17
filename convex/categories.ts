import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create default categories for a new user
export const createDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    // Only create if not already present
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (existing.length > 0) return;
    await ctx.db.insert("categories", { name: "To Do", order: 0, userId });
    await ctx.db.insert("categories", { name: "In Progress", order: 1, userId });
    await ctx.db.insert("categories", { name: "Completed", order: 2, userId });
  },
});
