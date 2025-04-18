import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { api } from '../convex/_generated/api'
import { SignInForm } from './SignInForm'
import { SignOutButton } from './SignOutButton'
import { Toaster } from 'sonner'
import { useEffect, useRef, useState } from 'react'
import { CategoryPanel } from './components/CategoryPanel'
import { Toolbar } from './components/Toolbar'
import { NoteModal } from './components/NoteModal'
import { Id } from '../convex/_generated/dataModel'

export default function App() {
  return (
    <div className='min-h-screen flex flex-col bg-[#fef9c3]'>
      <header className='sticky top-0 z-10'>
        <h2 className='text-xl font-semibold accent-text sr-only'>
          Chef Sticky Notes
        </h2>
      </header>
      <main className='flex-1 flex flex-col items-center justify-center p-8'>
        <div className='w-full max-w-6xl mx-auto'>
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  )
}

function Content() {
  const { signOut } = useAuthActions()
  const loggedInUser = useQuery(api.auth.loggedInUser)
  const categories = useQuery(api.notes.listCategories) ?? []
  const notes = useQuery(api.notes.list) ?? []
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null)

  // Ensure default categories exist for new users
  const createDefaults = useMutation(api.categories.createDefaults)
  useEffect(() => {
    if (loggedInUser && categories.length === 0) {
      void createDefaults({})
    }
  }, [loggedInUser, categories.length, createDefaults])

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState<Id<'notes'> | null>(null)
  const [modalContent, setModalContent] = useState('')
  const [modalImage, setModalImage] = useState<string | null>(null)
  const [modalImageFile, setModalImageFile] = useState<File | null>(null)

  // Drag state
  const [draggedNoteId, setDraggedNoteId] = useState<Id<'notes'> | null>(null)

  // Find selected note
  const selectedNote = notes.find((n) => n._id === selectedNoteId)

  // Open modal for editing/creating note
  function openNoteModal(noteId: Id<'notes'> | null) {
    if (noteId) {
      const note = notes.find((n) => n._id === noteId)
      setSelectedNoteId(noteId)
      setModalContent(note?.content ?? '')
      setModalImage(note?.imageUrl ?? null)
      setModalImageFile(null)
    } else {
      setSelectedNoteId(null)
      setModalContent('')
      setModalImage(null)
      setModalImageFile(null)
    }
    setModalOpen(true)
  }

  // Save note (auto-save on edit)
  const updateNote = useMutation(api.notes.update)
  useEffect(() => {
    if (!selectedNoteId) return
    if (selectedNote && modalContent !== selectedNote.content) {
      void updateNote({ noteId: selectedNoteId, content: modalContent })
    }
    // eslint-disable-next-line
  }, [modalContent])

  // Handle image upload
  const generateUploadUrl = useMutation(api.notes.generateUploadUrl)
  async function handleImageChange(file: File | null) {
    if (!selectedNoteId) return
    if (!file) {
      await updateNote({ noteId: selectedNoteId, imageId: null })
      setModalImage(null)
      setModalImageFile(null)
      return
    }
    // Only JPEG/PNG, max 5MB
    if (
      !['image/jpeg', 'image/png'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      alert('Only JPEG/PNG images under 5MB allowed.')
      return
    }
    // Upload to Convex storage
    const postUrl = await generateUploadUrl({})
    const result = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    })
    const json = await result.json()
    if (!result.ok) {
      alert('Upload failed')
      return
    }
    const { storageId } = json
    await updateNote({ noteId: selectedNoteId, imageId: storageId })
    setModalImage(URL.createObjectURL(file))
    setModalImageFile(file)
  }

  // Delete note
  const removeNote = useMutation(api.notes.remove)
  async function handleDeleteNote() {
    if (selectedNoteId) {
      await removeNote({ noteId: selectedNoteId })
      setModalOpen(false)
      setSelectedNoteId(null)
    }
  }

  // Create new note
  const createNote = useMutation(api.notes.create)
  async function handleNewNote() {
    if (!categories.length) return
    const firstCat = filterCategoryId
      ? categories.find((c) => c._id === filterCategoryId)
      : categories[0]
    if (!firstCat) return
    const order = notes.filter((n) => n.categoryId === firstCat._id).length
    const noteId = await createNote({
      categoryId: firstCat._id,
      content: '',
      order,
    })
    openNoteModal(noteId)
  }

  // Drag and drop logic
  const updateNoteMutation = useMutation(api.notes.update)
  function handleNoteDragStart(noteId: Id<'notes'>, e: React.DragEvent) {
    setDraggedNoteId(noteId)
    e.dataTransfer.effectAllowed = 'move'
    return void 0
  }
  function handleNoteDragEnd(noteId: Id<'notes'>, e: React.DragEvent) {
    setDraggedNoteId(null)
    return void 0
  }
  async function handlePanelDrop(
    categoryId: Id<'categories'>,
    e: React.DragEvent
  ) {
    e.preventDefault()
    if (!draggedNoteId) return
    const note = notes.find((n) => n._id === draggedNoteId)
    if (!note) return
    // Move to new category and set order to end
    const newOrder = notes.filter((n) => n.categoryId === categoryId).length
    await updateNoteMutation({
      noteId: draggedNoteId,
      categoryId,
      order: newOrder,
    })
    setDraggedNoteId(null)
  }

  // Filter notes by category
  const filteredCategories = filterCategoryId
    ? categories.filter((c) => c._id === filterCategoryId)
    : categories

  // Map notes to categories (imageUrl 바로 사용)
  const notesByCategory: Record<string, any[]> = {}
  for (const cat of filteredCategories) {
    notesByCategory[cat._id] = notes
      .filter((n) => n.categoryId === cat._id)
      .map((n) => ({
        ...n,
        imageUrl: n.imageUrl,
      }))
  }

  // Logout
  function handleLogout() {
    void signOut()
  }

  if (loggedInUser === undefined) {
    return (
      <div className='flex justify-center items-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500'></div>
      </div>
    )
  }

  if (!loggedInUser) {
    return (
      <div className='flex flex-col items-center justify-center'>
        <h1 className='text-5xl font-bold accent-text mb-4'>
          Sticky Note Board
        </h1>
        <SignInForm />
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-8'>
      <Toolbar
        onNewNote={() => {
          void handleNewNote()
        }}
        onFilter={setFilterCategoryId}
        onLogout={handleLogout}
        categories={categories}
        filterCategoryId={filterCategoryId}
      />
      <div className='flex flex-row gap-8 mt-20 justify-center'>
        {filteredCategories.map((cat) => (
          <CategoryPanel
            key={cat._id}
            name={cat.name}
            notes={notesByCategory[cat._id] || []}
            onNoteClick={(id) => {
              void openNoteModal(id)
            }}
            onNoteDragStart={(id, e) => {
              void handleNoteDragStart(id, e)
            }}
            onNoteDragEnd={(id, e) => {
              void handleNoteDragEnd(id, e)
            }}
            onDrop={(e) => {
              void handlePanelDrop(cat._id, e)
            }}
            selectedNoteId={selectedNoteId}
          />
        ))}
      </div>
      <NoteModal
        open={modalOpen}
        content={modalContent}
        imageUrl={modalImage}
        onContentChange={setModalContent}
        onImageChange={(file) => {
          void handleImageChange(file)
        }}
        onClose={() => setModalOpen(false)}
        onDelete={() => {
          void handleDeleteNote()
        }}
      />
    </div>
  )
}
