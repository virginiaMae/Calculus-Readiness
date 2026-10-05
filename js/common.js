/*
 * Shared helpers: course lookups, Doenet embeds, and score messages.
 *
 * Nothing here (or anywhere on the site) stores student data. Results
 * travel only in the page URL, which the student can bookmark, print, or
 * email to themselves.
 */

const DOENET_ORIGIN = "https://doenet.org";

const Course = {
    units: COURSE.units,
    topics: COURSE.units.flatMap((unit) =>
        unit.topics.map((topic) => ({ ...topic, unit })),
    ),
    topic(id) {
        return this.topics.find((t) => t.id === id) || null;
    },
};

/** Tiny element builder: h("a", { href: "#" }, "text", childNode) */
function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
        if (value === false || value == null) continue;
        if (key === "class") el.className = value;
        else if (key.startsWith("on")) el.addEventListener(key.slice(2), value);
        else el.setAttribute(key, value === true ? "" : value);
    }
    el.append(...children.flat().filter((c) => c != null && c !== false));
    return el;
}

function shuffle(items) {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function randomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function params() {
    return new URLSearchParams(window.location.search);
}

function topicUrl(topicId, extra = {}) {
    const p = new URLSearchParams({ t: topicId, ...extra });
    return `topic.html?${p}`;
}

/**
 * Create a live Doenet.org embed for a problem. Each load gets a fresh
 * random variant, so re-embedding the same problem gives new numbers.
 * `flags` become embed query parameters (see COURSE.diagnosticFlags).
 */
function createEmbed(problem, { title, lazy = false, flags = {} } = {}) {
    const query = new URLSearchParams(flags).toString();
    const iframe = h("iframe", {
        src: `${DOENET_ORIGIN}/embed/${encodeURIComponent(problem.id)}${query ? `?${query}` : ""}`,
        title: title || problem.title || "Doenet problem",
        loading: lazy ? "lazy" : null,
        allow: "fullscreen",
    });
    const wrap = h("div", { class: "embed" }, iframe);
    wrap.style.height = `${problem.height || COURSE.defaultEmbedHeight}px`;
    return { wrap, iframe };
}

/*
 * The doenet.org/embed page forwards its viewer's SPLICE and lti messages
 * to us. We use two of them:
 *
 * - SPLICE.reportScoreAndState: score is 0..1 for the whole problem. The
 *   viewer also sends one (score 0) as soon as the problem loads, so a
 *   problem only counts as answered once a report marked `onSubmission`
 *   (a Check Work click) arrives. Handlers receive (iframe, score).
 * - lti.frameResize: the problem's content height, used to size the iframe.
 */
const scoreHandlers = new Set();
const submittedFrames = new WeakSet();

function onScore(handler) {
    scoreHandlers.add(handler);
}

window.addEventListener("message", (event) => {
    if (event.origin !== DOENET_ORIGIN) return;
    const data = event.data;
    const iframe = [...document.querySelectorAll("iframe")].find(
        (f) => f.contentWindow === event.source,
    );
    if (!iframe) return;

    if (data?.subject === "lti.frameResize" && typeof data.height === "number") {
        iframe.parentElement.style.height = `${Math.ceil(data.height) + 24}px`;
        return;
    }

    if (data?.subject !== "SPLICE.reportScoreAndState") return;
    if (typeof data.score !== "number") return;
    if (data.state?.onSubmission) submittedFrames.add(iframe);
    if (!submittedFrames.has(iframe)) return;
    scoreHandlers.forEach((handler) => handler(iframe, data.score));
});

/*
 * Prototype banner. Feedback emails include the page the reviewer was on.
 */
if (COURSE.feedback?.email) {
    const subject = `${COURSE.title} feedback`;
    const body = `Page: ${window.location.href}\n\nFeedback:\n`;
    const href = `mailto:${COURSE.feedback.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    document.body.prepend(
        h(
            "div",
            { class: "prototype-banner no-print", role: "note" },
            h(
                "div",
                { class: "container" },
                h("strong", {}, "Prototype."),
                " This is an early version, and we'd love your feedback. ",
                h("a", { href }, "Send feedback"),
            ),
        ),
    );
}
