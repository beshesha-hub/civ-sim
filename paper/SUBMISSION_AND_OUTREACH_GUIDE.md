# Submission, Outreach, and Conference Guide

## 1. Posting to SocArXiv (Recommended First Step)

SocArXiv is the easiest preprint server — no endorser needed, immediate posting.

### Steps:
1. Go to https://osf.io/preprints/socarxiv and click "Add a preprint"
2. Create an OSF account if you don't have one (free, email-based)
3. Convert the paper to PDF:
   - Install pandoc (`brew install pandoc` on Mac)
   - Run: `pandoc paper/civ-sim-paper-draft.md -o paper/civ-sim-paper.pdf --pdf-engine=wkhtmltopdf`
   - Or use any Markdown-to-PDF converter, or paste into Google Docs and export as PDF
   - For a more polished look, use a LaTeX template (JASSS provides one)
4. Upload the PDF
5. Fill in metadata:
   - **Title**: "civ-sim: A Bias-Aware Macro-Level Civilization Simulation with Multi-Level Validation"
   - **Subjects**: Social and Behavioral Sciences > Other Social and Behavioral Sciences; also tag "Computational Social Science" and "Agent-Based Modeling"
   - **Tags/Keywords**: agent-based modeling, civilization simulation, computational social science, bias-aware modeling, validation, counterfactual analysis, ODD protocol
   - **License**: CC-BY 4.0 (standard for preprints)
   - **Add the GitHub repo link** in the "Links" section
6. Click "Create" — it goes live within minutes
7. You'll get a DOI (e.g., doi:10.31235/osf.io/xxxxx) that you can cite and share

### Why SocArXiv over arXiv:
- No endorser requirement (arXiv requires a first-time endorser in your subject area)
- Social science audience aligns better with this work
- Equally citable (both issue DOIs)
- If you want arXiv too, you can cross-post later once you have the SocArXiv version

## 2. Posting to arXiv (Optional, Broader Reach)

arXiv has a larger audience but requires an endorser for first submissions.

### Steps:
1. Create an account at https://arxiv.org/user/register
2. Choose category: **cs.MA** (Multi-Agent Systems) or **physics.soc-ph** (Physics and Society)
3. First-time submitters need an endorser — someone who has published in that category
4. To find an endorser:
   - arXiv has an endorsement request system — when you try to submit, it lets you request endorsement
   - Email researchers who have published in cs.MA (any of the people in the contact list below) and ask if they'd endorse your submission
   - Endorsement is lightweight — it just means someone vouches that your paper is appropriate for the category
5. Upload PDF + source files
6. Paper appears within 1-2 business days after endorsement

## 3. Submitting to JASSS

JASSS (Journal of Artificial Societies and Social Simulation) is the target peer-reviewed venue.

### About JASSS:
- Open access, no publication fees
- Published by the University of Surrey
- Impact factor: ~2.5 (respectable for a specialized journal)
- Typical review time: 3-6 months
- Accepts: research articles, review articles, forum pieces
- No institutional affiliation required
- Uses the ODD protocol — your ODD+D documentation is in their language

### Submission steps:
1. Go to https://www.jasss.org/admin/submit.html
2. Create an author account
3. Format requirements:
   - HTML is the final publication format, but submit in **Word or PDF** for review
   - References in author-date format (already done in the draft)
   - Figures/tables embedded in the document
   - Supplementary materials (code, data) linked via repository URL
4. Cover letter (keep it brief):

> Dear Editors,
>
> We submit "civ-sim: A Bias-Aware Macro-Level Civilization Simulation with Multi-Level Validation" for consideration as a Research Article in JASSS.
>
> The paper presents an open-source civilization simulation framework whose central design principle is the explicit avoidance of teleological assumptions — no governance or economic model is coded as inherently superior. The framework is validated through a six-level protocol including uncertainty quantification, hindcasting against four historical trajectories, and cross-validation. A counterfactual analysis engine enables controlled experimental comparison of divergent trajectories.
>
> The complete source code, validation suite, and ODD+D protocol documentation are publicly available at [GitHub URL]. A preprint is available at [SocArXiv DOI].
>
> This work has not been submitted elsewhere.
>
> Sincerely,
> Barak Water

5. Suggest reviewers (optional but helpful):
   - Suggest 2-3 people from the researcher list below who work in related areas
   - The editor may or may not use your suggestions

### Alternative venues if JASSS declines:
- **Computational and Mathematical Organization Theory** (Springer)
- **Journal of Computational Social Science** (Springer)
- **Simulation** (SAGE)
- **Complexity** (Wiley/Hindawi, open access)
- **PLOS ONE** (broad scope, open access, ~$1,800 publication fee)

