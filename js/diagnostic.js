/*
 * Diagnostic runner: one question at a time, embeds created on first visit
 * and kept (hidden) so a student's work survives moving back and forth.
 * A question counts as answered once Doenet reports a Check Work score.
 */

const questions = COURSE.diagnostic.map((q, index) => ({
    ...q,
    index,
    topicData: Course.topic(q.topic),
    embed: null,
    score: null, // latest Doenet score after a Check Work, 0..1
}));

let current = 0;
let inProgress = false;

const $ = (id) => document.getElementById(id);

$("question-count").textContent = questions.length;
$("start").addEventListener("click", start);
$("prev").addEventListener("click", () => show(current - 1));
$("next").addEventListener("click", () => show(current + 1));
$("finish").addEventListener("click", finish);

window.addEventListener("beforeunload", (event) => {
    if (inProgress) event.preventDefault();
});

onScore((iframe, score) => {
    const q = questions.find((q) => q.embed?.iframe === iframe);
    if (!q) return;
    q.score = score;
    renderDots();
    if (q.index === current) renderStatus();
});

function start() {
    inProgress = true;
    $("intro").hidden = true;
    $("runner").hidden = false;
    renderDots();
    show(0);
}

function isAnswered(q) {
    return q.score !== null;
}

function isCorrect(q) {
    return isAnswered(q) && q.score >= COURSE.passScore;
}

function show(index) {
    if (index < 0 || index >= questions.length) return;
    current = index;
    const q = questions[index];

    if (!q.embed) {
        q.embed = createEmbed(q, {
            title: `Diagnostic question ${index + 1}`,
            flags: COURSE.diagnosticFlags,
        });
        $("stage").append(q.embed.wrap);
    }
    for (const other of questions) {
        if (other.embed) other.embed.wrap.hidden = other !== q;
    }

    $("question-heading").textContent = `Question ${index + 1} of ${questions.length}`;
    $("prev").disabled = index === 0;
    $("next").hidden = index === questions.length - 1;
    renderDots();
    renderStatus();
    $("question-heading").focus();
}

function renderDots() {
    $("dots").replaceChildren(
        ...questions.map((q) =>
            h(
                "li",
                {},
                h(
                    "button",
                    {
                        class: `dot${isAnswered(q) ? " answered" : ""}`,
                        "aria-current": q.index === current ? "step" : null,
                        "aria-label": `Question ${q.index + 1}${isAnswered(q) ? ", answered" : ""}`,
                        onclick: () => show(q.index),
                    },
                    String(q.index + 1),
                ),
            ),
        ),
    );
}

function renderStatus() {
    const q = questions[current];
    let message;
    if (!isAnswered(q)) {
        message = "Click Check Work in the problem when you're done. Not sure? It's fine to skip it.";
    } else if (isCorrect(q)) {
        message = "✓ Correct. Answer recorded.";
    } else {
        message = "Answer recorded. Try again if you have attempts left, or move on.";
    }
    $("status").replaceChildren(h("p", {}, message));
}

function finish() {
    const unanswered = questions.filter((q) => !isAnswered(q)).length;
    if (
        unanswered > 0 &&
        !window.confirm(
            `${unanswered} question${unanswered === 1 ? " has" : "s have"} no answer recorded. ` +
                "These will count toward topics to review. Finish anyway?",
        )
    ) {
        return;
    }

    // A topic needs review if any of its questions was missed.
    const review = new Set();
    const ok = new Set();
    for (const q of questions) {
        (isCorrect(q) ? ok : review).add(q.topic);
    }
    for (const topic of review) ok.delete(topic);

    const correct = questions.filter(isCorrect).length;
    const result = new URLSearchParams({
        review: [...review].join(","),
        ok: [...ok].join(","),
        score: `${correct}-${questions.length}`,
        date: new Date().toISOString().slice(0, 10),
    });

    inProgress = false;
    window.location.href = `results.html?${result}`;
}
