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

/**
 * Fetches products from a specified Firestore collection or scraped_products.
 * @param {string} collectionName - Target Firestore collection
 * @param {number} limitCount - Max items to retrieve
 * @returns {Observable<{success: boolean, items: Array, error?: string}>}
 */
export const getProductsFromCollection$ = (collectionName = 'scraped_products', limitCount = 50) => {
  return defer(() =>
    from(
      db.collection(collectionName).limit(limitCount).get()
    )
  ).pipe(
    map((snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, items };
    }),
    catchError((error) => of({ success: false, items: [], error: error.message }))
  );
};

/**
 * Saves a reseller AI analysis result into Firestore collection 'reseller_analyses'
 * @param {Object} record - Analysis record object containing query, result, platforms
 * @returns {Observable<{success: boolean, id?: string, error?: string}>}
 */
export const saveResellerAnalysis$ = (record) => {
  const dataToSave = {
    ...record,
    createdAt: new Date().toISOString()
  };

  return defer(() =>
    from(db.collection('reseller_analyses').add(dataToSave))
  ).pipe(
    map((docRef) => ({
      success: true,
      id: docRef.id,
      savedRecord: dataToSave
    })),
    catchError((error) => of({ success: false, error: error.message }))
  );
};
