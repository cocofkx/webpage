# Kexin Fu research portfolio

A privacy-conscious Quarto portfolio for Kexin Fu's Summer 2027 search for PhD-level internships in biostatistics, statistical data science, and quantitative research.

The site is project-first rather than résumé-first. It includes substantive research pages, approved publications and posters, an About page focused on research perspective and collaboration, and a download-only page for the sanitized public résumé PDF.

## Required software

- [Quarto](https://quarto.org/docs/get-started/)
- A current web browser
- Git, for version control and deployment

No R, Python, Node.js, database, or server is required to render the website.

## Preview and render

From the repository root:

```bash
quarto preview
```

To produce the static site under `_site/`:

```bash
quarto render
```

## Content locations

- Public profile and optional links: `data/profile.yml`
- Project metadata: `data/projects.yml`
- Awards: `data/awards.yml`
- Research pages: `research/`
- Approved public documents: `assets/docs/`
- Headshot and public images: `assets/img/`
- Missing information and approvals: `CONTENT_TODO.md`

Empty optional URLs in `data/profile.yml` should remain empty until approved. Do not add placeholder URLs.

## Updating the headshot

Replace `assets/img/headshot-source.jpeg` with an approved JPG or JPEG. Preserve the filename unless `_quarto.yml`, `index.qmd`, and `data/profile.yml` are updated together. Use a high-resolution professional image with room for a responsive crop.

## Updating the public résumé

Only the sanitized résumé belongs at:

```text
assets/docs/Kexin_Fu_Resume_Public.pdf
```

Before replacing it, confirm that the PDF excludes phone numbers, exact home/office addresses, private links, and any unapproved information. The original résumé must remain under `private_sources/` and must never be copied into `assets/`.

## Adding approved posters or slides

1. Confirm that the entire file is approved for public distribution.
2. Copy the approved public version into `assets/docs/` using a descriptive filename.
3. Link it from the appropriate project's Outputs panel.
4. Render the site and open the link from `_site/`.
5. Search the rendered PDF and surrounding page for private or participant-level information.

Never link directly to `private_sources/`.

## GitHub Pages deployment

The website is intentionally offline during review. GitHub Pages has no publishing source, and `.github/workflows/publish.yml` is manual-only so a routine push cannot republish the site.

When the content is approved for a future public launch:

1. Complete a public-content and confidentiality review.
2. In repository **Settings → Actions → General**, confirm the required workflow permissions.
3. Manually run the Quarto Publish workflow.
4. In **Settings → Pages**, deliberately select the `gh-pages` branch.
5. Verify every page and linked PDF before sharing the URL.

## Privacy warning

GitHub repositories and GitHub Pages sites are public unless configured otherwise. Files committed even briefly may remain in Git history, forks, caches, or clones.

The following must never be committed:

- Original résumé or thesis PDFs
- Phone numbers or exact addresses
- Participant-level data or protected health information
- Internal SAPs, variable dictionaries, or workflow documents
- Sponsor-confidential information
- Unapproved research results, slides, posters, or code
- Credentials, tokens, or private-repository links

The complete `private_sources/` directory is ignored in `.gitignore`.

## If a private file is accidentally committed

Removing the current file does **not** remove it from Git history.

For an unpushed file, stop tracking the exact file and commit the removal:

```bash
git rm --cached -- "private_sources/private-source.pdf"
git commit -m "Remove private source from tracking"
```

If the file was pushed, first revoke or rotate any exposed credentials and contact affected collaborators when appropriate. Then use a history-rewriting tool such as `git filter-repo` on the exact confirmed path and coordinate a force-push with every collaborator. Do not run a broad history rewrite without reviewing the targets and making a recovery backup. GitHub Support may also need to clear cached views.

## Content-update workflow

1. Add or revise content in the relevant `.qmd` or data file.
2. Record unresolved facts or approvals in `CONTENT_TODO.md` rather than guessing.
3. Run `quarto render`.
4. Check navigation, internal links, output cards, workflow diagrams, and mobile layout.
5. Search `_site/` for phone numbers, exact addresses, private filenames, and unapproved terms.
6. Inspect `git status` before committing; confirm that `private_sources/`, `work/`, and `_site/` are absent.
7. Commit and push only after a public-content review.
