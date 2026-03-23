'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface Review {
  id: string
  rating: number
  title: string
  body: string
  createdAt: string
  customer: { name: string }
}

interface Props {
  productId: string
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={`text-2xl ${star <= value ? 'text-amber-400' : 'text-stone-300'} ${onChange ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function ProductReviews({ productId }: Props) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [avg, setAvg] = useState<number | null>(null)
  const [total, setTotal] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews ?? [])
        setAvg(data.avg)
        setTotal(data.total)
      })
  }, [productId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, rating, title, body }),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage(data.message)
      setShowForm(false)
      setTitle('')
      setBody('')
      setRating(5)
      // Refresh reviews
      fetch(`/api/reviews?productId=${productId}`)
        .then((r) => r.json())
        .then((d) => { setReviews(d.reviews ?? []); setAvg(d.avg); setTotal(d.total) })
    } else {
      setError(data.error ?? 'Erro ao enviar avaliação')
    }
    setSubmitting(false)
  }

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Avaliações</h2>
          {avg !== null && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={Math.round(avg)} />
              <span className="text-stone-500 text-sm">{avg.toFixed(1)} de 5 ({total} {total === 1 ? 'avaliação' : 'avaliações'})</span>
            </div>
          )}
        </div>
        {session && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Avaliar produto
          </button>
        )}
        {!session && (
          <a href="/conta/login" className="text-amber-700 hover:underline text-sm">Faça login para avaliar</a>
        )}
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">{message}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-stone-50 rounded-xl p-6 border border-stone-200 mb-8 space-y-4">
          <h3 className="font-semibold text-stone-700">Sua avaliação</h3>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Nota</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required
              placeholder="Resumo da sua experiência"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Comentário</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={4}
              placeholder="Conte mais sobre o produto..."
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white px-6 py-2 rounded-lg text-sm font-medium">
              {submitting ? 'Enviando...' : 'Enviar avaliação'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="bg-stone-200 hover:bg-stone-300 px-6 py-2 rounded-lg text-sm font-medium">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl p-5 border border-stone-200">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <StarRating value={r.rating} />
                  <p className="font-semibold text-stone-800 mt-1">{r.title}</p>
                </div>
                <div className="text-right text-sm text-stone-400">
                  <p>{r.customer.name.split(' ')[0]}</p>
                  <p>{new Date(r.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-stone-400 border border-dashed border-stone-200 rounded-xl">
          <p className="text-lg mb-1">Nenhuma avaliação ainda</p>
          <p className="text-sm">Seja o primeiro a avaliar este produto!</p>
        </div>
      )}
    </section>
  )
}
