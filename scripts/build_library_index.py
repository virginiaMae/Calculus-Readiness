#!/usr/bin/env python3
"""
Build js/library-data.js, the table of contents for library.html.

Structure (course > chapter > section > problem) comes from the local
PreCalculus_Library mirror, whose folders match the library on Doenet.org
and whose files carry each problem's Doenet ID. Names and "About the
problem" text are fetched from Doenet.org's public API, so they match what's
live there (the mirror's folder names have ':' and '/' replaced by '_').

Problems themselves are never copied; library.html embeds them live.
Re-run after adding, moving, or renaming problems in the library:

    python3 scripts/build_library_index.py [path/to/PreCalculus_Library]
"""

import json
import re
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_LIBRARY = ROOT.parent / "PreCalculus_Library"
OUTPUT = ROOT / "js" / "library-data.js"
API = "https://doenet.org/api/activityEditView/getActivityViewerData/"

COURSES = ["Algebra", "Trigonometry", "Probability"]

SYNC_ID_RE = re.compile(r"Doenet-Sync-ID:\s*(\S+)")
NUM_VARIANTS_RE = re.compile(r"Doenet-Sync-NumVariants:\s*(\d+)")
ABOUT_RE = re.compile(r"About the problem:\s*(.*?)\n\s*\*{5,}", re.S)
CHAPTER_RE = re.compile(r"^Ch\.\s*(\d+)\s+(.*)$")
# "Alg 8.3 - Linear eqs & fns / Equations of lines: slope-intercept form",
# "Alg 1.1 Properties"
# "Alg 1.1 Properties", "Alg. 10.6 Simplify Rational Expressions"
SECTION_RE = re.compile(r"^[A-Za-z]+\.?\s+(\d+(?:\.\d+)+)\s*(?:-\s*)?(.*)$")
# "Alg 8.3.4 Write equation...", "Alg 5.2.1b variant x GCF", "Alg 18.1.1-LA Given..."
PROBLEM_RE = re.compile(r"^(?:new\s+)?[A-Za-z]+\.?\s+(\d+(?:\.\d+)+[a-z]?)(?:-[A-Z]+)?\s+(.*)$")
# Work-in-progress or superseded items in the live library; not shown.
EXCLUDE_RE = re.compile(r"^(old\b|wip\b|unfinished|test|og\b|update sketch)", re.I)


def number_key(number):
    """'5.2.1b' -> (5, 2, 1, 'b'); unnumbered items sort last."""
    if not number:
        return ((10**9,), "")
    match = re.match(r"([\d.]+)([a-z]?)$", number)
    return (tuple(int(n) for n in match.group(1).split(".")), match.group(2))


class NotOnDoenet(Exception):
    pass


def fetch_activity(doenet_id):
    """Activity data from Doenet.org, NotOnDoenet if it's gone or private,
    or None on other errors (the local name is used instead)."""
    try:
        with urllib.request.urlopen(API + doenet_id, timeout=30) as resp:
            return json.load(resp)["activity"]
    except urllib.error.HTTPError as err:
        if err.code in (403, 404):
            return NotOnDoenet()
        print(f"  warning: couldn't fetch {doenet_id}: {err}", file=sys.stderr)
    except Exception as err:
        print(f"  warning: couldn't fetch {doenet_id}: {err}", file=sys.stderr)
    return None


def about_text(doenetml):
    match = ABOUT_RE.search(doenetml or "")
    if not match:
        return ""
    lines = [line.strip() for line in match.group(1).strip().splitlines()]
    return "\n".join(line for line in lines if line)


def split_section_name(name):
    """'Alg 8.3 - Linear eqs & fns / Slope-intercept form' -> ('8.3', 'Slope-intercept form')"""
    name = re.sub(r"^(Copy of )+", "", name)
    match = SECTION_RE.match(name)
    if not match:
        return None, name
    number, title = match.groups()
    # Most section names repeat the chapter as a "Chapter shorthand / " prefix.
    if " / " in title:
        title = title.split(" / ", 1)[1]
    return number, title.strip()


def split_problem_name(name):
    if " " not in name:  # e.g. "Alg_1.1.3_Apply_the_Associative_Property..."
        name = name.replace("_", " ")
    match = PROBLEM_RE.match(name)
    return match.groups() if match else (None, name)


