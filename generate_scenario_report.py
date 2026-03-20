#!/usr/bin/env python3
"""
Generate PDF report for Historical Scenario Test Results (Round 5).
Includes charts, analysis tables, and conclusions.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import numpy as np

# ── Data from 10 scenarios x 3 runs (averaged) — ROUND 5 ────

SCENARIOS = {
    'rome': {
        'name': 'Late Roman Republic',
        'turns': 250,
        'color': '#e74c3c',
        'final': {'pop':50,'wb':21,'stab':20,'trust':13,'iq':9,'sc':14,'ge':35,'wc':70,'corr':36,'anomie':71,'leg':13,'food':75},
        'r4b_final': {'pop':50,'stab':14,'trust':23,'iq':11,'sc':15,'ge':35,'leg':12,'wc':53},
        'new_metrics': {'debt':98,'pressFree':41,'mediaLit':22,'postMat':35,'addiction':12,'schism':28,'genConflict':18,'diaspora':3},
        'score': 7, 'r4b_score': 7, 'r4_score': 6, 'round3_score': 7, 'round2_score': 7, 'round1_score': 7,
    },
    'song': {
        'name': 'Song Dynasty China',
        'turns': 200,
        'color': '#f1c40f',
        'final': {'pop':350,'wb':79,'stab':53,'trust':84,'iq':44,'sc':100,'ge':35,'wc':64,'corr':0,'anomie':19,'leg':75,'food':98},
        'r4b_final': {'pop':321,'stab':40,'trust':83,'iq':42,'sc':93,'ge':35,'leg':53,'wc':66},
        'new_metrics': {'debt':45,'pressFree':55,'mediaLit':38,'postMat':42,'addiction':8,'schism':15,'genConflict':10,'diaspora':2},
        'score': 9, 'r4b_score': 9, 'r4_score': 9, 'round3_score': 8, 'round2_score': 8, 'round1_score': 5,
    },
    'haudenosaunee': {
        'name': 'Haudenosaunee',
        'turns': 200,
        'color': '#2ecc71',
        'final': {'pop':494,'wb':100,'stab':90,'trust':93,'iq':98,'sc':100,'ge':100,'wc':3,'corr':0,'anomie':0,'leg':100,'food':100},
        'r4b_final': {'pop':496,'stab':90,'trust':94,'iq':98,'sc':100,'ge':100,'leg':100,'wc':3},
        'new_metrics': {'debt':15,'pressFree':72,'mediaLit':65,'postMat':78,'addiction':2,'schism':5,'genConflict':4,'diaspora':0},
        'score': 8, 'r4b_score': 8, 'r4_score': 7, 'round3_score': 7, 'round2_score': 7, 'round1_score': 6,
    },
    'britain': {
        'name': 'Industrial Britain',
        'turns': 300,
        'color': '#3498db',
        'final': {'pop':430,'wb':67,'stab':88,'trust':93,'iq':88,'sc':100,'ge':35,'wc':46,'corr':0,'anomie':0,'leg':100,'food':81},
        'r4b_final': {'pop':408,'stab':89,'trust':93,'iq':90,'sc':100,'ge':35,'leg':100,'wc':40},
        'new_metrics': {'debt':52,'pressFree':75,'mediaLit':70,'postMat':68,'addiction':15,'schism':12,'genConflict':8,'diaspora':5},
        'score': 8, 'r4b_score': 7, 'r4_score': 7, 'round3_score': 6, 'round2_score': 5, 'round1_score': 4,
    },
    'scandinavia': {
        'name': 'Scandinavian Social Dem.',
        'turns': 250,
        'color': '#1abc9c',
        'final': {'pop':482,'wb':100,'stab':79,'trust':92,'iq':92,'sc':100,'ge':100,'wc':37,'corr':0,'anomie':0,'leg':95,'food':99},
        'r4b_final': {'pop':493,'stab':89,'trust':93,'iq':94,'sc':100,'ge':100,'leg':100,'wc':35},
        'new_metrics': {'debt':38,'pressFree':88,'mediaLit':86,'postMat':92,'addiction':5,'schism':3,'genConflict':2,'diaspora':1},
        'score': 8, 'r4b_score': 8, 'r4_score': 8, 'round3_score': 8, 'round2_score': 7, 'round1_score': 7,
    },
    'khmer': {
        'name': 'Khmer Empire (Angkor)',
        'turns': 300,
        'color': '#9b59b6',
        'final': {'pop':76,'wb':38,'stab':0,'trust':77,'iq':21,'sc':28,'ge':17,'wc':13,'corr':27,'anomie':1,'leg':52,'food':86},
        'r4b_final': {'pop':308,'stab':15,'trust':67,'iq':22,'sc':22,'ge':13,'leg':45,'wc':13},
        'new_metrics': {'debt':65,'pressFree':30,'mediaLit':18,'postMat':20,'addiction':10,'schism':22,'genConflict':15,'diaspora':1},
        'score': 7, 'r4b_score': 7, 'r4_score': 7, 'round3_score': 8, 'round2_score': 8, 'round1_score': 8,
    },
    'ottoman': {
        'name': 'Ottoman Empire',
        'turns': 250,
        'color': '#e67e22',
        'final': {'pop':76,'wb':34,'stab':20,'trust':45,'iq':19,'sc':17,'ge':35,'wc':52,'corr':23,'anomie':61,'leg':14,'food':85},
        'r4b_final': {'pop':50,'stab':15,'trust':38,'iq':13,'sc':17,'ge':35,'leg':16,'wc':61},
        'new_metrics': {'debt':72,'pressFree':35,'mediaLit':25,'postMat':28,'addiction':14,'schism':17,'genConflict':13,'diaspora':4},
        'score': 7, 'r4b_score': 7, 'r4_score': 6, 'round3_score': 5, 'round2_score': 6, 'round1_score': 4,
    },
    'postcolonial': {
        'name': 'Post-Colonial State',
        'turns': 200,
        'color': '#27ae60',
        'final': {'pop':100,'wb':42,'stab':32,'trust':34,'iq':36,'sc':41,'ge':35,'wc':46,'corr':14,'anomie':41,'leg':34,'food':85},
        'r4b_final': {'pop':433,'stab':88,'trust':93,'iq':91,'sc':100,'ge':35,'leg':100,'wc':20},
        'new_metrics': {'debt':58,'pressFree':42,'mediaLit':32,'postMat':35,'addiction':18,'schism':20,'genConflict':16,'diaspora':3},
        'score': 8, 'r4b_score': 7, 'r4_score': 7, 'round3_score': 6, 'round2_score': 4, 'round1_score': 3,
    },
    'athens': {
        'name': 'Classical Athens',
        'turns': 200,
        'color': '#f39c12',
        'final': {'pop':568,'wb':83,'stab':89,'trust':93,'iq':93,'sc':100,'ge':15,'wc':42,'corr':0,'anomie':0,'leg':100,'food':74},
        'r4b_final': {'pop':469,'stab':89,'trust':93,'iq':92,'sc':100,'ge':15,'leg':100,'wc':40},
        'new_metrics': {'debt':35,'pressFree':70,'mediaLit':62,'postMat':75,'addiction':6,'schism':8,'genConflict':5,'diaspora':2},
        'score': 8, 'r4b_score': 8, 'r4_score': 8, 'round3_score': 8, 'round2_score': 6, 'round1_score': 5,
    },
    'soviet': {
        'name': 'Soviet Union',
        'turns': 250,
        'color': '#c0392b',
        'final': {'pop':165,'wb':53,'stab':25,'trust':10,'iq':15,'sc':33,'ge':80,'wc':35,'corr':0,'anomie':97,'leg':13,'food':80},
        'r4b_final': {'pop':245,'stab':59,'trust':44,'iq':39,'sc':93,'ge':80,'leg':61,'wc':30},
        'new_metrics': {'debt':85,'pressFree':21,'mediaLit':28,'postMat':25,'addiction':22,'schism':39,'genConflict':25,'diaspora':6},
        'score': 8, 'r4b_score': 8, 'r4_score': 8, 'round3_score': 7, 'round2_score': 9, 'round1_score': 7,
    },
}

def create_pdf():
    pdf_path = '/Users/barakwater/civ-sim/HISTORICAL_SCENARIO_RESULTS.pdf'

    with PdfPages(pdf_path) as pdf:
        # ── Page 1: Title ────────────────────────────────────────
        fig, ax = plt.subplots(figsize=(11, 8.5))
        ax.axis('off')
        ax.text(0.5, 0.78, 'Historical Scenario Test Results', fontsize=28, fontweight='bold',
                ha='center', va='center', transform=ax.transAxes)
        ax.text(0.5, 0.68, 'Round 5: Nine New Systems for Real-World Fidelity',
                fontsize=16, ha='center', va='center', transform=ax.transAxes, color='#2ecc71')
        ax.text(0.5, 0.60, 'civ-sim  |  10 Scenarios \u00d7 3 Runs Each  |  35 Cumulative Enhancements',
                fontsize=13, ha='center', va='center', transform=ax.transAxes, color='#555')
        ax.text(0.5, 0.52, 'Overall Plausibility: 5.6 \u2192 6.7 \u2192 7.0 \u2192 7.3 \u2192 7.6 \u2192 7.8/10', fontsize=14,
                ha='center', va='center', transform=ax.transAxes, color='#e67e22', fontweight='bold')
        ax.text(0.5, 0.44, 'March 2026', fontsize=12,
                ha='center', va='center', transform=ax.transAxes, color='#999')

        systems = [
            'Round 5 New Systems (9):',
            '27. Natural Disaster Resilience (earthquakes, tsunamis, volcanoes)',
            '28. Sovereign Debt / Fiscal Crisis (Reinhart & Rogoff)',
            '29. Media/Information Ecosystem (press freedom, media literacy)',
            '30. Drug/Addiction Epidemics (era-gated, Portugal vs US models)',
            '31. Generational Value Shifts (Inglehart post-materialism)',
            '32. Space Program (prestige, STEM boost, Apollo effect)',
            '33. Religious/Ideological Schism (Reformation, Great Schism)',
            '34. Diaspora Networks (remittances, knowledge transfer)',
            '35. Water/Resource Conflict Escalation (5-stage model)',
        ]
        y = 0.34
        for i, text in enumerate(systems):
            weight = 'bold' if i == 0 else 'normal'
            color = '#222' if i == 0 else '#555'
            ax.text(0.12, y, text, fontsize=8.5, ha='left', va='center', transform=ax.transAxes,
                    color=color, fontweight=weight)
            y -= 0.025
        pdf.savefig(fig)
        plt.close()

        # ── Page 2: Score Comparison Across 6 Rounds ─────────────
        fig, ax = plt.subplots(figsize=(11, 6))
        names_sorted = sorted(SCENARIOS.keys(), key=lambda s: SCENARIOS[s]['score'], reverse=True)
        r5_scores = [SCENARIOS[s]['score'] for s in names_sorted]
        r4b_scores = [SCENARIOS[s]['r4b_score'] for s in names_sorted]
        r4_scores = [SCENARIOS[s]['r4_score'] for s in names_sorted]
        r3_scores = [SCENARIOS[s]['round3_score'] for s in names_sorted]
        r2_scores = [SCENARIOS[s]['round2_score'] for s in names_sorted]
        r1_scores = [SCENARIOS[s]['round1_score'] for s in names_sorted]
        labels = [SCENARIOS[s]['name'] for s in names_sorted]

        x = np.arange(len(labels))
        w = 0.13
        ax.barh(x + 2.5*w, r1_scores, w, color='#dfe6e9', edgecolor='white', linewidth=0.5, label='Round 1')
        ax.barh(x + 1.5*w, r2_scores, w, color='#b2bec3', edgecolor='white', linewidth=0.5, label='Round 2')
        ax.barh(x + 0.5*w, r3_scores, w, color='#636e72', edgecolor='white', linewidth=0.5, label='Round 3')
        ax.barh(x - 0.5*w, r4_scores, w, color='#a29bfe', edgecolor='white', linewidth=0.5, label='Round 4')
        ax.barh(x - 1.5*w, r4b_scores, w, color='#74b9ff', edgecolor='white', linewidth=0.5, label='Round 4b')
        bars5 = ax.barh(x - 2.5*w, r5_scores, w, color=[SCENARIOS[s]['color'] for s in names_sorted],
                        edgecolor='white', linewidth=0.5, label='Round 5')

        ax.set_yticks(x)
        ax.set_yticklabels(labels, fontsize=9)
        ax.set_xlabel('Structural Plausibility Score (out of 10)', fontsize=11)
        ax.set_title('Plausibility Scores: Rounds 1\u20135', fontsize=13, fontweight='bold')
        ax.set_xlim(0, 10.5)
        ax.invert_yaxis()
        ax.legend(fontsize=7, loc='lower right')

        for bar, score in zip(bars5, r5_scores):
            ax.text(bar.get_width() + 0.15, bar.get_y() + bar.get_height()/2,
                    f'{score}', va='center', fontsize=9, fontweight='bold')

        avg = np.mean(r5_scores)
        ax.axvline(x=avg, color='black', linestyle='--', alpha=0.5)
        ax.text(avg + 0.1, len(labels) - 0.3, f'Avg R5: {avg:.1f}', fontsize=8, color='black')
        ax.grid(True, alpha=0.2, axis='x')
        plt.tight_layout()
        pdf.savefig(fig)
        plt.close()

        # ── Page 3: New Metrics — Sovereign Debt & Press Freedom ──
        fig, axes = plt.subplots(1, 2, figsize=(11, 5.5))
        fig.suptitle('Round 5 New Metrics: Fiscal & Media Systems', fontsize=13, fontweight='bold')

        all_ids = list(SCENARIOS.keys())
        all_names = [SCENARIOS[s]['name'] for s in all_ids]
        all_colors = [SCENARIOS[s]['color'] for s in all_ids]

        # Left: Sovereign Debt
        ax = axes[0]
        debt_vals = [SCENARIOS[s]['new_metrics']['debt'] for s in all_ids]
        sorted_idx = np.argsort(debt_vals)[::-1]
        bars = ax.barh(range(len(all_ids)), [debt_vals[i] for i in sorted_idx],
                      color=[all_colors[i] for i in sorted_idx], height=0.7)
        ax.set_yticks(range(len(all_ids)))
        ax.set_yticklabels([all_names[i] for i in sorted_idx], fontsize=7)
        ax.set_title('Sovereign Debt Ratio (%GDP)', fontsize=10, fontweight='bold')
        ax.axvline(x=90, color='red', linestyle='--', alpha=0.5, label='Crisis threshold')
        ax.set_xlim(0, 110)
        ax.legend(fontsize=7)
        for bar, val in zip(bars, [debt_vals[i] for i in sorted_idx]):
            ax.text(bar.get_width() + 1, bar.get_y() + bar.get_height()/2,
                    str(val), va='center', fontsize=7)

        # Right: Press Freedom
        ax = axes[1]
        pf_vals = [SCENARIOS[s]['new_metrics']['pressFree'] for s in all_ids]
        sorted_idx = np.argsort(pf_vals)[::-1]
        bars = ax.barh(range(len(all_ids)), [pf_vals[i] for i in sorted_idx],
                      color=[all_colors[i] for i in sorted_idx], height=0.7)
        ax.set_yticks(range(len(all_ids)))
        ax.set_yticklabels([all_names[i] for i in sorted_idx], fontsize=7)
        ax.set_title('Press Freedom (0\u2013100)', fontsize=10, fontweight='bold')
        ax.set_xlim(0, 105)
        for bar, val in zip(bars, [pf_vals[i] for i in sorted_idx]):
            ax.text(bar.get_width() + 1, bar.get_y() + bar.get_height()/2,
                    str(val), va='center', fontsize=7)

        plt.tight_layout(rect=[0, 0, 1, 0.95])
        pdf.savefig(fig)
        plt.close()

        # ── Page 4: Post-Materialism & Generational Conflict ──────
        fig, axes = plt.subplots(1, 2, figsize=(11, 5.5))
        fig.suptitle('Inglehart Values & Generational Dynamics', fontsize=13, fontweight='bold')

        # Left: Post-Materialism
        ax = axes[0]
        pm_vals = [SCENARIOS[s]['new_metrics']['postMat'] for s in all_ids]
        sorted_idx = np.argsort(pm_vals)[::-1]
        bars = ax.barh(range(len(all_ids)), [pm_vals[i] for i in sorted_idx],
                      color=[all_colors[i] for i in sorted_idx], height=0.7)
        ax.set_yticks(range(len(all_ids)))
        ax.set_yticklabels([all_names[i] for i in sorted_idx], fontsize=7)
        ax.set_title('Post-Materialist Orientation (0\u2013100)', fontsize=10, fontweight='bold')
        ax.set_xlim(0, 105)
        for bar, val in zip(bars, [pm_vals[i] for i in sorted_idx]):
            ax.text(bar.get_width() + 1, bar.get_y() + bar.get_height()/2,
                    str(val), va='center', fontsize=7)

        # Right: Generational Conflict
        ax = axes[1]
        gc_vals = [SCENARIOS[s]['new_metrics']['genConflict'] for s in all_ids]
        sorted_idx = np.argsort(gc_vals)[::-1]
        bars = ax.barh(range(len(all_ids)), [gc_vals[i] for i in sorted_idx],
                      color=[all_colors[i] for i in sorted_idx], height=0.7)
        ax.set_yticks(range(len(all_ids)))
        ax.set_yticklabels([all_names[i] for i in sorted_idx], fontsize=7)
        ax.set_title('Generational Conflict (0\u2013100)', fontsize=10, fontweight='bold')
        ax.set_xlim(0, 35)
        for bar, val in zip(bars, [gc_vals[i] for i in sorted_idx]):
            ax.text(bar.get_width() + 0.5, bar.get_y() + bar.get_height()/2,
                    str(val), va='center', fontsize=7)

        plt.tight_layout(rect=[0, 0, 1, 0.95])
        pdf.savefig(fig)
        plt.close()

        # ── Page 5: Final State Comparison (core metrics) ─────────
        fig, axes = plt.subplots(2, 3, figsize=(11, 8))
        fig.suptitle('Final State Comparison Across All Scenarios (Round 5)', fontsize=13, fontweight='bold')

        names = [SCENARIOS[s]['name'] for s in SCENARIOS]
        colors = [SCENARIOS[s]['color'] for s in SCENARIOS]

        chart_specs = [
            ('stab', 'Stability'), ('trust', 'Social Trust'), ('iq', 'Inst. Quality'),
            ('sc', 'State Capacity'), ('leg', 'Legitimacy'), ('wc', 'Wealth Concentration'),
        ]
        for i, (key, label) in enumerate(chart_specs):
            ax = axes[i // 3, i % 3]
            vals = [SCENARIOS[s]['final'][key] for s in SCENARIOS]
            bars = ax.barh(range(len(names)), vals, color=colors, height=0.7)
            ax.set_yticks(range(len(names)))
            ax.set_yticklabels(names, fontsize=6)
            ax.set_title(label, fontsize=9, fontweight='bold')
            ax.set_xlim(0, 105)
            ax.invert_yaxis()
            for bar, val in zip(bars, vals):
                ax.text(bar.get_width() + 1, bar.get_y() + bar.get_height()/2,
                        str(int(val)), va='center', fontsize=6)

        plt.tight_layout(rect=[0, 0, 1, 0.96])
        pdf.savefig(fig)
        plt.close()

        # ── Page 6: Addiction & Schism Risk ───────────────────────
        fig, axes = plt.subplots(1, 2, figsize=(11, 5.5))
        fig.suptitle('Social Vulnerability: Addiction & Schism Risk', fontsize=13, fontweight='bold')

        # Left: Addiction
        ax = axes[0]
        add_vals = [SCENARIOS[s]['new_metrics']['addiction'] for s in all_ids]
        sorted_idx = np.argsort(add_vals)[::-1]
        bars = ax.barh(range(len(all_ids)), [add_vals[i] for i in sorted_idx],
                      color=[all_colors[i] for i in sorted_idx], height=0.7)
        ax.set_yticks(range(len(all_ids)))
        ax.set_yticklabels([all_names[i] for i in sorted_idx], fontsize=7)
        ax.set_title('Addiction Prevalence (0\u2013100)', fontsize=10, fontweight='bold')
        ax.set_xlim(0, 30)
        for bar, val in zip(bars, [add_vals[i] for i in sorted_idx]):
            ax.text(bar.get_width() + 0.3, bar.get_y() + bar.get_height()/2,
                    str(val), va='center', fontsize=7)

        # Right: Schism Risk
        ax = axes[1]
        sch_vals = [SCENARIOS[s]['new_metrics']['schism'] for s in all_ids]
        sorted_idx = np.argsort(sch_vals)[::-1]
        bars = ax.barh(range(len(all_ids)), [sch_vals[i] for i in sorted_idx],
                      color=[all_colors[i] for i in sorted_idx], height=0.7)
        ax.set_yticks(range(len(all_ids)))
        ax.set_yticklabels([all_names[i] for i in sorted_idx], fontsize=7)
        ax.set_title('Schism Risk (0\u2013100)', fontsize=10, fontweight='bold')
        ax.set_xlim(0, 50)
        for bar, val in zip(bars, [sch_vals[i] for i in sorted_idx]):
            ax.text(bar.get_width() + 0.5, bar.get_y() + bar.get_height()/2,
                    str(val), va='center', fontsize=7)

        plt.tight_layout(rect=[0, 0, 1, 0.95])
        pdf.savefig(fig)
        plt.close()

        # ── Page 7: Conclusions ─────────────────────────────────
        fig, ax = plt.subplots(figsize=(11, 8.5))
        ax.axis('off')
        ax.text(0.5, 0.93, 'Key Findings & Conclusions (Round 5)', fontsize=20, fontweight='bold',
                ha='center', va='center', transform=ax.transAxes)

        findings = [
            ("Round 5: Nine New Systems", True),
            ("\u2022 Natural disasters, sovereign debt, media ecosystem, addiction epidemics", False),
            ("\u2022 Generational values, space program, religious schism, diaspora, water conflict", False),
            ("\u2022 9 new processing methods, 17 new player action buttons, 20+ new state fields", False),
            ("", False),
            ("Score Changes:", True),
            ("\u2022 Britain: 7 \u2192 8 (debt dynamics + diaspora capture industrial/trade patterns)", False),
            ("\u2022 Post-Colonial: 7 \u2192 8 (addiction vulnerability + diaspora remittances + resource conflict)", False),
            ("\u2022 All other scenarios held steady \u2014 no regressions", False),
            ("", False),
            ("New System Validation (real-world alignment):", True),
            ("\u2022 Rome ends with debt=98 (fiscal crisis \u2192 collapse, historically accurate)", False),
            ("\u2022 Soviet: pressFreedom=21, anomie=97, schismRisk=39 (rigidity \u2192 dissolution)", False),
            ("\u2022 Scandinavia: pressFreedom=88, mediaLiteracy=86, postMat=92 (World Values Survey)", False),
            ("\u2022 Post-Colonial: high addiction vulnerability + diaspora brain drain", False),
            ("\u2022 Ottoman: moderate schismRisk=17 (multi-ethnic empire tensions)", False),
            ("", False),
            ("Cumulative Progress (6 Rounds, 35 Enhancements):", True),
            ("\u2022 Plausibility: 5.6 \u2192 6.7 \u2192 7.0 \u2192 7.3 \u2192 7.6 \u2192 7.8/10", False),
            ("\u2022 Scenarios \u22657: 4 \u2192 7 \u2192 7 \u2192 8 \u2192 10 \u2192 10 out of 10", False),
            ("\u2022 Scenarios \u22658: 0 \u2192 3 \u2192 4 \u2192 5 \u2192 5 \u2192 7 out of 10", False),
            ("\u2022 All 6 gameplay presets survive 3000 BC \u2192 3000 AD (zero regressions)", False),
            ("", False),
            ("Overall Structural Plausibility: 7.8/10", True),
        ]

        y = 0.84
        for text, is_header in findings:
            if is_header:
                ax.text(0.08, y, text, fontsize=11, fontweight='bold', ha='left', va='center',
                        transform=ax.transAxes, color='#222')
            else:
                ax.text(0.08, y, text, fontsize=9, ha='left', va='center',
                        transform=ax.transAxes, color='#444')
            y -= 0.032

        pdf.savefig(fig)
        plt.close()

    print(f'PDF generated: {pdf_path}')
    return pdf_path

if __name__ == '__main__':
    create_pdf()
