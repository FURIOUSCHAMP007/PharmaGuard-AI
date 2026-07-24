import { Patient, DrugInteraction, KnowledgeNode, KnowledgeEdge, AgentStep, CausalIntervention, PKPDSimulationPoint, FDAAlert, DoctorReview, SystemMetric } from '../types/pharmaguard';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-001',
    mrn: 'MRN-8829102',
    name: 'Eleanor Vance',
    age: 68,
    gender: 'Female',
    weightKg: 64,
    heightCm: 162,
    bmi: 24.4,
    primaryDiagnosis: 'Atrial Fibrillation with Chronic Kidney Disease Stage 3b & Major Depression',
    icd10Code: 'I48.91 / N18.32',
    allergies: ['Penicillin VK', 'Sulfa Drugs'],
    kidneyFunction: {
      egfr: 38,
      serumCreatinine: 1.8,
      stage: 'Stage 3b (Moderate to Severe)'
    },
    liverFunction: {
      alt: 28,
      ast: 31,
      bilirubin: 0.9,
      childPughScore: 'Class A (5 points)'
    },
    genetics: {
      cyp2d6: 'Poor Metabolizer',
      cyp3a4: 'Normal',
      cyp2c19: 'Normal Metabolizer',
      hlaB5701: 'Negative'
    },
    vitals: {
      bpSystolic: 134,
      bpDiastolic: 82,
      heartRate: 88,
      qtcIntervalMs: 468
    },
    comorbidities: ['Hypertension', 'Type 2 Diabetes', 'Osteoarthritis'],
    riskCategory: 'High',
    riskScorePercent: 82.4,
    activeMedications: [
      {
        id: 'med-101',
        rxNormCode: 'RxNorm: 32968',
        name: 'Amiodarone',
        genericName: 'Amiodarone HCl',
        brandName: 'Pacerone',
        doseMg: 200,
        frequency: 'Once Daily',
        route: 'Oral',
        startDate: '2025-11-10',
        indication: 'Rhythm Control in Atrial Fibrillation',
        category: 'Antiarrhythmic Class III',
        halfLifeHours: 1320, // 55 days
        cypMetabolism: ['CYP3A4', 'CYP2C8', 'CYP2D6'],
        primaryTarget: 'KCNH2 (hERG Potassium Channel)',
        transporters: ['P-glycoprotein (ABCB1)']
      },
      {
        id: 'med-102',
        rxNormCode: 'RxNorm: 11289',
        name: 'Warfarin',
        genericName: 'Warfarin Sodium',
        brandName: 'Coumadin',
        doseMg: 5,
        frequency: 'Once Daily at Night',
        route: 'Oral',
        startDate: '2025-11-12',
        indication: 'Thromboembolism Prophylaxis',
        category: 'Vitamin K Antagonist Anticoagulant',
        halfLifeHours: 40,
        cypMetabolism: ['CYP2C9', 'CYP3A4', 'CYP1A2'],
        primaryTarget: 'VKORC1',
        transporters: ['OATP1B1']
      },
      {
        id: 'med-103',
        rxNormCode: 'RxNorm: 203114',
        name: 'Fluoxetine',
        genericName: 'Fluoxetine HCl',
        brandName: 'Prozac',
        doseMg: 20,
        frequency: 'Once Daily Morning',
        route: 'Oral',
        startDate: '2026-01-15',
        indication: 'Major Depressive Disorder',
        category: 'SSRI Antidepressant',
        halfLifeHours: 96,
        cypMetabolism: ['CYP2D6', 'CYP2C9', 'CYP3A4'],
        primaryTarget: 'SLC6A4 (Serotonin Transporter)',
        transporters: ['P-gp']
      },
      {
        id: 'med-104',
        rxNormCode: 'RxNorm: 6918',
        name: 'Metformin',
        genericName: 'Metformin HCl',
        brandName: 'Glucophage',
        doseMg: 500,
        frequency: 'Twice Daily',
        route: 'Oral',
        startDate: '2024-03-01',
        indication: 'Type 2 Diabetes Mellitus',
        category: 'Biguanide',
        halfLifeHours: 6.2,
        cypMetabolism: ['Renal Clearance Unmetabolized'],
        primaryTarget: 'AMPK',
        transporters: ['OCT1', 'OCT2', 'MATE1']
      }
    ]
  },
  {
    id: 'pat-002',
    mrn: 'MRN-7731940',
    name: 'Robert Chen',
    age: 72,
    gender: 'Male',
    weightKg: 82,
    heightCm: 175,
    bmi: 26.8,
    primaryDiagnosis: 'Coronary Artery Disease with Post-PCI Stent & Heart Failure (HFrEF)',
    icd10Code: 'I25.10 / I50.22',
    allergies: ['Aspirin (Bronchospasm)'],
    kidneyFunction: {
      egfr: 52,
      serumCreatinine: 1.4,
      stage: 'Stage 3a (Mild to Moderate)'
    },
    liverFunction: {
      alt: 42,
      ast: 38,
      bilirubin: 1.1,
      childPughScore: 'Class A'
    },
    genetics: {
      cyp2d6: 'Normal Metabolizer',
      cyp3a4: 'Normal',
      cyp2c19: 'Poor Metabolizer',
      hlaB5701: 'Negative'
    },
    vitals: {
      bpSystolic: 122,
      bpDiastolic: 76,
      heartRate: 62,
      qtcIntervalMs: 432
    },
    comorbidities: ['Hyperlipidemia', 'Hypertension'],
    riskCategory: 'Critical',
    riskScorePercent: 91.2,
    activeMedications: [
      {
        id: 'med-201',
        rxNormCode: 'RxNorm: 329128',
        name: 'Clopidogrel',
        genericName: 'Clopidogrel Bisulfate',
        brandName: 'Plavix',
        doseMg: 75,
        frequency: 'Once Daily',
        route: 'Oral',
        startDate: '2026-02-01',
        indication: 'Antiplatelet post Coronary Stent',
        category: 'P2Y12 Inhibitor',
        halfLifeHours: 8,
        cypMetabolism: ['CYP2C19', 'CYP3A4'],
        primaryTarget: 'P2RY12 Receptor',
        transporters: ['P-gp']
      },
      {
        id: 'med-202',
        rxNormCode: 'RxNorm: 7646',
        name: 'Omeprazole',
        genericName: 'Omeprazole',
        brandName: 'Prilosec',
        doseMg: 20,
        frequency: 'Once Daily Morning',
        route: 'Oral',
        startDate: '2026-02-01',
        indication: 'GI Bleed Prophylaxis with Dual Antiplatelet',
        category: 'Proton Pump Inhibitor',
        halfLifeHours: 1,
        cypMetabolism: ['CYP2C19', 'CYP3A4'],
        primaryTarget: 'H+/K+ ATPase',
        transporters: ['P-gp']
      },
      {
        id: 'med-203',
        rxNormCode: 'RxNorm: 83367',
        name: 'Atorvastatin',
        genericName: 'Atorvastatin Calcium',
        brandName: 'Lipitor',
        doseMg: 80,
        frequency: 'Once Daily Night',
        route: 'Oral',
        startDate: '2025-05-10',
        indication: 'Atherosclerotic Cardiovascular Disease',
        category: 'HMG-CoA Reductase Inhibitor',
        halfLifeHours: 14,
        cypMetabolism: ['CYP3A4'],
        primaryTarget: 'HMGCR',
        transporters: ['OATP1B1', 'P-gp']
      }
    ]
  },
  {
    id: 'pat-003',
    mrn: 'MRN-5520119',
    name: 'Maria Santos',
    age: 54,
    gender: 'Female',
    weightKg: 70,
    heightCm: 160,
    bmi: 27.3,
    primaryDiagnosis: 'Rheumatoid Arthritis & Severe Pain Syndrome',
    icd10Code: 'M06.9',
    allergies: ['Codeine (Nausea)'],
    kidneyFunction: {
      egfr: 88,
      serumCreatinine: 0.8,
      stage: 'Stage 1 (Normal)'
    },
    liverFunction: {
      alt: 22,
      ast: 24,
      bilirubin: 0.6,
      childPughScore: 'Class A'
    },
    genetics: {
      cyp2d6: 'Ultra-rapid Metabolizer',
      cyp3a4: 'Normal',
      cyp2c19: 'Normal Metabolizer',
      hlaB5701: 'Negative'
    },
    vitals: {
      bpSystolic: 128,
      bpDiastolic: 80,
      heartRate: 74,
      qtcIntervalMs: 410
    },
    comorbidities: ['Asthma'],
    riskCategory: 'Moderate',
    riskScorePercent: 54.8,
    activeMedications: [
      {
        id: 'med-301',
        rxNormCode: 'RxNorm: 6809',
        name: 'Methotrexate',
        genericName: 'Methotrexate Sodium',
        brandName: 'Trexall',
        doseMg: 15,
        frequency: 'Once Weekly',
        route: 'Oral',
        startDate: '2024-08-12',
        indication: 'Rheumatoid Arthritis DMARD',
        category: 'Antimetabolite / Folate Antagonist',
        halfLifeHours: 10,
        cypMetabolism: ['Hepatic Polyglutamation'],
        primaryTarget: 'DHFR (Dihydrofolate Reductase)',
        transporters: ['BCRP', 'OAT1', 'OAT3']
      },
      {
        id: 'med-302',
        rxNormCode: 'RxNorm: 5640',
        name: 'Ibuprofen',
        genericName: 'Ibuprofen',
        brandName: 'Advil',
        doseMg: 800,
        frequency: 'Three Times Daily',
        route: 'Oral',
        startDate: '2026-02-10',
        indication: 'Joint Inflammatory Pain',
        category: 'NSAID',
        halfLifeHours: 2,
        cypMetabolism: ['CYP2C9', 'CYP2C8'],
        primaryTarget: 'COX-1 / COX-2',
        transporters: ['OAT1', 'OAT3']
      }
    ]
  }
];

