# The Monthly Pulse — Code Informatics

A monthly employee newsletter with a separate secured HR publishing workspace.

## Live routes
- Employee newsletter: `https://owaisqureshifiverr-ux.github.io/Newsletter/`
- HR workspace: `https://owaisqureshifiverr-ux.github.io/Newsletter/hr.html`

## First-time hosting setup
1. In this GitHub repository open **Settings → Pages**.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. Wait for the `Deploy The Monthly Pulse to GitHub Pages` workflow to finish successfully.

## First-time HR administrator setup
1. Open the HR workspace URL above.
2. Enter the HR email address and choose a strong password, then select **Create HR account**.
3. Verify the email from the message Supabase sends; return to `hr.html` and sign in.
4. Enter the private one-time first-admin setup code supplied separately to the owner, then select **Activate first HR administrator**. The code can only be used once and expires after seven days. Do not share it with employees.
5. Once access is activated, HR can edit every newsletter field, save drafts privately, and publish the current issue to the employee link.

## Monthly workflow
- Open `hr.html` and sign in.
- Edit headlines, stories, links, dates and images in the newspaper-style editor.
- Select **Save Draft to Cloud** to save privately.
- Select **Publish to Employees** when approved. The employee page automatically loads the latest published issue from the database; no monthly HTML replacement is required.

## Security and content visibility
- The HR workspace uses Supabase Auth and database Row Level Security. The publishable client key is designed for browser use; no service-role or database secret is included in either HTML file.
- The employee route can only read rows marked `published`. Drafts and HR administrator records are not available to anonymous visitors.
- This GitHub repository is public, and GitHub Pages content is publicly reachable on the web. Share only company-approved content cleared for public web access. GitHub Pages here is not an employee-only access-control boundary.
- Supabase Auth must allow the GitHub Pages callback URL. In Supabase **Authentication → URL Configuration**, set Site URL to `https://owaisqureshifiverr-ux.github.io/Newsletter/` and add `https://owaisqureshifiverr-ux.github.io/Newsletter/*` to Redirect URLs.

The current November 2026 record starts as a private draft containing the section prompts from the supplied Word template. Add verified company stories before publishing.
