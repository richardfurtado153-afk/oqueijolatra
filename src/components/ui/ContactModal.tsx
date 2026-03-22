'use client'

import { useState, FormEvent } from 'react'
import Modal from './Modal'
import Button from './Button'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    // Simulate send — replace with real API call later
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setSent(true)
  }

  function handleClose() {
    setSent(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Fale Conosco">
      {sent ? (
        <div className="text-center py-6">
          <p className="text-stone-700 text-lg mb-4">Mensagem enviada com sucesso!</p>
          <Button onClick={handleClose}>Fechar</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nome</label>
            <input
              type="text"
              name="name"
              required
              className="w-full border border-stone-300 rounded-lg px-4 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">E-mail</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-stone-300 rounded-lg px-4 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Telefone</label>
            <input
              type="tel"
              name="phone"
              className="w-full border border-stone-300 rounded-lg px-4 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Mensagem</label>
            <textarea
              name="message"
              required
              rows={4}
              className="w-full border border-stone-300 rounded-lg px-4 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>
          <Button type="submit" loading={loading} className="w-full">
            Enviar mensagem
          </Button>
        </form>
      )}
    </Modal>
  )
}
