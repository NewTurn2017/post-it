import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  categories: defineTable({
    name: v.string(),
    order: v.number(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),
  notes: defineTable({
    userId: v.id("users"),
    categoryId: v.id("categories"),
    content: v.string(),
    imageId: v.optional(v.id("_storage")),
    order: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["categoryId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
