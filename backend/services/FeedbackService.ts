// services/FeedbackService.ts
import Feedback from '../models/Feedback';
import natural from 'natural';

class FeedbackService {
  static async addFeedback(email: string, rating: number, comment: string, feedbackType: string, bookingId?: string, flightId?: string) {
    try {
      // Perform simple sentiment analysis
      const sentiment = this.analyzeSentiment(comment);
      
      // Create and save the feedback
      const feedback = new Feedback({
        email,
        rating,
        comment,
        sentiment,
        feedbackType,
        bookingId,
        flightId
      });
      
      await feedback.save();
      return feedback;
    } catch (error) {
      console.error('Error adding feedback:', error);
      return null;
    }
  }
  
  static analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    if (!text) return 'neutral';
    
    const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text);
    const score = analyzer.getSentiment(tokens);
    
    if (score > 0.2) return 'positive';
    if (score < -0.2) return 'negative';
    return 'neutral';
  }
  
  static async getFeedbackStats() {
    try {
      const totalCount = await Feedback.countDocuments();
      const positiveCount = await Feedback.countDocuments({ sentiment: 'positive' });
      const neutralCount = await Feedback.countDocuments({ sentiment: 'neutral' });
      const negativeCount = await Feedback.countDocuments({ sentiment: 'negative' });
      
      const averageRating = await Feedback.aggregate([
        { $group: { _id: null, avg: { $avg: '$rating' } } }
      ]);
      
      return {
        totalCount,
        positivePercentage: (positiveCount / totalCount) * 100,
        neutralPercentage: (neutralCount / totalCount) * 100,
        negativePercentage: (negativeCount / totalCount) * 100,
        averageRating: averageRating[0]?.avg || 0
      };
    } catch (error) {
      console.error('Error getting feedback stats:', error);
      return null;
    }
  }
}

export default FeedbackService;