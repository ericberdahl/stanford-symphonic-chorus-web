#!/usr/bin/env python3
"""
Extract performance data from SSC syllabus PDF and generate YAML file.

This script parses a Stanford Symphonic Chorus syllabus PDF and extracts
structured information to generate a performance YAML file.

Dependencies:
    pip install pdfplumber python-dateutil pyyaml

Usage:
    ./extractSyllabusToYaml.py "public/assets/syllabi/SSC Syllabus Winter 2026.pdf"
    
    Or with output file:
    ./extractSyllabusToYaml.py "public/assets/syllabi/SSC Syllabus Winter 2026.pdf" -o data/performances/2026-winter.yml
"""

import argparse
import pdfplumber
import re
import yaml
from datetime import datetime, timedelta
from dateutil import parser as date_parser
from typing import Dict, List, Optional, Tuple
import sys
from pathlib import Path


class SyllabusExtractor:
    """Extract structured data from SSC syllabus PDF."""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.text = ""
        self.lines = []
        
    def extract_text(self) -> str:
        """Extract all text from PDF."""
        with pdfplumber.open(self.pdf_path) as pdf:
            self.text = "\n".join(page.extract_text() or "" for page in pdf.pages)
            self.lines = [line.strip() for line in self.text.split('\n') if line.strip()]
        return self.text
    
    def extract_quarter(self) -> str:
        """Extract quarter name (e.g., 'Winter 2026')."""
        # Look for patterns like "Winter 2026", "Spring 2025", "Fall 2024"
        match = re.search(r'\b(Winter|Spring|Fall)\s+(\d{4})\b', self.text, re.IGNORECASE)
        if match:
            return f"{match.group(1).capitalize()} {match.group(2)}"
        return ""
    
    def extract_syllabus_filename(self) -> str:
        """Extract syllabus base filename from PDF path."""
        # Get filename without extension
        filename = Path(self.pdf_path).stem
        return filename
    
    def extract_repertoire(self) -> Dict[str, List[Dict]]:
        """Extract repertoire information."""
        repertoire = {"main": [], "other": []}
        
        # Look for the REPERTOIRE section specifically
        repertoire_text = ""
        in_section = False
        
        for i, line in enumerate(self.lines):
            # Start of repertoire section
            if re.match(r'^REPERTOIRE:', line, re.IGNORECASE):
                in_section = True
                # Include the rest of this line too
                repertoire_text += line[len("REPERTOIRE:"):].strip() + "\n"
                continue
            
            # End of section (when we hit next major section like ENROLLMENT, ATTENDANCE, etc.)
            if in_section and re.match(r'^[A-Z][A-Z\s]+:', line):
                break
            
            if in_section:
                repertoire_text += line + "\n"
        
        # Extract composer and work from the repertoire text
        pieces = []
        
        # Look for main pattern like "Giuseppe Verdi: Requiem" (first major work mentioned)
        main_match = re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s*:\s*([A-Za-z\s\'\-,]+?)(?:\s+with\s+|$)', repertoire_text)
        if main_match:
            composer = self._clean_composer_name(main_match.group(1).strip())
            title = main_match.group(2).strip()
            pieces.append({"composer": composer, "title": title})
        
        # Look for additional pieces performed by orchestra (marked as "other")
        # Pattern: "The SSO performs Composer: Work &/or Composer: Work"
        sso_match = re.search(r'(?:SSO|orchestra)\s+performs?\s+(.+?)(?:\s+on\s+the\s+first|$)', repertoire_text, re.IGNORECASE)
        if sso_match:
            sso_text = sso_match.group(1)
            # Split by & or "and" to get multiple pieces
            sso_pieces_text = re.split(r'\s+&\s+|\s+and\s+', sso_text)
            
            for piece_text in sso_pieces_text:
                # Try to match "Composer: Work" pattern
                piece_match = re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)?)\s*:\s*([^&]+)', piece_text)
                if piece_match:
                    composer = self._clean_composer_name(piece_match.group(1).strip())
                    title = piece_match.group(2).strip()
                    # Clean up title
                    title = re.sub(r'\s+$', '', title)
                    pieces.append({"composer": composer, "title": title})
        
        # Main piece is usually the first one (the one SSC performs)
        if pieces:
            repertoire["main"] = [pieces[0]]
            if len(pieces) > 1:
                repertoire["other"] = pieces[1:]
        
        return repertoire
    
    def _clean_composer_name(self, name: str) -> str:
        """Clean and format composer name."""
        # Remove extra spaces
        name = re.sub(r'\s+', ' ', name).strip()
        
        # Handle "Vaughan Williams" and similar compound last names
        if "vaughan williams" in name.lower():
            parts = name.split()
            # Return as list for proper YAML formatting
            return ["Ralph", "Vaughan Williams"] if "ralph" in name.lower() else "Ralph Vaughan Williams"
        
        return name
    
    def extract_soloists(self) -> List[Dict[str, str]]:
        """Extract soloist information."""
        soloists = []
        
        # Look for patterns like "Name, soprano" or "Name (tenor)"
        for line in self.lines:
            # Pattern: "Name, voice" or "Name (voice)"
            match = re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s*[,\(]\s*(soprano|mezzo-soprano|alto|tenor|baritone|bass)\s*[\)]?', 
                            line, re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                part = match.group(2).strip().lower()
                soloists.append({"name": name, "part": part})
        
        return soloists
    
    def extract_directors_and_instructors(self) -> Tuple[List[str], List[str]]:
        """Extract directors and instructors."""
        directors = []
        instructors = []
        
        # Look for "CONDUCTOR:" pattern (more specific for SSC syllabi)
        conductor_match = re.search(r'CONDUCTOR:\s*([A-Z][a-zA-Z\s\.]+)', self.text)
        if conductor_match:
            name = conductor_match.group(1).strip()
            # Clean up any trailing words that aren't part of the name
            name = re.sub(r'\s+(Phone|E-mail|Office).*', '', name)
            directors.append(name)
            instructors.append(name)
        
        # If not found, look for common patterns
        if not directors:
            for line in self.lines:
                if re.search(r'\b(director|conductor)\b', line, re.IGNORECASE):
                    # Try to extract name after the title
                    match = re.search(r'(?:director|conductor)[:\s]+([A-Z][a-zA-Z\s\.]+)', line, re.IGNORECASE)
                    if match:
                        name = match.group(1).strip()
                        directors.append(name)
                        break
        
        # Default to Stephen M. Sano if not found
        if not directors:
            directors = ["Stephen M. Sano"]
        if not instructors:
            instructors = directors.copy()
        
        return directors, instructors
    
    def extract_dates_and_times(self) -> Dict:
        """Extract all schedule information."""
        schedule = {
            "tuttiRehearsals": [],
            "tuttiRehearsalNotes": [],
            "mensSectionals": [],
            "womensSectionals": [],
            "dressRehearsals": [],
            "concerts": [],
            "first_rehearsal_date": None
        }
        
        # Extract year from quarter
        quarter_match = re.search(r'(\d{4})', self.extract_quarter())
        year = int(quarter_match.group(1)) if quarter_match else datetime.now().year
        
        # Find SCHEDULE section
        in_schedule = False
        schedule_lines = []
        
        for line in self.lines:
            if re.match(r'^SCHEDULE:', line, re.IGNORECASE):
                in_schedule = True
                continue
            if in_schedule:
                schedule_lines.append(line)
        
        # Parse schedule table - each row typically has: Day, Date, Location, Time, Description
        # Look for patterns like "Monday 1/5/2026 CRH 7:30 pm Tutti Rehearsal"
        
        tutti_dates = []
        mens_sectional_dates = []
        womens_sectional_dates = []
        dress_dates = []
        concert_dates = []
        
        for line in schedule_lines:
            line_lower = line.lower()
            
            # Try to extract date
            date_match = re.search(r'(\d{1,2})/(\d{1,2})/(\d{4})', line)
            if not date_match:
                continue
            
            month = int(date_match.group(1))
            day = int(date_match.group(2))
            year = int(date_match.group(3))
            
            try:
                parsed_date = datetime(year, month, day)
                date_str = parsed_date.strftime("%Y-%m-%d")
            except ValueError:
                continue
            
            # Extract time - look for time ranges first (e.g., "5:30-6:30 pm")
            time_range_match = re.search(r'(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\s*(am|pm)', line, re.IGNORECASE)
            start_time = None
            end_time = None
            
            if time_range_match:
                # Start time
                start_hour = int(time_range_match.group(1))
                start_minute = int(time_range_match.group(2))
                # End time
                end_hour = int(time_range_match.group(3))
                end_minute = int(time_range_match.group(4))
                am_pm = time_range_match.group(5).lower()
                
                # Convert to 24-hour format (apply am/pm to both times)
                if am_pm == 'pm':
                    if start_hour != 12:
                        start_hour += 12
                    if end_hour != 12:
                        end_hour += 12
                elif am_pm == 'am':
                    if start_hour == 12:
                        start_hour = 0
                    if end_hour == 12:
                        end_hour = 0
                
                start_time = f"{start_hour:02d}:{start_minute:02d}"
                end_time = f"{end_hour:02d}:{end_minute:02d}"
            else:
                # Single time
                time_match = re.search(r'(\d{1,2}):(\d{2})\s*(am|pm)', line, re.IGNORECASE)
                if time_match:
                    hour = int(time_match.group(1))
                    minute = int(time_match.group(2))
                    am_pm = time_match.group(3).lower()
                    
                    if am_pm == 'pm' and hour != 12:
                        hour += 12
                    elif am_pm == 'am' and hour == 12:
                        hour = 0
                    
                    start_time = f"{hour:02d}:{minute:02d}"
            
            # Categorize based on description
            if 'dress' in line_lower and 'rehearsal' in line_lower:
                dress_dates.append({
                    "date": date_str,
                    "start": start_time or "19:00",
                    "location": "Bing"
                })
            
            elif 'concert' in line_lower and 'call' in line_lower:
                # This is an actual concert with call time
                # Look for "call" time
                call_match = re.search(r'(\d{1,2}):(\d{2})\s*pm\s*call', line, re.IGNORECASE)
                call_time = None
                if call_match:
                    call_hour = int(call_match.group(1))
                    call_minute = int(call_match.group(2))
                    if call_hour != 12:
                        call_hour += 12
                    call_time = f"{call_hour:02d}:{call_minute:02d}"
                
                # Extract actual concert time (after "concert at")
                concert_time_match = re.search(r'concert\s+at\s+(\d{1,2}):(\d{2})\s*(am|pm)', line, re.IGNORECASE)
                if concert_time_match:
                    concert_hour = int(concert_time_match.group(1))
                    concert_minute = int(concert_time_match.group(2))
                    concert_am_pm = concert_time_match.group(3).lower()
                    if concert_am_pm == 'pm' and concert_hour != 12:
                        concert_hour += 12
                    start_time = f"{concert_hour:02d}:{concert_minute:02d}"
                
                concert_dates.append({
                    "date": date_str,
                    "start": start_time,
                    "call": call_time,
                    "location": "Bing"
                })
            
            elif 'dress' in line_lower:
                dress_dates.append({
                    "date": date_str,
                    "start": start_time or "19:00",
                    "location": "Bing"
                })
            
            elif 'tenor' in line_lower and 'bass' in line_lower:
                mens_sectional_dates.append({
                    "date": date_str,
                    "start": start_time,
                    "end": end_time,
                    "line": line
                })
            
            elif any(word in line_lower for word in ['sop', 'alto', 'women']):
                womens_sectional_dates.append({
                    "date": date_str,
                    "start": start_time,
                    "end": end_time,
                    "line": line
                })
            
            elif 'tutti' in line_lower:
                note = None
                if 'registration' in line_lower:
                    reg_match = re.search(r'registration\s+begins\s+at\s+(\d{1,2}):(\d{2})\s*(am|pm)', line, re.IGNORECASE)
                    if reg_match:
                        reg_hour = int(reg_match.group(1))
                        reg_am_pm = reg_match.group(3).lower()
                        if reg_am_pm == 'pm' and reg_hour != 12:
                            reg_hour += 12
                        note = f"Registration begins at {reg_hour}:30 PM."
                        schedule["tuttiRehearsalNotes"].append({
                            "note": note,
                            "date": date_str
                        })
                
                tutti_dates.append({
                    "date": date_str,
                    "start": start_time,
                })
        
        # Analyze tutti rehearsals for patterns
        if tutti_dates and len(tutti_dates) >= 2:
            # Find start and end dates, infer weekly pattern
            tutti_dates.sort(key=lambda x: x["date"])
            first_date = tutti_dates[0]["date"]
            last_date = tutti_dates[-1]["date"]
            typical_time = tutti_dates[0]["start"]
            
            # Estimate end time (typically 2.5-3 hours for tutti)
            if typical_time:
                hour = int(typical_time.split(':')[0])
                end_hour = hour + 2
                end_time = f"{end_hour:02d}:30"
            else:
                typical_time = "19:30"
                end_time = "22:00"
            
            schedule["tuttiRehearsals"].append({
                "frequency": "weekly",
                "startDate": first_date,
                "endDate": last_date,
                "startTime": typical_time,
                "endTime": end_time,
                "location": "CRH"
            })
            schedule["first_rehearsal_date"] = first_date
        
        # Process sectionals
        if mens_sectional_dates:
            for sectional in mens_sectional_dates:
                schedule["mensSectionals"].append({
                    "frequency": "once",
                    "startDate": sectional["date"],
                    "startTime": sectional["start"] or "17:30",
                    "endTime": sectional.get("end") or "18:30",
                    "location": "Braun 103"
                })
        
        if womens_sectional_dates:
            for sectional in womens_sectional_dates:
                schedule["womensSectionals"].append({
                    "frequency": "once",
                    "startDate": sectional["date"],
                    "startTime": sectional["start"] or "17:30",
                    "endTime": sectional.get("end") or "18:30",
                    "location": "Braun 103"
                })
        
        schedule["dressRehearsals"] = dress_dates
        schedule["concerts"] = concert_dates
        
        return schedule
    
    def extract_registration_info(self) -> Dict:
        """Extract registration fee, membership limit, and related info."""
        info = {
            "registrationFee": "",
            "membershipLimit": 220,  # Default
            "scorePrice": ""
        }
        
        # Look for registration fee - specifically $XX/quarter pattern
        fee_match = re.search(r'\$(\d+)\s*/\s*quarter', self.text, re.IGNORECASE)
        if fee_match:
            info["registrationFee"] = f"${fee_match.group(1)}"
        else:
            # Try more general pattern
            fee_match = re.search(r'(?:fee|cost|charge).*?\$(\d+)', self.text, re.IGNORECASE)
            if fee_match:
                info["registrationFee"] = f"${fee_match.group(1)}"
        
        # Look for membership limit
        limit_match = re.search(r'(?:limit|maximum|max)(?:\s+of)?\s*(\d+)\s*(?:members|singers)', self.text, re.IGNORECASE)
        if limit_match:
            info["membershipLimit"] = int(limit_match.group(1))
        
        # Look for score price
        score_match = re.search(r'score[s]?\s*[:\-]?\s*\$(\d+)', self.text, re.IGNORECASE)
        if score_match:
            info["scorePrice"] = f"${score_match.group(1)}"
        
        return info
    
    def extract_collaborators(self) -> List[str]:
        """Extract collaborating organizations."""
        collaborators = []
        
        # Common collaborators
        if re.search(r'\b(Stanford Symphony Orchestra|SSO)\b', self.text, re.IGNORECASE):
            collaborators.append("SSO")
        
        return collaborators
    
    def generate_yaml(self) -> str:
        """Generate complete YAML file content."""
        self.extract_text()
        
        quarter = self.extract_quarter()
        syllabus = self.extract_syllabus_filename()
        repertoire = self.extract_repertoire()
        soloists = self.extract_soloists()
        directors, instructors = self.extract_directors_and_instructors()
        schedule = self.extract_dates_and_times()
        registration = self.extract_registration_info()
        collaborators = self.extract_collaborators()
        
        # Build YAML structure
        data = {
            "quarter": quarter,
            "syllabus": syllabus,
            "repertoire": repertoire,
            "soloists": soloists,
            "collaborators": collaborators,
            "poster": None,
            "heraldImage": None,
            "directors": directors,
            "instructors": instructors,
            "registrationFee": registration["registrationFee"],
            "scorePrice": registration["scorePrice"],
            "membershipLimit": registration["membershipLimit"],
            "registrationInfo": {},
            "tuttiRehearsalNotes": schedule.get("tuttiRehearsalNotes", []),
            "tuttiRehearsals": schedule.get("tuttiRehearsals", []),
            "mensSectionals": schedule.get("mensSectionals", []),
            "womensSectionals": schedule.get("womensSectionals", []),
            "dressRehearsals": schedule.get("dressRehearsals", []),
            "concerts": schedule.get("concerts", []),
            "practiceFiles": [],
            "events": [],
            "description": "|",
            "schedule": schedule  # Pass full schedule for template generation
        }
        
        # Generate YAML with comments
        yaml_content = self._generate_yaml_with_comments(data)
        
        return yaml_content
    
    def _generate_yaml_with_comments(self, data: Dict) -> str:
        """Generate YAML with inline comments and formatting."""
        lines = []
        schedule = data.get("schedule", {})
        
        lines.append("# HOWTO: Set quarter to a single string that names the quarter and year. Use something like \"Winter 1812\",")
        lines.append("# \"Spring 1812\", or \"Fall 1812\"")
        lines.append(f"quarter: \"{data['quarter']}\"")
        lines.append("")
        lines.append("")
        lines.append("# HOWTO: Set syllabus to the root name syllabi documents. These documents will live in the assets folder.")
        lines.append("# Use something like \"SSC Syllabus Spring 2020\". Syllabi with extensions '.pdf', '.doc', and '.docx' will")
        lines.append("# be detected and used.")
        lines.append(f"syllabus: \"{data['syllabus']}\"")
        lines.append("")
        lines.append("")
        lines.append("# HOWTO: Set repertoire to a list of items that compose the program.")
        lines.append("#")
        lines.append("# A simple piece looks like this:")
        lines.append("# -   composer: \"Ludwig von Beethoven\"")
        lines.append("#     title: \"Magnificat\"")
        lines.append("#")
        lines.append("# For more complex piece formulae, look at the reference \"HOWTO Piece syntax\"")
        lines.append("#")
        lines.append("# Repertoire is separated into main pieces and other pieces. Main and other each contain a list of pieces.")
        lines.append("# Main pieces are included in headlines describing the program. Other pieces are added when displaying the")
        lines.append("# entire program of a performance.")
        lines.append("repertoire:")
        
        if data['repertoire']['main']:
            lines.append("    main:")
            for piece in data['repertoire']['main']:
                lines.append(f"    -   composer: \"{piece['composer']}\"")
                lines.append(f"        title: \"{piece['title']}\"")
        else:
            lines.append("    main:")
        
        if data['repertoire'].get('other'):
            lines.append("    other:")
            for piece in data['repertoire']['other']:
                lines.append(f"    -   composer: \"{piece['composer']}\"")
                lines.append(f"        title: \"{piece['title']}\"")
        
        lines.append("")
        lines.append("")
        lines.append("# HOWTO: soloists is a list of individuals and the part in which they solo.")
        lines.append("# An individual soloist looks like this:")
        lines.append("# -   name: \"Plácido Domingo\"")
        lines.append("#     part: \"tenor\"")
        lines.append("soloists:")
        for soloist in data['soloists']:
            lines.append(f"-   name: \"{soloist['name']}\"")
            lines.append(f"    part: \"{soloist['part']}\"")
        
        lines.append("")
        lines.append("")
        lines.append("# HOWTO: collaborators is a list of groups with whom we collaborate on this program.")
        lines.append("# Each entry in the list should be a single string that matches the key field of a record in")
        lines.append("# data/collaborators.yml")
        lines.append("collaborators:")
        for collab in data['collaborators']:
            lines.append(f"-   \"{collab}\"")
        
        lines.append("")
        lines.append("")
        lines.append("# HOWTO:")
        lines.append("# A typical full poster record looks like this:")
        lines.append("# poster:")
        lines.append("#     basename: \"S2018-Poster\"")
        lines.append("#     caption: \"Haydn: Missa Sancti Bernardi von Offida (Heiligmesse)\"")
        lines.append("# Where basename is a root name of the poster in assets/posters directory.")
        lines.append("#       Use something like \"S2020-Poster\". Posters with extensions '.pdf', '.jpg', and '.png' will")
        lines.append("#       be detected and used.")
        lines.append("# Where caption is a string to be used as hover text for the poster image when displayed on a web page.")
        lines.append("poster:")
        lines.append("")
        lines.append("")
        lines.append("# HOWTO: heraldImage is an image associated with this quarter's program. It has the same schema as")
        lines.append("# a poster (see also)")
        lines.append("#")
        lines.append("# If poster files are not present for a quarter, the heraldImage will be used as a stand-in for")
        lines.append("# presentations where a graphic for the quarter is used. If heraldImage and poster are both absent,")
        lines.append("# the system will use a generic stand-in graphic.")
        lines.append("#")
        lines.append("# The heraldImage will also typically be used on the home page, when talking about a quarter.")
        lines.append("heraldImage:")
        lines.append("")
        lines.append("")
        lines.append("# HOWTO: directors is a list of strings that name the directors of this performance")
        lines.append("directors:")
        for director in data['directors']:
            lines.append(f"-   \"{director}\"")
        
        lines.append("")
        lines.append("")
        lines.append("# HOWTO: instructors is a list of strings that name the instructors for this quarter")
        lines.append("instructors:")
        for instructor in data['instructors']:
            lines.append(f"-   \"{instructor}\"")
        
        lines.append("")
        lines.append("")
        lines.append("# HOWTO: registrationFee is the participation fee for the quarter, typically waived")
        lines.append("# for students and faculty")
        lines.append(f"registrationFee: \"{data['registrationFee']}\"")
        lines.append("")
        lines.append("")
        lines.append("# HOWTO: scorePrice, when provided, is the price at which the score(s) for the quarter are sold.")
        lines.append(f"scorePrice: {data['scorePrice'] if data['scorePrice'] else ''}")
        lines.append("")
        lines.append("")
        lines.append("# HOWTO: membershipLimit is the maximum number of members allowed to register for")
        lines.append("# this quarter")
        lines.append(f"membershipLimit: {data['membershipLimit']}")
        lines.append("")
        lines.append("# HOWTO:")
        lines.append("# * preregister (optional) is a date in \"YYYY-MM-DD\" format by which the preregistration mail")
        lines.append("#   is expected to be sent out.")
        lines.append("# * registrationLink (optional) is a link (without http:// prefix) of an online form at which")
        lines.append("#   members should preregister")
        lines.append("# * auditionLink (optional) is a link (without http:// prefix) of an online form at which")
        lines.append("#   new members should sign up for auditions")
        lines.append("registrationInfo:")
        lines.append("#    preregister: \"2024-12-06\"")
        lines.append("")
        lines.append("")
        lines.append("tuttiRehearsalNotes:")
        if schedule.get("tuttiRehearsalNotes"):
            for note in schedule["tuttiRehearsalNotes"]:
                lines.append(f"-   note: \"{note['note']}\"")
                lines.append(f"    date: \"{note['date']}\"")
        else:
            lines.append("# -   note: \"Registration begins at 6:30 PM.\"")
            lines.append("#     date: \"2025-01-06\"")
        lines.append("")
        lines.append("tuttiRehearsals:")
        if schedule.get("tuttiRehearsals"):
            for rehearsal in schedule["tuttiRehearsals"]:
                lines.append(f"-   frequency: \"{rehearsal['frequency']}\"")
                lines.append(f"    startDate: \"{rehearsal['startDate']}\"")
                lines.append(f"    endDate: \"{rehearsal['endDate']}\"")
                lines.append(f"    startTime: \"{rehearsal['startTime']}\"")
                lines.append(f"    endTime: \"{rehearsal['endTime']}\"")
                lines.append(f"    location: \"{rehearsal['location']}\"")
        else:
            lines.append("# -   frequency: \"weekly\"")
            lines.append("#     startDate: \"2025-01-06\"")
            lines.append("#     endDate: \"2025-02-24\"")
            lines.append("#     startTime: \"19:30\"")
            lines.append("#     endTime: \"22:00\"")
            lines.append("#     location: \"CRH\"")
        lines.append("")
        lines.append("")
        lines.append("mensSectionals:")
        if schedule.get("mensSectionals"):
            for sectional in schedule["mensSectionals"]:
                lines.append(f"-   frequency: \"{sectional['frequency']}\"")
                lines.append(f"    startDate: \"{sectional['startDate']}\"")
                lines.append(f"    startTime: \"{sectional['startTime']}\"")
                lines.append(f"    endTime: \"{sectional['endTime']}\"")
                lines.append(f"    location: \"{sectional['location']}\"")
        else:
            lines.append("# -   frequency: \"once\"")
            lines.append("#     startDate: \"2025-01-22\"")
            lines.append("#     startTime: \"17:30\"")
            lines.append("#     endTime: \"18:30\"")
            lines.append("#     location: \"Braun 103\"")
        lines.append("")
        lines.append("womensSectionals:")
        if schedule.get("womensSectionals"):
            for sectional in schedule["womensSectionals"]:
                lines.append(f"-   frequency: \"{sectional['frequency']}\"")
                lines.append(f"    startDate: \"{sectional['startDate']}\"")
                lines.append(f"    startTime: \"{sectional['startTime']}\"")
                lines.append(f"    endTime: \"{sectional['endTime']}\"")
                lines.append(f"    location: \"{sectional['location']}\"")
        else:
            lines.append("# -   frequency: \"once\"")
            lines.append("#     startDate: \"2025-01-15\"")
            lines.append("#     startTime: \"17:30\"")
            lines.append("#     endTime: \"18:30\"")
            lines.append("#     location: \"Braun 103\"")
        lines.append("")
        lines.append("")
        lines.append("# HOWTO: dresses is a list of dress rehearsals")
        lines.append("# A dress rehearsal entry looks like this:")
        lines.append("# -   date: \"YYYY-MM-DD\"")
        lines.append("#     start: \"HH:MM\"")
        lines.append("#     location: \"Bing\"")
        lines.append("# Where date is date of the event, specified as YYYY-MM-DD (four digit year, two digit month, two digit day")
        lines.append("# of month).")
        lines.append("# Where start and call are the curtain time and call time for the rehearsal specified as HH:MM in local time")
        lines.append("# (two digit hour, two digit minute of the hour, specified in 24-hour format)")
        lines.append("# Where location is a string that matches the key field of a record in data/locations.yml and specifies the")
        lines.append("# venue in which the concert will be performed.")
        lines.append("dressRehearsals:")
        if schedule.get("dressRehearsals"):
            for dress in schedule["dressRehearsals"]:
                lines.append(f"-   date: \"{dress['date']}\"")
                lines.append(f"    start: \"{dress['start']}\"")
                lines.append(f"    location: \"{dress['location']}\"")
        else:
            lines.append("# -   date: \"2025-03-03\"")
            lines.append("#     start: \"19:00\"")
            lines.append("#     location: \"Bing\"")
        lines.append("")
        lines.append("")
        lines.append("# HOWTO: concerts is a list of concert dates")
        lines.append("# A concert entry looks like this:")
        lines.append("# -   date: \"YYYY-MM-DD\"")
        lines.append("#     start: \"HH:MM\"")
        lines.append("#     call: \"HH:MM\"")
        lines.append("#     location: \"Bing\"")
        lines.append("#     ticketLink: \"https://url-to-purchase-ticket\"")
        lines.append("# Where date is date of the event, specified as YYYY-MM-DD (four digit year, two digit month, two digit day")
        lines.append("# of month).")
        lines.append("# Where start and call are the curtain time and call time for the concert specified as HH:MM in local time")
        lines.append("# (two digit hour, two digit minute of the hour, specified in 24-hour format)")
        lines.append("# Where location is a string that matches the key field of a record in data/locations.yml and specifies the")
        lines.append("# venue in which the concert will be performed.")
        lines.append("# Where ticketLink is an optional field. If present, the field should a string with the URL people can")
        lines.append("# follow to puchase tickets for the event")
        lines.append("concerts:")
        if schedule.get("concerts"):
            for concert in schedule["concerts"]:
                lines.append(f"-   date: \"{concert['date']}\"")
                lines.append(f"    start: \"{concert['start']}\"")
                lines.append(f"    call: \"{concert['call']}\"")
                lines.append(f"    location: \"{concert['location']}\"")
        else:
            lines.append("# -   date: \"2026-03-06\"")
            lines.append("#     start: \"19:30\"")
            lines.append("#     call: \"18:30\"")
            lines.append("#     location: \"Bing\"")
        lines.append("")
        lines.append("")
        lines.append("# HOWTO: practiceFiles is a list of locations where members can find recordings and other supplemental")
        lines.append("# material to assist with practice.")
        lines.append("# - title is a string describing the files to which the individual entry refers.")
        lines.append("# - externalLink (optional) is a link to a file on a different web site from which the specific practice")
        lines.append("#   file can be downloaded")
        lines.append("# - externalFolder (optional) is a link to a directory on a different web site that contains a selection")
        lines.append("#   of practice files which members can download")
        lines.append("practiceFiles:")
        lines.append("")
        lines.append("")
        lines.append("# HOWTO: events is a list of events associated with the quarter but outside of the performance or rehearsal")
        lines.append("# schedule.")
        lines.append("# An individual event looks like this:")
        lines.append("# -   date: \"YYYY-MM-DD\"")
        lines.append("#     start: \"HH:MM\"")
        lines.append("#     location: \"MemChu\"")
        lines.append("#     title: \"Messiah Sing/Play Along\"")
        lines.append("# Where location is a string that matches the key field of a record in data/locations.yml and specifies the")
        lines.append("# venue in which the event will take place.")
        lines.append("# Where title is a string that labels the event itself.")
        lines.append("# Where date is the date of the event, specified in YYYY-MM-DD format.")
        lines.append("# Where start is the starting time of the event. The time is specified in HH:MM format (24-hour time).")
        lines.append("events:")
        lines.append("")
        lines.append("")
        lines.append("# HOWTO: description contains Markdown that is included on pages which need a synopsis of")
        lines.append("# the concert. The home page is a typical location where such text is used.")
        lines.append("description: |")
        
        return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description='Extract performance data from SSC syllabus PDF and generate YAML file.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s "public/assets/syllabi/SSC Syllabus Winter 2026.pdf"
  %(prog)s "public/assets/syllabi/SSC Syllabus Winter 2026.pdf" -o data/performances/2026-winter.yml
  %(prog)s "public/assets/syllabi/SSC Syllabus Winter 2026.pdf" --preview

