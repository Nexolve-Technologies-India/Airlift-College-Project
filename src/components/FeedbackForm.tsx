// components/FeedbackForm.tsx
import React, { useState } from 'react';
import { MessageSquare, Star } from 'lucide-react';

interface Props {
  email: string;
  bookingId?: string;
  flightId?: string;
  feedbackType?: string;
}

const FeedbackForm: React.FC<Props> = ({ 
  email, 
  bookingId, 
  flightId,
  feedbackType = 'booking' 
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [hover, setHover] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:5500/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          rating,
          comment,
          feedbackType,
          bookingId,
          flightId,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setRating(0);
        setComment('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit feedback');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center mb-4">
        <MessageSquare className="mr-2 text-blue-600" />
        <h3 className="text-lg font-semibold">Your Feedback</h3>
      </div>
      
      {success ? (
        <div className="bg-green-100 text-green-800 p-3 rounded">
          Thank you for your feedback! We appreciate your input.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How would you rate your experience?
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      (hover || rating) >= star
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Comments (Optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 min-h-[100px]"
              placeholder="Tell us about your experience..."
            />
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className={`bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={loading || rating === 0}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      )}
    </div>
  );
};

export default FeedbackForm;