export const MOCK_INTERACTIONS: DrugInteraction[] = [
  {
    id: 'int-001',
    drugA: 'Amiodarone',
    drugB: 'Warfarin',
    severity: 'Severe',
    mechanism: 'Amiodarone potent inhibition of CYP2C9 and CYP3A4 decreases Warfarin metabolism by 40-50%, drastically raising Warfarin serum concentrations.',
    metabolicConflict: 'CYP2C9 Enzyme Competitive Inhibition & OATP Transporter Blocking',
    clinicalImpact: 'Supratherapeutic INR (>4.5), acute major internal hemorrhage risk, GI bleed, intracranial hemorrhage.',
    confidenceScore: 0.96,
    evidenceLevel: 'Level A (Meta-analysis)'
  },
  {
    id: 'int-002',
    drugA: 'Amiodarone',
    drugB: 'Fluoxetine',
    severity: 'Severe',
    mechanism: 'Dual blockade of hERG potassium channels (KCNH2) causing synergistic QTc prolongation and CYP2D6 inhibition.',
    metabolicConflict: 'hERG Channel Synergism & CYP2D6 Pathway saturation',
    clinicalImpact: 'Torsades de Pointes, fatal ventricular tachycardia, QTc interval expansion >500ms.',
    confidenceScore: 0.92,
    evidenceLevel: 'Level A (Meta-analysis)'
  },
  {
    id: 'int-003',
    drugA: 'Clopidogrel',
    drugB: 'Omeprazole',
    severity: 'Contraindicated',
    mechanism: 'Omeprazole competitively inhibits CYP2C19, preventing the bioactivation of the prodrug Clopidogrel into its active thiol metabolite.',
    metabolicConflict: 'CYP2C19 Bioactivation Inhibition',
    clinicalImpact: 'Therapeutic failure of Clopidogrel, post-stent acute thrombosis, recurrent myocardial infarction.',
    confidenceScore: 0.98,
    evidenceLevel: 'Level A (Meta-analysis)'
  },
  {
    id: 'int-004',
    drugA: 'Methotrexate',
    drugB: 'Ibuprofen',
    severity: 'Severe',
    mechanism: 'Ibuprofen inhibits renal tubular secretion of Methotrexate via OAT1/OAT3 transporters and reduces renal blood flow.',
    metabolicConflict: 'Renal OAT1/OAT3 Transporter Competition & GFR Reduction',
    clinicalImpact: 'Methotrexate toxicity, severe bone marrow suppression, leukopenia, acute renal failure.',
    confidenceScore: 0.94,
    evidenceLevel: 'Level A (Meta-analysis)'
  }
];

