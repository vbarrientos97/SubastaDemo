'use client'

import { useState } from 'react'

export function useEntityEditor<T>(empty: T) {
  const [draft, setDraft] = useState(empty)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function beginEdit(id: string, next: T) {
    setCreating(false)
    setEditingId(id)
    setError(null)
    setDraft(next)
  }

  function startCreate() {
    setEditingId(null)
    setDraft(empty)
    setError(null)
    setCreating(true)
  }

  function reset() {
    setEditingId(null)
    setCreating(false)
    setDraft(empty)
    setError(null)
  }

  function finishSubmit(message: string | null) {
    setError(message)
    if (!message) reset()
  }

  function finishRemove(id: string, message: string | null) {
    setPendingId(null)
    setError(message)
    if (!message && editingId === id) reset()
  }

  return {
    draft,
    setDraft,
    editingId,
    pendingId,
    setPendingId,
    error,
    formOpen: creating || editingId !== null,
    beginEdit,
    startCreate,
    reset,
    finishSubmit,
    finishRemove,
  }
}
