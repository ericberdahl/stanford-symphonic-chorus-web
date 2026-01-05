# Quick Start: Extract Performance Data from Syllabus PDF

## 1. Install Dependencies

```bash
pip3 install -r scripts/requirements.txt
```

## 2. Run the Extraction

```bash
./scripts/extractSyllabusToYaml.py "public/assets/syllabi/SSC Syllabus Winter 2026.pdf" \
    -o data/performances/2026-winter.yml
```

## 3. Review and Edit

Open `data/performances/2026-winter.yml` and verify:

- [ ] Quarter name is correct
- [ ] Repertoire (composer and title)
- [ ] Soloists (names and voice parts)
- [ ] All dates and times in the schedule
- [ ] Registration fee

Then add:

- [ ] Description text for the website
- [ ] Registration links (if available)
- [ ] Practice file links (if available)
- [ ] Poster/herald image references (if available)
- [ ] Concert ticket links (when available)

## 4. Test

```bash
npm run build
npm run dev
```

Navigate to http://localhost:3000 and check the performance page.

## That's it!

For more details, see [scripts/README.md](README.md)


