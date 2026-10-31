# The Monthly Pulse — Code Informatics

A monthly employee newsletter with a separate secured HR publishing workspace.

## Active website links
- **Employee newsletter:** https://hotyjsgogisglrbgmtns.supabase.co/functions/v1/monthly-pulse
- **HR workspace (private sign-in):** https://hotyjsgogisglrbgmtns.supabase.co/functions/v1/monthly-pulse?view=hr

The pages are currently served by the active Supabase Edge Function `monthly-pulse`. GitHub contains the source files and a Pages workflow; GitHub Pages itself is not enabled yet because the connected GitHub integration cannot create the Pages site. To move hosting to GitHub's domain later, open **Settings → Pages → Build and deployment → Source → GitHub Actions** and save.

## First-time HR administrator setup
1. In Supabase **Authentication → URL Configuration**, set **Site URL** to the employee newsletter URL above.
2. Add this **Redirect URL**: `https://hotyjsgogisglrbgmtns.supabase.co/functions/v1/monthly-pulse*`
3. Open the HR workspace URL above.
4. Enter the HR email address and choose a strong password, then select **Create HR account**.
5. Verify the email from the message Supabase sends, return to the HR workspace and sign in.
6. Enter the private one-time first-admin setup code supplied separately to the owner, then select **Activate first HR administrator**. The code can only be used once and expires seven days after setup. Never share it with employees.
7. After activation, the HR workspace unlocks.

## Monthly workflow
- Open the HR workspace and sign in.
- Edit headlines, stories, links, dates and images in the original newspaper-style editor.
- Select **Save Draft to Cloud** to save privately.
- Select **Publish to Employees** when approved. The employee page automatically loads the latest published issue; no monthly HTML replacement is required.

## Security and publication
- The HR workspace uses Supabase Auth and database Row Level Security. The publishable client key in the pages is designed for browser use; no service-role or database secret is included in either HTML page.
- The employee route can only read rows marked `published`. Drafts and HR administrator records are not available to anonymous visitors. The anonymous-access policy was tested: a simulated published record was visible, while drafts and HR-admin rows were not.
- The one-time first-admin setup code is not stored in this repository or in either HTML page.
- GitHub repository visibility is public. Supabase-hosted pages are publicly reachable too; publish only content approved for public web access. The employee link does not require employee sign-in.
- The current November 2026 record begins as a private draft with the sections from the supplied Word template. Add verified company stories before publishing.

## Source repository
https://github.com/owaisqureshifiverr-ux/Newsletter
