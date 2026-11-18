import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownToLine, ArrowRight, BookOpen, Check, CheckCircle2, ChevronDown, ChevronUp, Clipboard,
  Copy, ExternalLink, FileText, FolderUp, Layers3, LoaderCircle, MessageSquareText,
  Network, ShieldCheck, Sparkles, WandSparkles, X, AlertTriangle, Info, CheckCheck,
  RefreshCw, Cpu, Database, Eye, Terminal, PlayCircle, Sun, Moon, History, Sliders,
  Split, Trash2, Award, Zap, Users
} from 'lucide-react';
import type { PackageResult, Platform, TaskTemplate, BenchmarkCase, PlatformRule } from './lib/types';
import { buildFullPackage } from './lib/packageText';
import SamskarthaLogo from './components/SamskarthaLogo';
import CatalystGraphic from './components/CatalystGraphic';
import TeamLeaderGraphic from './components/TeamLeaderGraphic';

const defaultPlatforms: Platform[] = [
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/', promptStyle: 'Task framing, ordered steps, constraints, and defined output formatting.' },
  { id: 'claude', name: 'Claude', url: 'https://claude.ai/new', promptStyle: 'Hierarchical XML tags, explicit role priming, and deep reasoning guidelines.' },
  { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com/app', promptStyle: 'Direct actionable instructions, multimodal input references, and clear acceptance criteria.' },
  { id: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai/', promptStyle: 'Research questions, search recency window, authoritative sources, and in-text citations.' },
  { id: 'lovable', name: 'Lovable', url: 'https://lovable.dev/', promptStyle: 'Full application PRD specification with UI/UX tokens, schemas, and immutable boundaries.' },
  { id: 'notebooklm', name: 'NotebookLM', url: 'https://notebooklm.google.com/', promptStyle: 'Strict source-grounded inquiry guide with document upload advisory and citation rules.' }
];

const platformCapabilities: Record<string, { badge: string; color: string; desc: string }> = {
  chatgpt: { badge: 'Step-by-step & Boundaries', color: '#10a37f', desc: 'Reasoning trees, negative boundaries & contract enforcement' },
  claude: { badge: 'Hierarchical XML Delimiters', color: '#d97706', desc: 'Clean tag separation, zero preamble & semantic role priming' },
  gemini: { badge: 'Direct Imperative Commands', color: '#2563eb', desc: 'Multimodal groundings, direct headers & structured acceptance' },
  perplexity: { badge: 'Live Citations & Recency', color: '#0891b2', desc: 'Boolean search formulation, source tiering & temporal bounds' },
  lovable: { badge: 'Full-Stack PRD Architecture', color: '#db2777', desc: 'React 19 + Tailwind tokens, schema models & deterministic UI' },
  notebooklm: { badge: 'Strict Source Grounding Only', color: '#6366f1', desc: 'Zero external hallucination, upload verification & citation keys' },
};

const taskCategories = [
  { id: 'auto', name: 'Auto-Detect' },
  { id: 'research_and_fact_finding', name: 'Research & Fact-Finding' },
  { id: 'coding_and_debugging', name: 'Coding & Debugging' },
  { id: 'website_and_application_development', name: 'Web & App Development' },
  { id: 'writing_and_content_creation', name: 'Writing & Content Creation' },
  { id: 'document_analysis_and_summarization', name: 'Document Analysis' },
  { id: 'planning_and_problem_solving', name: 'Planning & Strategy' },
  { id: 'learning_and_educational_assistance', name: 'Learning & Education' },
  { id: 'data_analysis', name: 'Data Analysis' }
];

const sampleRequests = [
  {
    label: 'SaaS in Lovable',
    platform: 'lovable',
    task: 'website_and_application_development',
    text: 'Build a collaborative project management SaaS dashboard for engineering teams. Include interactive Kanban boards with drag-and-drop cards, milestone tracking, and user permission roles using Tailwind CSS and React. Must not use paid third-party components.'
  },
  {
    label: 'React Bug in ChatGPT',
    platform: 'chatgpt',
    task: 'coding_and_debugging',
    text: 'Diagnose and resolve an event listener closure memory leak in a large-scale React 19 dashboard with live WebSocket streaming. Provide profiling steps and fix implementation.'
  },
  {
    label: 'Research in Perplexity',
    platform: 'perplexity',
    task: 'research_and_fact_finding',
    text: 'Provide an in-depth comparative analysis of recent breakthroughs in quantum error correction between neutral atoms and superconducting qubits. Focus on 2025-2026 research papers, error threshold metrics, and industrial feasibility.'
  },
  {
    label: 'Paper in NotebookLM',
    platform: 'notebooklm',
    task: 'document_analysis_and_summarization',
    text: 'Synthesize the attached quarterly financial earnings transcript and security audit report. Extract revenue growth, gross margins, risk disclosures, and note any conflicting statements across sources.'
  },
  {
    label: 'Auth in Claude',
    platform: 'claude',
    task: 'coding_and_debugging',
    text: 'Design a distributed lock in TypeScript using Redis. Include token ownership verification, automatic lease heartbeat extension via Lua scripts, and graceful release on worker shutdown.'
  },
  {
    label: 'ETL in Gemini',
    platform: 'gemini',
    task: 'data_analysis',
    text: 'Design a robust ETL data pipeline script to ingest streaming JSON IoT sensor data, perform anomaly detection using rolling z-scores, and store aggregate metrics in PostgreSQL.'
  }
];

const PROCESSING_STEPS = [
  { id: 1, title: 'Analyzing Request Intent', desc: 'Extracting structured objectives, audience, and constraints (Module 1)' },
  { id: 2, title: 'Classifying Task Archetype', desc: 'Selecting task-specific prompt structure and template rules' },
  { id: 3, title: 'Retrieving Verified Platform Rules', desc: 'Querying official documentation guidelines and constraints' },
  { id: 4, title: 'Context Engineering & Chunking', desc: 'Structure-aware chunking, duplicate hashing & BM25 + MMR diversity ranking' },
  { id: 5, title: 'Compiling Intermediate Representation (IR)', desc: 'Platform adapter rendering target-native conventions' },
  { id: 6, title: 'Deterministic Quality Validation', desc: 'Verifying intent preservation, constraints coverage, and structure' },
  { id: 7, title: 'Assembling Final Package', desc: 'Compiling prompt, context excerpts, citations & clipboard handoff' }
];

function App() {
  // Theme state: dark / light
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('samskartha_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('samskartha_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((curr) => curr === 'dark' ? 'light' : 'dark');

  // Core application state
  const [platforms, setPlatforms] = useState<Platform[]>(defaultPlatforms);
  const [platformId, setPlatformId] = useState('chatgpt');
  const [selectedTask, setSelectedTask] = useState('auto');
  const [request, setRequest] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<PackageResult | null>(null);

  // Advanced context tuning
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lambda, setLambda] = useState(0.7);

  // Results view state
  const [activeTab, setActiveTab] = useState<'prompt' | 'context' | 'rules' | 'validation'>('prompt');
  const [editedPrompt, setEditedPrompt] = useState('');
  const [editedContext, setEditedContext] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Async & Stepper state
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [manualCopyText, setManualCopyText] = useState('');

  // Modals
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Real-time Database Explorer State
  const [dbCollection, setDbCollection] = useState('platform_profiles');
  const [dbDocuments, setDbDocuments] = useState<any[]>([]);
  const [dbStats, setDbStats] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(false);

  // Multi-platform comparison state
  const [compareResults, setCompareResults] = useState<any>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // History state
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  const [benchmarks, setBenchmarks] = useState<BenchmarkCase[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const selectedPlatform = platforms.find((item) => item.id === platformId) ?? defaultPlatforms[0];

  useEffect(() => {
    fetch('/api/platforms')
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data: Platform[]) => {
        if (Array.isArray(data) && data.length) setPlatforms(data);
      })
      .catch(() => {});

    fetch('/api/benchmarks')
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data: BenchmarkCase[]) => {
        if (Array.isArray(data)) setBenchmarks(data);
      })
      .catch(() => {});
  }, []);

  // Sync edited fields when a new package is generated
  useEffect(() => {
    if (result) {
      setEditedPrompt(result.optimizedPrompt);
      setEditedContext(result.contextSummary);
      setIsEditing(false);
    }
  }, [result]);

  const fullPackage = useMemo(() => {
    if (!result) return '';
    const customizedResult = {
      ...result,
      optimizedPrompt: editedPrompt || result.optimizedPrompt,
      contextSummary: editedContext || result.contextSummary
    };
    return buildFullPackage(customizedResult);
  }, [result, editedPrompt, editedContext]);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const next = Array.from(fileList);
    const allowed = /\.(txt|md|markdown|pdf|docx)$/i;
    const invalid = next.find((file) => !allowed.test(file.name));
    if (invalid) {
      setError(`${invalid.name} is not supported. Please upload TXT, Markdown, PDF, or DOCX files.`);
      return;
    }
    const combined = [...files, ...next].slice(0, 5);
    const oversized = combined.find((file) => file.size > 10 * 1024 * 1024);
    if (oversized) {
      setError(`${oversized.name} exceeds the 10 MB per-file limit.`);
      return;
    }
    setError('');
    setFiles(combined);
  }

  function loadExample(example: typeof sampleRequests[0]) {
    setRequest(example.text);
    setPlatformId(example.platform);
    setSelectedTask(example.task);
    setError('');
    setNotice(`Loaded sample request tailored for ${example.platform.toUpperCase()}.`);
  }

  async function generate() {
    setError('');
    setNotice('');
    setManualCopyText('');

    if (request.trim().length < 10) {
      setError('Please enter a request with at least 10 characters.');
      return;
    }

    setLoading(true);
    setCurrentStep(1);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < 6 ? prev + 1 : prev));
    }, 400);

    try {
      const form = new FormData();
      form.append('originalRequest', request.trim());
      form.append('platformId', platformId);
      form.append('lambda', String(lambda));
      if (selectedTask !== 'auto') {
        form.append('taskType', selectedTask);
      }
      files.forEach((file) => form.append('files', file));

      const response = await fetch('/api/generate', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Generation failed.');

      clearInterval(stepInterval);
      setCurrentStep(7);

      setTimeout(() => {
        setResult(data as PackageResult);
        setActiveTab('prompt');
        setLoading(false);
        setNotice(data.mode === 'gemini'
          ? 'Package generated using Samskartha Platform Adapter & Verified Rules (Demo Mode).'
          : 'Package generated with Gemini AI Assistance & Verified Platform Rules.');
      }, 450);

    } catch (err) {
      clearInterval(stepInterval);
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  async function runCompareAll() {
    if (request.trim().length < 10) {
      setError('Enter at least 10 characters to run multi-platform comparison.');
      return;
    }
    setCompareLoading(true);
    setShowCompareModal(true);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalRequest: request.trim(),
          taskType: selectedTask !== 'auto' ? selectedTask : null
        })
      });
      const data = await res.json();
      setCompareResults(data);
    } catch {
      setError('Failed to run multi-platform comparison.');
    } finally {
      setCompareLoading(false);
    }
  }

  async function openDatabaseExplorer() {
    setShowDatabaseModal(true);
    setDbLoading(true);
    try {
      const statsRes = await fetch('/api/database/stats').then((r) => r.json());
      setDbStats(statsRes);
      const docsRes = await fetch(`/api/database/collections/${dbCollection}`).then((r) => r.json());
      setDbDocuments(docsRes.documents || []);
    } catch {
      // ignore
    } finally {
      setDbLoading(false);
    }
  }

  async function loadDatabaseCollection(col: string) {
    setDbCollection(col);
    setDbLoading(true);
    try {
      const docsRes = await fetch(`/api/database/collections/${col}`).then((r) => r.json());
      setDbDocuments(docsRes.documents || []);
    } catch {
      // ignore
    } finally {
      setDbLoading(false);
    }
  }

  async function openHistoryExplorer() {
    setShowHistoryModal(true);
    try {
      const hist = await fetch('/api/history').then((r) => r.json());
      setHistoryItems(hist);
    } catch {
      // ignore
    }
  }

  async function deleteHistory(id: string) {
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
      setHistoryItems((curr) => curr.filter((h) => h.id !== id));
    } catch {
      // ignore
    }
  }

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setManualCopyText('');
      setNotice(`${label} copied to clipboard!`);
    } catch {
      setManualCopyText(text);
      setNotice('Clipboard access was unavailable. Please select the text in the manual copy box below.');
    }
  }

  async function copyAndOpen() {
    if (!result) return;
    const targetUrl = result.platform.url || selectedPlatform.url;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');

    try {
      await navigator.clipboard.writeText(fullPackage);
      setManualCopyText('');
      setShowHandoffModal(true);
    } catch {
      setManualCopyText(fullPackage);
      setShowHandoffModal(true);
    }
  }

  function exportMarkdown() {
    if (!result) return;
    const blob = new Blob([fullPackage], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `samskartha-${result.platform.id}-package.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice('Markdown package downloaded.');
  }

  function exportPlainText() {
    if (!result) return;
    const content = result.exportFormats?.plainText || fullPackage;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `samskartha-${result.platform.id}-package.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice('Plain text package downloaded.');
  }

  function exportJson() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `samskartha-${result.platform.id}-package.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice('JSON package deliverable downloaded.');
  }

  return (
    <div className="app-shell">
      {/* Top Navigation */}
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Samskartha home">
          <SamskarthaLogo size={36} />
          <div className="brand-title-wrap">
            <span className="samskartha-wildstyle-title brand-title">SAMSKARTHA</span>
            <span className="brand-sanskrit-tag">संस्कर्ता · The Reformer of Prompt & Context</span>
          </div>
        </a>

        <div className="topbar-nav">
          <button className="nav-btn" onClick={() => setShowPlatformModal(true)} type="button">
            <Cpu size={14} /> Platform Profiles
          </button>
          <button className="nav-btn" onClick={openDatabaseExplorer} type="button">
            <Database size={14} /> Real-Time Database
          </button>
          <button className="nav-btn" onClick={openHistoryExplorer} type="button">
            <History size={14} /> History
          </button>
          <button className="nav-btn" onClick={() => setShowBenchmarkModal(true)} type="button">
            <Terminal size={14} /> Benchmarks
          </button>
          <button className="nav-btn" onClick={() => setShowAboutModal(true)} type="button">
            <Info size={14} /> Architecture & Scope
          </button>
        </div>

        <div className="topbar-right">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            type="button"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <span className="topbar-tag">
            <span className="live-dot" />
            Prompt & Context Engine
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main id="top" className="main-wrap">
        {/* Hero Section */}
        <section className="hero">
          <div className="eyebrow"><Sparkles size={14} /> SANSKRIT REFORMER (संस्कर्ता) · PROMPT & CONTEXT ARCHITECTURE</div>
          
          <h1 className="hero-main-title">
            <span className="samskartha-wildstyle-title">SAMSKARTHA</span>
          </h1>

          <div className="sanskrit-meaning-pill">
            <Award size={14} />
            <span><strong>संस्कर्ता (Samskartha):</strong> The Reformer & Purifier that elevates raw intent into perfected GenAI execution.</span>
          </div>

          <p className="hero-copy">
            A high-potency catalyst transforming unstructured requirements and messy context files into platform-native instructions for ChatGPT, Claude, Gemini, Perplexity, Lovable, and NotebookLM.
          </p>

          <div className="hero-pills">
            <span><ShieldCheck size={14} /> Never Auto-Submits External Queries</span>
            <span><Network size={14} /> 6 Platform Adapters</span>
            <span><BookOpen size={14} /> Structure-Aware BM25 + MMR Diversity</span>
          </div>

          {/* Scientific Catalyst Banner */}
          <div className="catalyst-hero-banner">
            <CatalystGraphic size={120} />
            <div>
              <div className="catalyst-badge-title">
                <Zap size={16} color="var(--accent)" />
                The Science Catalyst: Lowering Activation Energy for GenAI
              </div>
              <p className="catalyst-badge-desc">
                In chemistry, a catalyst lowers the activation energy required to initiate a reaction. In Generative AI, Samskartha acts as that exact catalyst: eliminating prompt underspecification, removing hallucination hazards, and grounding context so models succeed on the very first execution.
              </p>
              <div className="catalyst-chem-badge">
                <Zap size={12} />
                <span>Reaction Kinetics: ΔE‡(Catalyzed) ≪ ΔE‡(Raw) · Zero Hallucination Overhead</span>
              </div>
            </div>
          </div>

          {/* Quick Examples */}
          <div className="examples-strip">
            <span className="examples-label">Try Example:</span>
            {sampleRequests.map((ex, i) => (
              <button key={i} className="example-chip" onClick={() => loadExample(ex)} type="button">
                {ex.label}
              </button>
            ))}
          </div>
        </section>

        {/* Two-Column Workspace */}
        <div className="workspace-grid">
          {/* Column 1: Input & Configuration */}
          <section className="panel input-panel">
            <div className="panel-heading">
              <div>
                <span className="step-label">MODULE 01 / INPUT & ANALYSIS</span>
                <h2>Describe Your Intent</h2>
              </div>
              <span className="panel-icon"><MessageSquareText size={20} /></span>
            </div>

            <label className="field-label" htmlFor="request">
              <span>What are you trying to accomplish?</span>
              {request.length > 0 && (
                <button type="button" className="text-action" onClick={() => setRequest('')}>
                  Clear
                </button>
              )}
            </label>
            <textarea
              id="request"
              className="request-area"
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  generate();
                }
              }}
              placeholder="Describe your goal, task specifications, technical stack, audience, and constraints in plain English… (Press Ctrl+Enter to generate)"
              maxLength={25000}
            />
            <div className="input-meta">
              <span>Press <kbd className="keycap">Ctrl</kbd> + <kbd className="keycap">Enter</kbd> to generate package.</span>
              <span>
                {request.trim() ? `${request.trim().split(/\s+/).length} words · ` : ''}
                {request.length > 0 ? `~${Math.ceil(request.length / 4)} tokens · ` : ''}
                {request.length.toLocaleString()} / 25,000
              </span>
            </div>

            {/* Task Category Selector */}
            <div className="section-divider" />
            <div className="field-row">
              <label className="field-label">Task Archetype</label>
              <span className="field-hint">Select or auto-infer</span>
            </div>
            <div className="category-row">
              {taskCategories.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-pill ${selectedTask === cat.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTask(cat.id)}
                  type="button"
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Platform Selector */}
            <div className="section-divider" />
            <div className="field-row">
              <label className="field-label">Target GenAI Platform</label>
              <span className="field-hint">Choose destination platform</span>
            </div>
            <div className="platform-grid">
              {platforms.map((p) => {
                const cap = platformCapabilities[p.id];
                const isSelected = p.id === platformId;
                return (
                  <button
                    key={p.id}
                    data-platform={p.id}
                    className={`platform-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setPlatformId(p.id)}
                    type="button"
                  >
                    <div className="platform-card-header">
                      <span className={`platform-symbol symbol-${p.id}`}>{p.name.slice(0, 1)}</span>
                      <span className="platform-copy">
                        <strong>{p.name}</strong>
                        <small>{p.promptStyle || 'Platform-specific prompt profile'}</small>
                      </span>
                      <span className="radio-indicator">
                        {isSelected && <Check size={12} />}
                      </span>
                    </div>
                    {cap && (
                      <span className="platform-badge-pill">
                        <Zap size={11} color={cap.color} />
                        {cap.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Context Files Upload */}
            <div className="section-divider" />
            <div className="field-row">
              <label className="field-label">
                Upload Context Reference Files <span className="optional">OPTIONAL</span>
              </label>
              <span className="field-hint">Max 5 files · 10 MB each</span>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept=".txt,.md,.markdown,.pdf,.docx"
              multiple
              hidden
              onChange={(e) => addFiles(e.target.files)}
            />
            <button
              className="upload-zone"
              type="button"
              onClick={() => fileInput.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            >
              <span className="upload-icon"><FolderUp size={20} /></span>
              <span>
                <strong>Drop reference documents here or browse</strong>
                <small>PDF, DOCX, TXT, and Markdown files supported</small>
              </span>
              <span className="browse-label">Browse files</span>
            </button>

            {files.length > 0 && (
              <div className="file-list">
                {files.map((file, idx) => (
                  <div className="file-chip" key={`${file.name}-${idx}`}>
                    <FileText size={14} />
                    <span>{file.name}</span>
                    <small>{(file.size / 1024).toFixed(0)} KB</small>
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => setFiles((curr) => curr.filter((_, i) => i !== idx))}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Advanced Context Tuning Accordion */}
            <button
              className="advanced-toggle-btn"
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Sliders size={13} /> Advanced Context Engine Tuning {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {showAdvanced && (
              <div className="advanced-box">
                <div className="slider-control">
                  <div className="slider-row">
                    <span>MMR Diversity Balance (λ)</span>
                    <span>{lambda.toFixed(2)} {lambda > 0.75 ? '(High Relevance)' : lambda < 0.4 ? '(High Diversity)' : '(Balanced)'}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={lambda}
                    onChange={(e) => setLambda(parseFloat(e.target.value))}
                  />
                  <small style={{ color: 'var(--text-light)', marginTop: '2px' }}>
                    Formula: MMR = λ · BM25(d,q) - (1-λ) · max Sim(d,s). Higher λ focuses strictly on lexical matching; lower λ penalizes redundant chunks.
                  </small>
                </div>
              </div>
            )}

            {error && <div className="alert alert-error" role="alert">{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', marginTop: '18px' }}>
              <button className="generate-button" style={{ marginTop: 0 }} onClick={generate} disabled={loading} type="button">
                {loading ? (
                  <><LoaderCircle className="spin" size={18} /> Reforming Package…</>
                ) : (
                  <><WandSparkles size={18} /> Generate Optimized Package <ArrowRight size={17} /></>
                )}
              </button>

              <button
                className="action-btn"
                style={{ height: '52px', padding: '0 16px' }}
                onClick={runCompareAll}
                title="Compile across all 6 platforms simultaneously"
                type="button"
              >
                <Split size={16} /> Compare All
              </button>
            </div>

            <p className="privacy-note">
              <ShieldCheck size={14} /> Documents are processed strictly in-memory as untrusted context.
            </p>
          </section>

          {/* Column 2: Output & Results Workspace */}
          <section className="panel output-panel">
            <div className="panel-heading">
              <div>
                <span className="step-label">MODULE 02 & 03 / OUTPUT</span>
                <h2>Engineered Deliverable</h2>
              </div>
              <span className="panel-icon"><Clipboard size={20} /></span>
            </div>

            {!result ? (
              <div className="empty-state">
                <div className="empty-illustration">
                  <div className="empty-orbit orbit-one" />
                  <div className="empty-orbit orbit-two" />
                  <div className="empty-core"><WandSparkles size={28} /></div>
                </div>
                <h3>Your next optimized prompt starts here.</h3>
                <p>
                  Submit a request to generate a platform-tailored prompt, engineered context summary, verified citations, and a ready-to-copy package.
                </p>
                <div className="empty-steps">
                  <span><b>1</b> Intent Analysis</span>
                  <ArrowRight size={13} />
                  <span><b>2</b> Context & MMR Engine</span>
                  <ArrowRight size={13} />
                  <span><b>3</b> Platform Adapter Handoff</span>
                </div>
              </div>
            ) : (
              <>
                {/* Result Meta Bar */}
                <div className="result-meta">
                  <div className="meta-left">
                    <span className="result-platform">
                      <span className={`platform-symbol symbol-${result.platform.id}`}>
                        {result.platform.name.slice(0, 1)}
                      </span>
                      <div>
                        <strong style={{ fontSize: '15px' }}>{result.platform.name}</strong>
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>
                          {platformCapabilities[result.platform.id]?.badge || 'Platform Profile'}
                        </span>
                      </div>
                    </span>
                    <span className={`mode-badge ${result.mode}`}>
                      {result.mode === 'gemini' ? 'Gemini AI Assisted' : 'Platform Adapter (Demo)'}
                    </span>
                  </div>

                  <div className="meta-right">
                    <div className="radial-score-container">
                      <svg width="40" height="40" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="16" stroke="var(--panel-border)" strokeWidth="3.5" fill="none" />
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          stroke={result.qualityCheck.score >= 90 ? '#10b981' : '#f59e0b'}
                          strokeWidth="3.5"
                          strokeDasharray="100.5"
                          strokeDashoffset={100.5 - (100.5 * result.qualityCheck.score) / 100}
                          strokeLinecap="round"
                          fill="none"
                          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.6s ease' }}
                        />
                        <text x="20" y="24" textAnchor="middle" fontSize="11" fontWeight="bold" fill="var(--text-main)" fontFamily="var(--font-heading)">
                          {result.qualityCheck.score}
                        </text>
                      </svg>
                      <div className="radial-score-info">
                        <span className="radial-score-title">Quality Verification</span>
                        <span className="radial-score-status">
                          {result.qualityCheck.score >= 90 ? 'Optimal (AST Pass)' : 'Review Criteria'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Telemetry KPI Grid */}
                {result.metrics && (
                  <div className="telemetry-grid">
                    <div className="telemetry-card">
                      <span className="telemetry-label"><Cpu size={12} /> Prompt Size</span>
                      <span className="telemetry-val">~{result.metrics.promptTokensEst} tokens</span>
                      <span className="telemetry-sub">IR Compiled</span>
                    </div>
                    <div className="telemetry-card">
                      <span className="telemetry-label"><Database size={12} /> Context Size</span>
                      <span className="telemetry-val">~{result.metrics.contextTokensEst} tokens</span>
                      <span className="telemetry-sub">BM25 + MMR Ranked</span>
                    </div>
                    <div className="telemetry-card">
                      <span className="telemetry-label"><Zap size={12} /> Compression</span>
                      <span className="telemetry-val">{result.metrics.compressionRatioPercent}</span>
                      <span className="telemetry-sub">Fluff Pruned</span>
                    </div>
                    <div className="telemetry-card">
                      <span className="telemetry-label"><ShieldCheck size={12} /> Total Package</span>
                      <span className="telemetry-val">~{result.metrics.totalPackageTokensEst} tokens</span>
                      <span className="telemetry-sub">{result.references.length} Directives</span>
                    </div>
                  </div>
                )}

                {notice && <div className="alert alert-info" role="status">{notice}</div>}

                {/* Tabs */}
                <div className="result-tabs" role="tablist">
                  <button
                    type="button"
                    className={`tab-btn ${activeTab === 'prompt' ? 'active' : ''}`}
                    onClick={() => setActiveTab('prompt')}
                  >
                    Optimized Prompt
                  </button>
                  <button
                    type="button"
                    className={`tab-btn ${activeTab === 'context' ? 'active' : ''}`}
                    onClick={() => setActiveTab('context')}
                  >
                    Context Package
                  </button>
                  <button
                    type="button"
                    className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rules')}
                  >
                    Platform Rules <span className="tab-count">{result.references.length}</span>
                  </button>
                  <button
                    type="button"
                    className={`tab-btn ${activeTab === 'validation' ? 'active' : ''}`}
                    onClick={() => setActiveTab('validation')}
                  >
                    Quality Check
                  </button>
                </div>

                {/* Tab Body */}
                <div className="result-content">
                  {/* TAB 1: Optimized Prompt */}
                  {activeTab === 'prompt' && (
                    <>
                      <div className="content-topline">
                        <span>READY TO COPY & PASTE INTO {result.platform.name.toUpperCase()}</span>
                        <div className="editor-controls">
                          {isEditing ? (
                            <button
                              type="button"
                              className="text-action"
                              onClick={() => {
                                setEditedPrompt(result.optimizedPrompt);
                                setIsEditing(false);
                              }}
                            >
                              <RefreshCw size={13} /> Revert
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="text-action"
                              onClick={() => setIsEditing(true)}
                            >
                              Edit Prompt
                            </button>
                          )}
                          <button
                            type="button"
                            className="text-action"
                            onClick={() => copyText(editedPrompt || result.optimizedPrompt, 'Optimized prompt')}
                          >
                            <Copy size={13} /> Copy Prompt
                          </button>
                        </div>
                      </div>

                      {isEditing ? (
                        <textarea
                          className="editable-area"
                          value={editedPrompt}
                          onChange={(e) => setEditedPrompt(e.target.value)}
                        />
                      ) : (
                        <pre className="result-pre">{editedPrompt || result.optimizedPrompt}</pre>
                      )}
                    </>
                  )}

                  {/* TAB 2: Context Package */}
                  {activeTab === 'context' && (
                    <>
                      <div className="content-topline">
                        <span>ENGINEERED CONTEXT (BM25 + MMR RANKED)</span>
                        <button
                          type="button"
                          className="text-action"
                          onClick={() => copyText(editedContext || result.contextSummary, 'Context')}
                        >
                          <Copy size={13} /> Copy Context
                        </button>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                          Compact Prompt Summary:
                        </strong>
                        <pre className="result-pre" style={{ marginTop: '6px' }}>
                          {editedContext || result.contextSummary}
                        </pre>
                      </div>

                      {result.detailedContext && result.detailedContext !== 'No uploaded context documents provided.' && (
                        <div>
                          <strong style={{ fontSize: '13px', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                            Detailed Chunk Excerpts & Citations:
                          </strong>
                          <pre className="result-pre" style={{ marginTop: '6px', opacity: 0.9 }}>
                            {result.detailedContext}
                          </pre>
                        </div>
                      )}
                    </>
                  )}

                  {/* TAB 3: Platform Rules & Sources */}
                  {activeTab === 'rules' && (
                    <div className="source-list">
                      {result.references.length > 0 ? (
                        result.references.map((ref, idx) => (
                          <div className="rule-card" key={idx}>
                            <div className="rule-header">
                              <span className="rule-id">{result.platform.name.toUpperCase()} REF 0{idx + 1}</span>
                              <a href={ref.url} target="_blank" rel="noreferrer" className="rule-source">
                                Official Doc <ExternalLink size={12} />
                              </a>
                            </div>
                            <span className="rule-title">{ref.title}</span>
                            <span className="rule-desc">{ref.whyRelevant || ref.url}</span>
                          </div>
                        ))
                      ) : (
                        <p className="muted-copy">No external documentation references included.</p>
                      )}
                    </div>
                  )}

                  {/* TAB 4: Quality Check & Validation */}
                  {activeTab === 'validation' && (
                    <div className="validation-card">
                      {result.qualityCheck.checks.map((c) => (
                        <div key={c.id} className={`val-check-item ${c.passed ? 'passed' : 'failed'}`}>
                          <div className={`val-icon ${c.passed ? 'passed' : 'failed'}`}>
                            {c.passed ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                          </div>
                          <div className="val-text">
                            <strong>{c.name} — {c.passed ? 'PASSED' : 'FLAGGED'}</strong>
                            <small>{c.details}</small>
                          </div>
                        </div>
                      ))}

                      {result.assumptions.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <strong style={{ fontSize: '13px', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                            Stated Assumptions:
                          </strong>
                          <ul style={{ paddingLeft: '18px', margin: '6px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                            {result.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Output Actions Bar */}
                <div className="output-actions-grid">
                  <button className="action-btn" type="button" onClick={() => copyText(fullPackage, 'Full Package')}>
                    <Copy size={13} /> Copy Full Package
                  </button>

                  <button className="action-btn" type="button" onClick={exportMarkdown}>
                    <ArrowDownToLine size={13} /> Export .MD
                  </button>

                  <button className="action-btn" type="button" onClick={exportPlainText}>
                    <FileText size={13} /> Export .TXT
                  </button>

                  <button className="action-btn" type="button" onClick={exportJson}>
                    <Database size={13} /> Export .JSON
                  </button>

                  <button className="action-btn" type="button" onClick={runCompareAll}>
                    <Split size={13} /> Compare 6 Platforms
                  </button>

                  {/* Prominent One-Click Platform Handoff */}
                  <button
                    className="handoff-btn"
                    type="button"
                    onClick={copyAndOpen}
                    style={{
                      background: platformCapabilities[result.platform.id]?.color || 'var(--accent)',
                      boxShadow: `0 8px 24px ${platformCapabilities[result.platform.id]?.color ? platformCapabilities[result.platform.id].color + '45' : 'rgba(46, 139, 123, 0.28)'}`
                    }}
                  >
                    <Sparkles size={16} />
                    Copy Package & Open {result.platform.name}
                    <ExternalLink size={16} />
                  </button>
                </div>

                <p className="handoff-advisory">
                  Clicking copies the complete package and opens {result.platform.name}. Paste with <span className="keycap">Ctrl</span> + <span className="keycap">V</span>. Samskartha does not automatically execute or submit external tasks.
                </p>
              </>
            )}

            {manualCopyText && (
              <div className="manual-copy">
                <div className="manual-copy-head">
                  <strong>Manual Copy Fallback (Clipboard Access Blocked)</strong>
                  <button type="button" onClick={() => setManualCopyText('')} aria-label="Close">
                    <X size={15} />
                  </button>
                </div>
                <textarea
                  readOnly
                  value={manualCopyText}
                  onFocus={(e) => e.currentTarget.select()}
                />
              </div>
            )}
          </section>
        </div>

        {/* BOTTOM SECTION: TEAM LEADER EMPOWERING THE GROUP */}
        <section className="team-leader-section">
          <div className="leader-content">
            <span className="step-label">THE FORCE-MULTIPLIER EFFECT</span>
            <h2>One Leader. An Empowered, Unstoppable Team.</h2>
            <p>
              Just as a visionary team leader lifts and strengthens every member in a group, Samskartha acts as the institutional intelligence multiplier across engineering, research, and product organizations. By encoding verified prompting guidelines, structure-aware context engineering, and deterministic validation into a unified system, Samskartha ensures that every team member commands any GenAI platform with the mastery of a senior principal architect.
            </p>
            <div className="leader-points">
              <div className="leader-point-item">
                <CheckCircle2 size={16} />
                <span>Elevates junior developers to expert prompt & context engineers</span>
              </div>
              <div className="leader-point-item">
                <CheckCircle2 size={16} />
                <span>Enforces consistent, verified standards across ChatGPT, Claude & Lovable</span>
              </div>
              <div className="leader-point-item">
                <CheckCircle2 size={16} />
                <span>Protects private data with server-side secrets and in-memory processing</span>
              </div>
              <div className="leader-point-item">
                <CheckCircle2 size={16} />
                <span>Delivers reproducible, evidence-grounded packages with zero prefill friction</span>
              </div>
            </div>
          </div>
          <div>
            <TeamLeaderGraphic size={320} />
          </div>
        </section>

        {/* Workflow Strip */}
        <section className="workflow-strip">
          <div>
            <span className="step-label">INTEGRATED ARCHITECTURE</span>
            <h2>Three Core Modules. Zero Hallucinated Prefills.</h2>
          </div>
          <div className="workflow-items">
            <div>
              <span>01</span>
              <strong>Requirement Analysis</strong>
              <small>Deconstruct objectives & constraints</small>
            </div>
            <ArrowRight size={16} />
            <div>
              <span>02</span>
              <strong>Context & Prompt Engine</strong>
              <small>Structure-aware BM25 + MMR & IR Compiler</small>
            </div>
            <ArrowRight size={16} />
            <div>
              <span>03</span>
              <strong>Package Compilation</strong>
              <small>Deterministic validation & handoff</small>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <span>© 2026 Samskartha (संस्कर्ता) Platform. All rights reserved.</span>
        <span>Independent prompt and context engineering workspace — does not auto-submit external queries.</span>
        <a href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noreferrer">
          Official Gemini API Reference <ExternalLink size={12} />
        </a>
      </footer>

      {/* REALISTIC PROCESSING STEPPER MODAL */}
      {loading && (
        <div className="modal-overlay">
          <div className="modal-window" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3><WandSparkles className="spin" size={18} /> Reforming Your Package</h3>
            </div>
            <div className="modal-body">
              <div className="processing-stepper">
                {PROCESSING_STEPS.map((s) => {
                  const isActive = currentStep === s.id;
                  const isDone = currentStep > s.id;
                  return (
                    <div
                      key={s.id}
                      className={`step-item ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                    >
                      <div className="step-indicator">
                        {isDone ? <Check size={14} /> : s.id}
                      </div>
                      <div className="step-desc">
                        <strong>{s.title}</strong>
                        <small>{s.desc}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HANDOFF SUCCESS MODAL */}
      {showHandoffModal && result && (
        <div className="modal-overlay" onClick={() => setShowHandoffModal(false)}>
          <div className="modal-window" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <CheckCheck size={20} color="#2e7d5e" />
                Package Copied & {result.platform.name} Opened
              </h3>
              <button className="modal-close" onClick={() => setShowHandoffModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginTop: 0 }}>
                Your complete engineered package is in your clipboard! A new tab has been opened to <strong>{result.platform.name}</strong>.
              </p>

              <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent-border)', borderRadius: '10px', padding: '14px', margin: '14px 0' }}>
                <strong style={{ display: 'block', color: 'var(--accent)', marginBottom: '6px' }}>
                  Next Step:
                </strong>
                Switch to the new tab, click into the prompt input box, and press:
                <div style={{ margin: '10px 0', textAlign: 'center' }}>
                  <span className="keycap">Ctrl</span> + <span className="keycap">V</span> (or <span className="keycap">Cmd</span> + <span className="keycap">V</span> on macOS)
                </div>
              </div>

              {result.platform.id === 'notebooklm' && (
                <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning)', borderRadius: '10px', padding: '12px', fontSize: '12px', color: 'var(--warning)' }}>
                  <strong>NotebookLM Reminder:</strong> Before running queries in NotebookLM, ensure you upload your primary reference files (PDF, DOCX, Google Docs) into your Notebook sources.
                </div>
              )}

              {result.platform.id === 'lovable' && (
                <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: '10px', padding: '12px', fontSize: '12px', color: 'var(--accent)' }}>
                  <strong>Lovable App Spec:</strong> This package is formatted as a full-stack product specification (PRD) with component hierarchy and schema definitions ready for code synthesis.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="action-btn" onClick={() => setShowHandoffModal(false)} type="button">
                Got it, Thanks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME DATABASE EXPLORER MODAL */}
      {showDatabaseModal && (
        <div className="modal-overlay" onClick={() => setShowDatabaseModal(false)}>
          <div className="modal-window" style={{ maxWidth: '900px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Database size={18} /> Real-Time Database & Knowledge Store</h3>
              <button className="modal-close" onClick={() => setShowDatabaseModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {dbStats && (
                <div className="metrics-strip" style={{ marginBottom: '16px' }}>
                  <span>Uptime: <strong>{dbStats.liveTelemetry?.uptimeSeconds}s</strong></span>
                  <span>Active Memory: <strong>{(dbStats.liveTelemetry?.activeMemoryBytes / 1024 / 1024).toFixed(1)} MB</strong></span>
                  <span>Collections: <strong>{Object.keys(dbStats.collections).length}</strong></span>
                  <span>Total Records: <strong>{String(Object.values(dbStats.collections).reduce((a: any, b: any) => a + b, 0))}</strong></span>
                </div>
              )}

              <div className="db-tabs">
                {[
                  { id: 'platform_profiles', name: 'platform_profiles' },
                  { id: 'platform_rules', name: 'platform_rules' },
                  { id: 'task_templates', name: 'task_templates' },
                  { id: 'knowledge_chunks', name: 'knowledge_chunks' },
                  { id: 'knowledge_sources', name: 'knowledge_sources' },
                  { id: 'saved_packages', name: 'saved_packages (history)' }
                ].map((col) => (
                  <button
                    key={col.id}
                    className={`db-tab-btn ${dbCollection === col.id ? 'active' : ''}`}
                    onClick={() => loadDatabaseCollection(col.id)}
                    type="button"
                  >
                    {col.name} ({dbStats?.collections?.[col.id] ?? 0})
                  </button>
                ))}
              </div>

              {dbLoading ? (
                <p><LoaderCircle className="spin" size={16} /> Loading collection data…</p>
              ) : (
                <pre className="json-viewer">
                  {JSON.stringify(dbDocuments, null, 2)}
                </pre>
              )}
            </div>
            <div className="modal-footer">
              <button className="action-btn" onClick={() => setShowDatabaseModal(false)} type="button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERATION HISTORY DRAWER / MODAL */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-window" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><History size={18} /> Generation History & Saved Packages</h3>
              <button className="modal-close" onClick={() => setShowHistoryModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {historyItems.length === 0 ? (
                <p>No packages generated in this session yet.</p>
              ) : (
                historyItems.map((h) => (
                  <div key={h.id} className="rule-card" style={{ marginBottom: '10px' }}>
                    <div className="rule-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`platform-symbol symbol-${h.platform.id}`} style={{ width: '24px', height: '24px', fontSize: '11px' }}>
                          {h.platform.name.slice(0, 1)}
                        </span>
                        <strong>{h.platform.name}</strong>
                        <span className="rule-id">{h.id}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="score-badge passed" style={{ padding: '2px 7px', fontSize: '10px' }}>
                          Score: {h.score}/100
                        </span>
                        <button
                          type="button"
                          className="text-action"
                          onClick={() => {
                            setResult(h.package);
                            setEditedPrompt(h.package.optimizedPrompt);
                            setEditedContext(h.package.contextSummary);
                            setShowHistoryModal(false);
                            setNotice(`Restored package ${h.id} to active workspace.`);
                          }}
                        >
                          Restore
                        </button>
                        <button
                          type="button"
                          className="text-action"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => deleteHistory(h.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {h.objective}
                    </p>
                    <small style={{ color: 'var(--text-light)', marginTop: '4px' }}>
                      Created at {new Date(h.createdAt).toLocaleTimeString()} · Mode: {h.mode}
                    </small>
                  </div>
                ))
              )}
            </div>
            <div className="modal-footer">
              <button className="action-btn" onClick={() => setShowHistoryModal(false)} type="button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MULTI-PLATFORM COMPARE MODAL */}
      {showCompareModal && (
        <div className="modal-overlay" onClick={() => setShowCompareModal(false)}>
          <div className="modal-window" style={{ maxWidth: '960px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Split size={18} /> Multi-Platform Prompt Matrix</h3>
              <button className="modal-close" onClick={() => setShowCompareModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {compareLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <LoaderCircle className="spin" size={28} style={{ color: 'var(--accent)' }} />
                  <p style={{ marginTop: '12px', fontWeight: 600 }}>Compiling across all 6 platform adapters in real time…</p>
                </div>
              ) : compareResults ? (
                <div className="compare-grid">
                  {Object.values(compareResults.platforms || {}).map((item: any) => (
                    <div key={item.platformId} className="compare-card">
                      <div className="compare-head">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className={`platform-symbol symbol-${item.platformId}`} style={{ width: '24px', height: '24px', fontSize: '11px' }}>
                            {item.platformName.slice(0, 1)}
                          </span>
                          <strong>{item.platformName}</strong>
                        </div>
                        <span className="score-badge passed" style={{ padding: '2px 6px', fontSize: '10px' }}>
                          Score: {item.qualityScore}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 8px', lineHeight: 1.4 }}>
                        {item.promptStyle}
                      </p>
                      <pre className="result-pre" style={{ maxHeight: '180px', overflow: 'auto', fontSize: '11px', padding: '8px', background: 'var(--panel-sub)', borderRadius: '6px', border: '1px solid var(--panel-border)' }}>
                        {item.optimizedPrompt}
                      </pre>
                      <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="text-action"
                          onClick={() => {
                            setPlatformId(item.platformId);
                            setShowCompareModal(false);
                            generate();
                          }}
                        >
                          Select {item.platformName}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No comparison data.</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="action-btn" onClick={() => setShowCompareModal(false)} type="button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLATFORM PROFILES EXPLORER MODAL */}
      {showPlatformModal && (
        <div className="modal-overlay" onClick={() => setShowPlatformModal(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Cpu size={18} /> Platform Adaptation Profiles</h3>
              <button className="modal-close" onClick={() => setShowPlatformModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginTop: 0, color: 'var(--text-muted)' }}>
                Samskartha maintains independent, version-controlled profiles with verified prompt engineering rules derived exclusively from official public documentation.
              </p>
              {platforms.map((p) => (
                <div key={p.id} className="rule-card" style={{ marginBottom: '14px' }}>
                  <div className="rule-header">
                    <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{p.name}</strong>
                    <span className="rule-id">Profile v{p.profileVersion || '2.0'}</span>
                  </div>
                  <p style={{ margin: '6px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {p.promptStyle}
                  </p>
                  {p.rules && p.rules.length > 0 && (
                    <div style={{ marginTop: '6px' }}>
                      <small style={{ fontWeight: 700, color: 'var(--text-main)' }}>Verified Rules:</small>
                      <ul style={{ paddingLeft: '16px', margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {p.rules.map((r) => (
                          <li key={r.ruleId}>
                            <strong>[{r.ruleId}] {r.title}:</strong> {r.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div style={{ marginTop: '8px' }}>
                    <a href={p.url} target="_blank" rel="noreferrer" className="rule-source">
                      Destination: {p.url} <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="action-btn" onClick={() => setShowPlatformModal(false)} type="button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BENCHMARK CASES MODAL */}
      {showBenchmarkModal && (
        <div className="modal-overlay" onClick={() => setShowBenchmarkModal(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Terminal size={18} /> Benchmark Evaluation Suite</h3>
              <button className="modal-close" onClick={() => setShowBenchmarkModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginTop: 0, color: 'var(--text-muted)' }}>
                Evaluation tasks spanning research, coding, application development, writing, and document analysis. Select any case to test platform adaptation.
              </p>
              {benchmarks.length > 0 ? (
                benchmarks.map((b) => (
                  <div key={b.id} className="rule-card" style={{ marginBottom: '12px' }}>
                    <div className="rule-header">
                      <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{b.title}</strong>
                      <span className="rule-id">{b.taskType.replace(/_/g, ' ')}</span>
                    </div>
                    <p style={{ margin: '6px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {b.request}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <button
                        type="button"
                        className="text-action"
                        onClick={() => {
                          setRequest(b.request);
                          setSelectedTask(b.taskType);
                          setShowBenchmarkModal(false);
                          setNotice(`Loaded benchmark case: "${b.title}".`);
                        }}
                      >
                        <PlayCircle size={13} /> Load This Case
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>Loading benchmark cases…</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="action-btn" onClick={() => setShowBenchmarkModal(false)} type="button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABOUT & PRIVACY MODAL */}
      {showAboutModal && (
        <div className="modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Info size={18} /> About Samskartha & Technical Architecture</h3>
              <button className="modal-close" onClick={() => setShowAboutModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <h4 style={{ margin: '0 0 6px', color: 'var(--text-main)' }}>Core Architecture & Boundary:</h4>
              <p style={{ margin: '0 0 14px', color: 'var(--text-muted)' }}>
                Samskartha is an independent prompt-and-context engineering platform. It optimizes and structures your task for the target model, but does <strong>not</strong> execute prompts on ChatGPT, Claude, Gemini, Perplexity, Lovable, or NotebookLM. The user pastes the package into the external platform.
              </p>

              <h4 style={{ margin: '0 0 6px', color: 'var(--text-main)' }}>Algorithms & Engineering:</h4>
              <ul style={{ paddingLeft: '18px', margin: '0 0 16px', color: 'var(--text-muted)' }}>
                <li><strong>IR-Based Prompt Compiler:</strong> Generates Intermediate Representation (IR) and compiles target-specific prompts (XML for Claude, PRD specs for Lovable, citations for Perplexity).</li>
                <li><strong>Robertson-Spärck Jones BM25:</strong> Lexical search with IDF scaling without requiring paid embedding services.</li>
                <li><strong>Maximal Marginal Relevance (MMR):</strong> Minimizes chunk redundancy: λ·Sim(d,q) - (1-λ)·max Sim(d,s).</li>
                <li><strong>Untrusted Data Neutralization:</strong> Sanitizes prompt injection patterns from uploaded documents in memory.</li>
              </ul>

              <h4 style={{ margin: '0 0 6px', color: 'var(--text-main)' }}>Privacy & Reliability:</h4>
              <p style={{ margin: '0', color: 'var(--text-muted)' }}>
                API keys are strictly server-side. Zero permanent file retention by default. In local demo mode, all deterministic rules execute with zero external calls.
              </p>
            </div>
            <div className="modal-footer">
              <button className="action-btn" onClick={() => setShowAboutModal(false)} type="button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
