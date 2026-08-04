import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface SearchQueryResponse {
  success: boolean;
  savedAnalysisId?: string;
  query?: string;
  verdict?: string;
  matchedItemsCount?: number;
  answer?: string;
  error?: string;
  savedRecord?: {
    query: string;
    verdict: string;
    contextCollection: string;
    createdAt: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ResellerSearchService {
  private apiUrl = 'http://localhost:3000/api/pipeline/search-query';

  constructor(private http: HttpClient) {}

  /**
   * Sends a natural language reseller search query to backend via RxJS Observable
   */
  searchQuery$(query: string, collectionName: string = 'scraped_products'): Observable<SearchQueryResponse> {
    return this.http.post<SearchQueryResponse>(this.apiUrl, {
      query,
      collectionName
    }).pipe(
      catchError((err) => {
        const errorMsg = err.error?.error || err.message || 'Failed to analyze query';
        return of({ success: false, error: errorMsg });
      })
    );
  }
}
