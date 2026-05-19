import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  Download, 
  FileText, 
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Briefcase
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Job } from '../../types';
import { apiService } from '../../services/api';

interface JobDetailViewProps {
  job: Job;
  onBack: () => void;
}

export default function JobDetailView({ job, onBack }: JobDetailViewProps) {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const data = await apiService.getRankings(job.id);
      // Sort candidates using azendlyScore
      const sorted = Array.isArray(data) 
        ? data.sort((a, b) => (b.azendlyScore || 0) - (a.azendlyScore || 0))
        : [];
      setRankings(sorted);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [job.id]);

  const filteredResumes = rankings.filter(r => 
    (r.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateReport = async () => {
    if (!rankings || rankings.length === 0) return;
    setIsGeneratingReport(true);
    
    try {
      // 1. Map and parse the structured payload rows
      const reportData = rankings.map((candidate, idx) => {
      let parsedExplanation = { summary: '', strengths: [], weaknesses: [] };
      
      if (candidate.explanation) {
        if (typeof candidate.explanation === 'string') {
          try {
            parsedExplanation = JSON.parse(candidate.explanation);
          } catch (e) {
            console.error("Failed parsing explanation string inside report:", e);
          }
        } else if (typeof candidate.explanation === 'object') {
          parsedExplanation = candidate.explanation;
        }
      }

      // Convert arrays of text items into single breathable string rows for Excel cells
      const formatList = (arr: any) => Array.isArray(arr) ? arr.map(item => `• ${item}`).join('\n') : '';

      return {
        "Rank": idx + 1,
        "Name": candidate.name,
        "Azendly Score (%)": candidate.azendlyScore ?? 0,
        "Email Address": candidate.email || 'N/A',
        "Phone Number": candidate.phone || 'N/A',
        "Summary": parsedExplanation.summary || '',
        "Key Strengths": formatList(parsedExplanation.strengths),
        "Potential Weaknesses / Risks": formatList(parsedExplanation.weaknesses),
        "Location": candidate.location || 'N/A',
      };
    });

    // 2. Convert mapped JSON dataset to a SheetJS Worksheet object
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    
    // 3. Configure cell design alignments (enables text wrap for long summaries & bullet points)
    const totalCols = Object.keys(reportData[0] || {}).length;
    worksheet['!cols'] = [
      { wch: 6 },   // Rank
      { wch: 25 },  // Candidate Name
      { wch: 18 },  // Azendly Score
      { wch: 25 },  // Email
      { wch: 18 },  // Phone
      { wch: 45 },  // AI Summary
      { wch: 45 },  // Key Strengths
      { wch: 45 },  // Potential Weaknesses
      { wch: 15 },  // Location
    ];

    // 4. Create Workbook wrapper shell and append the sheet
    const workbook = XLSX.utils.book_new();
    const cleanJobTitle = (job.title || 'Job').replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidate Rankings");

    // 5. Build file system payload write execution context
    XLSX.writeFile(workbook, `Azendly_Report_${cleanJobTitle}.xlsx`);
    } catch (error) {
      console.error("Error generating excel report spreadsheet:", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex-grow">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 flex-shrink-0">
                  <Briefcase size={24} />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white">{job.title}</h1>
              </div>
              {/* Removed max-w-3xl and line-clamp-2 so the description reads naturally full-width */}
              <p className="text-gray-400 text-sm md:text-base leading-relaxed w-full">
                {job.overview}
              </p>
            </div>          
            <div className="flex items-center gap-3">
          </div>         
          <div className="flex items-center gap-3">
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Job Context */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-4">Ideal Candidate</h3>
              <div className="space-y-4">
                <SpecItem label="Overview" value={job.bioText} />
                <SpecItem label="Expected Skills" value={job.skillsText} />
                <SpecItem label="Expected Experience" value={job.experienceText} />
                {job.signals && (
                  <div className="pt-4 border-t border-white/5">
                    <div className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-2">Priority Signals</div>
                    <div className="text-sm text-gray-400 italic">"{job.signals}"</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Candidates List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search candidates..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-cyan-500/50 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-sm">
                  <Download size={18} />
                  Download All
                </button>
                <button 
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport || rankings.length === 0 || loading}
                  className="px-6 py-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 font-bold flex items-center justify-center gap-2 hover:bg-cyan-500/20 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isGeneratingReport ? (
                    <>
                      <div className="w-4 h-4 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <BarChart3 size={18} />
                      <span>Generate Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 col-span-1 lg:col-span-3">
                {/* Concentric spinning glowing circle */}
                <div className="relative w-16 h-16 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 border-4 border-cyan-500/10 rounded-full" />
                  <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin shadow-lg shadow-cyan-500/20" />
                </div>
                
                {/* Loading Typography */}
                <h4 className="text-white text-lg font-bold tracking-wide text-center animate-pulse">
                  Gathering your top Picks
                </h4>
              </div>
            ) : filteredResumes.length === 0 ? (
              <div className="py-24 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                <p className="text-gray-500">No candidates found for this search.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredResumes.map((resume, idx) => {
                  // Safe processing of the JSON explanation data fields
                  let parsedExplanation = { summary: '', strengths: [], weaknesses: [] };
                  if (resume.explanation) {
                    if (typeof resume.explanation === 'string') {
                      try {
                        parsedExplanation = JSON.parse(resume.explanation);
                      } catch (e) {
                        console.error("Failed to parse explanation JSON string:", e);
                      }
                    } else if (typeof resume.explanation === 'object') {
                      parsedExplanation = resume.explanation;
                    }
                  }

                  const score = resume.azendlyScore ?? 0;
                  const summaryText = parsedExplanation.summary || "AI synthesis analysis complete for this candidate.";
                  const strengthsList = Array.isArray(parsedExplanation.strengths) ? parsedExplanation.strengths : [];
                  const weaknessesList = Array.isArray(parsedExplanation.weaknesses) ? parsedExplanation.weaknesses : [];

                  return (
                    <motion.div 
                      key={resume.resumeId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`
                        group relative overflow-hidden rounded-2xl transition-all cursor-pointer border
                        ${selectedResumeId === resume.resumeId 
                          ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-cyan-500/30' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}
                      `}
                      onClick={() => setSelectedResumeId(selectedResumeId === resume.resumeId ? null : resume.resumeId)}
                    >
                      <div className="p-5 flex items-center gap-6">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg transition-transform group-hover:scale-110 ${
                          rankings.findIndex(r => r.resumeId === resume.resumeId) === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-[#0D0D0F] shadow-yellow-500/20' :
                          rankings.findIndex(r => r.resumeId === resume.resumeId) === 1 ? 'bg-gradient-to-br from-gray-200 to-gray-500 text-[#0D0D0F] shadow-white/10' :
                          rankings.findIndex(r => r.resumeId === resume.resumeId) === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-[#0D0D0F] shadow-orange-500/20' :
                          'bg-black/40 text-white/50'
                        }`}>
                          {rankings.findIndex(r => r.resumeId === resume.resumeId) + 1}
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-white truncate">{resume.name}</h4>
                            {rankings.findIndex(r => r.resumeId === resume.resumeId) === 0 && (
                              <span className="px-2 py-0.5 bg-yellow-400/10 text-yellow-500 rounded text-[8px] font-black uppercase tracking-widest">Top Pick</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-[10px] text-gray-500 uppercase tracking-widest font-black">
                            <span className="flex items-center gap-1">
                              {resume.phone || 'N/A'}
                            </span>
                            <span>•</span>
                            <a 
                              href={`mailto:${resume.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-cyan-400 hover:underline lowercase"
                            >
                              {resume.email || 'N/A'}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="hidden md:flex flex-col items-end">
                            <div className="text-xs font-black text-white">{score}% MATCH</div>
                            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                              />
                            </div>
                          </div>
                          <ChevronRight className={`text-gray-600 transition-transform ${selectedResumeId === resume.resumeId ? 'rotate-90' : ''}`} />
                        </div>
                      </div>

                      {/* Detailed Breakdown */}
                      <AnimatePresence>
                        {selectedResumeId === resume.resumeId && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-5 pb-6 pt-2 border-t border-white/5"
                          >
                            <div className="p-6 rounded-2xl bg-black/40 space-y-6">
                              <div>
                                <h5 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-3">AI Synthesis</h5>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                  {summaryText}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h5 className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em] mb-3">Strengths</h5>
                                  <ul className="space-y-2">
                                    {strengthsList.length > 0 ? (
                                      strengthsList.map((strength, sIdx) => (
                                        <StrengthItem key={sIdx} text={strength} />
                                      ))
                                    ) : (
                                      <p className="text-xs text-gray-500 italic">No explicit strengths listed.</p>
                                    )}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-3">Potential Risks</h5>
                                  <ul className="space-y-2">
                                    {weaknessesList.length > 0 ? (
                                      weaknessesList.map((weakness, wIdx) => (
                                        <RiskItem key={wIdx} text={weakness} />
                                      ))
                                    ) : (
                                      <p className="text-xs text-gray-500 italic">No explicit potential risks noted.</p>
                                    )}
                                  </ul>
                                </div>
                              </div>

                              <div className="pt-4 flex gap-3">
                                <button className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                  <FileText size={14} />
                                  View Full Resume
                                </button>
                                <button className="flex-1 py-3 rounded-xl bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/10">
                                  <Download size={14} />
                                  Download
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{label}</div>
      <div className="text-sm text-gray-300">{value}</div>
    </div>
  );
}

function StrengthItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-xs text-gray-400">
      <CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
      <span>{text}</span>
    </li>
  );
}

function RiskItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-xs text-gray-400">
      <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
      <span>{text}</span>
    </li>
  );
}
