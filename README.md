# Company Newsletter — Code Informatics

This repository contains two separate website routes:

- Employee newspaper: `/Newsletter/`
- Secure HR publishing workspace: `/Newsletter/hr/`

## Hosting and deployment

The `.github/workflows/pages.yml` workflow checks both website routes and their inline JavaScript, then deploys the site to GitHub Pages after every push to `main`.

## Shared publication data

The HR workspace and employee newspaper use the same `newsletter_editions.publication` JSON document in Supabase.

- **Save Draft to Cloud** stores HR edits without showing them to employees.
- **Publish to Employees** writes the complete publication, including text, cards, URLs, pictures, hidden sections and custom sections.
- The employee route loads the newest published edition and re-renders the whole page from that publication document.
- The section manager can remove or restore standard page sections.
- HR can add and permanently delete custom sections, then add, edit or remove content cards inside them.
- Existing HR database permissions remain in force; only an approved HR administrator can save or publish.
- Public visitors can read only editions marked `published`.

## Monthly publishing workflow

1. Open the HR workspace and enter the private workspace password.
2. Edit any existing story, heading, date, link or picture.
3. Add/remove cards or use **Section Manager** to remove/restore a standard section.
4. Use **Add New Section** for additional content areas.
5. Choose **Save Draft to Cloud** to keep work private, or **Publish to Employees** to make the new edition live.

The employee newspaper and HR editor are separate routes. The employee page does not include HR login or editing controls.

## Text size controls

Both routes include floating **−** and **+** controls. They change text size from 80% to 140% in 10% steps without zooming images. The selected size is saved in browser storage and shared by the employee and HR routes on the same site. Dynamically-rendered newsletter and editor content follows the selected size.


## Employee surveys

The HR Publishing Workspace includes a survey builder for draft, active, and closed surveys. HR can add 1–5 Likert-scale, multiple-choice, and open-ended questions, activate one survey on the Employee Newspaper, review anonymous question-level results, and export responses as CSV.

Survey definitions and anonymous submissions are stored in dedicated Supabase tables: `newsletter_surveys` and `newsletter_survey_responses`. Public users can read only the active survey and submit answers; only approved HR administrators can manage surveys and read responses. The employee form does not collect names or email addresses.
