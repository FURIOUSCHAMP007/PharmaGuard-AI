import React, { useState } from 'react';
import { CheckCircle2, XCircle, ShieldCheck, MessageSquare, Award, RefreshCw } from 'lucide-react';
import { DoctorReview, Patient } from '../../types/pharmaguard';
import { INITIAL_PATIENTS } from '../../data/mockClinicalData';

interface DoctorApprovalWorkflowViewProps {
  patient?: Patient;
  reviews?: DoctorReview[];
  doctorReviews?: DoctorReview[];
  onAddReview?: (review: DoctorReview) => void;
  onApproveReview?: (review: DoctorReview) => void;
}

export const DoctorApprovalWorkflowView: React.FC<DoctorApprovalWorkflowViewProps> = ({
  patient,
  reviews = [],
  doctorReviews = [],
  onAddReview,
  onApproveReview
}) => {
  const activePatient = patient || INITIAL_PATIENTS[0];
  const activeReviews = reviews.length > 0 ? reviews : doctorReviews;

  const [doctorNotes, setDoctorNotes] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'Approved' | 'Overridden'>('Approved');

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    const newRev: DoctorReview = {
      id: `rev-${Date.now()}`,
      patientId: activePatient.id,
      reviewedBy: 'Dr. Sarah Jenkins, MD (Cardiology)',
      status: reviewStatus,
      doctorNotes: doctorNotes || 'Reviewed and confirmed multi-agent safety recommendation.',
      overrideReason: reviewStatus === 'Overridden' ? overrideReason : undefined,
      timestamp: new Date().toLocaleString(),
      learningFeedbackLoopRecorded: true
    };
    if (onAddReview) onAddReview(newRev);
    if (onApproveReview) onApproveReview(newRev);
    setDoctorNotes('');
    setOverrideReason('');
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Doctor Review & Human-in-the-Loop (HITL) Learning Workflow</h1>
            <p className="text-xs text-slate-400">
              Physician oversight console recording clinical approvals, overrides, and rationale into the RLHF continual learning feedback loop.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Review Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span>Submit Attending Review for {activePatient.name}</span>
          </h2>

          <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Decision Status</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewStatus('Approved')}
                  className={`py-2.5 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    reviewStatus === 'Approved'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve Recommendation
                </button>

                <button
                  type="button"
                  onClick={() => setReviewStatus('Overridden')}
                  className={`py-2.5 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    reviewStatus === 'Overridden'
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <XCircle className="w-4 h-4" /> Clinical Override
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Physician Rationale & Notes</label>
              <textarea
                rows={3}
                placeholder="Enter attending clinical notes..."
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {reviewStatus === 'Overridden' && (
              <div>
                <label className="block text-rose-400 mb-1 font-semibold">Specify Override Clinical Justification</label>
                <textarea
                  rows={2}
                  placeholder="Explain clinical reason for overriding AI recommendation..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-slate-800 border border-rose-900/60 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-white shadow-lg cursor-pointer transition-all"
            >
              Sign & Record Feedback Loop Entry
            </button>
          </form>
        </div>

        {/* Right Col: Historical Review Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Historical Physician Approvals & Audit Log
          </h2>

          <div className="space-y-3">
            {activeReviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300">{rev.reviewedBy}</span>
                  <span className={`px-2.5 py-0.5 rounded font-extrabold text-[10px] ${
                    rev.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  }`}>
                    {rev.status}
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed">{rev.doctorNotes}</p>
                <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-700/60">
                  <span>HITL Feedback Recorded: <strong className="text-emerald-400">Yes</strong></span>
                  <span className="font-mono">{rev.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