## 4. Researchers to Contact

For each person below: find their current email on their institutional webpage (search "[Name] [University]"). Emails change; the ones on their official page are current.

### Tier 1: Most Likely to Engage (work directly overlaps)

**Flaminio Squazzoni**
- University of Milan, Department of Social and Political Sciences
- Editor-in-chief of JASSS
- Research: computational social science, agent-based modeling methodology, trust and cooperation
- Why contact: He decides what JASSS publishes. Even if he can't review your paper himself, he can tell you whether it fits and suggest reviewers
- Find email: Search "Flaminio Squazzoni University of Milan"

**Volker Grimm**
- Helmholtz Centre for Environmental Research (UFZ), Leipzig, Germany
- Co-creator of the ODD protocol
- Research: ecological modeling, pattern-oriented modeling, model documentation standards
- Why contact: You used his protocol (ODD+D). He'll be interested in seeing it applied to civilizational modeling, which is unusual. Could become a collaborator on methodology
- Find email: Search "Volker Grimm UFZ Leipzig"

**Gary Polhill**
- James Hutton Institute, Aberdeen, Scotland
- ODD protocol co-author, JASSS editorial board
- Research: social simulation, land use modeling, agent-based modeling methodology
- Why contact: JASSS insider, ODD expert, interested in novel applications
- Find email: Search "Gary Polhill James Hutton Institute"

**Peter Turchin**
- Complexity Science Hub Vienna (formerly University of Connecticut)
- Research: cliodynamics, mathematical history, Seshat Global History Databank
- Why contact: His work is the closest existing research program to what civ-sim does. He quantifies historical dynamics mathematically. Your hindcasting approach speaks his language
- Find email: Search "Peter Turchin Complexity Science Hub"

### Tier 2: Strong Overlap, Established Researchers

**Lars-Erik Cederman**
- ETH Zurich, Center for Comparative and International Studies
- Research: computational modeling of state formation, ethnic conflict, civil war
- Why contact: His GeoSim and related models are direct predecessors. Your multi-domain approach extends territory he's worked in
- Find email: Search "Lars-Erik Cederman ETH Zurich"

**Robert Axtell**
- George Mason University, Department of Computational Social Science
- Research: agent-based computational economics, Sugarscape, large-scale social simulation
- Why contact: Pioneer of the field. George Mason has a whole department for this. He's also relatively accessible compared to other big names
- Find email: Search "Robert Axtell George Mason University"

**Bo Rothstein**
- University of Gothenburg, Quality of Government Institute
- Research: corruption, social trust, quality of government, institutional theory
- Why contact: Your corruption modeling and trust dynamics are directly in his wheelhouse. The bias-aware approach aligns with his critique of Western-centric governance metrics
- Find email: Search "Bo Rothstein University of Gothenburg"

**Giangiacomo Bravo**
- Linnaeus University, Sweden
- Research: social simulation, agent-based modeling, collective action, common pool resources
- Why contact: Active in the JASSS community, responsive to new work, interested in methodological innovation
- Find email: Search "Giangiacomo Bravo Linnaeus University"

### Tier 3: Worth Trying (famous, lower response probability)

**Joshua Epstein**
- NYU, Department of Epidemiology (and Agent Zero lab)
- Research: generative social science, Sugarscape, agent-based modeling theory
- Why contact: His "Why Model?" paper (2008) is foundational. Your work embodies his argument that models are for structured reasoning, not just prediction
- Find email: Search "Joshua Epstein NYU"

**Dirk Helbing**
- ETH Zurich, Computational Social Science
- Research: social simulation, FuturICT project, self-organization
- Why contact: Led the FuturICT initiative which aimed to build large-scale social simulation. Your project is a solo version of something his group has worked toward
- Find email: Search "Dirk Helbing ETH Zurich"

**Yaneer Bar-Yam**
- New England Complex Systems Institute (NECSI), Cambridge MA
- Research: complex systems, multi-scale analysis, societal dynamics
- Why contact: NECSI is independent (not a university), which means he understands non-academic research paths. Closest to LA of the US-based researchers (Boston)
- Find email: Search "Yaneer Bar-Yam NECSI"

## 5. Email Template

Subject: **Feedback on a bias-aware civilization simulation with validation framework**

