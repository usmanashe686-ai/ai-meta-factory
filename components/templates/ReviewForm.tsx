'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-hot-toast'

interface ReviewFormProps {
  templateId: string
  onReviewSubmitted?: () => void
}

export default function ReviewForm({ templateId, onReviewSubmitted }: ReviewFormProps) {
  const { data: session } = useSession()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [pros, setPros] = useState<string[]>([])
  const [cons, setCons] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [currentPro, setCurrentPro] = useState('')
  const [currentCon, setCurrentCon] = useState('')

  const handleSubmit = async () => {
    if (!session) {
      toast.error('Please sign in to submit a review')
      return
    }

    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    if (review.trim().length < 10) {
      toast.error('Please write a more detailed review')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/analytics/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          userId: session.user.id,
          userName: session.user.name || 'Anonymous',
          rating,
          review,
          pros,
          cons
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Review submitted successfully!')
        setRating(0)
        setReview('')
        setPros([])
        setCons([])
        onReviewSubmitted?.()
      } else {
        toast.error(data.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const addPro = () => {
    if (currentPro.trim() && !pros.includes(currentPro.trim())) {
      setPros([...pros, currentPro.trim()])
      setCurrentPro('')
    }
  }

  const removePro = (pro: string) => {
    setPros(pros.filter(p => p !== pro))
  }

  const addCon = () => {
    if (currentCon.trim() && !cons.includes(currentCon.trim())) {
      setCons([...cons, currentCon.trim()])
      setCurrentCon('')
    }
  }

  const removeCon = (con: string) => {
    setCons(cons.filter(c => c !== con))
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      
      {/* Rating Stars */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">How would you rate this template?</p>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Review Text */}
      <div className="mb-6">
        <Textarea
          placeholder="Share your experience with this template. What did you like? What could be improved?"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="min-h-[120px]"
        />
        <div className="text-xs text-gray-500 mt-1">
          {review.length}/500 characters
        </div>
      </div>

      {/* Pros */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <ThumbsUp className="w-5 h-5 text-green-600 mr-2" />
          <span className="font-medium text-green-700">Pros</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {pros.map((pro) => (
            <div
              key={pro}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center"
            >
              {pro}
              <button
                type="button"
                onClick={() => removePro(pro)}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a pro (e.g., 'Easy to customize')"
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            value={currentPro}
            onChange={(e) => setCurrentPro(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addPro()}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPro}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Cons */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <ThumbsDown className="w-5 h-5 text-red-600 mr-2" />
          <span className="font-medium text-red-700">Cons</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {cons.map((con) => (
            <div
              key={con}
              className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center"
            >
              {con}
              <button
                type="button"
                onClick={() => removeCon(con)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a con (e.g., 'Could use more documentation')"
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            value={currentCon}
            onChange={(e) => setCurrentCon(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCon()}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCon}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={submitting || rating === 0 || review.trim().length < 10}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Your review helps others make better decisions
      </p>
    </div>
  )
}
