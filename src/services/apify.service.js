import { ApifyClient } from 'apify-client';
import { defer, from, map, catchError, of } from 'rxjs';

const apifyClient = new ApifyClient({
  token: process.env.APIFY_TOKEN
});

export const PLATFORM_ACTORS = {
  ebayScraper: 'automation-lab/ebay-scraper',
  vintedScraper: 'epicscrapers/vinted-search-scraper',
  default: 'apify/web-scraper'
};

export const runApifyActor$ = (actorId = 'apify/web-scraper', input = {}) => {
  return defer(() => from(apifyClient.actor(actorId).call(input))).pipe(
    map((run) => ({
      success: true,
      runId: run.id,
      defaultDatasetId: run.defaultDatasetId,
      status: run.status
    })),
    catchError((error) => of({ success: false, error: error.message }))
  );
};

export const getApifyDatasetItems$ = (datasetId, options = { limit: 100 }) => {
  return defer(() => from(apifyClient.dataset(datasetId).listItems(options))).pipe(
    map((dataset) => ({
      success: true,
      items: dataset.items,
      count: dataset.count,
      total: dataset.total
    })),
    catchError((error) => of({ success: false, error: error.message }))
  );
};
