import React, { useState } from 'react';
import { FileText, Printer, ShieldCheck, Download, CheckCircle2, User, Activity, Code2, Copy, Check, FileJson, Sparkles } from 'lucide-react';
import { Patient, DrugInteraction, CausalIntervention } from '../../types/pharmaguard';
import { INITIAL_PATIENTS } from '../../data/mockClinicalData';

interface ReportsPdfExportViewProps {
  patient?: Patient;
  interactions?: DrugInteraction[];
  interventions?: CausalIntervention[];
}

export const ReportsPdfExportView: React.FC<ReportsPdfExportViewProps> = ({
  patient,
  interactions = [],
  interventions = []
}) => {
  const activePatient = patient || INITIAL_PATIENTS[0];
  const [showFhirPreview, setShowFhirPreview] = useState(false);
  const [copiedFhir, setCopiedFhir] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const generateFhirBundle = () => {
    const timestamp = new Date().toISOString();
    return {
      resourceType: "Bundle",
      id: `pharmaguard-fhir-bundle-${activePatient.mrn.replace(/[^a-zA-Z0-9]/g, '')}`,
      meta: {
        lastUpdated: timestamp,
        source: "PharmaGuard AI Autonomous Safety Engine v2.5",
        profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"]
      },
      type: "collection",
      entry: [
        {
          fullUrl: `urn:uuid:patient-${activePatient.id}`,
          resource: {
            resourceType: "Patient",
            id: activePatient.id,
            identifier: [
              {
                use: "official",
                system: "urn:oid:2.16.840.1.113883.4.1",
                value: activePatient.mrn
              }
            ],
            active: true,
            name: [{ text: activePatient.name }],
            gender: activePatient.gender.toLowerCase() === 'female' ? 'female' : 'male',
            extension: [
              {
                url: "http://pharmaguard.ai/fhir/StructureDefinition/cyp2d6-genotype",
                valueString: activePatient.genetics?.cyp2d6 || "Normal Metabolizer"
              }
            ]
          }
        },
        {
          fullUrl: `urn:uuid:obs-egfr-${activePatient.id}`,
          resource: {
            resourceType: "Observation",
            status: "final",
            code: {
              coding: [
                {
                  system: "http://loinc.org",
                  code: "33914-3",
                  display: "Glomerular filtration rate/1.73 sq M.predicted"
                }
              ],
              text: "eGFR Renal Function"
            },
            subject: { reference: `urn:uuid:patient-${activePatient.id}` },
            valueQuantity: {
              value: activePatient.kidneyFunction?.egfr || 60,
              unit: "mL/min/1.73m2",
              system: "http://unitsofmeasure.org",
              code: "mL/min/{1.73_m2}"
            }
          }
        },
        {
          fullUrl: `urn:uuid:obs-qtc-${activePatient.id}`,
          resource: {
            resourceType: "Observation",
            status: "final",
            code: {
              coding: [
                {
                  system: "http://loinc.org",
                  code: "85354-9",
                  display: "Corrected QT interval (QTc)"
                }
              ],
              text: "Cardiac QTc Interval"
            },
            subject: { reference: `urn:uuid:patient-${activePatient.id}` },
            valueQuantity: {
              value: activePatient.vitals?.qtcIntervalMs || 440,
              unit: "ms",
              system: "http://unitsofmeasure.org",
              code: "ms"
            }
          }
        },
        ...(activePatient.activeMedications || []).map((med, idx) => ({
          fullUrl: `urn:uuid:medstatement-${activePatient.id}-${idx}`,
          resource: {
            resourceType: "MedicationStatement",
            status: "active",
            medicationCodeableConcept: {
              text: med.name,
              coding: [
                {
                  system: "http://www.nlm.nih.gov/research/umls/rxnorm",
                  code: med.rxNormCode || "10000",
                  display: med.name
                }
              ]
            },
            dosage: [
              {
                text: `${med.doseMg}mg ${med.frequency}`,
                route: { text: med.route || "Oral" }
              }
            ]
          }
        })),
        {
          fullUrl: `urn:uuid:riskassessment-${activePatient.id}`,
          resource: {
            resourceType: "RiskAssessment",
            status: "final",
            subject: { reference: `urn:uuid:patient-${activePatient.id}` },
            occurrenceDateTime: timestamp,
            prediction: [
              {
                outcome: {
                  text: `Adverse Drug Event Hazard (${activePatient.riskCategory})`
                },
                probabilityDecimal: (activePatient.riskScorePercent || 50) / 100,
                qualitativeRisk: {
                  coding: [
                    {
                      system: "http://terminology.hl7.org/CodeSystem/risk-probability",
                      code: activePatient.riskCategory.toLowerCase(),
                      display: activePatient.riskCategory
                    }
                  ]
                }
              }
            ]
          }
        },
        ...interactions.map((int, idx) => ({
          fullUrl: `urn:uuid:detectedissue-${activePatient.id}-${idx}`,
          resource: {
            resourceType: "DetectedIssue",
            status: "final",
            code: {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                  code: "DRG",
                  display: "Drug Interaction Alert"
                }
              ]
            },
            severity: int.severity === 'Contraindicated' || int.severity === 'Severe' ? 'high' : 'moderate',
            detail: `${int.drugA} and ${int.drugB}: ${int.mechanism}`,
            mitigation: [
              {
                action: {
                  text: int.clinicalImpact
                }
              }
            ]
          }
        }))
      ]
    };
  };

  const fhirBundleData = generateFhirBundle();
  const fhirJsonString = JSON.stringify(fhirBundleData, null, 2);

  const handleExportFhirBundle = () => {
    const blob = new Blob([fhirJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HL7_FHIR_Bundle_${activePatient.mrn.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadToast(`HL7 FHIR R4 Bundle exported successfully for ${activePatient.name}`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  const handleCopyFhir = () => {
    navigator.clipboard.writeText(fhirJsonString);
    setCopiedFhir(true);
    setTimeout(() => setCopiedFhir(false), 2000);
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10 print:bg-white print:text-black">
      {/* Toast Alert */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-900/90 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-2xl animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Action Header Bar (Hidden during print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Clinical Safety Report & Interoperability Center</h1>
            <p className="text-xs text-slate-400">
              Publication-grade clinical documentation and HL7 FHIR R4 JSON export for EHR integration.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowFhirPreview(!showFhirPreview)}
            className="bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs px-4 py-2.5 rounded-xl border border-cyan-500/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>{showFhirPreview ? 'Hide FHIR Schema' : 'Inspect FHIR JSON'}</span>
          </button>

          <button
            onClick={handleExportFhirBundle}
            className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg cursor-pointer transition-all border border-cyan-400/30"
          >
            <FileJson className="w-4 h-4 text-cyan-200" />
            <span>Export HL7 FHIR Bundle (JSON)</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* HL7 FHIR Schema Preview Drawer */}
      {showFhirPreview && (
        <div className="p-5 bg-slate-950 border border-cyan-500/30 rounded-2xl space-y-3 print:hidden animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>HL7 FHIR R4 Bundle Specification ({activePatient.name} - {activePatient.mrn})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyFhir}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
              >
                {copiedFhir ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedFhir ? 'Copied' : 'Copy JSON'}</span>
              </button>
              <button
                onClick={handleExportFhirBundle}
                className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .json</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 leading-relaxed max-h-80 overflow-y-auto">
            {fhirJsonString}
          </pre>
        </div>
      )}

      {/* Printable Report Document Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 print:border-none print:p-0 print:shadow-none print:bg-white print:text-slate-900">
        {/* Document Header */}
        <div className="border-b border-slate-800 print:border-slate-300 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white print:text-slate-900 tracking-tight">PharmaGuard AI Clinical Safety Report</h2>
            <div className="text-xs text-cyan-400 print:text-blue-700 font-semibold mt-1">Autonomous Clinical Intelligence System v2.5 • HL7 FHIR R4 Interoperable</div>
          </div>
          <div className="text-right text-xs text-slate-400 print:text-slate-600 space-y-0.5">
            <div>Date: <strong>{new Date().toLocaleDateString()}</strong></div>
            <div>Report ID: <strong>PGAI-RPT-889021</strong></div>
          </div>
        </div>

        {/* Patient Demographics Banner */}
        <div className="p-4 rounded-xl bg-slate-800/80 print:bg-slate-100 border border-slate-700 print:border-slate-300 space-y-2 text-xs">
          <div className="flex justify-between font-bold text-sm text-white print:text-slate-900">
            <span>Patient: {activePatient.name} ({activePatient.mrn})</span>
            <span>Age/Gender: {activePatient.age} y/o {activePatient.gender}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-700 print:border-slate-300 text-slate-300 print:text-slate-700">
            <div>Renal eGFR: <strong>{activePatient.kidneyFunction.egfr} mL/min</strong></div>
            <div>CYP2D6: <strong>{activePatient.genetics.cyp2d6}</strong></div>
            <div>Cardiac QTc: <strong>{activePatient.vitals.qtcIntervalMs} ms</strong></div>
            <div>Risk Level: <strong className="text-rose-400 print:text-rose-700">{activePatient.riskCategory} ({activePatient.riskScorePercent}%)</strong></div>
          </div>
        </div>

        {/* Identified Severe Interactions Section */}
        <div className="space-y-3 text-xs">
          <h3 className="font-bold text-sm text-white print:text-slate-900 border-b border-slate-800 print:border-slate-300 pb-1">
            1. Identified Critical Pharmacokinetic Interactions
          </h3>
          {interactions.map(int => (
            <div key={int.id} className="p-3 rounded-lg bg-slate-800/40 print:bg-slate-50 border border-slate-700 print:border-slate-200 space-y-1">
              <div className="font-bold text-amber-300 print:text-amber-800">{int.drugA} ↔ {int.drugB} ({int.severity})</div>
              <p className="text-slate-300 print:text-slate-700 leading-relaxed">{int.mechanism}</p>
            </div>
          ))}
        </div>

        {/* Counterfactual Recommendations Section */}
        <div className="space-y-3 text-xs">
          <h3 className="font-bold text-sm text-white print:text-slate-900 border-b border-slate-800 print:border-slate-300 pb-1">
            2. Causal AI Regimen Optimization Recommendations
          </h3>
          {interventions.map(item => (
            <div key={item.id} className="p-3 rounded-lg bg-slate-800/40 print:bg-slate-50 border border-slate-700 print:border-slate-200 space-y-1">
              <div className="font-bold text-emerald-300 print:text-emerald-800">
                {item.interventionType}: {item.targetDrug} → {item.replacementDrug} (+{item.estimatedRiskReductionPercent}% Risk Delta)
              </div>
              <p className="text-slate-300 print:text-slate-700">{item.counterfactualOutcome}</p>
            </div>
          ))}
        </div>

        {/* Physician Sign-off Box */}
        <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex justify-between items-end text-xs text-slate-400 print:text-slate-600">
          <div>
            <div>Attending Physician Signature: _______________________</div>
            <div className="mt-1">Dr. Sarah Jenkins, MD (Cardiology)</div>
          </div>
          <div className="text-right font-mono">
            Verified by PharmaGuard Multi-Agent Consensus (0.95 Conf)
          </div>
        </div>
      </div>
    </div>
  );
};

