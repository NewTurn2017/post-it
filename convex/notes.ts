import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'
import { Id } from './_generated/dataModel'

// List notes for the current user, grouped by category
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []
    const notes = await ctx.db
      .query('notes')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('asc')
      .collect()
    // imageId가 있으면 signed URL을 생성해서 imageUrl로 추가
    return await Promise.all(
      notes.map(async (note) => ({
        ...note,
        imageUrl: note.imageId ? await ctx.storage.getUrl(note.imageId) : null,
      }))
    )
  },
})

// List categories for the current user
export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []
    const categories = await ctx.db
      .query('categories')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('asc')
      .collect()
    return categories
  },
})

// Create a new note
export const create = mutation({
  args: {
    categoryId: v.id('categories'),
    content: v.string(),
    imageId: v.optional(v.id('_storage')),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')
    return await ctx.db.insert('notes', {
      userId,
      categoryId: args.categoryId,
      content: args.content,
      imageId: args.imageId,
      order: args.order,
    })
  },
})

// Update a note (content, image, category, order)
export const update = mutation({
  args: {
    noteId: v.id('notes'),
    content: v.optional(v.string()),
    imageId: v.optional(v.union(v.id('_storage'), v.null())),
    categoryId: v.optional(v.id('categories')),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')
    const note = await ctx.db.get(args.noteId)
    if (!note || note.userId !== userId) throw new Error('Not found')

    // Only include imageId if it's an Id<_storage> or undefined (not null)
    const patch: any = {
      ...(args.content !== undefined ? { content: args.content } : {}),
      ...(args.categoryId !== undefined ? { categoryId: args.categoryId } : {}),
      ...(args.order !== undefined ? { order: args.order } : {}),
    }
    if (args.imageId !== undefined) {
      if (args.imageId === null) {
        patch.imageId = undefined
      } else {
        patch.imageId = args.imageId
      }
    }

    await ctx.db.patch(args.noteId, patch)
  },
})

// Delete a note
export const remove = mutation({
  args: { noteId: v.id('notes') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')
    const note = await ctx.db.get(args.noteId)
    if (!note || note.userId !== userId) throw new Error('Not found')
    await ctx.db.delete(args.noteId)
  },
})

// Generate upload URL for images
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

// 이미지 signed URL 반환 쿼리
export const getImageUrl = query({
  args: { imageId: v.id('_storage') },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.imageId)
  },
})
