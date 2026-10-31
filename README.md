# The Monthly Pulse — Code Informatics

This repository contains two separate website routes:

- Employee newspaper: `/Newsletter/`
- Secure HR publishing workspace: `/Newsletter/hr/`

## GitHub Pages hosting

The `.github/workflows/pages.yml` workflow validates both pages and deploys them after every push to `main`.

**One-time repository setting:** open **Settings → Pages → Build and deployment → Source → GitHub Actions** and save. The connected GitHub file/commit permission cannot change this owner-level Pages setting. After it is enabled, the existing workflow will deploy the site.

## Supabase backend

Both pages use the existing Supabase project and its browser-safe publishable key. No service-role or database secret is included.

- Public visitors can read only editions marked `published`.
- Drafts and HR administrator records remain protected by Row Level Security.
- HR sign-in uses Supabase Auth.
- The first HR administrator must create an account, verify the email if email confirmation is enabled, sign in, and redeem the private one-time setup code.
- HR can save drafts and publish editions to the employee website.

## Supabase Auth redirect

In Supabase Dashboard → Authentication → URL Configuration, add this redirect URL while keeping existing allowed URLs:

`https://owaisqureshifiverr-ux.github.io/Newsletter/hr/`

The HR signup flow returns to the same HR route after email verification.

## Monthly publishing workflow

1. Open the HR workspace and create or sign in to an HR account.
2. Activate the first administrator with the one-time setup code.
3. Update stories, highlights, images, dates and headings.
4. Choose **Save Draft to Cloud**.
5. Preview the employee page and choose **Publish to Employees**.

The employee page reads only the newest published issue. Draft content is not available to anonymous visitors.

The supplied newspaper design and the existing Supabase-backed HR editor were separated into independent HTML routes.