export const MOCK_KG_NODES: KnowledgeNode[] = [
  { id: 'n-amiodarone', label: 'Amiodarone', type: 'Drug', ontologyCode: 'RxNorm: 32968', ontologySource: 'RxNorm', description: 'Class III Antiarrhythmic agent with multi-channel blocking action.' },
  { id: 'n-warfarin', label: 'Warfarin', type: 'Drug', ontologyCode: 'RxNorm: 11289', ontologySource: 'RxNorm', description: 'Anticoagulant vitamin K antagonist.' },
  { id: 'n-fluoxetine', label: 'Fluoxetine', type: 'Drug', ontologyCode: 'RxNorm: 203114', ontologySource: 'RxNorm', description: 'Selective Serotonin Reuptake Inhibitor (SSRI).' },
  { id: 'n-clopidogrel', label: 'Clopidogrel', type: 'Drug', ontologyCode: 'RxNorm: 329128', ontologySource: 'RxNorm', description: 'P2Y12 platelet inhibitor prodrug.' },
  { id: 'n-omeprazole', label: 'Omeprazole', type: 'Drug', ontologyCode: 'RxNorm: 7646', ontologySource: 'RxNorm', description: 'Proton Pump Inhibitor (PPI).' },
  { id: 'n-cyp2c9', label: 'CYP2C9 Gene/Enzyme', type: 'Enzyme', ontologyCode: 'HGNC:2623', ontologySource: 'UMLS', description: 'Cytochrome P450 family 2 subfamily C member 9.' },
  { id: 'n-cyp2d6', label: 'CYP2D6 Gene/Enzyme', type: 'Enzyme', ontologyCode: 'HGNC:2625', ontologySource: 'UMLS', description: 'Major drug metabolizing enzyme in liver.' },
  { id: 'n-cyp3a4', label: 'CYP3A4 Gene/Enzyme', type: 'Enzyme', ontologyCode: 'HGNC:2629', ontologySource: 'UMLS', description: 'Dominant hepatic and intestinal cytochrome enzyme.' },
  { id: 'n-herg', label: 'KCNH2 / hERG Channel', type: 'Target', ontologyCode: 'HGNC:6251', ontologySource: 'UMLS', description: 'Potassium voltage-gated channel subunit involved in cardiac repolarization.' },
  { id: 'n-vkorc1', label: 'VKORC1', type: 'Target', ontologyCode: 'HGNC:23663', ontologySource: 'UMLS', description: 'Vitamin K epoxide reductase complex subunit 1.' },
  { id: 'n-p2y12', label: 'P2RY12', type: 'Target', ontologyCode: 'HGNC:8610', ontologySource: 'UMLS', description: 'Purinergic receptor P2Y12 on blood platelets.' },
  { id: 'n-torsades', label: 'Torsades de Pointes', type: 'SideEffect', ontologyCode: 'SNOMED: 88168000', ontologySource: 'SNOMED CT', description: 'Polymorphic ventricular tachycardia associated with QTc prolongation.' },
  { id: 'n-bleeding', label: 'Major Hemorrhage', type: 'SideEffect', ontologyCode: 'SNOMED: 13114007', ontologySource: 'SNOMED CT', description: 'Pathological loss of blood from vasculature.' },
  { id: 'n-thrombosis', label: 'Stent Thrombosis', type: 'SideEffect', ontologyCode: 'ICD10: T81.7', ontologySource: 'ICD-10', description: 'Acute occlusion of coronary arterial stent.' },
  { id: 'n-guideline-acc', label: 'ACC/AHA 2023 AFib Guidelines', type: 'Guideline', ontologyCode: 'ACC-AFIB-2023', ontologySource: 'OpenFDA', description: 'Clinical guidance on anticoagulation and rate/rhythm control.' }
];

