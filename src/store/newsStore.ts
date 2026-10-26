import { createCollection } from './collection';
import { news as seedNews } from '../data/news';
import type { NewsItem } from '../types';

export const newsStore = createCollection<NewsItem>('db_news', seedNews);

export const useNews = newsStore.useAll;
