import { createCollection } from './collection';
import { results as seedResults } from '../data/news';
import { publishedOr } from '../data/published';
import type { SportResult } from '../types';

/**
 * Спортивные результаты. Раньше страница читала их напрямую из `data/news`,
 * поэтому добавленное в админке никуда не попадало.
 */
export const resultsStore = createCollection<SportResult>(
  'db_results',
  publishedOr<SportResult>('results', seedResults)
);

export const useResults = resultsStore.useAll;
