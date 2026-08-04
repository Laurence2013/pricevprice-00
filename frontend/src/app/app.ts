import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResellerSearchService, SearchQueryResponse } from './services/reseller-search.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private resellerSearchService = inject(ResellerSearchService);

  // Angular Signals for Reactive State Management
  searchQuery = signal<string>('Is there a second hand PS4 in Vinted, and eBay for under £400 refurbished?');
  isLoading = signal<boolean>(false);
  searchResult = signal<SearchQueryResponse | null>(null);
  errorMessage = signal<string | null>(null);
  recentSearches = signal<Array<{ query: string; verdict: string; timestamp: string }>>([]);

  // Preset sample prompts for resellers
  presetPrompts = [
    "Is there a second hand PS4 in Vinted, and eBay for under £400 refurbished?",
    "Find Nike Air Jordan 1 Retro under £120 in eBay or Vinted with high resale potential",
    "Show second hand Nintendo Switch OLED deals under £200 with controllers"
  ];

  // Computed signals for UI state
  hasResult = computed(() => !!this.searchResult() && this.searchResult()?.success);
  verdictBadgeClass = computed(() => {
    const verdict = this.searchResult()?.verdict?.toUpperCase() || '';
    if (verdict.includes('GREAT') || verdict.includes('DEAL')) return 'badge-success';
    if (verdict.includes('OVERPRICED') || verdict.includes('NO MATCHES')) return 'badge-danger';
    return 'badge-warning';
  });

  onSearch(): void {
    const query = this.searchQuery().trim();
    if (!query) {
      this.errorMessage.set('Please enter a natural language search query.');
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);
    this.searchResult.set(null);

    this.resellerSearchService.searchQuery$(query).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.searchResult.set(response);
          // Prepend to recent searches history signal
          this.recentSearches.update((list) => [
            {
              query,
              verdict: response.verdict || 'ANALYZED',
              timestamp: new Date().toLocaleTimeString()
            },
            ...list.slice(0, 4)
          ]);
        } else {
          this.errorMessage.set(response.error || 'Failed to complete search analysis.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Network error occurred while connecting to backend.');
      }
    });
  }

  usePreset(preset: string): void {
    this.searchQuery.set(preset);
    this.onSearch();
  }

  clear(): void {
    this.searchQuery.set('');
    this.searchResult.set(null);
    this.errorMessage.set(null);
  }
}
