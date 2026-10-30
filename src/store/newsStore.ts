import { createCollection } from './collection';
import { news as seedNews } from '../data/news';
import { publishedOr } from '../data/published';
import type { NewsItem } from '../types';

export const newsStore = createCollection<NewsItem>(
  'db_news',
  publishedOr<NewsItem>('news', seedNews)
);

export const useNews = newsStore.useAll;