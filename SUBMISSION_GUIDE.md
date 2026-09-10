# Submission Guide: civ-sim

Detailed instructions for submitting the civ-sim model description and source code to four academic venues.

---

## 1. JASSS (Journal of Artificial Societies and Social Simulation)

**URL:** https://www.jasss.org  
**Type:** Peer-reviewed open-access journal  
**Turnaround:** 3-6 months typical  
**Cost:** No publication fees (open access by default)

### Submission Format

JASSS accepts ODD protocol descriptions as standalone model description articles. The `ODD_D_PROTOCOL.md` document follows the Müller et al. (2013) ODD+D extension, which JASSS editors have endorsed.

### Steps

1. **Convert to submission format.** JASSS accepts HTML submissions. Convert the ODD+D protocol from Markdown to HTML, preserving all tables, references, and section structure. Pandoc command:
   ```bash
   pandoc ODD_D_PROTOCOL.md -f markdown -t html5 --standalone \
     --metadata title="ODD+D Protocol: civ-sim Civilization Simulation Model" \
     -o submission_jasss.html
   ```

2. **Prepare supplementary materials.** Bundle the following as a zip archive:
   - `js/simulation.js` — complete simulation source
   - `js/companion.js` — companion demographics module
   - `js/validation_suite.js` — validation infrastructure
   - `js/hindcast_runner.js` — hindcast validation runner
   - `js/scenario_test_harness.js` — calibration scenarios
   - `MODELING_ASSUMPTIONS.md` — full theoretical grounding
   - `README.md` — project overview and instructions
   - `package.json` — dependencies and build scripts

3. **Write cover letter.** Address to the Editor-in-Chief. Key points:
   - Model fills a gap: no existing macro-level civilization simulator operates at this breadth (13 domains, 250+ feedback loops) with explicit empirical grounding for each mechanism.
   - Distinguishing feature: absence of teleological or cultural assumptions. Novel societal configurations (currencyless, polycentric) can be modeled, not just variations of existing societies.
   - Validation: multi-level framework (UQ, hindcast, held-out, robustness) plus 7-country counterfactual diagnostic classifying deviations as structural vs configurable.
   - Counterfactual analysis capability: Lab Mode (snapshot, fork, compare trajectories) and Custom Events (12 presets, 20 sliders, structural modifiers) enable controlled diagnostic experiments.
   - Reproducibility: seeded PRNG, browser-executable, no server dependencies.

4. **Submit via JASSS online system.** Create account at the JASSS submission portal. Select article type: "Model Description." Upload HTML and supplementary zip.

### Reviewer Considerations

JASSS reviewers will focus on:
- Is the ODD+D complete? (Yes — all sections filled)
- Is the model reproducible? (Yes — seeded PRNG, self-contained JS)
- Are design choices justified? (Yes — every mechanism cites specific literature)
- Is validation appropriate? (Discuss honestly: 28-36% UQ coverage is modest; emphasize it as a transparency measure, not a sufficiency claim. The 7-country counterfactual diagnostic shows which deviations are structural vs configurable)

---

## 2. SocArXiv

**URL:** https://osf.io/preprints/socarxiv  
**Type:** Open-access preprint server (not peer-reviewed)  
**Turnaround:** 1-3 days for moderation  
**Cost:** Free

### Purpose

SocArXiv provides immediate public availability while JASSS peer review proceeds. Preprint establishes priority date and allows community feedback.

### Steps

1. **Create OSF account** at https://osf.io if not already registered.

2. **Create OSF project.** This will host the preprint and its associated data/code:
   - Project title: "civ-sim: A Multi-Domain Civilization Simulation Model"
   - Description: Brief abstract (can reuse the Purpose section from the ODD+D protocol)
   - Tags: agent-based model, civilization simulation, institutional dynamics, social trust, macrosociology, ODD protocol

3. **Upload project files to OSF.** Create a "Code" component with the complete codebase. This serves as the permanent archive. Include:
   - Full source code (js/ directory)
   - Configuration and build files
   - Validation scripts and results
   - Documentation (README.md, MODELING_ASSUMPTIONS.md, ODD_D_PROTOCOL.md)

4. **Submit preprint.** From the OSF project page:
   - Click "Add Preprint"
   - Select SocArXiv as the preprint server
   - Upload the ODD+D protocol as a PDF:
     ```bash
     pandoc ODD_D_PROTOCOL.md -f markdown -o civ-sim_ODD_D.pdf \
       --pdf-engine=xelatex \
       -V geometry:margin=1in \
       -V fontsize=11pt
     ```
   - Fill in metadata: authors, abstract, subjects (Sociology, Political Science, Economics)
   - Link to the OSF project for code/data access
   - Submit for moderation

5. **Add license.** Use MIT for code, CC-BY 4.0 for the preprint text.

### Notes

