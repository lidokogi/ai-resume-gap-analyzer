import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast, toast } from "@/hooks/use-toast";
import { Upload, FileText, Eye, Download, Rocket, Save, Plus, Sun, Moon, CheckCircle2, AlertTriangle, AlertCircle, Copy } from "lucide-react";
import ScoreGauge from "@/components/ScoreGauge";
// Import your REAL API hook
import { useResumeAnalyzer } from '../hooks/useResumeAnalyzer';

// Sample demo texts
const demoResume = `Senior Frontend Engineer with 7+ years building scalable React apps. Led migration to TypeScript, improved performance by 30%. Strong in testing (Jest, React Testing Library), design systems, accessibility (WCAG), and CI/CD. Worked closely with design and product to deliver user‑centric features at speed.`;

const demoJD = `We seek a Senior Frontend Engineer experienced with React, TypeScript, state management (Redux/Zustand), testing, and accessibility. Bonus for Tailwind, design systems, and performance optimization. Collaborate cross-functionally and ship reliably.`;

// Types
type AnalysisResult = {
  match_percentage: number;
  overall_assessment: string;
  ai_full_analysis: string;
  // Add more fields as your backend provides them
  error?: string;
};

const Index = () => {
  const { toast: showToast } = useToast();
  const [resumeFile, setResumeFile] = useState<File | undefined>();
  const [resumeText, setResumeText] = useState<string>("");
  const [resumeStats, setResumeStats] = useState<{ chars: number; words: number; lines: number } | null>(null);
  const [jdText, setJdText] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Use your REAL API hook instead of fake state
  const { analyzeResume, extractText, loading, error, clearError } = useResumeAnalyzer();

  useEffect(() => {
    document.title = "AI Resume Gap Analyzer";
    const root = document.documentElement;
    if (!root.classList.contains("dark")) root.classList.add("dark");
  }, []);

  const bothInputsReady = resumeText.trim().length > 0 && jdText.trim().length > 0;

  // Keyboard shortcut: Cmd/Ctrl+Enter to analyze
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && bothInputsReady && !loading) {
        void handleAnalyze();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bothInputsReady, loading, resumeText, jdText]);

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast({ title: "PDF only", description: "Please upload a .pdf resume.", variant: "destructive" });
      return;
    }
    
    setResumeFile(file);
    clearError();
    
    try {
      // Use REAL API for text extraction
      const textData = await extractText(file);
      setResumeText(textData.text);
      setResumeStats({
        chars: textData.stats.characters,
        words: textData.stats.words,
        lines: textData.stats.lines
      });
      toast({ 
        title: "Resume processed", 
        description: `Extracted ${textData.stats.characters.toLocaleString()} characters` 
      });
    } catch (err) {
      console.error('Failed to extract text preview:', err);
      toast({ 
        title: "Extraction failed", 
        description: "Could not extract text from PDF. Please try another file.", 
        variant: "destructive" 
      });
    }
  };

  const handleAnalyze = async () => {
    if (!bothInputsReady || !resumeFile) return;
    
    clearError();
    toast({ title: `Analyzing with AI…`, description: "Lightning-fast insights, recruiter-ready." });

    try {
      // Use REAL API for analysis
      const analysisResult = await analyzeResume(resumeFile, jdText);
      
      // Transform the result to match your UI expectations
      const transformedResult: AnalysisResult = {
        match_percentage: analysisResult.match_percentage,
        overall_assessment: analysisResult.overall_assessment,
        ai_full_analysis: analysisResult.ai_full_analysis,
        // Add more transformations as needed based on your backend response
      };
      
      setResult(transformedResult);
      toast({ title: "AI analysis complete", description: "We scanned your resume like an ATS would." });
    } catch (err) {
      console.error('Analysis failed:', err);
      toast({ 
        title: "Analysis failed", 
        description: error || "Something went wrong during analysis", 
        variant: "destructive" 
      });
    }
  };

  const scoreColor = (score: number) =>
    score >= 80 ? "text-success" : score >= 65 ? "text-warning" : "text-danger";

  return (
    <div className="min-h-screen bg-[radial-gradient(60%_40%_at_20%_0%,hsl(var(--primary)/0.12),transparent)]">
      <header className="sticky top-0 z-10 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 grid place-items-center rounded-xl glass-panel panel-hover"><span>🚀</span></div>
            <div>
              <h1 className="text-xl font-heading font-semibold">AI Resume Gap Analyzer by Lucille Idokogi</h1>
              <p className="text-sm text-muted-foreground">Upload your resume & JD. Get laser-focused AI insights.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => { 
              setResumeFile(undefined); 
              setResumeText(""); 
              setJdText(""); 
              setResult(null);
              clearError();
            }}>New Analysis</Button>
            <Button variant="soft" size="sm" onClick={() => toast({ title: "Export ready", description: "Use Results > Export Options." })}><Download className="h-4 w-4 mr-2"/>Export</Button>
            <Button variant="outline" size="sm" onClick={() => {
              const el = document.documentElement; el.classList.toggle("dark");
            }}>
              <Sun className="h-4 w-4 mr-2 hidden dark:block"/>
              <Moon className="h-4 w-4 mr-2 dark:hidden"/>Theme
            </Button>
          </div>
        </div>
      </header>

      <main className={`container py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 ${bothInputsReady ? 'pb-24' : ''}`}>
        {/* Left: Resume Uploader */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="font-heading">Upload Resume (PDF)</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void handleFile(f); }}
              className="border-2 border-dashed border-border/60 rounded-2xl p-8 text-center hover-scale"
            >
              <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3"/>
              <p className="mb-2 text-sm text-muted-foreground">Drag & drop your PDF here (max 200MB)</p>
              <div className="flex items-center justify-center gap-3">
                <input id="pdf-input" type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}/>
                <Button variant="hero" onClick={() => document.getElementById("pdf-input")?.click()}>Browse files</Button>
                <Button variant="soft" onClick={() => { 
                  // Create a demo file for testing
                  const blob = new Blob([demoResume], { type: 'application/pdf' }); 
                  const fake = new File([blob], 'demo-resume.pdf', { type: 'application/pdf' }); 
                  void handleFile(fake); 
                }}>Use demo</Button>
              </div>
            </div>

            {resumeText && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <div className="font-medium text-foreground">{resumeFile?.name || "demo-resume.pdf"}</div>
                  <div>{resumeStats?.chars.toLocaleString()} chars · {resumeStats?.words} words · {resumeStats?.lines} lines</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Extracted {resumeText.length.toLocaleString()} characters</Badge>
                  <Button size="sm" variant="outline" onClick={() => setPreviewOpen(true)}><Eye className="h-4 w-4 mr-2"/>Preview Extracted Text</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Job Description */}
        <Card className="glass-panel">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-heading">Job Description</CardTitle>
            <Button variant="soft" size="sm" onClick={() => setJdText(demoJD)}>Paste sample JD</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the job description here…"
                className="min-h-[260px] font-mono resize-y"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{jdText.length.toLocaleString()} characters</span>
                <span className={jdText.length > 4000 ? "text-danger" : jdText.length >= 400 ? "text-success" : "text-warning"}>
                  {jdText.length > 4000 ? "Too long" : jdText.length >= 400 ? "Good length" : "Add more detail"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="lg:col-span-2 space-y-6 animate-enter">
            <Card className="glass-panel">
              <CardContent className="p-6 grid md:grid-cols-[220px_1fr] gap-6 items-center">
                <div className="flex items-center justify-center">
                  <ScoreGauge score={result.match_percentage} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-heading">Match Score: {result.match_percentage}%</h2>
                    <Badge className={scoreColor(result.match_percentage)}>
                      {result.match_percentage >= 80 ? "Strong fit" : result.match_percentage >= 65 ? "Good base — refine" : "Moderate fit — improve"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{result.overall_assessment}</p>
                </div>
              </CardContent>
            </Card>

            {/* Full AI Analysis */}
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>🤖 Detailed AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm">{result.ai_full_analysis}</pre>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="lg:col-span-2">
            <Card className="glass-panel border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5"/>
                  <strong>Error:</strong> {error}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Sticky Analyze Toolbar */}
      {bothInputsReady && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur">
          <div className="container py-3 flex flex-col md:flex-row items-center gap-3">
            <div className="flex-1 text-xs text-muted-foreground">Your API is connected to FastAPI backend on port 8001.</div>
            <Button variant="hero" onClick={handleAnalyze} disabled={loading}>
              {loading ? "Analyzing…" : "Analyze with AI"}
            </Button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extracted Resume Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            {resumeStats && (
              <div className="flex gap-4 text-muted-foreground">
                <div>{resumeStats.words} words</div>
                <div>{resumeStats.lines} lines</div>
                <div>{resumeStats.chars.toLocaleString()} characters</div>
              </div>
            )}
            <pre className="whitespace-pre-wrap max-h-[60vh] overflow-auto">{resumeText.slice(0, 1000)}{resumeText.length > 1000 ? "…" : ""}</pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;