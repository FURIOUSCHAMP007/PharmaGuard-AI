import React, { useState } from 'react';
import { HeaderNavbar } from './components/HeaderNavbar';
import { Sidebar } from './components/Sidebar';

// Import Views
import { LandingHomeView } from './components/views/LandingHomeView';
import { AuthRoleView } from './components/views/AuthRoleView';
import { DashboardView } from './components/views/DashboardView';
import { PatientManagementView } from './components/views/PatientManagementView';
import { DrugPrescriptionView } from './components/views/DrugPrescriptionView';
import { DrugInteractionMatrixView } from './components/views/DrugInteractionMatrixView';
import { CausalCounterfactualView } from './components/views/CausalCounterfactualView';
import { DigitalPatientTwinView } from './components/views/DigitalPatientTwinView';
import { TemporalRiskSimulationView } from './components/views/TemporalRiskSimulationView';
import { KnowledgeGraphExplorerView } from './components/views/KnowledgeGraphExplorerView';
import { MultiAgentConsoleView } from './components/views/MultiAgentConsoleView';
import { GeminiChatAssistantView } from './components/views/GeminiChatAssistantView';
import { AlternativeDrugRecommendationView } from './components/views/AlternativeDrugRecommendationView';
import { ClinicalGuidelinesViewerView } from './components/views/ClinicalGuidelinesViewerView';
import { XAIDashboardView } from './components/views/XAIDashboardView';
import { UncertaintyAnalyticsView } from './components/views/UncertaintyAnalyticsView';
import { PharmacovigilanceFDAView } from './components/views/PharmacovigilanceFDAView';
import { ReportsPdfExportView } from './components/views/ReportsPdfExportView';
import { DoctorApprovalWorkflowView } from './components/views/DoctorApprovalWorkflowView';
import { ResearchArchitectureHubView } from './components/views/ResearchArchitectureHubView';
import { AdminMonitoringView } from './components/views/AdminMonitoringView';

// Import Mock Data & Types
import {
  INITIAL_PATIENTS,
  MOCK_INTERACTIONS,
  MOCK_CAUSAL_INTERVENTIONS,
  MOCK_KG_NODES,
  MOCK_KG_EDGES,
  MOCK_AGENT_STEPS,
  MOCK_PKPD_POINTS,
  MOCK_FDA_ALERTS,
  MOCK_DOCTOR_REVIEWS,
  MOCK_SYSTEM_METRICS
} from './data/mockClinicalData';