> Dear Professor [Name],
>
> I'm an independent researcher who has built an open-source civilization simulation framework and would value your perspective on it.
>
> The project (civ-sim) models the co-evolution of economic, governance, social, demographic, and environmental systems using ~130 state variables connected by ~250 empirically grounded feedback loops. The central design principle is the explicit avoidance of teleological assumptions — no governance or economic model is coded as inherently superior, and emergent outcomes arise from mechanism interaction (drawing on Piketty, Minsky, Acemoglu-Robinson, Keltner's power-empathy research, and others).
>
> I've validated it through a six-level protocol including hindcasting against four historical trajectories (71-76% waypoint accuracy), uncertainty quantification across 12 country profiles, and cross-validation showing 75% generalization from mechanisms rather than initial conditions. A counterfactual analysis engine enables controlled "what if?" experiments.
>
> [PERSONALIZE: 1-2 sentences connecting to their specific work. Examples:]
> - For Turchin: "Your cliodynamic framework was a key influence on the hindcasting approach, and I'd be interested in your assessment of how the multi-domain coupling compares to your secular cycle models."
> - For Grimm: "The model is documented using the ODD+D protocol, and I'd welcome your perspective on how the protocol serves a civilizational-scale model versus its more typical ecological applications."
> - For Rothstein: "Your work on the relationship between corruption, social trust, and institutional quality directly informed the model's governance dynamics, particularly the finding that corruption is better modeled as a structural feature of power concentration than as governance failure."
>
> The preprint is available at [SocArXiv DOI], and the complete source code, validation suite, and documentation are at [GitHub URL].
>
> I would welcome any feedback, and would be glad to discuss potential collaboration if the work interests you.
>
> Best regards,
> Barak Water

### Tips:
- **Personalize the bracketed section** for each person. Generic emails get ignored; specific connections to their work get read
- **Keep it under 300 words total.** Academics scan, they don't read cold emails
- **Don't apologize** for not having an affiliation. State what you built and let the work speak
- **Send Tuesday-Thursday mornings** (their local time). Monday and Friday emails get buried
- **Follow up once** after 2 weeks if no response, then move on. One follow-up is professional; two is pushing it
- **Expect a ~20% response rate.** If you email 10 people and get 2 substantive responses, that's a success

## 6. Conferences

### Nearest / Most Affordable from Los Angeles

**Computational Social Science Society of the Americas (CSSSA)**
- Annual, typically October-November
- US-based, location rotates (has been in Santa Fe NM, Arlington VA, Pittsburgh PA)
- Registration: typically $100-200 for non-students
- Very accessible community, friendly to independent researchers
- Submission: 2-page extended abstract
- Website: computationalsocialscience.org (check for 2027 dates — 2026 may have already passed)
- **Best fit for this work.** Small enough to actually meet people

**Winter Simulation Conference (WSC)**
- Annual, typically December
- Large conference, US-based (rotates cities — has been in Phoenix, Orlando, San Antonio)
- Registration: $600-900 (early bird), but has reduced rates
- Very broad scope — your work would go in the "Agent-Based Simulation" track
- Website: wintersim.org
- Worth attending to network even without presenting

**NetSci**
- Annual, typically June-July
- International (location rotates globally)
- Registration: $300-500
- Focus: network science, but has social simulation tracks
- Your diffusion and network topology modeling fits here
- Website: netsci-society.net

**ALife (Artificial Life)**
- Annual/biennial
- International, sometimes US-based
- Registration: $300-500
- Focus: artificial life, complex adaptive systems
- Website: alife.org

**Conference on Complex Systems (CCS)**
- Annual, typically September-October
- International, usually Europe but sometimes elsewhere
- Registration: $200-400
- Organized by the Complex Systems Society
- Website: cssociety.org
- Broad scope, good for cross-disciplinary visibility

### How to Submit a Talk

Most of these accept:
1. **Extended abstract** (1-2 pages) — easiest, lowest commitment
2. **Full paper** — some conferences have proceedings
3. **Poster** — lowest barrier, still gets you in the room

For your first conference, submit an extended abstract to CSSSA focusing on either:
- The bias-aware design principles + validation results (methodology angle)
- The counterfactual engine as a tool for policy exploration (applied angle)

### Budget Considerations
- CSSSA is the best value: affordable registration, often in drivable-from-LA locations
- Most conferences have fee waivers or reduced rates — email the organizers and explain you're an independent researcher. Many will accommodate
- If a conference is fully virtual or hybrid, that eliminates travel costs entirely
- University seminars are free to attend — some universities near LA (UCLA, USC, Caltech, UC Irvine) have complexity/computational social science seminars that accept outside speakers. Email the seminar organizer

## 7. Next Steps Checklist

- [ ] Convert paper draft to PDF
- [ ] Post to SocArXiv
- [ ] Send emails to 5-8 researchers (personalize each one)
- [ ] Submit to JASSS
- [ ] Apply to present at CSSSA (check submission deadline)
- [ ] Look into UCLA/USC/UCI complexity seminars as local speaking opportunities
