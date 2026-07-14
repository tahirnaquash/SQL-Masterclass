import { useState, useEffect, useRef } from "react";
import { 
  Play, 
  BookOpen, 
  Database, 
  HelpCircle, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  ChevronRight, 
  Clock, 
  FileText, 
  User, 
  RefreshCw, 
  Award, 
  Volume2, 
  Search, 
  Check, 
  Filter, 
  Bookmark, 
  BookMarked,
  Info
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import confetti from "canvas-confetti";
import { TRAINING_SESSIONS } from "./data";
import { Question, TrainingSession, UserProgress } from "./types";

export default function App() {
  // Views: 'dashboard' | 'workspace'
  const [view, setView] = useState<"dashboard" | "workspace">("dashboard");
  const [selectedSession, setSelectedSession] = useState<TrainingSession>(TRAINING_SESSIONS[0]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question>(TRAINING_SESSIONS[0].questions[0]);
  
  // App-wide state / Progress tracking
  const [progress, setProgress] = useState<UserProgress>({
    completedQuestions: [],
    savedQueries: {},
    notes: {}
  });

  // Database State
  const [isSqlLoaded, setIsSqlLoaded] = useState(false);
  const [sqlEngine, setSqlEngine] = useState<any>(null);
  const [dbInstance, setDbInstance] = useState<any>(null);
  const [dbVersion, setDbVersion] = useState(0); // to force-refresh database views
  const [schemaData, setSchemaData] = useState<Record<string, { columns: string[]; rows: any[][] }>>({});

  // Code Editor state
  const [userQuery, setUserQuery] = useState("");
  
  // Left panel active tab: 'info' | 'schema'
  const [leftTab, setLeftTab] = useState<"info" | "schema">("info");
  
  // Selected Table inside database explorer
  const [activeExploreTable, setActiveExploreTable] = useState<string>("");

  // Right panel execution states
  const [isRunning, setIsRunning] = useState(false);
  const [queryResult, setQueryResult] = useState<{ columns: string[]; rows: any[][]; error?: string } | null>(null);
  const [validationResult, setValidationResult] = useState<{ isCorrect: boolean; message: string } | null>(null);
  
  // AI Helper state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Search & Filters on dashboard
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sql_training_progress");
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to load saved progress:", err);
      }
    }
  }, []);

  // Save progress helper
  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem("sql_training_progress", JSON.stringify(newProgress));
  };

  // SQLite engine loading (from CDN script)
  useEffect(() => {
    const loadSQLite = async () => {
      try {
        if (typeof window !== "undefined" && (window as any).initSqlJs) {
          const SQL = await (window as any).initSqlJs({
            locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
          });
          setSqlEngine(SQL);
          setIsSqlLoaded(true);
        } else {
          // Retry logic in case CDN script loads slowly
          const interval = setInterval(async () => {
            if ((window as any).initSqlJs) {
              clearInterval(interval);
              const SQL = await (window as any).initSqlJs({
                locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
              });
              setSqlEngine(SQL);
              setIsSqlLoaded(true);
            }
          }, 200);
          return () => clearInterval(interval);
        }
      } catch (err) {
        console.error("WASM SQLite failed to initialize:", err);
      }
    };
    loadSQLite();
  }, []);

  // Reseed the database whenever the selected session changes
  useEffect(() => {
    if (!sqlEngine) return;
    try {
      const db = new sqlEngine.Database();
      db.run(selectedSession.seedSQL);
      setDbInstance(db);
      setQueryResult(null);
      setValidationResult(null);
      setAiExplanation(null);
      setAiError(null);
      
      // Load user query if saved, or use default template
      const savedCode = progress.savedQueries[selectedQuestion.id];
      setUserQuery(savedCode || `/* Write your SQL query here */\nSELECT * FROM ${selectedSession.tables[0].name} LIMIT 5;`);

      // Automatically inspect all tables to show them in the schema browser
      const tempSchemaData: Record<string, { columns: string[]; rows: any[][] }> = {};
      selectedSession.tables.forEach(t => {
        try {
          const res = db.exec(`SELECT * FROM ${t.name};`);
          if (res.length > 0) {
            tempSchemaData[t.name] = {
              columns: res[0].columns,
              rows: res[0].values
            };
          } else {
            tempSchemaData[t.name] = { columns: [], rows: [] };
          }
        } catch (e) {
          console.error("Error loading table schema values:", e);
        }
      });
      setSchemaData(tempSchemaData);
      if (selectedSession.tables.length > 0) {
        setActiveExploreTable(selectedSession.tables[0].name);
      }
      setDbVersion(v => v + 1);
    } catch (err) {
      console.error("Database seeding failed:", err);
    }
  }, [sqlEngine, selectedSession]);

  // Handle question switch
  useEffect(() => {
    if (!selectedQuestion) return;
    const savedCode = progress.savedQueries[selectedQuestion.id];
    setUserQuery(savedCode || `/* Write your SQL query here */\nSELECT * FROM ${selectedSession.tables[0].name} LIMIT 5;`);
    setQueryResult(null);
    setValidationResult(null);
    setAiExplanation(null);
    setAiError(null);
  }, [selectedQuestion]);

  // Execute User Query
  const handleRunQuery = () => {
    if (!dbInstance) return;
    setIsRunning(true);
    setQueryResult(null);
    setValidationResult(null);

    // Timeout simulation to make it feel responsive
    setTimeout(() => {
      try {
        const trimmedQuery = userQuery.trim();
        if (!trimmedQuery) {
          setQueryResult({ columns: [], rows: [], error: "Query is empty." });
          setIsRunning(false);
          return;
        }

        const res = dbInstance.exec(trimmedQuery);
        if (res.length === 0) {
          setQueryResult({ columns: [], rows: [] }); // Executed but returned no rows
          verifyResults(trimmedQuery, []);
        } else {
          setQueryResult({
            columns: res[0].columns,
            rows: res[0].values
          });
          verifyResults(trimmedQuery, res[0].values, res[0].columns);
        }
      } catch (err: any) {
        setQueryResult({ columns: [], rows: [], error: err.message || "Execution failed." });
        setValidationResult({
          isCorrect: false,
          message: `SQL Error: ${err.message || "Invalid syntax"}`
        });
      } finally {
        setIsRunning(false);
      }
    }, 150);
  };

  // Run the validation check
  const verifyResults = (userSQL: string, userRows: any[][], userCols: string[] = []) => {
    try {
      // 1. Get official solution results
      const solutionRes = dbInstance.exec(selectedQuestion.solutionQuery);
      if (solutionRes.length === 0) {
        // Solution has no rows? (should not happen)
        setValidationResult({ isCorrect: false, message: "Internal validation error. Contact instructor." });
        return;
      }

      const solColumns = solutionRes[0].columns;
      const solRows = solutionRes[0].values;

      // Check column counts
      if (userCols.length !== solColumns.length) {
        setValidationResult({
          isCorrect: false,
          message: `Column Count Mismatch. Expected ${solColumns.length} columns (${solColumns.join(", ")}), but your query returned ${userCols.length} columns.`
        });
        return;
      }

      // Check row counts
      if (userRows.length !== solRows.length) {
        setValidationResult({
          isCorrect: false,
          message: `Row Count Mismatch. Expected ${solRows.length} rows, but your query returned ${userRows.length} rows.`
        });
        return;
      }

      // Deep compare row arrays
      const userRowsStr = JSON.stringify(userRows);
      const solRowsStr = JSON.stringify(solRows);

      if (userRowsStr !== solRowsStr) {
        // Check if sorted elements match (order issue)
        const sortedUserRowsStr = JSON.stringify([...userRows].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))));
        const sortedSolRowsStr = JSON.stringify([...solRows].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))));

        if (sortedUserRowsStr === sortedSolRowsStr) {
          setValidationResult({
            isCorrect: false,
            message: "Correct Rows, Incorrect Order. The correct records were returned, but they are not sorted properly. Check your ORDER BY clauses!"
          });
          return;
        }

        setValidationResult({
          isCorrect: false,
          message: "Values Mismatch. The returned records do not match the expected dataset. Check your filtering filters or values."
        });
        return;
      }

      // Match found!
      setValidationResult({
        isCorrect: true,
        message: "Excellent! Your query returned the exact expected dataset. Spot on!"
      });

      // Update completedQuestions array
      if (!progress.completedQuestions.includes(selectedQuestion.id)) {
        const updatedCompleted = [...progress.completedQuestions, selectedQuestion.id];
        const updatedProgress = {
          ...progress,
          completedQuestions: updatedCompleted,
          savedQueries: {
            ...progress.savedQueries,
            [selectedQuestion.id]: userSQL
          }
        };
        saveProgress(updatedProgress);

        // Show fancy celebration confetti!
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#10B981", "#3B82F6", "#6D28D9"]
        });

        // If completed all 30, double confetti!
        if (updatedCompleted.length === 30) {
          setTimeout(() => {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.5 }
            });
          }, 500);
        }
      }
    } catch (err: any) {
      setValidationResult({
        isCorrect: false,
        message: `Validation comparison error: ${err.message}`
      });
    }
  };

  // Ask AI Helper
  const handleAskAI = async () => {
    setAiLoading(true);
    setAiExplanation(null);
    setAiError(null);

    try {
      const response = await fetch("/api/gemini/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionTitle: selectedSession.title,
          questionTitle: selectedQuestion.title,
          questionPrompt: selectedQuestion.questionText,
          officialSolution: selectedQuestion.solutionQuery,
          userQuery: userQuery,
          executionError: queryResult?.error || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch response.");
      }

      const data = await response.json();
      setAiExplanation(data.explanation);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "An error occurred connecting to the tutor server. Ensure GEMINI_API_KEY is configured.");
    } finally {
      setAiLoading(false);
    }
  };

  // Helper keyword insertion in editor
  const insertKeyword = (keyword: string) => {
    setUserQuery(prev => {
      return prev + (prev.endsWith(" ") || prev.endsWith("\n") ? "" : " ") + keyword + " ";
    });
  };

  // Format helper for query preview
  const formatQuery = () => {
    let formatted = userQuery;
    // Simple uppercase converter for key SQL terms
    const keywords = ["select", "from", "where", "and", "or", "between", "in", "like", "not", "order by", "group by", "having", "limit", "asc", "desc", "inner join", "left join", "right join", "on", "as", "with", "partition by", "over", "lag"];
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      formatted = formatted.replace(regex, keyword.toUpperCase());
    });
    setUserQuery(formatted);
  };

  // Save current query manually
  const saveCurrentQuery = (queryVal: string) => {
    setUserQuery(queryVal);
    saveProgress({
      ...progress,
      savedQueries: {
        ...progress.savedQueries,
        [selectedQuestion.id]: queryVal
      }
    });
  };

  // Reset editor query to default
  const handleResetQuery = () => {
    const defaultQuery = `/* Write your SQL query here */\nSELECT * FROM ${selectedSession.tables[0].name} LIMIT 5;`;
    setUserQuery(defaultQuery);
    saveProgress({
      ...progress,
      savedQueries: {
        ...progress.savedQueries,
        [selectedQuestion.id]: defaultQuery
      }
    });
    setQueryResult(null);
    setValidationResult(null);
    setAiExplanation(null);
  };

  // Total Course Progress percentage
  const totalQuestions = 30;
  const completedCount = progress.completedQuestions.length;
  const coursePercentage = Math.round((completedCount / totalQuestions) * 100);

  // Get session-wise progress
  const getSessionProgress = (sessionNo: number) => {
    const session = TRAINING_SESSIONS.find(s => s.number === sessionNo);
    if (!session) return { count: 0, total: 0, percent: 0 };
    const completedInSession = session.questions.filter(q => progress.completedQuestions.includes(q.id)).length;
    return {
      count: completedInSession,
      total: session.questions.length,
      percent: Math.round((completedInSession / session.questions.length) * 100)
    };
  };

  // Filtered Questions for current session on Left panel list
  const filteredQuestions = selectedSession.questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.questionText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === "All" || q.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="flex flex-col h-screen text-[#0F172A] bg-[#F8FAFC] font-sans">
      
      {/* GLOBAL BANNER */}
      <header className="h-20 border-b-4 border-[#0F172A] flex items-center justify-between px-8 bg-white shrink-0 shadow-md">
        <div className="flex items-center gap-4 cursor-pointer select-none" onClick={() => setView("dashboard")}>
          <div className="bg-[#0F172A] text-white p-2.5 font-black text-2xl leading-none tracking-tighter border-2 border-[#0F172A]">SQL</div>
          <div>
            <h1 className="font-display font-black text-sm xs:text-base sm:text-lg md:text-xl uppercase tracking-tighter text-[#0F172A] flex items-center gap-2 whitespace-nowrap">
              PRE-PLACEMENT TRAINING <span className="text-xs bg-amber-400 border-2 border-[#0F172A] text-[#0F172A] font-black px-2 py-0.5 rounded-full">DBMS WORKSPACE</span>
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:block">Interactive query lab and progress notebook</p>
          </div>
        </div>

        {/* Global Stats */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <div className="text-[10px] uppercase font-black text-slate-400 leading-none mb-1">
              CURRENT COURSE PROGRESS
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-3.5 bg-slate-100 rounded-full overflow-hidden border-2 border-[#0F172A]">
                <div 
                  className="bg-[#0F172A] h-full rounded-full transition-all duration-500"
                  style={{ width: `${coursePercentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-black text-[#0F172A]">{completedCount.toString().padStart(2, '0')} / 30 TASKS</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-black text-[#0F172A] uppercase tracking-tighter">{coursePercentage}% COMPLETED</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">10-Hour Lab</div>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-full border-2 border-[#0F172A] flex items-center justify-center relative shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
              <Award className={`w-5 h-5 ${completedCount === 30 ? 'text-amber-300 animate-bounce' : 'text-white'}`} />
              {completedCount === 30 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full animate-ping border border-white"></span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* VIEW RENDERER */}
      {view === "dashboard" ? (
        
        /* --------------------------------- DASHBOARD VIEW --------------------------------- */
        <main className="flex-1 overflow-y-auto px-6 py-8 max-w-7xl mx-auto w-full space-y-10 animate-fadeIn">
          
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl border-4 border-[#0F172A] bg-white p-8 md:p-10 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50/30 rounded-full blur-3xl -z-10"></div>
            
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2 space-y-5">
                <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-700 border-2 border-blue-500">
                  <Sparkles className="w-4.5 h-4.5 mr-1.5 text-blue-500 fill-current" />
                  Self-Paced Training Course Sandbox
                </span>
                <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight text-[#0F172A] leading-none uppercase">
                  Master DBMS SQL via Real-World Scenarios
                </h2>
                <p className="text-slate-600 max-w-2xl leading-relaxed font-semibold">
                  Welcome to the ultimate SQL training workspace. Progress through 5 logical sessions containing 30 structured, hands-on tasks. Write real queries on real datasets spanning E-commerce, Banking, Healthcare, College Placements, and Sales Analytics.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2.5 rounded-xl border-2 border-[#0F172A] shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-black uppercase text-[#0F172A] tracking-wider">In-Browser WASM SQLite Engine</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2.5 rounded-xl border-2 border-[#0F172A] shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-black uppercase text-[#0F172A] tracking-wider">Generative AI Coding Tutor</span>
                  </div>
                </div>
              </div>

              {/* Progress Card */}
              <div className="bg-slate-50 border-4 border-[#0F172A] p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Progress Ring */}
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" className="stroke-slate-200 fill-none" strokeWidth="8" />
                    <circle cx="48" cy="48" r="40" className="stroke-[#0F172A] fill-none transition-all duration-500" strokeWidth="8" 
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * coursePercentage) / 100}
                    />
                  </svg>
                  <span className="text-xl font-display font-black text-[#0F172A]">{coursePercentage}%</span>
                </div>
                <div>
                  <h4 className="font-black text-[#0F172A] uppercase tracking-tight text-sm">Your Syllabus Progress</h4>
                  <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wide">{completedCount} of {totalQuestions} queries correctly validated</p>
                </div>
                {completedCount === totalQuestions ? (
                  <div className="bg-emerald-100 border-2 border-emerald-500 text-emerald-800 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 animate-bounce">
                    <Award className="w-4 h-4 text-emerald-600" /> Certification Earned!
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      // Find first incomplete question or default to first
                      let nextQ = TRAINING_SESSIONS[0].questions[0];
                      let nextS = TRAINING_SESSIONS[0];
                      let found = false;
                      for (const s of TRAINING_SESSIONS) {
                        for (const q of s.questions) {
                           if (!progress.completedQuestions.includes(q.id)) {
                            nextQ = q;
                            nextS = s;
                            found = true;
                            break;
                          }
                        }
                        if (found) break;
                      }
                      setSelectedSession(nextS);
                      setSelectedQuestion(nextQ);
                      setView("workspace");
                    }}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-tight border-2 border-[#0F172A] shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current text-white" />
                    {completedCount > 0 ? "Resume Learning" : "Start Course Lab"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* COURSE SYLLABUS SESSIONS */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tighter text-[#0F172A]">5-Session Complete Syllabus</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Structured curriculum mapping simple queries to advanced window analytics</p>
              </div>
              
              {/* Reset Progress Button */}
              {completedCount > 0 && (
                <button 
                  onClick={() => {
                    if (confirm("Are you sure you want to reset all progress? This will clear your completed questions and saved SQL codes.")) {
                      saveProgress({ completedQuestions: [], savedQueries: {}, notes: {} });
                      confetti({ particleCount: 30, colors: ["#EF4444"] });
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs font-black text-rose-600 hover:bg-rose-100 bg-rose-50 px-3.5 py-2 rounded-xl border-2 border-rose-500 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> RESET LAB PROGRESS
                </button>
              )}
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {TRAINING_SESSIONS.map((session) => {
                const sessionProg = getSessionProgress(session.number);
                const isCompleted = sessionProg.count === sessionProg.total;
                const isStarted = sessionProg.count > 0;

                return (
                  <div 
                    key={session.number}
                    className={`flex flex-col rounded-2xl border-4 border-[#0F172A] transition duration-300 relative group overflow-hidden ${
                      isCompleted 
                        ? 'bg-emerald-50/60 text-[#0F172A] shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]' 
                        : 'bg-white text-[#0F172A] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]'
                    }`}
                  >
                    
                    <div className="p-6 flex-1 flex flex-col space-y-4">
                      {/* Badge / Number */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-black text-blue-600 tracking-wider">
                          SESSION {session.number} / 5
                        </span>
                        {isCompleted ? (
                          <span className="flex items-center text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md border-2 border-emerald-500">
                            <CheckCircle className="w-3 h-3 mr-1" /> COMPLETE
                          </span>
                        ) : isStarted ? (
                          <span className="flex items-center text-xs font-black text-sky-700 bg-sky-100 px-2.5 py-1 rounded-md border-2 border-sky-500">
                            IN PROGRESS
                          </span>
                        ) : (
                          <span className="flex items-center text-xs font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-300">
                            NOT STARTED
                          </span>
                        )}
                      </div>

                      {/* Header */}
                      <div className="space-y-1.5">
                        <h4 className="font-display font-black text-xl text-[#0F172A] group-hover:text-blue-600 transition uppercase tracking-tight leading-snug">
                          {session.title.replace(`Session ${session.number} — `, "")}
                        </h4>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1">
                          <Database className="w-3.5 h-3.5 text-slate-400" />
                          Domain: <span className="text-slate-800">{session.domain}</span>
                        </p>
                      </div>

                      {/* Topics */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {session.topics.slice(0, 5).map(topic => (
                          <span key={topic} className="text-[10px] font-black font-mono bg-slate-100 text-[#0F172A] px-2.5 py-1 rounded border-2 border-[#0F172A]">
                            {topic}
                          </span>
                        ))}
                        {session.topics.length > 5 && (
                          <span className="text-[10px] font-black font-mono bg-[#0F172A] text-white px-2 py-1 rounded">
                            +{session.topics.length - 5} MORE
                          </span>
                        )}
                      </div>

                      {/* Session Progress Bar */}
                      <div className="space-y-1 pt-2 flex-1 flex flex-col justify-end">
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <span>Progress</span>
                          <span>{sessionProg.count} of {sessionProg.total} Solved</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden border-2 border-[#0F172A]">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${sessionProg.percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <button
                      onClick={() => {
                        setSelectedSession(session);
                        // Default to the first incomplete question in session, or just first question
                        const incomplete = session.questions.find(q => !progress.completedQuestions.includes(q.id));
                        setSelectedQuestion(incomplete || session.questions[0]);
                        setView("workspace");
                      }}
                      className="border-t-4 border-[#0F172A] py-4 px-6 text-xs font-black text-slate-600 group-hover:text-blue-600 hover:bg-slate-50 bg-slate-50/50 text-left flex items-center justify-between transition uppercase tracking-wider cursor-pointer"
                    >
                      <span>Enter Practice Lab</span>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COURSE LEARNING OUTCOMES */}
          <section className="bg-white rounded-3xl border-4 border-[#0F172A] p-8 space-y-6 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="text-xl md:text-2xl font-display font-black text-[#0F172A] flex items-center gap-2 uppercase tracking-tight">
              <Award className="w-6 h-6 text-blue-500 fill-current" /> Syllabus Learning Outcomes
            </h3>
            <div className="grid md:grid-cols-2 gap-6 leading-relaxed">
              <div className="bg-slate-50 p-6 rounded-2xl border-2 border-[#0F172A] space-y-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                <h4 className="font-black text-blue-600 text-xs font-mono uppercase tracking-widest">Foundation & Grouping</h4>
                <p className="text-slate-600 text-sm font-medium">
                  After completing Session 1 and 2, students will be fully capable of writing structured queries to filter and order records using multi-conditional logic (WHERE, AND, OR, BETWEEN, IN, LIKE), and performing advanced summaries and group aggregates with HAVING conditions.
                </p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border-2 border-[#0F172A] space-y-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                <h4 className="font-black text-emerald-600 text-xs font-mono uppercase tracking-widest">Joins & Subqueries</h4>
                <p className="text-slate-600 text-sm font-medium">
                  Through Session 3 and 4, students learn the anatomy of INNER and LEFT joins, multi-table relationships, null checks, and SELF JOINs. Students then elevate to nested queries, subqueries (aggregates, existence checks), and advanced correlated subqueries.
                </p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border-2 border-[#0F172A] space-y-2 md:col-span-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                <h4 className="font-black text-amber-600 text-xs font-mono uppercase tracking-widest">Advanced Analytical Processing</h4>
                <p className="text-slate-600 text-sm font-medium">
                  Session 5 empowers students with analytical window features. Master ROW_NUMBER() partitioning, RANK() vs DENSE_RANK(), LAG() sequentially comparisons, and Common Table Expressions (CTEs) to solve real business intelligence metrics.
                </p>
              </div>
            </div>
          </section>

        </main>

      ) : (        /* --------------------------------- WORKSPACE / LAB VIEW --------------------------------- */
        <main className="flex-1 flex overflow-hidden">
          
          {/* LEFT PANEL: Navigator, Question Detail, Schema Explorer */}
          <section className="w-1/3 min-w-[360px] max-w-xl border-r-4 border-[#0F172A] bg-white flex flex-col h-full text-[#0F172A]">
            
            {/* Nav Header & Session picker */}
            <div className="p-5 border-b-4 border-[#0F172A] bg-slate-50 space-y-4">
              <button 
                onClick={() => setView("dashboard")}
                className="inline-flex items-center text-xs font-black uppercase tracking-wider text-slate-500 hover:text-blue-600 transition group"
              >
                <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition" />
                Back to Syllabus Dashboard
              </button>

              <div className="flex items-center justify-between gap-2">
                <select 
                  value={selectedSession.number}
                  onChange={(e) => {
                    const sess = TRAINING_SESSIONS.find(s => s.number === Number(e.target.value));
                    if (sess) {
                      setSelectedSession(sess);
                      setSelectedQuestion(sess.questions[0]);
                    }
                  }}
                  className="bg-white border-2 border-[#0F172A] text-xs font-black uppercase rounded-xl px-3 py-2 text-[#0F172A] shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] focus:outline-none focus:ring-0 max-w-xs transition"
                >
                  {TRAINING_SESSIONS.map(s => (
                    <option key={s.number} value={s.number}>Session {s.number}: {s.title.split(" — ")[1]}</option>
                  ))}
                </select>

                <span className="text-[10px] font-black uppercase font-mono text-blue-600 bg-blue-50 border-2 border-blue-200 px-2 py-1 rounded-md">
                  {selectedSession.domain}
                </span>
              </div>
            </div>

            {/* Panel Mode Switcher tabs */}
            <div className="flex border-b-4 border-[#0F172A] bg-slate-100 shrink-0">
              <button 
                onClick={() => setLeftTab("info")}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-wider text-center border-r-2 border-[#0F172A] transition flex items-center justify-center gap-1.5 ${
                  leftTab === "info" 
                    ? "text-white bg-[#0F172A]" 
                    : "text-[#0F172A] hover:bg-slate-200"
                }`}
              >
                <FileText className="w-4 h-4" />
                Question Details
              </button>
              <button 
                onClick={() => setLeftTab("schema")}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-wider text-center transition flex items-center justify-center gap-1.5 ${
                  leftTab === "schema" 
                    ? "text-white bg-[#0F172A]" 
                    : "text-[#0F172A] hover:bg-slate-200"
                }`}
              >
                <Database className="w-4 h-4" />
                Database Explorer
                <span className={`ml-1 px-1.5 py-0.5 text-[9px] font-black font-mono rounded border ${
                  leftTab === "schema" ? "bg-blue-600 text-white border-blue-400" : "bg-[#0F172A] text-white border-[#0F172A]"
                }`}>
                  {selectedSession.tables.length}
                </span>
              </button>
            </div>

            {/* TAB CONTAINER CONTENT */}
            <div className="flex-1 overflow-y-auto">
              
              {leftTab === "info" ? (
                
                /* TAB 1: QUESTION SYLLABUS & INSTRUCTIONS */
                <div className="p-5 space-y-6">
                  
                  {/* Select hands-on question dropdown */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest block mb-2">Select Hands-on Task</label>
                    <div className="grid gap-3">
                      {selectedSession.questions.map((q) => {
                        const isSolved = progress.completedQuestions.includes(q.id);
                        const isCurrent = q.id === selectedQuestion.id;
                        
                        return (
                          <button
                            key={q.id}
                            onClick={() => setSelectedQuestion(q)}
                            className={`p-3.5 rounded-xl border-2 transition-all flex items-center justify-between group ${
                              isCurrent 
                                ? "bg-[#0F172A] border-[#0F172A] text-white shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]" 
                                : isSolved 
                                  ? "bg-emerald-50 border-emerald-500 text-emerald-950 hover:bg-emerald-100 shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]"
                                  : "bg-slate-50 border-[#0F172A] text-[#0F172A] hover:bg-slate-100 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              {isSolved ? (
                                <CheckCircle className="w-4.5 h-4.5 text-emerald-500 fill-emerald-100 shrink-0" />
                              ) : (
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center text-[10px] font-black font-mono shrink-0 ${
                                  isCurrent ? 'border-blue-400 text-white bg-blue-600' : 'border-[#0F172A] text-[#0F172A] bg-white'
                                }`}>
                                  {q.title.includes("Easy") ? "E" : q.title.includes("Medium") ? "M" : "H"}
                                </div>
                              )}
                              <span className="text-xs font-black uppercase tracking-tight line-clamp-1">{q.title}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 shrink-0">
                              <span className={`text-[9px] px-1.5 py-0.5 font-black font-mono rounded-md border ${
                                q.difficulty === "Easy" 
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-400" 
                                  : q.difficulty === "Medium"
                                    ? "bg-sky-100 text-sky-800 border-sky-400"
                                    : "bg-rose-100 text-rose-800 border-rose-400"
                              }`}>
                                {q.difficulty.toUpperCase()}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <hr className="border-b-2 border-[#0F172A]" />

                  {/* ACTIVE QUESTION PANEL DETAILS */}
                  <div className="space-y-5">
                    {/* Difficulty & Status banner */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] uppercase font-mono font-black px-2.5 py-1 rounded-md border-2 ${
                        selectedQuestion.difficulty === "Easy"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-500"
                          : selectedQuestion.difficulty === "Medium"
                            ? "bg-sky-100 text-sky-800 border-sky-500"
                            : "bg-rose-100 text-rose-800 border-rose-500"
                      }`}>
                        {selectedQuestion.difficulty.toUpperCase()} DIFFICULTY
                      </span>

                      {progress.completedQuestions.includes(selectedQuestion.id) && (
                        <span className="flex items-center text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md border-2 border-emerald-500">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> SOLVED
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-display font-black text-[#0F172A] leading-tight uppercase tracking-tight">
                      {selectedQuestion.title}
                    </h3>

                    {/* Scenario */}
                    <div className="p-4 rounded-xl bg-slate-50 border-2 border-[#0F172A] space-y-2 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
                      <h4 className="text-[10px] font-mono font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-blue-600" /> Real-World Scenario
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                        {selectedQuestion.scenario}
                      </p>
                    </div>

                    {/* Question Statement */}
                    <div className="space-y-1.5">
                      <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Problem Statement</h4>
                      <p className="text-sm font-bold text-[#0F172A] leading-relaxed bg-slate-100 border-l-4 border-blue-500 p-3.5 rounded-r">
                        {selectedQuestion.questionText}
                      </p>
                    </div>

                    {/* Concepts Covered */}
                    <div className="space-y-1.5">
                      <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Concepts Covered</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedQuestion.concepts.map(c => (
                          <span key={c} className="text-xs font-black font-mono bg-white text-[#0F172A] px-2.5 py-1 rounded-md border-2 border-[#0F172A] shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Hint Expander */}
                    <details className="group border-2 border-[#0F172A] rounded-xl bg-slate-50 overflow-hidden transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                      <summary className="p-3 text-xs font-black uppercase tracking-wider text-slate-600 group-hover:text-[#0F172A] cursor-pointer flex items-center justify-between select-none">
                        <span>Need a hint?</span>
                        <span className="text-[10px] font-black font-mono text-blue-600 group-open:hidden">SHOW +</span>
                        <span className="text-[10px] font-black font-mono text-slate-500 group-open:inline">HIDE -</span>
                      </summary>
                      <div className="p-4 border-t-2 border-[#0F172A] text-xs text-slate-600 leading-relaxed bg-white font-semibold">
                        {selectedQuestion.hint}
                      </div>
                    </details>

                  </div>

                </div>
              ) : (
                
                /* TAB 2: DATABASE EXPLORER */
                <div className="p-5 space-y-6">
                  <div className="space-y-1">
                    <h4 className="font-display font-black text-[#0F172A] text-base uppercase tracking-tight">Session {selectedSession.number} Database</h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Click a table to visualize its raw rows and schema metadata.</p>
                  </div>

                  {/* Schema Tables list switcher */}
                  <div className="flex flex-wrap gap-2">
                    {selectedSession.tables.map(table => (
                      <button
                        key={table.name}
                        onClick={() => setActiveExploreTable(table.name)}
                        className={`px-3 py-2 rounded-lg text-xs font-black font-mono uppercase transition flex items-center gap-1.5 border-2 ${
                          activeExploreTable === table.name
                            ? "bg-[#0F172A] border-[#0F172A] text-white shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]"
                            : "bg-white border-[#0F172A] text-[#0F172A] hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                        }`}
                      >
                        <Database className="w-3.5 h-3.5 shrink-0" />
                        {table.name}
                      </button>
                    ))}
                  </div>

                  {/* Selected Table details */}
                  {selectedSession.tables.map(table => {
                    if (table.name !== activeExploreTable) return null;
                    const meta = schemaData[table.name] || { columns: [], rows: [] };

                    return (
                      <div key={table.name} className="space-y-4 animate-fadeIn">
                        
                        {/* Table metadata description */}
                        <div className="p-4 bg-slate-50 rounded-xl border-2 border-[#0F172A] space-y-2 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                          <h5 className="text-[10px] font-mono font-black text-blue-600 uppercase tracking-widest">Description</h5>
                          <p className="text-xs text-slate-700 leading-relaxed font-semibold">{table.desc}</p>
                          
                          <h5 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest pt-2">SQL Schema</h5>
                          <code className="block text-[11px] bg-[#0F172A] p-2.5 rounded border border-[#0F172A] text-emerald-400 font-mono break-all leading-normal shadow-inner">
                            {table.name}( {table.schema} );
                          </code>
                        </div>

                        {/* Raw Records Table Grid */}
                        <div className="space-y-1.5">
                          <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-widest flex items-center justify-between">
                            <span>Raw Data Sample</span>
                            <span className="text-slate-500 lowercase font-mono normal-case font-bold">{meta.rows.length} rows loaded</span>
                          </h5>
                          
                          <div className="border-2 border-[#0F172A] rounded-xl overflow-hidden max-h-[250px] overflow-auto bg-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
                            <table className="w-full text-[11px] font-mono text-left border-collapse">
                              <thead className="bg-[#0F172A] text-white sticky top-0 border-b-2 border-[#0F172A]">
                                <tr>
                                  {meta.columns.map((col) => (
                                    <th key={col} className="px-3 py-2 text-[10px] tracking-widest uppercase text-slate-300 font-black border-r border-slate-700">{col}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 bg-white">
                                {meta.rows.length === 0 ? (
                                  <tr>
                                    <td colSpan={meta.columns.length} className="px-3 py-4 text-center text-slate-500 italic">No records loaded.</td>
                                  </tr>
                                ) : (
                                  meta.rows.map((row, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-slate-50 transition border-b border-slate-200">
                                      {row.map((val, cIdx) => (
                                        <td key={cIdx} className="px-3 py-2 border-r border-slate-100 text-slate-800 font-mono font-bold truncate max-w-[120px]">
                                          {val === null ? <span className="text-slate-400 italic font-medium">NULL</span> : String(val)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>
                    );
                  })}

                </div>
              )}

            </div>
          </section>

          {/* RIGHT PANEL: SQL Code Editor, Results, and AI Tutor */}
          <section className="flex-1 flex flex-col h-full bg-slate-100">
            
            {/* Editor toolbar */}
            <div className="px-5 py-3 border-b-4 border-[#0F172A] bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-black uppercase font-mono text-[#0F172A] flex items-center gap-1">
                  <FileText className="w-4 h-4 text-blue-600" />
                  query.sql
                </span>
                
                {/* Save query state */}
                <span className="text-[10px] bg-[#0F172A] text-white font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border-2 border-[#0F172A]">
                  SQLite in-memory
                </span>
              </div>

              {/* Reset query button */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={formatQuery}
                  className="text-xs font-black uppercase tracking-wider text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-lg border-2 border-transparent hover:border-[#0F172A] transition"
                  title="Format SQL syntax with uppercase keywords"
                >
                  Format SQL
                </button>
                <button 
                  onClick={handleResetQuery}
                  className="text-xs font-black uppercase tracking-wider text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg border-2 border-transparent hover:border-rose-600 transition flex items-center gap-1"
                >
                  Reset Code
                </button>
              </div>
            </div>

            {/* SQL CODE TEXTAREA */}
            <div className="relative flex-1 max-h-[300px] border-b-4 border-[#0F172A] flex flex-col bg-white">
              <textarea
                value={userQuery}
                onChange={(e) => saveCurrentQuery(e.target.value)}
                placeholder="/* Write your SQL query here e.g. SELECT * FROM students; */"
                className="w-full h-full p-5 bg-white text-[#0F172A] font-mono text-sm leading-relaxed border-0 focus:outline-none focus:ring-0 resize-none placeholder-slate-400 font-bold"
              />
              
              {/* Shortcut helpers */}
              <div className="absolute bottom-3 left-3 right-40 flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                {["SELECT", "FROM", "WHERE", "JOIN", "ON", "GROUP BY", "HAVING", "ORDER BY", "LIMIT"].map(word => (
                  <button
                    key={word}
                    onClick={() => insertKeyword(word)}
                    className="text-[10px] font-black font-mono bg-white hover:bg-blue-50 text-[#0F172A] border-2 border-[#0F172A] rounded px-2 py-0.5 cursor-pointer whitespace-nowrap transition active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                  >
                    {word}
                  </button>
                ))}
              </div>

              {/* Run Query Overlay button */}
              <div className="absolute bottom-3 right-3">
                <button
                  onClick={handleRunQuery}
                  disabled={isRunning}
                  className="px-5 py-3 bg-[#0F172A] hover:bg-blue-700 text-white text-xs font-black font-mono uppercase rounded-xl border-2 border-[#0F172A] shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] flex items-center gap-2 transition active:translate-y-1 active:shadow-none disabled:opacity-50"
                >
                  {isRunning ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  {isRunning ? "RUNNING..." : "RUN SQL (CTRL+ENTER)"}
                </button>
              </div>
            </div>

            {/* LOWER PORTION: Results Console & AI Tutor */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Output Table Panel */}
              <div className="flex-1 flex flex-col h-full overflow-hidden border-r-4 border-[#0F172A]">
                <div className="px-5 py-3 bg-slate-50 border-b-4 border-[#0F172A] flex items-center justify-between">
                  <span className="text-xs font-black font-mono text-[#0F172A] uppercase tracking-wider">
                    Query Output Console
                  </span>
                  
                  {queryResult && !queryResult.error && (
                    <span className="text-[10px] text-[#0F172A] bg-blue-50 border border-blue-200 font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                      {queryResult.rows.length} rows returned
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-auto p-5 bg-white">
                  {!queryResult ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-3 p-6">
                      <div className="w-12 h-12 bg-blue-50 border-2 border-dashed border-[#0F172A] rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
                        <Database className="w-6 h-6 text-blue-600 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase text-[#0F172A] tracking-wide">Console Ready</p>
                        <p className="text-xs font-semibold text-slate-500 max-w-xs mt-1 leading-relaxed">Write your SQL statement in the editor above and click Run SQL to view the output dataset.</p>
                      </div>
                    </div>
                  ) : queryResult.error ? (
                    <div className="space-y-4">
                      {/* SQL Execution Error block */}
                      <div className="bg-rose-50 border-2 border-rose-500 p-4 rounded-xl flex items-start space-x-3 animate-fadeIn shadow-[3px_3px_0px_0px_rgba(239,68,68,1)]">
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div className="space-y-1.5 flex-1">
                          <h4 className="text-xs font-black text-rose-800 uppercase tracking-widest font-mono">SQL Syntax/Runtime Error</h4>
                          <p className="text-xs text-rose-950 font-mono bg-white p-3 rounded-lg border-2 border-rose-300 break-all leading-relaxed font-semibold">{queryResult.error}</p>
                        </div>
                      </div>

                      {/* Proactive AI Call Invitation */}
                      <div className="bg-slate-50 p-5 rounded-xl border-2 border-[#0F172A] flex flex-col space-y-3 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
                        <p className="text-xs font-bold text-slate-700 leading-relaxed">Need some help debugging this SQL error? Ask your generative AI tutor for feedback.</p>
                        <button
                          onClick={handleAskAI}
                          disabled={aiLoading}
                          className="px-4 py-2.5 bg-[#0F172A] hover:bg-blue-700 text-white border-2 border-[#0F172A] rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                        >
                          <Sparkles className="w-4 h-4" />
                          {aiLoading ? "Consulting AI Tutor..." : "Ask AI Tutor to Explain Error"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* SQL Success Grid list */
                    <div className="space-y-4 animate-fadeIn">
                      
                      {/* Validation results Banner */}
                      {validationResult && (
                        <div className={`p-4 rounded-xl border-2 flex items-start space-x-3 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] ${
                          validationResult.isCorrect 
                            ? "bg-emerald-50 border-emerald-500 text-emerald-950" 
                            : "bg-rose-50 border-rose-500 text-rose-950"
                        }`}>
                          {validationResult.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-2 text-xs flex-1">
                            <h4 className="font-black uppercase tracking-wider">
                              {validationResult.isCorrect ? "Task Completed Successfully!" : "Output Mismatch"}
                            </h4>
                            <p className="font-semibold text-slate-700 leading-relaxed">{validationResult.message}</p>
                            {!validationResult.isCorrect && (
                              <button
                                onClick={handleAskAI}
                                disabled={aiLoading}
                                className="mt-1 px-3 py-2 bg-white hover:bg-rose-100 border-2 border-rose-500 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition text-rose-800 shadow-[2px_2px_0px_0px_rgba(239,68,68,1)]"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                                {aiLoading ? "Consulting AI..." : "Get AI Tutor Feedback on Mismatch"}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Visual Table */}
                      <div className="border-2 border-[#0F172A] rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                        <table className="w-full text-[11px] font-mono text-left border-collapse bg-white">
                          <thead className="bg-[#0F172A] text-white border-b-2 border-[#0F172A]">
                            <tr>
                              {queryResult.columns.map((col) => (
                                <th key={col} className="px-3 py-2 text-[10px] tracking-widest uppercase text-slate-300 font-black border-r border-slate-700">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {queryResult.rows.length === 0 ? (
                              <tr>
                                <td colSpan={queryResult.columns.length} className="px-3 py-4 text-center text-slate-500 italic">No rows returned by this query.</td>
                              </tr>
                            ) : (
                              queryResult.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-50 transition">
                                  {row.map((val, cIdx) => (
                                    <td key={cIdx} className="px-3 py-2 border-r border-slate-100 text-slate-800 font-mono font-bold">
                                      {val === null ? <span className="text-slate-400 italic">NULL</span> : String(val)}
                                    </td>
                                  ))}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI SQL Tutor Sidebar helper */}
              <div className="w-[340px] max-w-md bg-slate-50 flex flex-col h-full overflow-hidden">
                <div className="px-4 py-3 bg-[#0F172A] border-b-2 border-[#0F172A] flex items-center justify-between">
                  <span className="text-xs font-black font-mono text-blue-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    AI Coding Tutor
                  </span>
                  
                  {aiExplanation && (
                    <button 
                      onClick={() => setAiExplanation(null)}
                      className="text-[10px] text-slate-300 hover:text-white font-black font-mono uppercase tracking-wider"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-white">
                  {aiLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-3 p-4">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <Sparkles className="w-5 h-5 text-blue-500 absolute inset-0 m-auto animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase text-[#0F172A]">Analyzing SQL...</p>
                        <p className="text-[10px] font-bold text-slate-500 max-w-[220px] uppercase tracking-wider">Consulting course schema & diagnosing query...</p>
                      </div>
                    </div>
                  ) : aiError ? (
                    <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-500 space-y-2.5 text-xs shadow-[2px_2px_0px_0px_rgba(239,68,68,1)]">
                      <h4 className="font-black text-rose-800 flex items-center gap-1.5 uppercase tracking-wider">
                        <XCircle className="w-4 h-4 text-rose-600" /> API Key Config
                      </h4>
                      <p className="text-rose-950 font-bold leading-relaxed">
                        {aiError}
                      </p>
                      <p className="text-slate-500 text-[11px] font-semibold leading-normal">
                        Note: You can configure your Gemini API key inside the <strong>Settings &gt; Secrets</strong> panel to active this live tutoring assistant.
                      </p>
                    </div>
                  ) : aiExplanation ? (
                    <div className="text-xs text-slate-800 leading-relaxed space-y-3 prose prose-xs max-w-none font-medium">
                      <ReactMarkdown>{aiExplanation}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-3 p-4">
                      <div className="w-10 h-10 bg-slate-50 border-2 border-[#0F172A] rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                        <HelpCircle className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase text-[#0F172A]">Need Explanations?</p>
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed max-w-[200px] uppercase tracking-wider">
                          Stuck on a syntax error or mismatch? Click the feedback button to request live diagnostic guidance.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </section>

        </main>
      )}

      {/* FOOTER */}
      <footer className="py-3.5 px-6 bg-[#0F172A] border-t-4 border-[#0F172A] text-center text-[10px] text-slate-300 font-bold uppercase tracking-wider flex justify-between items-center shrink-0">
        <p>© HKBK College of Engineering, Built by Department of CSE.</p>
        <p className="font-mono text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">SQLite v3.x WASM Engine</p>
      </footer>

    </div>
  );
}