export const MOCK_KG_EDGES: KnowledgeEdge[] = [
  { id: 'e1', source: 'n-amiodarone', target: 'n-cyp2c9', relationship: 'INHIBITS', weight: 0.95, evidenceSource: 'DrugBank DB01118' },
  { id: 'e2', source: 'n-warfarin', target: 'n-cyp2c9', relationship: 'METABOLIZED_BY', weight: 0.92, evidenceSource: 'DrugBank DB00682' },
  { id: 'e3', source: 'n-amiodarone', target: 'n-herg', relationship: 'INHIBITS', weight: 0.88, evidenceSource: 'ChEMBL CHEMBL21' },
  { id: 'e4', source: 'n-fluoxetine', target: 'n-herg', relationship: 'INHIBITS', weight: 0.76, evidenceSource: 'PubChem CID 3386' },
  { id: 'e5', source: 'n-herg', target: 'n-torsades', relationship: 'CAUSES', weight: 0.98, evidenceSource: 'SNOMED CT Mapping' },
  { id: 'e6', source: 'n-cyp2c9', target: 'n-bleeding', relationship: 'ASSOCIATED_WITH', weight: 0.91, evidenceSource: 'FDA FAERS Safety DB' },
  { id: 'e7', source: 'n-omeprazole', target: 'n-cyp2c19', relationship: 'INHIBITS', weight: 0.97, evidenceSource: 'DrugBank DB00338' },
  { id: 'e8', source: 'n-clopidogrel', target: 'n-cyp2c19', relationship: 'METABOLIZED_BY', weight: 0.94, evidenceSource: 'DrugBank DB00758' },
  { id: 'e9', source: 'n-clopidogrel', target: 'n-p2y12', relationship: 'TARGETS', weight: 0.99, evidenceSource: 'KEGG DRUG D07727' },
  { id: 'e10', source: 'n-clopidogrel', target: 'n-thrombosis', relationship: 'ASSOCIATED_WITH', weight: 0.89, evidenceSource: 'ACC/AHA Guideline 2023' }
];

