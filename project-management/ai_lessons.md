# AI Self-Improvement Loop (Lessons Learned)

> **CORE RULE:** EVERY AI agent must read this file BEFORE starting a task or writing code in this repository.
> If an agent is corrected by the human operator, the agent MUST append the lesson learned to this document to prevent future agents from making the exact same mistake.

---

## 📚 Lessons

_(Append new lessons below this line using the format: `**[Date] Context:** Lesson learned`)_

**[2026-03-05] Database Mapping — Always verify against the live database export:**
When creating or updating `database_mapping.md`, NEVER write table definitions from memory, old docs, or FRD assumptions. Always compare against a fresh Supabase schema export (`supabase-export.md`) first. In this project, our mapping had phantom tables (`user_actions`, `ai_analysis`, `gamification_data`) that didn't exist, and missed ~20 actual tables (learning, rewards, granular gamification). The mapping document is located at `web-applications/<backend>/database/schema/database_mapping.md`.

**[2026-03-05] Seeding Scripts — Use real user IDs, not fake UUIDs:**
The `public.users` table has a FK constraint on `auth.users`. You cannot insert rows with fabricated UUIDs. Instead, query existing `public.users` first and use their real IDs for seeding dependent tables. If no users exist, skip user-dependent seeding and instruct the developer to create users via the auth flow first.

**[2026-03-05] Column Names — Always match the exact Supabase schema:**
Do not assume column names from business logic or PRD. For example: `career_status` → `employment_type`, `risk_appetite` → `risk_tolerance`, `tier` → `current_tier`, `total_income` → `monthly_income`, `deadline` → `target_date`, `goals` table → `financial_goals` table. Always cross-reference the Supabase export before writing any database interaction code.

**[2026-03-05] Supabase-py Version Compatibility:**
`supabase-py 2.3.7` is incompatible with `httpx >=0.28` (causes `proxy` kwarg error). The fix is to upgrade to `supabase-py 2.28.0+`. After upgrading, also upgrade `websockets` to `>=13` (the `realtime` module needs `websockets.asyncio`). Keep dependencies in sync.

**[2026-03-06] Flutter Testing — Use `pumpApp` helper, not manual `MaterialApp`:**
When writing widget tests, NEVER wrap widgets in manual `MaterialApp`, `Scaffold`, `ProviderScope`, or `RepositoryProvider` calls. Always use the `pumpApp` test helper from `test/helpers/pump_app.dart`. It automatically sets up the full widget tree with providers and mocks. Example:

```dart
// WRONG:
await tester.pumpWidget(
  MaterialApp(
    home: Scaffold(
      body: MyWidget(),
    ),
  ),
);

// CORRECT:
await tester.pumpApp(
  const MyWidget(),
  overrides: [someProvider.overrideWithValue(mockValue)],
);
```

This ensures consistent test environments and prevents hard-to-debug issues.