import { Patient, CausalIntervention, DoctorReview, UserRole } from './types/pharmaguard';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedRole, setSelectedRole] = useState<string>('Cardiologist / Physician');
  const [patientsList, setPatientsList] = useState<Patient[]>(INITIAL_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(INITIAL_PATIENTS[0].id);
  const [interventionsList, setInterventionsList] = useState<CausalIntervention[]>(MOCK_CAUSAL_INTERVENTIONS);
  const [doctorReviewsList, setDoctorReviewsList] = useState<DoctorReview[]>(MOCK_DOCTOR_REVIEWS);

  const selectedPatient = patientsList.find(p => p.id === selectedPatientId) || patientsList[0] || INITIAL_PATIENTS[0];

  const handleUpdatePatient = (updated: Patient) => {
    setPatientsList(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleApplyIntervention = (intervention: CausalIntervention) => {
    if (intervention.replacementDrug && selectedPatient) {
      const updatedMeds = selectedPatient.activeMedications.map(m => {
        if (m.name && m.name.toLowerCase() === intervention.targetDrug.toLowerCase()) {
          return {
            ...m,
            name: intervention.replacementDrug!,
            genericName: intervention.replacementDrug!,
            brandName: intervention.replacementDrug!
          };
        }
        return m;
      });

      const updatedPatient: Patient = {
        ...selectedPatient,
        activeMedications: updatedMeds,
        riskScorePercent: Math.max(12.0, selectedPatient.riskScorePercent - intervention.estimatedRiskReductionPercent),
        riskCategory: 'Moderate'
      };

      handleUpdatePatient(updatedPatient);
      setActiveTab('dashboard');
    }
  };

  const handleAddDoctorReview = (newReview: DoctorReview) => {
    setDoctorReviewsList(prev => [newReview, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header Navigation Bar */}
      <HeaderNavbar
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        activePatient={selectedPatient}
        allPatients={patientsList}
        onSelectPatientId={setSelectedPatientId}
        onNavigate={(tab) => setActiveTab(tab)}
      />

      {/* Main Body with Persistent Sidebar & Workspace View */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 text-slate-900 scrollbar-thin">
          {activeTab === 'landing' && (
            <LandingHomeView selectedPatient={selectedPatient} onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'auth_role' && (
            <AuthRoleView
              currentRole={selectedRole as UserRole}
              selectedRole={selectedRole}
              onSelectRole={(role) => setSelectedRole(role)}
              setSelectedRole={setSelectedRole}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              patient={selectedPatient}
              interactions={MOCK_INTERACTIONS}
              interventions={interventionsList}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'patients' && (
            <PatientManagementView
              patients={patientsList}
              selectedPatient={selectedPatient}
              onSelectPatient={(p) => setSelectedPatientId(p.id)}
              onAddPatient={(p) => setPatientsList(prev => [p, ...prev])}
            />
          )}

          {(activeTab === 'drug_prescribe' || activeTab === 'prescriptions') && (
            <DrugPrescriptionView
              patient={selectedPatient}
              onUpdatePatient={handleUpdatePatient}
            />
          )}

          {(activeTab === 'interaction_matrix' || activeTab === 'interactions') && (
            <DrugInteractionMatrixView
              patient={selectedPatient}
              interactions={MOCK_INTERACTIONS}
            />
          )}

          {activeTab === 'causal_counterfactual' && (
            <CausalCounterfactualView
              patient={selectedPatient}
              interventions={interventionsList}
              onApplyIntervention={handleApplyIntervention}
            />
          )}

          {activeTab === 'digital_twin' && (
            <DigitalPatientTwinView
              patient={selectedPatient}
              onUpdatePatient={handleUpdatePatient}
            />
          )}

          {activeTab === 'temporal_simulation' && (
            <TemporalRiskSimulationView
              patient={selectedPatient}
              pkpdPoints={MOCK_PKPD_POINTS}
            />
          )}

          {(activeTab === 'kg_explorer' || activeTab === 'knowledge_graph') && (
            <KnowledgeGraphExplorerView
              nodes={MOCK_KG_NODES}
              edges={MOCK_KG_EDGES}
            />
          )}

          {(activeTab === 'multi_agent' || activeTab === 'multi_agent_console') && (
            <MultiAgentConsoleView
              patient={selectedPatient}
              agentSteps={MOCK_AGENT_STEPS}
            />
          )}

          {(activeTab === 'ai_chat' || activeTab === 'chat_copilot') && (
            <GeminiChatAssistantView patient={selectedPatient} />
          )}

          {(activeTab === 'alt_recommend' || activeTab === 'alternative_drugs') && (
            <AlternativeDrugRecommendationView
              patient={selectedPatient}
              interventions={interventionsList}
              onApplyIntervention={handleApplyIntervention}
            />
          )}

          {activeTab === 'guidelines' && (
            <ClinicalGuidelinesViewerView />
          )}

          {activeTab === 'xai_dashboard' && (
            <XAIDashboardView patient={selectedPatient} />
          )}

          {activeTab === 'uncertainty' && (
            <UncertaintyAnalyticsView />
          )}

          {activeTab === 'pharmacovigilance' && (
            <PharmacovigilanceFDAView alerts={MOCK_FDA_ALERTS} />
          )}

          {(activeTab === 'reports_pdf' || activeTab === 'reports_export') && (
            <ReportsPdfExportView
              patient={selectedPatient}
              interactions={MOCK_INTERACTIONS}
              interventions={interventionsList}
            />
          )}

          {activeTab === 'doctor_review' && (
            <DoctorApprovalWorkflowView
              patient={selectedPatient}
              reviews={doctorReviewsList}
              onAddReview={handleAddDoctorReview}
            />
          )}

          {activeTab === 'research_hub' && (
            <ResearchArchitectureHubView />
          )}

          {activeTab === 'admin_monitoring' && (
            <AdminMonitoringView metrics={MOCK_SYSTEM_METRICS} />
          )}
        </main>
      </div>
    </div>
  );
}
