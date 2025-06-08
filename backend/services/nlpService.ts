import natural from 'natural';
import { IChatContext } from '../models/ChatSession';
import nlpConfig, { isSupportedCity, isDateInRange } from '../config/nlpConfig';

// Define types
type Intent = {
  name: string;
  confidence: number;
};

type Entity = {
  type: string;
  value: string;
  position: number;
};

interface NLPResponse {
  intent: Intent;
  entities: Entity[];
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
}

class NLPService {
  private static instance: NLPService;
  private tokenizer: natural.WordTokenizer;
  private classifier: natural.BayesClassifier;

  private constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.classifier = new natural.BayesClassifier();
    this.trainClassifier();
  }

  public static getInstance(): NLPService {
    if (!NLPService.instance) {
      NLPService.instance = new NLPService();
    }
    return NLPService.instance;
  }

  private trainClassifier(): void {
    // Booking related intents
    this.addDocuments([
      'I want to book a flight',
      'Need to book tickets',
      'Looking for flights',
      'Show available flights',
      'Book SkyWings tickets',
      'Need to fly',
      'Planning to travel'
    ], 'book_flight');

    // Greeting intents
    this.addDocuments([
      'hi', 'hello', 'hey', 'good morning',
      'good afternoon', 'good evening'
    ], 'greeting');

    // Farewell intents
    this.addDocuments([
      'bye', 'goodbye', 'see you',
      'thank you', 'thanks', 'done'
    ], 'farewell');

    // Train the classifier
    this.classifier.train();
  }

  private addDocuments(phrases: string[], intent: string): void {
    phrases.forEach(phrase => this.classifier.addDocument(phrase, intent));
  }

  private extractEntities(text: string): Entity[] {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    const entities: Entity[] = [];

    tokens.forEach((token, index) => {
      // Check for cities
      if (isSupportedCity(token)) {
        entities.push({
          type: 'location',
          value: token,
          position: index
        });
      }

      // Check for flight numbers (SW followed by 3 digits)
      const flightNumberMatch = token.match(/SW\d{3}/i);
      if (flightNumberMatch) {
        entities.push({
          type: 'flight_number',
          value: flightNumberMatch[0].toUpperCase(),
          position: index
        });
      }

      // Check for dates
      const dateMatch = token.match(/\d{4}-\d{2}-\d{2}/);
      if (dateMatch && isDateInRange(dateMatch[0])) {
        entities.push({
          type: 'date',
          value: dateMatch[0],
          position: index
        });
      }

      // Check for times
      if (nlpConfig.flightPatterns.departureTimes.includes(token)) {
        entities.push({
          type: 'time',
          value: token,
          position: index
        });
      }

      // Check for price mentions
      const priceMatch = token.match(/\d+/);
      if (priceMatch && parseInt(priceMatch[0]) === nlpConfig.flightPatterns.basePrice) {
        entities.push({
          type: 'price',
          value: token,
          position: index
        });
      }
    });

    return entities;
  }

  private analyzeSentiment(text: string): { score: number; label: 'positive' | 'negative' | 'neutral' } {
    const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    const score = analyzer.getSentiment(this.tokenizer.tokenize(text));

    let label: 'positive' | 'negative' | 'neutral';
    if (score > 0.2) label = 'positive';
    else if (score < -0.2) label = 'negative';
    else label = 'neutral';

    return { score, label };
  }

  public async processMessage(message: string): Promise<NLPResponse> {
    const classifications = this.classifier.getClassifications(message);
    const intent: Intent = {
      name: classifications[0].label,
      confidence: classifications[0].value
    };

    const entities = this.extractEntities(message);
    const sentiment = this.analyzeSentiment(message);

    return {
      intent,
      entities,
      sentiment
    };
  }

  public updateContext(currentContext: IChatContext, nlpResponse: NLPResponse): IChatContext {
    // Start with a shallow copy of the current context
    const updatedContext: IChatContext = { ...currentContext };

    // Update intent if confidence is high enough
    if (nlpResponse.intent.confidence > 0.7) {
      updatedContext.intent = nlpResponse.intent.name;
      updatedContext.confidence = nlpResponse.intent.confidence;
    }

    // Update sentiment
    updatedContext.sentiment = nlpResponse.sentiment;

    // Update entities based on type
    nlpResponse.entities.forEach(entity => {
      switch (entity.type) {
        case 'location':
          // Prioritize filling 'from' first, then 'to'
          if (!updatedContext.from && isSupportedCity(entity.value)) {
            updatedContext.from = entity.value;
          } else if (updatedContext.from && !updatedContext.to && isSupportedCity(entity.value) && entity.value !== updatedContext.from) {
            updatedContext.to = entity.value;
          }
          break;

        case 'date':
          if (isDateInRange(entity.value)) {
            updatedContext.date = entity.value;
          }
          break;

        case 'flight_number':
          if (!updatedContext.selectedFlight) {
            updatedContext.selectedFlight = {
              airline: 'SkyWings Airlines',
              flightNumber: entity.value,
              from: updatedContext.from || '',
              to: updatedContext.to || '',
              departureTime: nlpConfig.flightPatterns.departureTimes[0],
              arrivalTime: nlpConfig.flightPatterns.departureTimes[0],
              duration: nlpConfig.flightPatterns.duration,
              price: nlpConfig.flightPatterns.basePrice,
              seatsAvailable: 100,
              status: 'scheduled'
            };
          } else {
            // If already selectedFlight exists, update flightNumber maybe
            updatedContext.selectedFlight.flightNumber = entity.value;
          }
          break;

        // Add more entity types as needed
      }
    });

    return updatedContext;
  }
}

export default NLPService;
