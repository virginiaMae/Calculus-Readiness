/*
 * Study plan, rebuilt entirely from the URL:
 *   results.html?review=slope,applications&ok=linear-equations&score=5-8&date=2026-10-05
 * The URL is the student's only copy, so it's what we offer to bookmark,
 * print, and email.
 */

const p = params();
const listParam = (name) =>
    (p.get(name) || "")
        .split(",")
        .map((id) => Course.topic(id))
        .filter(Boolean);

const review = listParam("review");
const ok = listParam("ok");
const [correct, total] = (p.get("score") || "").split("-").map(Number);
const date = p.get("date");
const resultsLink = window.location.href;
const root = document.getElementById("results");

if (review.length === 0 && ok.length === 0) {
    root.append(
        h("h1", {}, "No results here"),
        h("p", {}, "This link doesn't contain diagnostic results."),
        h("a", { class: "button", href: "diagnostic.html" }, "Take the diagnostic"),
    );
} else {
    render();
}

function formatDate(iso) {
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function topicCard(topic) {
    // `plan` lets the topic page link back here without storing anything.
    return h(
        "li",
        { class: "card" },
        h("p", { class: "eyebrow" }, `${topic.unit.title} · ${topic.section}`),
        h("h3", {}, topic.title),
        h("p", {}, topic.summary),
        h(
            "a",
            { class: "button small", href: topicUrl(topic.id, { plan: window.location.search }) },
            "Study this topic →",
        ),
    );
}

function render() {
    const when = date && formatDate(date);

    root.append(
        h("h1", {}, "Your study plan"),
        h(
            "p",
            { class: "lead" },
            Number.isFinite(correct) && Number.isFinite(total)
                ? `You answered ${correct} of ${total} diagnostic questions correctly${when ? ` on ${when}` : ""}.`
                : when
                  ? `Diagnostic taken ${when}.`
                  : null,
        ),
    );

    root.append(
        h(
            "section",
            { class: "save-box", "aria-labelledby": "save-heading" },
            h("h2", { id: "save-heading" }, "Keep these results"),
            h(
                "p",
                {},
                "We don't save anything. To come back to this plan later, bookmark this page, print it, or email it to yourself.",
            ),
            h(
                "div",
                { class: "actions no-print" },
                h("button", { class: "button", onclick: () => window.print() }, "Print"),
                h("a", { class: "button secondary", href: mailtoLink() }, "Email to myself"),
                h("button", { class: "button secondary", onclick: copyLink }, "Copy link"),
                h("span", { id: "copy-status", class: "muted", "aria-live": "polite" }),
            ),
            h("p", { class: "results-link" }, "Your results link: ", h("a", { href: resultsLink }, resultsLink)),
        ),
    );

    if (review.length > 0) {
        root.append(
            h("h2", {}, "Recommended topics"),
            h("p", {}, "These topics had questions you missed or skipped. Start here."),
            h("ul", { class: "card-list" }, review.map(topicCard)),
        );
    } else {
        root.append(
            h("h2", {}, "You're in good shape"),
            h("p", {}, "You didn't miss any questions. Explore any topic to keep your skills sharp."),
        );
    }

    if (ok.length > 0) {
        root.append(
            h("h2", {}, "Topics you did well on"),
            h(
                "ul",
                { class: "topic-list compact" },
                ok.map((t) =>
                    h("li", {}, h("a", { href: topicUrl(t.id, { plan: window.location.search }) }, t.title), h("span", { class: "muted" }, ` ${t.section}`)),
                ),
            ),
        );
    }

    root.append(
        h(
            "p",
            { class: "no-print" },
            "Every topic is open to you: ",
            h("a", { href: "index.html#topics" }, "browse all topics"),
            ".",
        ),
    );
}

function mailtoLink() {
    const lines = [`My ${COURSE.title} study plan`];
    if (date) lines.push(`Diagnostic taken ${date}`);
    if (Number.isFinite(correct)) lines.push(`Score: ${correct} of ${total}`);
    lines.push("");
    if (review.length > 0) {
        lines.push("Topics to review:");
        review.forEach((t) => lines.push(`- ${t.title} (${t.section})`));
    } else {
        lines.push("No topics flagged for review.");
    }
    lines.push("", "Open my study plan:", resultsLink);

    const subject = `${COURSE.title}: my study plan`;
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}

async function copyLink() {
    const status = document.getElementById("copy-status");
    try {
        await navigator.clipboard.writeText(resultsLink);
        status.textContent = "Link copied.";
    } catch {
        status.textContent = "Couldn't copy automatically. Copy the link shown below.";
    }
}
