"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, X, Sparkles, Loader2, ArrowRight, Star } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Substitution {
  original: string;
  substitute: string;
  reason: string;
}

interface Analysis {
  analysis: { style: string; colors: string[]; occasion: string; vibe: string };
  matchedItemIds: string[];
  substitutions: Substitution[];
  missingItems: string[];
  matchScore: number;
  stylingTips: string;
}

interface Inspiration {
  id: string;
  imageUrl: string;
  source: string;
  analysis: Analysis | null;
  createdAt: Date;
}

export function InspirationPage({ initialInspirations }: { initialInspirations: Inspiration[] }) {
  const [inspirations, setInspirations] = useState(initialInspirations);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) processFile(f);
  }, []);

  function processFile(f: File) {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
    setCurrentAnalysis(null);
    setUploadedUrl(null);
  }

  async function uploadAndAnalyze() {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const upRes = await fetch("/api/upload/inspiration", { method: "POST", body: fd });
      if (!upRes.ok) throw new Error("Upload failed");
      const { url } = await upRes.json();
      setUploadedUrl(url);
      setAnalyzing(true);

      const analyzeRes = await fetch("/api/inspiration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url, source: "upload" }),
      });
      if (!analyzeRes.ok) throw new Error("Analysis failed");
      const { inspiration, analysis } = await analyzeRes.json();

      setCurrentAnalysis(analysis);
      setInspirations((prev) => [{ ...inspiration, analysis }, ...prev]);
      toast.success("Look analyzed! See your recreation below ✨");
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  }

  function reset() {
    setPreview(null);
    setFile(null);
    setCurrentAnalysis(null);
    setUploadedUrl(null);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold">Style Inspiration</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a look you love — AI recreates it with your own wardrobe.
        </p>
      </div>

      {/* Upload zone */}
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("inspirationInput")?.click()}
          className="border-2 border-dashed border-primary/25 rounded-3xl p-14 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-all"
        >
          <input
            id="inspirationInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
          />
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Camera className="w-7 h-7 text-primary" />
          </div>
          <p className="font-heading text-xl font-semibold mb-1">Drop your inspiration here</p>
          <p className="text-sm text-muted-foreground mb-3">
            Pinterest screenshot, Instagram outfit, magazine photo — anything
          </p>
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="w-3.5 h-3.5" /> Choose photo
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Preview */}
            <div className="relative w-full sm:w-56 h-72 rounded-2xl overflow-hidden border border-border shrink-0">
              <Image src={preview} alt="Inspiration" fill className="object-cover" />
              <button
                onClick={reset}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Analysis panel */}
            <div className="flex-1">
              {!currentAnalysis && !uploading && !analyzing && (
                <Card className="p-6 border-dashed border-primary/20 h-full flex flex-col items-center justify-center text-center">
                  <Sparkles className="w-8 h-8 text-primary/40 mb-3" />
                  <p className="font-medium mb-1">Ready to recreate this look</p>
                  <p className="text-sm text-muted-foreground mb-4">AI will match it to your wardrobe</p>
                  <Button onClick={uploadAndAnalyze} className="shadow-rose gap-2">
                    <Sparkles className="w-4 h-4" /> Recreate with my wardrobe
                  </Button>
                </Card>
              )}

              {(uploading || analyzing) && (
                <Card className="p-6 h-full flex flex-col items-center justify-center border-primary/20">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                  <p className="font-medium">{uploading ? "Uploading..." : "Analyzing your look..."}</p>
                  <p className="text-xs text-muted-foreground mt-1">Matching to your wardrobe ✨</p>
                </Card>
              )}

              {currentAnalysis && (
                <Card className="p-5 border border-primary/20 bg-secondary/20 h-full overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-heading text-lg font-semibold">Your Recreation</p>
                    <Badge className="gap-1 bg-primary/10 text-primary border border-primary/20">
                      <Star className="w-3 h-3 fill-primary" />
                      {Math.round((currentAnalysis.matchScore ?? 0) * 100)}% match
                    </Badge>
                  </div>

                  {currentAnalysis.analysis && (
                    <div className="space-y-1.5 mb-4">
                      <p className="text-sm font-medium">{currentAnalysis.analysis.vibe}</p>
                      <p className="text-xs text-muted-foreground">{currentAnalysis.analysis.style}</p>
                      <div className="flex gap-1.5 flex-wrap mt-2">
                        {currentAnalysis.analysis.colors?.map((c: string) => (
                          <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentAnalysis.substitutions?.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Substitutions</p>
                      {currentAnalysis.substitutions.map((sub: Substitution, i: number) => (
                        <div key={i} className="text-xs">
                          <span className="line-through text-muted-foreground/60">{sub.original}</span>
                          <ArrowRight className="inline w-3 h-3 mx-1 text-primary" />
                          <span className="font-medium">{sub.substitute}</span>
                          <p className="text-muted-foreground ml-4 mt-0.5">{sub.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentAnalysis.stylingTips && (
                    <div className="bg-white/60 rounded-xl p-3">
                      <p className="text-xs font-medium mb-1">Styling tip ✨</p>
                      <p className="text-xs text-muted-foreground">{currentAnalysis.stylingTips}</p>
                    </div>
                  )}

                  {currentAnalysis.missingItems?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">To fully recreate this look:</p>
                      {currentAnalysis.missingItems.map((item: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-[10px] mr-1 mb-1">{item}</Badge>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Past inspirations */}
      {inspirations.length > 0 && (
        <div>
          <h2 className="font-heading text-2xl font-semibold mb-4">Past inspirations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {inspirations.map((ins) => (
              <Card
                key={ins.id}
                className="overflow-hidden border border-border hover:shadow-soft transition-all cursor-pointer group"
                onClick={() => {
                  setPreview(ins.imageUrl);
                  setCurrentAnalysis(ins.analysis);
                  setUploadedUrl(ins.imageUrl);
                }}
              >
                <div className="aspect-[3/4] relative">
                  <Image src={ins.imageUrl} alt="Inspiration" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  {ins.analysis?.matchScore && (
                    <div className="absolute bottom-2 right-2 bg-white/90 rounded-full px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {Math.round(ins.analysis.matchScore * 100)}% match
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
