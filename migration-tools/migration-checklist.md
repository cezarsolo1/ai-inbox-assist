# Database Migration Checklist

## Phase 1: Preparation
- [ ] Create new Supabase project in target organization
- [ ] Note new project URL and anon key
- [ ] Export data from current project using `export-data.sql`
- [ ] Save all data as CSV files or copy to spreadsheets

## Phase 2: Schema Setup (Run in new project's SQL Editor)
1. [ ] Run `recreate-schema.sql` - Creates all tables and types
2. [ ] Run `setup-functions.sql` - Creates custom functions  
3. [ ] Run `setup-rls-policies.sql` - Sets up security policies
4. [ ] Run `setup-triggers.sql` - Creates triggers

## Phase 3: Data Import (In order of dependencies)
1. [ ] Import `tenants` data first (no dependencies)
2. [ ] Import `user_roles` data  
3. [ ] Import `email_threads` data
4. [ ] Import `email_messages` data (depends on email_threads)
5. [ ] Import `inbox_messages` data
6. [ ] Import `outbound_messages` data
7. [ ] Import `tickets` data (depends on user auth)

## Phase 4: Edge Functions & Secrets
- [ ] Copy all edge function code to new project
- [ ] Transfer secrets:
  - [ ] OPENAI_API_KEY
  - [ ] GMAIL_CLIENT_ID  
  - [ ] GMAIL_CLIENT_SECRET
  - [ ] GMAIL_REFRESH_TOKEN
  - [ ] WEBHOOK_SECRET
- [ ] Test edge functions work correctly

## Phase 5: Update Lovable Project
- [ ] Update project connection in Lovable
- [ ] Test authentication works
- [ ] Verify all data loads correctly
- [ ] Test all functionality

## Phase 6: Validation
- [ ] Check RLS policies work (test with different user roles)
- [ ] Verify triggers function properly
- [ ] Test edge functions with new secrets
- [ ] Confirm webhooks point to correct endpoints
- [ ] Run full application test

## Rollback Plan
- Keep old project active until migration is fully validated
- Document any issues encountered
- Have connection details ready to revert if needed

## Notes
- Import order matters due to foreign key relationships
- Test with non-admin users to verify RLS policies
- Email threads must exist before importing email messages
- User roles should be imported before testing tickets functionality