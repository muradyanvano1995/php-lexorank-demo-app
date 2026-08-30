# LexoRank integration

## Installed version

- Packagist: `muradyanvano/php-lexorank`
- Exact version: **v0.1.2** (verify with `composer show muradyanvano/php-lexorank`)
- v0.1.2 is documentation-only in the package; demo rank math and API behavior match v0.1.1

## Laravel wiring

- Auto-discovered `MuradyanVano\LexoRank\Laravel\LexoRankServiceProvider`
- Singletons: `LexoRankService`, `Rebalancer`
- Facade: `MuradyanVano\LexoRank\Laravel\Facades\LexoRank` (alias `LexoRankFacade`)
- Config: publishable `lexorank` (`max_count`, `max_rank_length`, `column`)

## Task model

```php
use MuradyanVano\LexoRank\Laravel\Casts\LexoRankCast;
use MuradyanVano\LexoRank\Laravel\Concerns\HasLexoRank;

// casts: 'rank' => LexoRankCast::class
// trait: HasLexoRank
// unique: ['column_id', 'rank']
```

Persist **canonical** strings from `$rank->toString()`. Column: `string('rank', 255)`.

## Movement algorithm (`TaskRankingService`)

Request body:

```json
{ "column_id": 2, "before_id": 15, "after_id": 16 }
```

- `before_id` = previous/lower neighbor; `after_id` = next/upper neighbor.
- Validate destination column; neighbors must belong to destination; forbid self-neighbors.
- Empty / start / end / between supported (null neighbors).
- Same-column and cross-column moves.
- Lock rows → reload neighbors → `LexoRankService::between($lower, $upper)` → save.
- On unique violation: reload + recompute, max **3** attempts → **409**.

## Seeding

Use `LexoRankService::initialRanks($count)` for deterministic evenly spaced ranks — never floats/timestamps/random strings.

## Rebalancing (`ColumnRebalanceService`)

1. Transaction + `lockForUpdate` ordered by rank.
2. `Rebalancer::rebalance($orderedRankStrings)` → next bucket + mapping.
3. Apply mapping with query-builder string updates (avoid inventing non-canonical placeholders that would break `LexoRankCast` hydration).
4. Return old→new mapping, before/after max lengths, target bucket.

## Diagnostics

Per column: task count, min/max/avg rank length, bucket histogram, duplicates, `shouldRebalance` soft length (default 64).

## Hard rules

- **No JavaScript LexoRank implementation.**
- SPA sends neighbor IDs only; ranks are opaque strings from the API.
