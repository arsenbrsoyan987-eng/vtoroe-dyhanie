export interface Direction {
  id: string;
  name: string;
  nameShort: string;
  description: string;
  fullDescription: string;
  icon: string;
  imageUrl: string;
  suitableFor: string[];
  requiredEquipment: string[];
  level: string;
}

export interface Training {
  id: string;
  name: string;
  directionId: string;
  directionName: string;
  date: string;
  time: string;
  location: string;
  trainer: string;
  trainerId: string;
  duration: string;
  level: string;
  spotsAvailable: number;
  description: string;
  equipment: string[];
  image: string;
}

export interface Trainer {
  id: string;
  name: string;
  photo: string;
  specialization: string;
  experience: string;
  biography: string;
  directions: string[];
  certifications: string[];
  phone: string;
  email: string;
}

export interface Event {
  id: string;
  name: string;
  category: EventCategory;
  date: string;
  time: string;
  location: string;
  description: string;
  fullDescription: string;
  images: string[];
  registrationOpen: boolean;
  registrationDeadline: string;
  price: string;
  requirements: string[];
}

export type EventCategory =
  | 'training'
  | 'competition'
  | 'hike'
  | 'camp'
  | 'public';

export interface Route {
  id: string;
  name: string;
  type: RouteType;
  image: string;
  distance: string;
  elevation: string;
  duration: string;
  difficulty: RouteDifficulty;
  description: string;
  startPoint: string;
  mapUrl?: string;
  gpxUrl?: string;
}

export type RouteType = 'running' | 'trail' | 'cycling' | 'hiking';
export type RouteDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: string;
  image: string;
}

export interface SportResult {
  id: string;
  athleteName: string;
  event: string;
  date: string;
  discipline: string;
  result: string;
  place: string;
  protocolUrl?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  photo: string;
  text: string;
  achievement: string;
  direction: string;
}
