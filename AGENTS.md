<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Agent.md — AI Expense Tracker

## Stack
- Framework: Next.js 15 (App Router), PWA (next-pwa or manual service worker + manifest)
- DB: Prisma + Supabase Postgres
- Storage: Cloudflare R2 (receipt images, signed URLs only, no public bucket)
- Auth: Clerk
- AI: OpenAI (GPT-4o for vision/parsing, GPT-4o-mini for cheap classification)
- UI: shadcn/ui components only — no custom component libs, no raw HTML form elements unless shadcn has no equivalent
- Icons: Phosphor Icons only — no lucide, no heroicons, no inline SVGs unless Phosphor lacks the icon
- Styling: Tailwind (shadcn default)
- Animation: Framer Motion + GSAP only. No CSS keyframes, no other animation libs.
- Deploy: Vercel

## Rules
- Every UI element: shadcn component first. Check shadcn registry before writing custom markup.
- Every icon: Phosphor. Import from `@phosphor-icons/react`.
- No client-side secrets. OpenAI/R2 calls server-side only (route handlers or server actions).
- All AI responses validated with Zod before DB write. Never trust raw LLM JSON.
- All money fields: integer paise/cents in DB, format on display. No floats for currency.
- All mutating routes: rate limited.
- All user input in notes/chat fields: sanitized before passed to LLM prompt (prompt injection risk).

## Data models (Prisma, core)
- User (Clerk-synced)
- Account (cash/card/UPI/wallet)
- Transaction (amount, category, merchant, date, notes, accountId, receiptUrl, tags[])
- Category (custom, user-scoped)
- Budget (categoryId, monthlyLimit)
- Goal (targetAmount, deadline, currentAmount)
- RecurringTransaction (pattern detection output)
- MoodLog (optional, linked to Transaction)
- Debt (balance, interestRate, minPayment, type: loan/credit-card)

## Feature list

### Core tracking
- Manual entry: amount, category, merchant, date, notes
- NL text entry: "1200 swiggy dinner" → parsed via LLM → confirm → save
- Bill/screenshot upload → GPT-4o vision → structured JSON → confirm → save
- Multi-transaction screenshot split (bank statement chunks)
- Recurring transaction detection
- Custom categories + tags
- Multi-account support
- Receipt image per transaction (R2, signed URL)
- Auto-split shared expenses

### Conversational (primary AI interface)
- General finance chat: free-form Q&A on spend history, trends, category comparisons — "why did I overspend last month," "what's my biggest leak," "how much on food last month"
- Purchase advisor: intent under chat — "buy X for ₹Y?" checks category spend, income ratio, goals
- Price-check advisor: web search market price, flag overpay
- Goal-aware advice
- What-if simulator
- Voice entry (mobile)
- Anomaly detection
- Category auto-suggest, learns from corrections
- Bill negotiation nudge: flag rarely-used subscriptions
- Receipt splitting by category: one bill, multiple categories, AI itemizes and splits
- Duplicate transaction detector: same amount/merchant/day across manual + screenshot, flag before double-count
- Merchant enrichment: messy strings ("SWIGGY*BLR0912") → clean name + logo + category, cached lookup
- Debt payoff optimizer: loans/credit card balances → avalanche vs snowball suggestion
- Smart notification timing: nudge before typical spend spike, not random time
- Contextual advisor alternatives: verdict + cheaper substitute or better timing (post-payday, sale season)
- Spending personality summary: periodic profile ("saver," "impulse spender," "planner"), feeds advice tone
- Negotiated bill detection: recurring bill amount change (rent hike, plan upgrade) flagged for review

### Predictive
- Cash flow forecast: month-end balance from velocity + known bills
- Overspend early warning
- Salary-to-salary runway

### Behavioral
- Spend trigger detection (day/time patterns)
- Emotional spend flag (optional mood tag)
- Streak tracking

### Insights/reporting
- Weekly/monthly digest
- Budget leak finder
- Category breakdown charts
- Income vs expense trend
- Spend heatmap
- Merchant ranking
- Auto-generated monthly narrative summary
- Year-in-review report
- Tax-deductible flagging (80C/80D hints)

### Budgeting/goals
- Monthly budget per category, overspend alerts
- Savings goal tracker
- Bill due reminders

### UX/infra
- Dashboard: summary cards, recent transactions, quick-add
- Search/filter
- CSV/PDF export
- Offline entry queue, sync on reconnect (PWA core requirement)

### Security
- JWT + refresh token rotation (Clerk handles this)
- Session timeout, re-auth for sensitive actions (export, delete all)
- PIN/biometric lock on app open
- Encrypt sensitive fields at rest (account numbers, bank refs) — AES-256, standard encryption, no E2EE
- Signed URLs for receipts
- Validate file type/size before vision call
- Upload rate limit per user
- Strip EXIF from uploaded images
- Sanitize input before LLM prompts
- Zod validation on all AI output
- Cost caps per user per day (AI calls)
- Audit log for delete/edit
- Input validation on amount fields
- No memory leaks: cleanup listeners/timers/subscriptions in useEffect, close DB connections properly, no unbounded caches
- No N+1 queries: use Prisma `include`/`select` for relations, batch queries, `findMany` over loop-based `findUnique`. Audit with query logging in dev.
- Follow OWASP Top 10 as baseline (injection, broken auth, sensitive data exposure, XXE, broken access control, security misconfig, XSS, insecure deserialization, known vulns, insufficient logging)
- Least privilege on all API keys/service roles (Supabase RLS enabled, R2 scoped tokens, no wildcard permissions)
- Dependency scanning (`npm audit`, Dependabot or similar) in CI
- Secrets never committed, `.env*` gitignored, rotate keys on suspected leak

## AI call conventions
- Structured output: system prompt forces JSON-only, no preamble, no markdown fences.
- Every AI route: try/catch, fallback to manual entry form on parse failure.
- Vision parse confidence < threshold → flag for manual review, don't auto-save.
- Cache category-suggestion embeddings if using similarity matching (pgvector, optional v2).

## PWA requirements
- manifest.json: icons, name, theme color
- Service worker: cache shell, offline transaction queue (IndexedDB or localStorage fallback)
- Install prompt handling
- Works offline for entry; syncs on reconnect

<!-- END:nextjs-agent-rules -->
