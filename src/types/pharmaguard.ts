export type UserRole = 
  | 'Doctor'
  | 'Pharmacist'
  | 'Nurse'
  | 'Hospital Administrator'
  | 'Researcher'
  | 'Patient'
  | 'System Administrator';

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  weightKg: number;
  heightCm: number;
  bmi: number;
  primaryDiagnosis: string;
  icd10Code: string;
  allergies: string[];
  kidneyFunction: {
    egfr: number; // mL/min/1.73m2
    serumCreatinine: number; // mg/dL
    stage: string;
  };
  liverFunction: {
    alt: number; // U/L
    ast: number; // U/L
    bilirubin: number; // mg/dL
    childPughScore: string;
  };
  genetics: {
    cyp2d6: 'Poor Metabolizer' | 'Intermediate Metabolizer' | 'Normal Metabolizer' | 'Ultra-rapid Metabolizer';
    cyp3a4: 'Normal' | 'Reduced Activity' | 'Inducible';
    cyp2c19: 'Poor Metabolizer' | 'Normal Metabolizer' | 'Rapid Metabolizer';
    hlaB5701: 'Positive' | 'Negative';
  };
  vitals: {
    bpSystolic: number;
    bpDiastolic: number;
    heartRate: number;
    qtcIntervalMs: number;
  };
  activeMedications: PrescribedDrug[];
  comorbidities: string[];
  riskCategory: 'Low' | 'Moderate' | 'High' | 'Critical';
  riskScorePercent: number;
}

export interface PrescribedDrug {
  id: string;
  rxNormCode: string;
  name: string;
  genericName: string;
  brandName: string;
  doseMg: number;
  frequency: string;
  route: string;
  startDate: string;
  indication: string;
  category: string;
  halfLifeHours: number;
  cypMetabolism: string[];
  primaryTarget: string;
  transporters: string[];
}

export interface DrugInteraction {
  id: string;
  drugA: string;
  drugB: string;
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Contraindicated';
  mechanism: string;
  metabolicConflict: string;
  clinicalImpact: string;
  confidenceScore: number;
  evidenceLevel: 'Level A (Meta-analysis)' | 'Level B (Clinical Trials)' | 'Level C (Observational/Case Reports)';
}

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'Drug' | 'Protein' | 'Gene' | 'Pathway' | 'Disease' | 'Symptom' | 'SideEffect' | 'Guideline' | 'Target' | 'Enzyme' | 'Transporter';
  ontologyCode?: string;
  ontologySource?: 'SNOMED CT' | 'RxNorm' | 'UMLS' | 'ICD-10' | 'LOINC' | 'DrugBank' | 'OpenFDA' | 'SIDER' | 'KEGG' | 'Reactome';
  description: string;
  properties?: Record<string, any>;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  relationship: 'METABOLIZED_BY' | 'TARGETS' | 'INHIBITS' | 'INDUCES' | 'CAUSES' | 'INDICATED_FOR' | 'ASSOCIATED_WITH' | 'PART_OF_PATHWAY' | 'RECOMMENDED_IN';
  weight: number;
  evidenceSource: string;
}

export interface AgentStep {
  agentName: 'Risk Assessment' | 'Drug Interaction' | 'Drug Replacement' | 'Guideline' | 'Evidence Retrieval' | 'Patient Safety' | 'Planner' | 'Consensus Verifier';
  status: 'Pending' | 'Running' | 'Completed' | 'Warning' | 'Error';
  input: string;
  output: string;
  confidence: number;
  timestamp: string;
}

export interface CausalIntervention {
  id: string;
  interventionType: 'Remove Drug' | 'Replace Drug' | 'Reduce Dose' | 'Increase Dose' | 'Add Drug' | 'Modify Timing';
  targetDrug: string;
  replacementDrug?: string;
  doseAdjustment?: number;
  estimatedRiskReductionPercent: number;
  ateScore: number; // Average Treatment Effect
  iteScore: number; // Individual Treatment Effect
  counterfactualOutcome: string;
  pCalibratedValue: number;
}

export interface PKPDSimulationPoint {
  timeHours: number;
  drug1Conc: number; // mg/L
  drug2Conc: number;
  combinedToxicityScore: number;
  therapeuticMin: number;
  toxicThreshold: number;
}

export interface FDAAlert {
  id: string;
  drugName: string;
  alertType: 'Black Box Warning' | 'FDA Recall' | 'Safety Communication' | 'Post-market Adverse Event';
  date: string;
  summary: string;
  impactedPathways: string[];
  actionRequired: string;
}

export interface DoctorReview {
  id: string;
  patientId: string;
  reviewedBy: string;
  status: 'Approved' | 'Overridden' | 'Pending Review' | 'Flagged for Tumor Board';
  doctorNotes: string;
  overrideReason?: string;
  learningFeedbackLoopRecorded: boolean;
  timestamp: string;
}

export interface SystemMetric {
  apiLatencyMs: number;
  geminiTokenUsageToday: number;
  kgQueryTimeMs: number;
  gnnInferenceMs: number;
  activeAgents: number;
  systemUptimePercent: number;
}