export const MOCK_AGENT_STEPS: AgentStep[] = [
  {
    agentName: 'Risk Assessment',
    status: 'Completed',
    input: 'Eleanor Vance regimen: Amiodarone 200mg + Warfarin 5mg + Fluoxetine 20mg (eGFR 38)',
    output: 'High risk detected: Combined bleeding score 8.4/10, QTc risk score 9.1/10.',
    confidence: 0.95,
    timestamp: '2026-07-23 22:15:02'
  },
  {
    agentName: 'Drug Interaction',
    status: 'Completed',
    input: 'Analyze pairwise and triplet metabolic conflicts in Cytochrome P450 network.',
    output: 'Severe interaction: Amiodarone CYP2C9 inhibition + Fluoxetine hERG inhibition.',
    confidence: 0.98,
    timestamp: '2026-07-23 22:15:03'
  },
  {
    agentName: 'Drug Replacement',
    status: 'Completed',
    input: 'Query renal-safe anticoagulants & antiarrhythmics with minimal CYP2C9/2D6 interference.',
    output: 'Recommended alternative: Switch Warfarin to Apixaban (2.5mg BID adjusted for renal eGFR 38), Replace Fluoxetine with Sertraline or Escitalopram.',
    confidence: 0.93,
    timestamp: '2026-07-23 22:15:04'
  },
  {
    agentName: 'Guideline',
    status: 'Completed',
    input: 'Ground candidates against ACC/AHA 2023 AFib and KDIGO CKD Guidelines.',
    output: 'Apixaban 2.5mg BID is Class I-A recommended in CKD Stage 3b for stroke prevention in AFib.',
    confidence: 0.97,
    timestamp: '2026-07-23 22:15:05'
  },
  {
    agentName: 'Evidence Retrieval',
    status: 'Completed',
    input: 'Retrieve RCT trial evidence & FDA alerts for Apixaban in CKD Stage 3b.',
    output: 'ARISTOTLE trial subgroup analysis: Apixaban reduces major bleeding by 50% vs Warfarin in renal impairment (p < 0.001).',
    confidence: 0.96,
    timestamp: '2026-07-23 22:15:06'
  },
  {
    agentName: 'Patient Safety',
    status: 'Completed',
    input: 'Simulate organ clearance & QTc trajectory under proposed regimen.',
    output: 'Predicted QTc reduction from 468ms to 418ms (-50ms delta). INR fluctuation risk eliminated.',
    confidence: 0.94,
    timestamp: '2026-07-23 22:15:07'
  },
  {
    agentName: 'Planner',
    status: 'Completed',
    input: 'Synthesize optimal multi-stage transition plan.',
    output: 'Step 1: Stop Warfarin & monitor INR. Step 2: Initiate Apixaban when INR < 2.0. Step 3: Transition Fluoxetine to Sertraline over 7 days.',
    confidence: 0.92,
    timestamp: '2026-07-23 22:15:08'
  },
  {
    agentName: 'Consensus Verifier',
    status: 'Completed',
    input: 'Verify all recommendations against safety boundaries & multi-agent agreement.',
    output: 'Consensus score: 0.95 (Unanimous agreement across all 7 agent nodes). Ready for Doctor Review.',
    confidence: 0.96,
    timestamp: '2026-07-23 22:15:09'
  }
];

