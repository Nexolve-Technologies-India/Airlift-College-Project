import natural from 'natural';
import nlpConfig from '../config/nlpConfig';

export type IntentType = 
  | 'book_flight'
  | 'provide_location'
  | 'provide_date'
  | 'provide_time'
  | 'select_flight'
  | 'provide_passenger_info'
  | 'price_inquiry'
  | 'flight_status'
  | 'greeting'
  | 'farewell'
  | 'unknown';

interface IntentMatch {
  intent: IntentType;
  confidence: number;
  entities?: Record<string, string[]>;
}

class IntentClassifier {
  private static instance: IntentClassifier;
  private classifier: natural.BayesClassifier;
  private tokenizer: natural.WordTokenizer;
  
  private constructor() {
    this.classifier = new natural.BayesClassifier();
    this.tokenizer = new natural.WordTokenizer();
    this.trainClassifier();
  }

  public static getInstance(): IntentClassifier {
    if (!IntentClassifier.instance) {
      IntentClassifier.instance = new IntentClassifier();
    }
    return IntentClassifier.instance;
  }

  private trainClassifier(): void {
    // Booking intents
    this.addDocuments([
      'I want to book a flight',
      'Need to book tickets',
      'Looking for flights',
      'Show available flights',
      'Book SkyWings tickets',
      'Need to fly',
      'Planning to travel',
      'Want to make a reservation'
    ], 'book_flight');

    // Location intents - using actual cities
    const locationPhrases = nlpConfig.cities.flatMap(city => [
      `Flying from ${city}`,
      `Going to ${city}`,
      `Travel to ${city}`,
      `Departure from ${city}`,
      `From ${city}`,
      `To ${city}`
    ]);
    this.addDocuments(locationPhrases, 'provide_location');

    // Date intents
    this.addDocuments([
      'Want to fly on 2025-01-01',
      'Book for tomorrow',
      'Flying next week',
      'Travel date is',
      'Planning for January',
      'Book for next month'
    ], 'provide_date');

    // Time selection intents
    const timeIntents = nlpConfig.flightPatterns.departureTimes.flatMap(time => [
      `Flight at ${time}`,
      `Departure at ${time}`,
      `Book ${time} flight`,
      `Prefer ${time}`
    ]);
    this.addDocuments(timeIntents, 'provide_time');

    // Passenger details intents
    this.addDocuments([
      'My name is',
      'Email address is',
      'Phone number is',
      'Contact details',
      'Address is',
      'Passenger information'
    ], 'provide_passenger_info');

    // Price inquiry intents
    this.addDocuments([
      'How much is the ticket',
      'What is the fare',
      'Show me the price',
      'Cost of flight',
      `Is it ${nlpConfig.flightPatterns.basePrice}`,
      'Ticket price information'
    ], 'price_inquiry');

    // Flight status intents
    this.addDocuments([
      'Flight status',
      'Is flight on time',
      'Check status',
      'Track flight',
      'Flight information'
    ], 'flight_status');

    // Greeting intents
    this.addDocuments([
      'hi', 'hello', 'hey',
      'good morning', 'good afternoon',
      'good evening', 'greetings'
    ], 'greeting');

    // Farewell intents
    this.addDocuments([
      'bye', 'goodbye', 'see you',
      'thank you', 'thanks',
      'that\'s all', 'done'
    ], 'farewell');

    this.classifier.train();
  }

  private addDocuments(documents: string[], label: string): void {
    documents.forEach(doc => this.classifier.addDocument(doc, label));
  }

  private normalizeText(text: string): string {
    return text.toLowerCase().trim();
  }

  public classifyIntent(message: string): IntentMatch {
    const normalizedMessage = this.normalizeText(message);
    const tokens = this.tokenizer.tokenize(normalizedMessage);
    const classifications = this.classifier.getClassifications(normalizedMessage);
    
    const topClassification = classifications[0];
    let intent: IntentType = (topClassification?.label as IntentType) || 'unknown';
    let confidence = topClassification?.value || 0;

    // Extract entities
    const entities: Record<string, string[]> = {};

    // Extract cities
    const cities = tokens.filter(token => 
      nlpConfig.cities.includes(token)
    );
    if (cities.length > 0) {
      entities['cities'] = cities;
    }

    // Extract times
    const times = tokens.filter(time => 
      nlpConfig.flightPatterns.departureTimes.includes(time)
    );
    if (times.length > 0) {
      entities['times'] = times;
    }

    // Extract dates
    const dateMatch = message.match(/\d{4}-\d{2}-\d{2}/g);
    if (dateMatch) {
      entities['dates'] = dateMatch;
    }

    // Adjust intent based on entities
    if (intent === 'unknown' && Object.keys(entities).length > 0) {
      if (entities.cities?.length > 0) {
        intent = 'provide_location';
        confidence = 0.8;
      } else if (entities.dates?.length > 0) {
        intent = 'provide_date';
        confidence = 0.8;
      } else if (entities.times?.length > 0) {
        intent = 'provide_time';
        confidence = 0.8;
      }
    }

    return {
      intent,
      confidence,
      entities: Object.keys(entities).length > 0 ? entities : undefined
    };
  }
}

export default IntentClassifier;