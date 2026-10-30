import { createCollection } from './collection';
import { testimonials as seedTestimonials } from '../data/news';
import { publishedOr } from '../data/published';
import type { Testimonial } from '../types';

export const testimonialsStore = createCollection<Testimonial>(
  'db_testimonials',
  publishedOr<Testimonial>('testimonials', seedTestimonials)
);

export const useTestimonials = testimonialsStore.useAll;