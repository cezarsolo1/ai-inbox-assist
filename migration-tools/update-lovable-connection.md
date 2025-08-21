# Update Lovable Project Connection

After completing the database migration, you'll need to update your Lovable project to point to the new Supabase project.

## Step 1: Get New Project Details
From your new Supabase project dashboard:
- Project URL: `https://[new-project-ref].supabase.co`
- Anon Key: Found in Settings > API > Project API keys

## Step 2: Update Lovable Project
In Lovable, you'll need to update the connection to point to your new Supabase project. This typically involves:

1. **Update Project Settings**: In your Lovable project settings, change the Supabase connection details
2. **Update any hardcoded references**: Check for any hardcoded project references in your code

## Current Connection Details (to replace):
- Current URL: `https://bubdrdrhtqhoqtjayhlc.supabase.co`
- Current Project ID: `bubdrdrhtqhoqtjayhlc`

## Files that may need updates:
- `src/integrations/supabase/client.ts` (if it contains hardcoded values)
- Any configuration files with Supabase references

## Testing Checklist:
- [ ] Authentication works
- [ ] Data loads correctly in all pages
- [ ] Inbox messages display
- [ ] Email threads load
- [ ] Tickets functionality works
- [ ] User roles and permissions work
- [ ] Edge functions respond correctly

## Troubleshooting:
- If you see 404 errors, check the project URL
- If you see authentication issues, verify the anon key
- If RLS policies don't work, ensure user authentication is properly configured
- Check browser console for any connection errors

Remember: Keep your old project active until you've fully validated the new setup!