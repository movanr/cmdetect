import type { Page } from "playwright";

/**
 * Injects gremlins.js and runs random interaction stress testing.
 * Clicks buttons, fills forms, scrolls — for a configurable duration.
 */
export async function unleashGremlins(
  page: Page,
  durationMs = 5000
): Promise<void> {
  // Inject gremlins.js from unpkg
  await page.addScriptTag({
    url: "https://unpkg.com/gremlins.js",
  });

  // Wait for the script to load
  await page.waitForFunction(() => !!(window as any).gremlins, {
    timeout: 10000,
  });

  await page.evaluate((duration) => {
    return new Promise<void>((resolve) => {
      const gremlins = (window as any).gremlins;

      const horde = gremlins.createHorde({
        species: [
          gremlins.species.clicker(),
          gremlins.species.toucher(),
          gremlins.species.formFiller(),
          gremlins.species.scroller(),
        ],
        mogwais: [gremlins.mogwais.alert(), gremlins.mogwais.fps()],
        strategies: [
          gremlins.strategies.distribution({
            delay: 50,
          }),
        ],
      });

      // Race: gremlins completion vs timeout
      const timeout = setTimeout(resolve, duration);
      horde
        .unleash()
        .then(() => {
          clearTimeout(timeout);
          resolve();
        })
        .catch(() => {
          clearTimeout(timeout);
          resolve();
        });
    });
  }, durationMs);
}
