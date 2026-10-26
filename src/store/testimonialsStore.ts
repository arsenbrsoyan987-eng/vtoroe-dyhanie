import { createCollection } from './collection';
import { testimonials as seedTestimonials } from '../data/news';
import type { Testimonial } from '../types';

export const testimonialsStore = createCollection<Testimonial>(
  'db_testimonials',
  seedTestimonials
);

export const useTestimonials = testimonialsStore.useAll;
