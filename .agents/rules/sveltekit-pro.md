---
trigger: always_on
---

# SvelteKit Expert Agent Workflow

This workflow enhances the AI's capabilities to natively act as an expert SvelteKit systems engineer. Whenever the user invokes this skill (or asks for a SvelteKit-related feature development), explicitly follow these step-by-step instructions.

## Step 1: Context Detection (Research Phase)

- **Identify Framework Environment:** Use `list_dir` or `view_file` to read `package.json` in the active workspace.
- **Determine Svelte Version:** Discover if the project uses Svelte 4 or Svelte 5 (Runes). Look out for dependencies `svelte: "^5.x"` or `svelte: "^4.x"`.
- **Identify Tooling:** Find out if TypeScript and TailwindCSS are employed.
- Do NOT proceed to coding until you know the exact context.

## Step 2: Intent Analysis

Analyze the user's task description to categorize it into one of three intents. This will drive the rules you must apply.

- **FRONTEND:** Focus exclusively on UI components, layouts, client side stores, and styling.
- **FULLSTACK:** Focus on end-to-end features involving server-side operations, database queries, authentication forms, and frontend integration.
- **HYBRID:** Focus on statically serving an app or pure frontend integrations over 3rd-party APIs.

## Step 3: Hardcoded SvelteKit Policy Enforcement

Before drafting any code, you MUST mentally apply the following architectural constraints based on the detected context and intent. A failure to follow these rules constitutes a failed execution.

### Global Rules

1. **Svelte 5 Mandate:** If Svelte 5 is detected, you MUST use Svelte Runes exclusively (e.g., `$state()`, `$derived()`, `$effect()`, `$props()`). Do NOT use `export let` or reactive declarations (`$:`) under any circumstances unless strictly maintaining an old component.
2. **TypeScript First:** Favor standard TypeScript `<script lang="ts">` implementation if explicitly defined in context.

### Backend / Server Constraints

3. **Secrecy:** Never expose `$env/static/private` or `$env/dynamic/private` inside `.svelte` components or `+page.ts` files.
4. **Data Fetching:** For databases (like Prisma/Drizzle) or secret integrations, you MUST isolate logic within `+page.server.ts` form actions/load functions, or `+server.ts` API endpoints.
5. **Form Actions:** Prefer SvelteKit's built-in Form Actions (`export const actions = { default: async () => {} }`) placed in `+page.server.ts` instead of writing custom client-side fetch methods, wherever applicable.

### Frontend Constraints

6. **No Server Leaks:** For FRONTEND intent, strictly output `+page.svelte` or client load files (`+page.ts`).

## Step 4: Validation Gatekeeper

Before executing code changes via file modification tools:

- Self-check the drafted structure.
- Assert 1: `import { PrismaClient }` OR `$env/*/private` is NEVER in `*.svelte` or `+page.ts`.
- Assert 2: Only Svelte 5 Runes are used if a Svelte 5 environment applies.
- If assertions fail, automatically rewrite your code payload internally before committing any files.

## Step 5: Execute & Report

- Apply changes securely using your native file-editing tools.
- Summarize the actions taken to the user, briefly mentioning the context discovered (e.g., "Created Svelte 5 Reactive Button based on Fullstack guidelines, and routed through +page.server.ts").
