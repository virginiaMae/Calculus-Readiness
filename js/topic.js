/*
 * Topic page: practice sets, videos, and further reading.
 *
 * A practice set is a random 4–6 problems from the topic's pool. When the
 * pool is smaller than the set, problems repeat; each embed loads its own
 * random variant, so repeats come with new numbers.
 */

const p = params();
const topic = Course.topic(p.get("t"));
const plan = p.get("plan"); // results query string, if we came from a study plan
const root = document.getElementById("topic");

if (!topic) {
    root.append(
        h("h1", {}, "Topic not found"),
        h("a", { href: "index.html#topics" }, "See all topics"),
    );
} else {
    render();
}

function render() {
    document.title = `${topic.title} · ${COURSE.title}`;
    const linkExtra = plan ? { plan } : {};

    root.append(
        h(
            "p",
            { class: "breadcrumbs" },
            plan
                ? h("a", { href: `results.html${plan}` }, "← Back to my study plan")
                : h("a", { href: "index.html#topics" }, "← All topics"),
        ),
        h("p", { class: "eyebrow" }, `${topic.unit.title} · ${topic.section}`),
        h("h1", {}, topic.title),
        h("p", { class: "lead" }, topic.summary),
    );

    // Practice
    const practiceList = h("ol", { class: "practice-list" });
    const tally = h("p", { class: "muted", "aria-live": "polite" });
    const startButton = h("button", { class: "button", onclick: newPracticeSet }, "Start a practice set");
    root.append(
        h(
            "section",
            { "aria-labelledby": "practice-heading" },
            h("h2", { id: "practice-heading" }, "Practice"),
            h(
                "p",
                {},
                `Each practice set has ${COURSE.practiceSetSize.min}–${COURSE.practiceSetSize.max} problems, with new numbers every time.`,
            ),
            h("div", { class: "actions" }, startButton, tally),
            practiceList,
        ),
    );

    const scores = new Map(); // iframe -> latest score
    onScore((iframe, score) => {
        if (!scores.has(iframe)) return;
        scores.set(iframe, score);
        renderTally();
    });

    function renderTally() {
        const checked = [...scores.values()].filter((s) => s !== null);
        if (checked.length === 0) {
            tally.textContent = "";
            return;
        }
        const right = checked.filter((s) => s >= COURSE.passScore).length;
        tally.textContent = `${right} of ${scores.size} correct so far`;
    }

    function newPracticeSet() {
        const { min, max } = COURSE.practiceSetSize;
        const size = randomInt(min, max);
        const picks = [];
        while (picks.length < size) picks.push(...shuffle(topic.problems));
        picks.length = size;

        scores.clear();
        practiceList.replaceChildren(
            ...picks.map((problem, i) => {
                const embed = createEmbed(problem, {
                    title: `Practice problem ${i + 1}: ${problem.title}`,
                    lazy: i > 0,
                });
                scores.set(embed.iframe, null);
                return h("li", {}, h("h3", {}, `Problem ${i + 1} of ${size}`), embed.wrap);
            }),
        );
        renderTally();
        startButton.textContent = "New practice set";
    }

    // Videos
    root.append(
        h(
            "section",
            { "aria-labelledby": "videos-heading" },
            h("h2", { id: "videos-heading" }, "Videos"),
            topic.videos.length > 0
                ? h(
                      "div",
                      { class: "video-grid" },
                      topic.videos.map((video) =>
                          h(
                              "figure",
                              {},
                              h(
                                  "div",
                                  { class: "video" },
                                  h("iframe", {
                                      src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.youtubeId)}`,
                                      title: video.title,
                                      loading: "lazy",
                                      allow: "fullscreen; picture-in-picture",
                                  }),
                              ),
                              h("figcaption", {}, video.title),
                          ),
                      ),
                  )
                : h("p", { class: "placeholder" }, "Videos for this topic are coming soon."),
        ),
    );

    // Reading
    if (topic.resources.length > 0) {
        root.append(
            h(
                "section",
                { "aria-labelledby": "reading-heading" },
                h("h2", { id: "reading-heading" }, "Further reading"),
                h(
                    "ul",
                    {},
                    topic.resources.map((r) =>
                        h(
                            "li",
                            {},
                            h("a", { href: r.url, target: "_blank", rel: "noopener" }, r.title),
                            r.source ? h("span", { class: "muted" }, ` · ${r.source}`) : null,
                        ),
                    ),
                ),
            ),
        );
    }

    // Prev / next topic
    const i = Course.topics.findIndex((t) => t.id === topic.id);
    const prev = Course.topics[i - 1];
    const next = Course.topics[i + 1];
    root.append(
        h(
            "nav",
            { class: "pager", "aria-label": "Other topics" },
            prev ? h("a", { href: topicUrl(prev.id, linkExtra) }, `← ${prev.title}`) : h("span"),
            next ? h("a", { href: topicUrl(next.id, linkExtra) }, `${next.title} →`) : h("span"),
        ),
    );
}