Note: This script requires pdfplumber. Install with:
  pip install pdfplumber python-dateutil pyyaml
        """
    )
    
    parser.add_argument('pdf_path', help='Path to the syllabus PDF file')
    parser.add_argument('-o', '--output', help='Output YAML file path (default: print to stdout)')
    parser.add_argument('--preview', action='store_true', help='Show extracted text preview before generating YAML')
    
    args = parser.parse_args()
    
    # Check if PDF exists
    if not Path(args.pdf_path).exists():
        print(f"Error: PDF file not found: {args.pdf_path}", file=sys.stderr)
        sys.exit(1)
    
    try:
        extractor = SyllabusExtractor(args.pdf_path)
        
        if args.preview:
            print("=" * 80)
            print("EXTRACTED TEXT PREVIEW")
            print("=" * 80)
            text = extractor.extract_text()
            print(text)
            print("=" * 80)
            print()
        
        yaml_content = extractor.generate_yaml()
        
        if args.output:
            output_path = Path(args.output)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(yaml_content)
            print(f"YAML file generated: {args.output}")
            print()
            print("NOTE: Please review and edit the generated file. The extraction may not be perfect.")
            print("Pay special attention to:")
            print("  - Repertoire (composer names and titles)")
            print("  - Schedule (dates and times)")
            print("  - Soloists")
            print("  - Registration information")
        else:
            print(yaml_content)
    
    except ImportError as e:
        print("Error: Required package not installed.", file=sys.stderr)
        print("Please install required packages with:", file=sys.stderr)
        print("  pip install pdfplumber python-dateutil pyyaml", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

