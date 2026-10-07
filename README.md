# Calculus Readiness (prototype)

A public, college-preparatory mini-course that helps students find and fill
gaps before Calculus. Students take a diagnostic, get a study plan, and
practice with problem sets drawn live from Doenet.org.

Prototype scope: Algebra Ch. 8, Linear Equations and Functions (8 topics,
19 problems, 8-question diagnostic).

## Running it

It's a static site with no build step and no server code:

```
cd Calculus-Readiness
python3 -m http.server 8000
# open http://localhost:8000
```

Any static host works for deployment (GitHub Pages, a university web server).

## Pages

| Page | What it does |
|---|---|
| `index.html` | Landing page and list of all topics |
| `diagnostic.html` | One question at a time; finishing sends the student to their results |
| `results.html` | Study plan, rebuilt entirely from the URL; print / email / copy link |
| `topic.html?t=<id>` | Random practice set (4–6 problems), videos, further reading |
| `library.html` | Browse the whole library: course → chapter → section → problem, with a live preview panel |

## Editing content

Everything lives in [`js/course-data.js`](js/course-data.js): units, topics,
problem pools, videos, reading links, and the diagnostic question list.
Problem IDs are Doenet.org activity IDs. Find one in a problem's "copy embed
code" snippet, or in the `Doenet-Sync-ID` line of a PreCalculus_Library
`.doenetml` file.

- **Add a video:** `videos: [{ title: "...", youtubeId: "..." }]`. Videos are
  embedded from `youtube-nocookie.com`.
- **Add a diagnostic question:** `{ topic: "<topic id>", id: "<doenet id>" }`.
  A topic is flagged for review if any of its questions is missed.

## Updating the library browser

`library.html` reads its table of contents from `js/library-data.js`, which
is generated. After problems are added, moved, or renamed on Doenet.org
(and pulled into `PreCalculus_Library` with `doenet_pull.py`), rebuild it:

```
python3 scripts/build_library_index.py            # uses ../PreCalculus_Library
```

Structure comes from the mirror's folders; names and "About the problem"
text are fetched live from Doenet.org. The script skips, and lists, anything
that shouldn't be shown: files outside a chapter/section, problems that are
deleted or private on Doenet.org, and work-in-progress items (names starting
with "old", "wip", "Unfinished", "test", "og", "update sketch"). Problems
themselves are always embedded live.

## How it works

- **Problems are live.** Each problem is an iframe of
  `https://doenet.org/embed/<id>`, so edits on Doenet.org show up right away.
  Each load gets a random variant, so a repeated problem has new numbers.
- **Scoring.** The embed page forwards the viewer's `SPLICE.*` and `lti.*`
  messages to this page. A question counts as answered once a
  `SPLICE.reportScoreAndState` with `state.onSubmission: true` arrives (a
  Check Work click). The viewer also sends a score-0 report on load, which is
  ignored. `lti.frameResize` sizes each iframe to its content.
- **Nothing is stored.** No accounts, cookies, or localStorage. Results exist
  only in the results URL (`?review=...&ok=...&score=5-8&date=...`), which
  students bookmark, print, or email to themselves (via a `mailto:` link in
  their own mail app).

## Open questions / next steps

- **Hiding solutions in the diagnostic.** Diagnostic embeds request
  `?solutionDisplayMode=none&showHints=false` (`diagnosticFlags` in
  `course-data.js`), which hides `<solution>`, `<givenAnswer>`, and `<hint>`.
  This needs the doenet.org embed route to accept those parameters (branch
  `embed-viewer-flags` in the DoenetApps fork). Until that's deployed, the
  parameters are ignored and solutions still show.
- **Pool sizes.** Several topics have only 1–2 problems, so practice sets
  repeat them (with new numbers each time). More problems per topic would help.
- **Diagnostic design.** Currently one question per topic. Decide the real
  ~30-question set, how many questions per topic, and whether partial credit
  counts (`passScore` in `course-data.js`).
- **Videos** are placeholders for now.
- **Analytics.** The doenet.org embed page loads Google Analytics. Worth
  reviewing given the audience includes minors.
- **Scaling up:** add more units to `course-data.js`. No code changes needed.