export const MOCK_CAUSAL_INTERVENTIONS: CausalIntervention[] = [
  {
    id: 'causal-01',
    interventionType: 'Replace Drug',
    targetDrug: 'Warfarin',
    replacementDrug: 'Apixaban 2.5mg BID',
    estimatedRiskReductionPercent: 68.4,
    ateScore: -0.32,
    iteScore: -0.41,
    counterfactualOutcome: 'Drastic reduction in internal bleeding probability; stroke prophylaxis maintained with zero INR instability.',
    pCalibratedValue: 0.0012
  },
  {
    id: 'causal-02',
    interventionType: 'Replace Drug',
    targetDrug: 'Fluoxetine',
    replacementDrug: 'Sertraline 50mg Daily',
    estimatedRiskReductionPercent: 42.1,
    ateScore: -0.18,
    iteScore: -0.26,
    counterfactualOutcome: 'Eliminates CYP2D6 competitive inhibition; normalizes cardiac repolarization reserve.',
    pCalibratedValue: 0.0048
  },
  {
    id: 'causal-03',
    interventionType: 'Reduce Dose',
    targetDrug: 'Amiodarone',
    doseAdjustment: 100,
    estimatedRiskReductionPercent: 25.5,
    ateScore: -0.12,
    iteScore: -0.15,
    counterfactualOutcome: 'Partial reduction in QTc prolongation, but therapeutic antiarrhythmic control maintained.',
    pCalibratedValue: 0.0210
  }
];

