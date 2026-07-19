import type { SourceConfig, SourceModule, ScrapeContext, ListingCandidate } from './types.js';

/**
 * Shared stub: dry-run / planning records the configured listing URL only.
 * Live HTML parsing is intentionally not implemented — operators must respect robots/ToS.
 */
export function createListingStub(config: SourceConfig): SourceModule {
  return {
    config,
    async planListing(ctx: ScrapeContext): Promise<ListingCandidate[]> {
      if (config.requiresApiDiscovery) {
        console.warn(
          `[${config.id}] SPA/# route or API unknown — listing stub only. Discover endpoints before --fetch-listing.`,
        );
      }

      if (ctx.fetchListing && !ctx.dryRun) {
        console.warn(
          `[${config.id}] --fetch-listing requested but HTML/API parser is not implemented. Falling back to planned URL list (no remote scrape).`,
        );
      } else {
        console.info(`[${config.id}] plan only (dry-run or stub) — not implemented: full scrape.`);
      }

      return [
        {
          url: config.listingUrl,
          titleHint: `${config.name} listing`,
        },
      ];
    },
  };
}
