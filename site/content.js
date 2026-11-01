// Survey content rendered by site/app.js. Wording follows the manuscript; keep it in step with
// tools/readme-content.mjs in LongHorizonSWE/Awesome-LongHorizonSWE.
window.SURVEY_CONTENT = {
  // [title, caption, width, height]; Plate I is an illustration kept as WebP
  figures: [
    ["From tasks to projects.", "In continuing work, each request starts from the state that earlier work left; the agent works from the current requirements and brings its retained knowledge, and selective revision corrects what later changes invalidate. Signposts 1–3 are the requests of the illustrative API example used throughout.", 1600, 703],
    ["Organization of the survey and representative works.", "Each group within a column lists representative works discussed in the corresponding subsection.", 1600, 1468],
    ["Three settings and what each can show.", "Each setting is defined by what the next unit starts from; Plate VIII places named protocols on both comparison axes.", 1600, 1145],
    ["Three events that look alike in a test report.", "In the pagination example of Plate I, a failing check after a later change can mark a regression, a new requirement, or an older defect. The last row shows how each event counts toward the retention and conformance measures.", 1600, 1112],
    ["From program repair to continuing projects.", "Each marker gives the year in which representative work first appeared, as a preprint where one exists. Marker spacing is not proportional to time.", 1600, 356],
    ["State boundaries in sequential evaluation.", "ChainSWE runs the same issues in three modes that differ in the code and the conversation each issue starts from; in Seq+Mem, the form of the retained dialogue depends on the context configuration (Plate VII).", 1600, 703],
    ["Per-issue resolution by mode and context configuration.", "GPT-5.5 results reported by ChainSWE on 304 issues in 100 chains under its SWE-Edit agent scaffold. Oracle installs earlier reference fixes; Seq inherits agent patches; Seq+Mem also retains dialogue. Baseline retains the full transcript; Summarize compacts older messages; Sub-Agent delegates file viewing and editing to separate contexts.", 1600, 728],
    ["Representative protocols on the two comparison axes.", "Columns give who produces the state that the next request starts from, and rows give whether the tests that earlier stages of the same run passed are systematically rerun after later changes. Pass-to-pass tests fixed in advance for each issue, as in SWE-bench and ChainSWE, may cover some earlier behavior but are not such a rerun.", 1600, 1088],
    ["Evaluation scopes and how far mechanisms have been tested.", "Each runtime mechanism appears at the widest scope at which it has been evaluated, and each training method at the scope of the episodes it trains on. Most mechanisms have been tested only on bounded requests, which cannot show whether they help in a continuing project. The last row gives what remains open at each scope.", 1600, 988],
    ["A runtime for continuing projects.", "The dashed link denotes knowledge supplied to analysis; failed checks reopen editing. Subscripts count closed engineering units. In many protocols a unit also closes after failed checks, and the next unit inherits that state.", 1600, 707],
    ["From training data to learned behavior.", "The pipeline that most training results follow, with the limits that keep almost all of them within a single request.", 1600, 831],
    ["Equal stage success can conceal different chain outcomes.", "Each row is a constructed five-stage chain, and every stage is attempted after earlier failures. A chain counts as successful only when all five stages pass.", 1600, 695],
    ["Four ways continuing work can fail.", "The badge in each card gives the type of study that has examined each failure.", 1600, 719],
  ],

  // [group, [[problem, what is known, first experiment], ...]]
  problems: [
    ["Long-term maintenance benchmarks", [
      ["Measuring retention", "Per-issue and whole-chain success; earlier tests rerun; regressions inside precision scores", "Declared obligation record; state saved per checkpoint; rerun validated checks of still-active obligations"],
      ["Successor-task validity", "In ChainSWE, the later problem differs between Oracle and sequential modes, as inherited code differs", "Later requests classified on agent state; common predecessor states; split by earlier outcome"],
      ["Inherited code and external change", "Chain benchmarks carry the agent’s own code; SWE-Touch injects outside edits in one task", "Outside edits injected into an agent-produced chain"],
      ["A common report for continuing work", "Each measurement is reported by some study; definitions differ across benchmarks", "One obligation split and one measurement set across several persistent protocols"],
      ["Transfer beyond one benchmark", "High scores can reflect one-benchmark adaptation; fresh task sets only partly help", "One configuration held fixed across independent benchmarks and freshly reconstructed repositories"],
    ]],
    ["Consistent revision of code and knowledge", [
      ["Selective revision", "Retained dialogue gives no consistent offset for inherited code; EvoMem revises under reference updates", "Hold the project change fixed; vary knowledge representation and repair actions under matched budgets"],
      ["Requirement status", "Agents can keep superseded behavior; no reviewed study isolates requirement status across requests", "Fixed code and notes; vary only whether a later request retires an earlier requirement"],
      ["Delivering experience", "Most tested solver–memory pairings do not beat memory-off", "Memory-off vs. revision-tagged retrieval vs. independently selected relevant records"],
      ["Repairing compromised memory", "Insertion, recall, effect, and repair are separable; repair fails mainly through collateral loss of benign memories", "Poisoned-record removal; check what derived summaries and code still carry from it"],
      ["Handoff and understanding", "Context reduces rediscovery; agents can weaken comprehension relative to a chatbot", "Matched takeovers with different handoff records; successor correctness and time"],
    ]],
    ["Learning from inherited state and delayed failures", [
      ["Learning from inherited state", "Chained pull-request data, gains not isolated; failed repair patches seed higher-order bugs", "Training with vs. without state carryover; matched data and compute"],
      ["Credit for delayed failures", "Process signals only within one task, e.g., guiding rollouts or a trajectory-level reward", "Later failures labeled as regressions, older defects, or new requirements before credit assignment"],
      ["Recovery from damaged states", "Guided retries in fresh rollouts; same-task resumption from earlier saved states", "Training from settled states left by earlier failed attempts"],
    ]],
    ["Verification coverage and reliability", [
      ["Checks for active obligations", "Spec writing limits proofs; variant-guided tests strengthen oracles given a reference patch", "Checks derived from accepted changes; later-regression detection"],
      ["Validated process judges", "Judges add design and process-quality information; their agreement must itself be measured", "Agreement, false positives, and robustness to alternative valid solutions on long trajectories"],
    ]],
    ["Coordination, oversight, and governance", [
      ["Coordination without shared specifications", "Full specifications restore accuracy; conflict reports alone do not", "Interface details omitted across parallel worktrees; detection before merge"],
      ["Spending review and verification", "Repository activity can outgrow review capacity; the benefit of running code is concentrated in some tasks", "Fixed-budget check allocation to high-dependency changes; human review time reported separately"],
    ]],
  ],
};