- SocArXiv allows updates. Post revised versions after incorporating JASSS reviewer feedback.
- The preprint DOI is citable immediately after moderation approval.
- Mention the SocArXiv preprint in the JASSS cover letter if submitted first.

---

## 3. Ronin Institute

**URL:** https://ronininstitute.org  
**Type:** Scholarly organization for independent researchers  
**Purpose:** Provides institutional affiliation and community

### Steps

1. **Apply for Research Scholar status.** Visit https://ronininstitute.org/join/ and complete the application:
   - Research area: Computational Social Science / Complex Systems
   - Research description: Describe civ-sim as an independent research project developing an empirically-grounded macro-level civilization simulation for structural analysis and counterfactual exploration.
   - CV/publications: Include any prior publications, conference presentations, or technical reports. The civ-sim codebase and SocArXiv preprint count as scholarly output.

2. **Once accepted as Research Scholar:**
   - Use "Ronin Institute" as institutional affiliation on all submissions (JASSS, SocArXiv, SESMO).
   - The affiliation format is: "Ronin Institute, Montclair, NJ, USA"
   - This provides legitimacy for independent scholarship that reviewers and editors expect.

3. **List civ-sim on Ronin research page.** Each Scholar gets a profile page. Add the project with links to:
   - SocArXiv preprint
   - GitHub repository (once set up)
   - Live web demo (once deployed)

4. **Engage with the Ronin community.** The Ronin Slack and mailing list include computational social scientists who may provide feedback or collaboration.

### Notes

- Ronin does not charge membership fees for Research Scholars (they accept donations).
- The application review typically takes 2-4 weeks.
- Having an institutional affiliation improves chances of fair review at peer-reviewed journals.

---

## 4. SESMO (Society for the Empirical Study of Macro-level Organization)

**URL:** Search for current SESMO conference/workshop announcements  
**Type:** Professional society / conference  
**Purpose:** Presentation and proceedings publication

### Steps

1. **Monitor for call for papers.** SESMO organizes workshops and conference sessions, typically in conjunction with larger conferences (AAMAS, Social Simulation Conference, or similar). Subscribe to their mailing list or follow announcements.

2. **Prepare extended abstract** (typically 2-4 pages for conference submission):
   - Title: "civ-sim: An Empirically-Grounded Multi-Domain Civilization Simulation"
   - Abstract: 150-250 words
   - Body: Focus on what distinguishes civ-sim from existing models:
     - 13 interacting domains with 250+ feedback loops
     - Explicit rejection of teleological assumptions
     - Ability to model novel societal configurations
     - Multi-level validation framework
     - Power-empathy suppression mechanism grounded in neuroscience
   - Figures: Include validation score summary table, one domain interaction diagram
   - References: Cite key theoretical sources (10-15)

3. **Prepare presentation materials:**
   - 15-20 minute talk with slides
   - Live demo if possible (the web-embeddable version)
   - Emphasize the structural plausibility approach and how it differs from calibration-driven models

4. **Submit via conference system** when the call for papers opens. Select track: macro-level modeling, computational social science, or complex systems.

### Notes

- Conference presentation provides direct engagement with the macro-simulation community.
- Proceedings papers are typically shorter than journal articles — the extended abstract format works well.
- Feedback from the SESMO community is particularly valuable because they understand macro-level modeling challenges.

---

## Recommended Submission Sequence

1. **Week 1: Ronin Institute application** — Submit early because approval takes 2-4 weeks. Use the affiliation on all subsequent submissions.

2. **Week 1-2: SocArXiv preprint** — Upload immediately for public availability and priority date. Use personal affiliation initially; update to Ronin once approved.

3. **Week 2-3: JASSS submission** — Submit the full ODD+D protocol with supplementary code. Reference the SocArXiv preprint DOI.

4. **When available: SESMO submission** — Prepare extended abstract for the next relevant conference or workshop call.

5. **Parallel: GitHub repository** — Set up public repository with full source code, documentation, and validation infrastructure. Link from all submissions.

6. **Parallel: Web deployment** — Deploy web-embeddable version for live demonstrations and public access.

---

## Pre-Submission Checklist

- [ ] ODD+D protocol complete (all Müller et al. 2013 sections)
- [ ] All references verified (no citation without corresponding reference)
- [ ] Validation scores current and documented
- [ ] Known limitations explicitly stated
- [ ] Source code clean and commented where mechanisms are non-obvious
- [ ] README includes build/run instructions
- [ ] License files in place (MIT for code, CC-BY for text)
- [ ] Seeded PRNG reproducibility verified
- [ ] SocArXiv preprint DOI obtained
- [ ] Ronin Institute affiliation confirmed
- [ ] JASSS cover letter drafted
- [ ] SESMO extended abstract drafted
- [ ] GitHub repository initialized with complete history
- [ ] Web demo deployed and tested
