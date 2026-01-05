# SSC Scripts

This directory contains utility scripts for managing Stanford Symphonic Chorus data.

## extractSyllabusToYaml.py

A Python script that automatically extracts performance data from SSC syllabus PDFs and generates YAML files for the website.

### Features

- **Automatic extraction** of quarter information, repertoire, soloists, schedule, and more
- **Intelligent parsing** of PDF text with pattern matching and date recognition
- **YAML generation** with proper formatting and all HOWTO comments preserved
- **Preview mode** to inspect extracted text before generation
- **Sophisticated schedule parsing** that distinguishes between rehearsals, sectionals, dress rehearsals, and concerts

### Installation

Install the required Python packages:

```bash
pip3 install -r scripts/requirements.txt
```

Or install individually:

```bash
pip3 install pdfplumber python-dateutil pyyaml
```

### Usage

#### Basic Usage

Generate a YAML file from a syllabus PDF:

```bash
./scripts/extractSyllabusToYaml.py "public/assets/syllabi/SSC Syllabus Winter 2026.pdf"
```

This will print the generated YAML to stdout.

#### Save to File

Generate and save to a specific file:

```bash
./scripts/extractSyllabusToYaml.py \
    "public/assets/syllabi/SSC Syllabus Winter 2026.pdf" \
    -o data/performances/2026-winter.yml
```

#### Preview Extracted Text

See what text is being extracted from the PDF before generating YAML:

```bash
./scripts/extractSyllabusToYaml.py \
    "public/assets/syllabi/SSC Syllabus Winter 2026.pdf" \
    --preview
```

### What Gets Extracted

The script attempts to extract the following information:

✅ **Automatically Extracted:**
- Quarter name (e.g., "Winter 2026")
- Syllabus filename
- Director/Conductor name
- Instructor name
- Registration fee
- Soloists (names and voice parts)
- Collaborating organizations (e.g., SSO)
- Schedule:
  - Tutti rehearsals (with start/end dates and times)
  - Men's sectionals
  - Women's sectionals
  - Dress rehearsals
  - Concert dates and times (including call times)
  - Special notes (e.g., registration times)

⚠️ **Partially Extracted / May Need Manual Review:**
- Repertoire (composer and title)
  - The script tries to identify the main piece and supporting works
  - Complex arrangements or multi-movement selections may need manual editing
- Time extraction for sectionals
  - Default location is "Braun 103" but may vary

❌ **Not Extracted (must be added manually):**
- Poster information
- Herald images
- Practice file links
- Score prices (unless explicitly stated)
- Membership limits (defaults to 220)
- Registration links
- Concert ticket links
- Event descriptions

### Post-Extraction Steps

After generating the YAML file, you should:

1. **Review the repertoire section** - Verify composer names and work titles are correct
2. **Check all dates and times** - Ensure they match the syllabus exactly
3. **Add missing information:**
   - Registration links (if available)
   - Practice file links
   - Poster/herald image references
   - Concert ticket links
   - Description text for the website
4. **Verify soloists** - Check spelling and voice parts
5. **Test the build** - Run `npm run build` to ensure the YAML is valid

### Example Workflow

Complete workflow for creating a new quarter:

```bash
# 1. Extract from PDF
./scripts/extractSyllabusToYaml.py \
    "public/assets/syllabi/SSC Syllabus Spring 2027.pdf" \
    -o data/performances/2027-spring.yml

# 2. Edit the generated file to:
#    - Verify all extracted data
#    - Add registration links
#    - Add practice file links
#    - Write description text
#    - Add poster references

# 3. Test the build
npm run build

# 4. Preview locally
npm run dev
```

### Troubleshooting

**Problem:** Script reports "Error: Required package not installed"
**Solution:** Install dependencies with `pip3 install -r scripts/requirements.txt`

**Problem:** Repertoire extraction is incorrect
**Solution:** The REPERTOIRE section in PDFs can vary in format. Manually edit the generated YAML to correct composer and title fields.

**Problem:** Schedule dates are off by a year
**Solution:** The script infers the year from the quarter name. Ensure the PDF clearly states the year (e.g., "Winter 2026").

**Problem:** Times are in wrong format
**Solution:** The script converts to 24-hour format. Double-check HH:MM times in the generated file.

### Tips

- Always use the `--preview` flag first to see what text is being extracted
- Compare the generated YAML with a previous quarter's file to ensure consistency
- The script preserves all HOWTO comments, making it easy to know what each field does
- Generated files are meant to be edited - don't expect 100% perfect extraction

### Technical Details

**PDF Parsing:** Uses `pdfplumber` library for robust PDF text extraction

**Date Recognition:** Handles multiple date formats:
- `1/5/2026`
- `January 5, 2026`
- `Monday 1/5/2026`

**Time Parsing:** Automatically converts 12-hour to 24-hour format

**Pattern Matching:** Uses regular expressions to identify sections like REPERTOIRE, SCHEDULE, etc.

**YAML Generation:** Maintains exact formatting and comments used in existing performance files

### Contributing

To improve the extraction logic:

1. Edit `extractSyllabusToYaml.py`
2. Test with multiple syllabus PDFs from different quarters
3. Ensure backward compatibility with existing PDF formats
4. Update this README with any new features or changes

### Support

If you encounter issues with extraction, you can:

1. Use the `--preview` flag to debug what's being extracted
2. Manually create/edit the YAML file using previous quarters as templates
3. Check the inline HOWTO comments in the generated YAML for guidance
4. Review existing performance YAML files in `data/performances/` for examples