export const MOCK_PKPD_POINTS: PKPDSimulationPoint[] = [
  { timeHours: 0, drug1Conc: 1.2, drug2Conc: 2.1, combinedToxicityScore: 35, therapeuticMin: 1.0, toxicThreshold: 8.0 },
  { timeHours: 4, drug1Conc: 4.8, drug2Conc: 6.5, combinedToxicityScore: 78, therapeuticMin: 1.0, toxicThreshold: 8.0 },
  { timeHours: 8, drug1Conc: 6.9, drug2Conc: 8.9, combinedToxicityScore: 92, therapeuticMin: 1.0, toxicThreshold: 8.0 },
  { timeHours: 12, drug1Conc: 6.1, drug2Conc: 8.2, combinedToxicityScore: 88, therapeuticMin: 1.0, toxicThreshold: 8.0 },
  { timeHours: 16, drug1Conc: 5.2, drug2Conc: 7.1, combinedToxicityScore: 75, therapeuticMin: 1.0, toxicThreshold: 8.0 },
  { timeHours: 24, drug1Conc: 3.8, drug2Conc: 5.4, combinedToxicityScore: 62, therapeuticMin: 1.0, toxicThreshold: 8.0 },
  { timeHours: 36, drug1Conc: 2.5, drug2Conc: 3.8, combinedToxicityScore: 48, therapeuticMin: 1.0, toxicThreshold: 8.0 },
  { timeHours: 48, drug1Conc: 1.8, drug2Conc: 2.6, combinedToxicityScore: 38, therapeuticMin: 1.0, toxicThreshold: 8.0 },
  { timeHours: 72, drug1Conc: 1.1, drug2Conc: 1.5, combinedToxicityScore: 28, therapeuticMin: 1.0, toxicThreshold: 8.0 }
];

export const MOCK_FDA_ALERTS: FDAAlert[] = [
  {
    id: 'fda-101',
    drugName: 'Amiodarone (Pacerone)',
    alertType: 'Black Box Warning',
    date: '2025-10-14',
    summary: 'Fatal toxicities including pulmonary toxicity, hepatic injury, and severe proarrhythmic effects (Torsades de Pointes).',
    impactedPathways: ['KCNH2 (hERG)', 'Hepatic CYP450', 'Thyroid Iodination'],
    actionRequired: 'Perform baseline pulmonary function test, LFTs, and monitor QTc closely when co-administering with CYP3A4/CYP2D6 inhibitors.'
  },
  {
    id: 'fda-102',
    drugName: 'Clopidogrel + PPI Co-administration',
    alertType: 'Safety Communication',
    date: '2025-11-20',
    summary: 'Avoid co-administration of Clopidogrel with Omeprazole or Esomeprazole due to CYP2C19 inhibition reducing active antiplatelet metabolite levels by up to 45%.',
    impactedPathways: ['CYP2C19 Bioactivation', 'P2Y12 Antiplatelet Pathway'],
    actionRequired: 'Switch PPI to Pantoprazole or H2 receptor antagonist (Famotidine) which do not significantly inhibit CYP2C19.'
  },
  {
    id: 'fda-103',
    drugName: 'Methotrexate + High-Dose NSAIDs',
    alertType: 'Post-market Adverse Event',
    date: '2026-01-08',
    summary: 'Severe bone marrow suppression and acute tubulointerstitial nephritis reported with concomitant daily high-dose ibuprofen.',
    impactedPathways: ['OAT1/OAT3 Renal Transporters', 'DHFR Folate Cycle'],
    actionRequired: 'Monitor complete blood count (CBC) and serum creatinine weekly; consider non-renal NSAID alternatives or acetaminophen.'
  }
];

export const MOCK_DOCTOR_REVIEWS: DoctorReview[] = [
  {
    id: 'rev-001',
    patientId: 'pat-001',
    reviewedBy: 'Dr. Sarah Jenkins, MD (Cardiology)',
    status: 'Approved',
    doctorNotes: 'Reviewed PharmaGuard multi-agent recommendation. Concur with transition from Warfarin to Apixaban 2.5mg BID given eGFR 38. Transitioning SSRI to Sertraline with Psychiatry consult.',
    timestamp: '2026-07-23 21:40:00',
    learningFeedbackLoopRecorded: true
  }
];

export const MOCK_SYSTEM_METRICS: SystemMetric = {
  apiLatencyMs: 142,
  geminiTokenUsageToday: 48290,
  kgQueryTimeMs: 18,
  gnnInferenceMs: 34,
  activeAgents: 8,
  systemUptimePercent: 99.98
};
