# The Monthly Pulse — Code Informatics

This repository contains two separate website routes:

- Employee newspaper: `/Newsletter/`
- Secure HR publishing workspace: `/Newsletter/hr/`

## GitHub Pages hosting

The `.github/workflows/pages.yml` workflow validates both pages and deploys them after every push to `main`.

## Supabase backend

Both pages use the existing Supabase project and its browser-safe publishable key. No service-role or database secret is included in the website source.

- Public visitors can read only editions marked `published`.
- Drafts and HR administrator records remain protected by Row Level Security.
- The HR login screen displays a single password field. The HR sign-in uses the existing verified HR Auth account internally; its email is not requested in the interface.
- Only an account with a row in `hr_admins` can edit, save, or publish.
- HR can save drafts and publish editions to the employee website.

## Monthly publishing workflow

1. Open the HR workspace and enter the HR workspace password.
2. Update stories, highlights, images, dates and headings.
3. Choose **Save Draft to Cloud**.
4. Preview the employee page and choose **Publish to Employees**.

The employee page reads only the newest published issue. Draft content is not available to anonymous visitors.

The employee newspaper and the HR editor are separate routes. Employees are not shown the HR login or publishing interface.
