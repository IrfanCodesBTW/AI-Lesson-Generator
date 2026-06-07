# Cleanup Tasks (post-Railway migration)

After the Railway migration, the following orphan services remain on free tiers. They cost nothing but should be removed for hygiene.

## Render — Suspend or delete

**Web service**: `ai-lesson-generator-api` (id `srv-d8illo48aovs738eknsg`, region Singapore, free plan)
**Postgres**: `ai-lesson-generator-db` (id `dpg-d8im87jtqb8s73batfp0-a`, region Oregon, free plan)

Steps:

1. Go to https://dashboard.render.com
2. Web Services → `ai-lesson-generator-api` → **Suspend** (top right) or **Settings → Delete Service**
3. PostgreSQL → `ai-lesson-generator-db` → **Suspend** or **Settings → Delete**

The Render MCP does not expose a suspend or delete operation, so this must be done via the dashboard.

## Supabase — Delete project

**Project**: `betskshhivqwvbamhatm` (Mumbai `ap-south-1` region, IPv6-only — incompatible with Render's IPv4-only free tier, which is why we migrated to Railway)

Steps:

1. Go to https://supabase.com/dashboard/project/betskshhivqwvbamhatm/settings/general
2. Scroll to **Danger Zone** → **Delete Project**
3. Type the project name to confirm

The Supabase MCP does not expose a project delete operation.

## Cost impact

- Render free tier: $0.00/month (will spin down after 15 min idle; re-uses 750 free hours/month)
- Supabase free tier: $0.00/month (paused after 1 week of inactivity)
- Railway free tier: $0.00/month (includes $5 of usage; Postgres + Web Service use ~$1-2/month)

Net: $0 currently; Railway has the most generous limits and is the long-term home.