def main():
    library = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_LIBRARY
    if not library.is_dir():
        sys.exit(f"Library folder not found: {library}")

    # Collect every problem file with its place in the folder tree.
    entries = []
    for course in COURSES:
        for path in sorted((library / course).rglob("*.doenetml")):
            parts = path.relative_to(library / course).parts
            if len(parts) != 3:
                print(f"  skipping (not inside a chapter/section): {course}/{'/'.join(parts)}", file=sys.stderr)
                continue
            if path.name.startswith("PDF"):
                print(f"  skipping PDF variant: {path.relative_to(library)}", file=sys.stderr)
                continue
            text = path.read_text(encoding="utf-8")
            sync_id = SYNC_ID_RE.search(text)
            if not sync_id:
                print(f"  skipping (no Doenet-Sync-ID): {path.relative_to(library)}", file=sys.stderr)
                continue
            variants = NUM_VARIANTS_RE.search(text)
            entries.append(
                {
                    "course": course,
                    "chapter": parts[0],
                    "section": parts[1],
                    "file": path,
                    "localText": text,
                    "id": sync_id.group(1),
                    "numVariants": int(variants.group(1)) if variants else None,
                }
            )

    print(f"Fetching {len(entries)} problems from Doenet.org...", file=sys.stderr)
    with ThreadPoolExecutor(max_workers=8) as pool:
        activities = list(pool.map(lambda e: fetch_activity(e["id"]), entries))

    courses = []
    for course in COURSES:
        chapters = {}
        for entry, activity in zip(entries, activities):
            if entry["course"] != course:
                continue
            if isinstance(activity, NotOnDoenet):
                # Deleted or private on Doenet.org, so an embed wouldn't load.
                print(f"  skipping (not available on Doenet.org): {entry['file'].relative_to(library)}", file=sys.stderr)
                continue

            chapter = chapters.setdefault(entry["chapter"], {"sections": {}})
            section = chapter["sections"].setdefault(entry["section"], {"problems": [], "names": []})

            name = activity["name"] if activity else entry["file"].stem
            if EXCLUDE_RE.match(name):
                print(f"  skipping work in progress: {name}", file=sys.stderr)
                continue
            if activity and activity.get("parent", {}).get("name"):
                section["names"].append(activity["parent"]["name"])
            number, title = split_problem_name(name)
            section["problems"].append(
                {
                    "id": entry["id"],
                    "number": number,
                    "title": title,
                    "about": about_text(activity["doenetML"] if activity else entry["localText"]),
                    "numVariants": activity.get("numVariants") if activity else entry["numVariants"],
                }
            )

        chapter_list = []
        for folder, chapter in chapters.items():
            match = CHAPTER_RE.match(folder)
            chapter_number, chapter_title = match.groups() if match else (None, folder)
            section_list = []
            for section_folder, section in chapter["sections"].items():
                # Prefer the live folder name from Doenet.org over the sanitized local one.
                section_number, section_title = split_section_name(
                    section["names"][0] if section["names"] else section_folder
                )
                section["problems"].sort(key=lambda p: (number_key(p["number"]), p["title"]))
                section_list.append(
                    {"number": section_number, "title": section_title, "problems": section["problems"]}
                )
            section_list.sort(key=lambda s: (number_key(s["number"]), s["title"]))
            chapter_list.append({"number": chapter_number, "title": chapter_title, "sections": section_list})
        chapter_list.sort(key=lambda c: (number_key(c["number"]), c["title"]))

        # Unique per-course key for links (library.html?course=Algebra&section=8.3).
        used = set()
        for chapter in chapter_list:
            for section in chapter["sections"]:
                base = section["number"] or "section"
                key, n = base, 1
                while key in used:
                    n += 1
                    key = f"{base}-{n}"
                used.add(key)
                section["key"] = key
                if n > 1:
                    print(f"  note: duplicate section number {base} in {course} (key {key}): {section['title']}", file=sys.stderr)
        courses.append({"id": course, "title": course, "chapters": chapter_list})

    data = {"generated": date.today().isoformat(), "courses": courses}
    OUTPUT.write_text(
        "// Generated by scripts/build_library_index.py. Do not edit by hand.\n"
        f"window.LIBRARY = {json.dumps(data, indent=1, ensure_ascii=False)};\n",
        encoding="utf-8",
    )

    for course in courses:
        n_sections = sum(len(c["sections"]) for c in course["chapters"])
        n_problems = sum(len(s["problems"]) for c in course["chapters"] for s in c["sections"])
        print(f"{course['title']}: {len(course['chapters'])} chapters, {n_sections} sections, {n_problems} problems", file=sys.stderr)
    print(f"Wrote {OUTPUT.relative_to(ROOT)}", file=sys.stderr)


if __name__ == "__main__":
    main()
