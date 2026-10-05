/*
 * Course content for the Calculus Readiness site.
 *
 * This is the only file that needs editing to add topics, problems,
 * resources, or diagnostic questions. Problem `id`s are Doenet.org activity
 * IDs (the part after /embed/ in a "copy embed code" snippet, or the
 * Doenet-Sync-ID line in a PreCalculus_Library .doenetml file). Problems are
 * always loaded live from Doenet.org; nothing is copied here.
 *
 * Prototype scope: Algebra Ch. 8 (Linear Equations and Functions).
 */
window.COURSE = {
    title: "Calculus Readiness",

    // Shows a "prototype, feedback welcome" banner on every page while set.
    // Remove (or set to null) for the public launch.
    feedback: { email: "mae00002@umn.edu" },

    // Starting iframe height in px while a problem loads; it then resizes
    // to fit. Individual problems can override (useful for graphs).
    defaultEmbedHeight: 650,

    // Doenet reports a score from 0 to 1. A diagnostic question counts as
    // "got it" at or above this score.
    passScore: 1,

    // Doenet viewer flags for diagnostic questions, passed as embed query
    // parameters. Hides <solution>, <givenAnswer>, and <hint> (worked
    // examples). Add showCorrectness: false / showFeedback: false to also
    // hide right/wrong; scores are still reported to the page.
    // Requires the doenet.org embed route to accept these parameters.
    diagnosticFlags: { solutionDisplayMode: "none", showHints: false },

    // Practice sets pick a random number of problems in this range.
    practiceSetSize: { min: 4, max: 6 },

    units: [
        {
            id: "linear",
            title: "Linear Equations and Functions",
            source: "Algebra Ch. 8",
            topics: [
                {
                    id: "slope",
                    section: "Alg 8.1",
                    title: "Finding the slope",
                    summary:
                        "Compute slope from two points or a graph, and read slope as a rate of change.",
                    problems: [
                        { id: "hm8K5Gf5mpst4gaX4oCWN6", title: "Slope through two points" },
                        { id: "hQLheUvBhvfK3ru76YAeYV", title: "Linear model: cost of owning a car per mile" },
                        { id: "cYPB19R6QsVaLx2XKVK5Dg", title: "Construct a line with slope m", height: 850 },
                        { id: "7wEVVUq3wYjNdC4rQaNTDt", title: "Construct a line with undefined slope", height: 850 },
                    ],
                    videos: [],
                    resources: [
                        {
                            title: "3.2 Slope of a Line",
                            source: "OpenStax Intermediate Algebra 2e",
                            url: "https://openstax.org/books/intermediate-algebra-2e/pages/3-2-slope-of-a-line",
                        },
                    ],
                },
                {
                    id: "parallel-perpendicular",
                    section: "Alg 8.2",
                    title: "Parallel and perpendicular lines",
                    summary:
                        "Use slopes to decide when lines are parallel or perpendicular, and write equations for them.",
                    problems: [
                        { id: "cJ298Pvb226GkfiUNJUk3a", title: "Find k so two lines are parallel" },
                        { id: "7HXNBNC1sQTN3mHNfFvBDB", title: "Find k so two lines are perpendicular" },
                        { id: "2a67GzSfinvZd9C73k3vYD", title: "Equation of a line through a point, parallel to a given line" },
                    ],
                    videos: [],
                    resources: [
                        {
                            title: "3.3 Find the Equation of a Line",
                            source: "OpenStax Intermediate Algebra 2e",
                            url: "https://openstax.org/books/intermediate-algebra-2e/pages/3-3-find-the-equation-of-a-line",
                        },
                    ],
                },
                {
                    id: "slope-intercept",
                    section: "Alg 8.3",
                    title: "Equations of lines: slope-intercept form",
                    summary:
                        "Write y = mx + b from a slope and intercept, a point and slope, two points, or a related line.",
                    problems: [
                        { id: "6u5uxVun67BGWNKQUGrp3i", title: "Slope-intercept form from slope and y-intercept" },
                        { id: "pJc7TiF7Wutqakbej476dv", title: "Rewrite general form in slope-intercept form" },
                        { id: "e2WhJPpLQac6oyp6uPwqnF", title: "Slope-intercept form from a point and slope" },
                        { id: "bfJEYH7z21Vhsiqv7XaX3z", title: "Slope-intercept form from two points" },
                        { id: "aj2y6KKpFsKP1jyqhyRz9e", title: "Slope-intercept form from a point and a parallel line" },
                        { id: "dXGmyREymk1AaPEMExUgiB", title: "Slope-intercept form from a point and a perpendicular line" },
                    ],
                    videos: [],
                    resources: [
                        {
                            title: "3.3 Find the Equation of a Line",
                            source: "OpenStax Intermediate Algebra 2e",
                            url: "https://openstax.org/books/intermediate-algebra-2e/pages/3-3-find-the-equation-of-a-line",
                        },
                        {
                            title: "4.1 Linear Functions",
                            source: "OpenStax College Algebra 2e",
                            url: "https://openstax.org/books/college-algebra-2e/pages/4-1-linear-functions",
                        },
                    ],
                },
                {
                    id: "linear-functions",
                    section: "Alg 8.7",
                    title: "Linear functions",
                    summary:
                        "Find a linear function f(x) = mx + b from two of its values.",
                    problems: [
                        { id: "fWxHRqT8hW14ct6xnRp3AD", title: "Linear function from two function values" },
                    ],
                    videos: [],
                    resources: [
                        {
                            title: "4.1 Linear Functions",
                            source: "OpenStax College Algebra 2e",
                            url: "https://openstax.org/books/college-algebra-2e/pages/4-1-linear-functions",
                        },
                    ],
                },
                {
                    id: "linear-equations",
                    section: "Alg 8.8",
                    title: "Linear equations",
                    summary: "Solve linear equations in one variable.",
                    problems: [
                        { id: "mphcb7x6JRF9NRAi1BfMaK", title: "Solve a linear equation for x" },
                    ],
                    videos: [],
                    resources: [
                        {
                            title: "2.1 Use a General Strategy to Solve Linear Equations",
                            source: "OpenStax Intermediate Algebra 2e",
                            url: "https://openstax.org/books/intermediate-algebra-2e/pages/2-1-use-a-general-strategy-to-solve-linear-equations",
                        },
                        {
                            title: "2.2 Linear Equations in One Variable",
                            source: "OpenStax College Algebra 2e",
                            url: "https://openstax.org/books/college-algebra-2e/pages/2-2-linear-equations-in-one-variable",
                        },
                    ],
                },
                {
                    id: "linear-inequalities",
                    section: "Alg 8.9",
                    title: "Linear inequalities",
                    summary:
                        "Graph a linear inequality in two variables, and write the inequality for a shaded region.",
                    problems: [
                        { id: "dSBJ3fTkKbDdxt3Qtf6aD4", title: "Graph a linear inequality", height: 850 },
                        { id: "obC86BwAGaKusfzBR4D8Wz", title: "Write the inequality for a graph", height: 850 },
                    ],
                    videos: [],
                    resources: [
                        {
                            title: "3.4 Graph Linear Inequalities in Two Variables",
                            source: "OpenStax Intermediate Algebra 2e",
                            url: "https://openstax.org/books/intermediate-algebra-2e/pages/3-4-graph-linear-inequalities-in-two-variables",
                        },
                    ],
                },
                {
                    id: "graphs-of-lines",
                    section: "Alg 8.10",
                    title: "Graphs of lines and intercepts",
                    summary: "Find the x- and y-intercepts of a line and use them to graph it.",
                    problems: [
                        { id: "opRdpYiUbYbYs4UsSqdZBp", title: "Find x- and y-intercepts" },
                    ],
                    videos: [],
                    resources: [
                        {
                            title: "3.1 Graph Linear Equations in Two Variables",
                            source: "OpenStax Intermediate Algebra 2e",
                            url: "https://openstax.org/books/intermediate-algebra-2e/pages/3-1-graph-linear-equations-in-two-variables",
                        },
                        {
                            title: "2.1 The Rectangular Coordinate Systems and Graphs",
                            source: "OpenStax College Algebra 2e",
                            url: "https://openstax.org/books/college-algebra-2e/pages/2-1-the-rectangular-coordinate-systems-and-graphs",
                        },
                    ],
                },
                {
                    id: "applications",
                    section: "Alg 8.11",
                    title: "Applications and models",
                    summary: "Build and use linear models for real situations.",
                    problems: [
                        { id: "vg7MvbftSA7h3RYjoLgALi", title: "Population growth of a city" },
                    ],
                    videos: [],
                    resources: [
                        {
                            title: "4.2 Modeling with Linear Functions",
                            source: "OpenStax College Algebra 2e",
                            url: "https://openstax.org/books/college-algebra-2e/pages/4-2-modeling-with-linear-functions",
                        },
                    ],
                },
            ],
        },
    ],

    /*
     * Diagnostic questions, in the order students see them. Each is tagged
     * with the topic it tests; a missed question flags that topic for review.
     * A topic can have several questions. For the prototype this is one
     * problem per topic, drawn from that topic's pool.
     */
    diagnostic: [
        { topic: "slope", id: "hm8K5Gf5mpst4gaX4oCWN6" },
        { topic: "parallel-perpendicular", id: "cJ298Pvb226GkfiUNJUk3a" },
        { topic: "slope-intercept", id: "bfJEYH7z21Vhsiqv7XaX3z" },
        { topic: "linear-functions", id: "fWxHRqT8hW14ct6xnRp3AD" },
        { topic: "linear-equations", id: "mphcb7x6JRF9NRAi1BfMaK" },
        { topic: "linear-inequalities", id: "dSBJ3fTkKbDdxt3Qtf6aD4", height: 850 },
        { topic: "graphs-of-lines", id: "opRdpYiUbYbYs4UsSqdZBp" },
        { topic: "applications", id: "vg7MvbftSA7h3RYjoLgALi" },
    ],
};
