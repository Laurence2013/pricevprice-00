import { defer, from, map, catchError, of } from 'rxjs';
import { db } from '../config/firebase.js';

/**
 * Saves scraped product items to Firestore in a batch write.
 * @param {Array} items - List of scraped item objects
 * @param {string} platform - E-commerce platform name (e.g. ebay, vinted)
 * @param {string} collectionName - Target Firestore collection name
 * @returns {Observable<{success: boolean, savedCount?: number, error?: string}>}
 */
export const saveScrapedProducts$ = (items = [], platform = 'ebay', collectionName = 'scraped_products') => {
  return defer(() =>
    from(
      (async () => {
        if (!items || items.length === 0) {
          return 0;
        }

        const batch = db.batch();
        const itemsToSave = items.slice(0, 25); // Limit batch to top 25 items per run

        itemsToSave.forEach((item) => {
          const docRef = db.collection(collectionName).doc();
          batch.set(docRef, {
            platform,
            rawData: item,
            createdAt: new Date().toISOString()
          });
        });

        await batch.commit();
        return itemsToSave.length;
      })()
    )
  ).pipe(
    map((savedCount) => ({
      success: true,
      savedCount
    })),
    catchError((error) => of({ success: false, error: error.message }))
  );
};
