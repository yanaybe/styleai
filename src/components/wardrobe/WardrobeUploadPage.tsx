"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  X,
  Sparkles,
  CheckCircle,
  Loader2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { WARDROBE_CATEGORIES } from "@/types";
import type { WardrobeCategory } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

interface AIAnalysis {
  name: string;
  category: WardrobeCategory;
  colorPrimary: string;
  colorSecondary: string | null;
  pattern: string | null;
  material: string | null;
  brand: string | null;
  formalityLevel: string;
  season: string[];
  styleTags: string[];
  confidence: number;
}

const FORMALITY_LEVELS = ["casual", "smart_casual", "business", "formal"];
const SEASONS = ["spring", "summer", "fall", "winter", "all"];

export function WardrobeUploadPage() {
  const router = useRouter();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "" as WardrobeCategory | "",
    colorPrimary: "",
    brand: "",
    formalityLevel: "casual",
    season: ["all"] as string[],
    styleTags: [] as string[],
    notes: "",
  });

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) processFile(file);
  }, []);

  function processFile(file: File) {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function uploadAndAnalyze() {
    if (!imageFile || !imagePreview) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const uploadRes = await fetch("/api/upload/wardrobe", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url, thumbnailUrl } = await uploadRes.json();
      setUploadedImageUrl(url);

      setAnalyzing(true);
      const analyzeRes = await fetch("/api/wardrobe/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      });

      if (!analyzeRes.ok) throw new Error("Analysis failed");
      const aiData: AIAnalysis = await analyzeRes.json();
      setAnalysis(aiData);

      setForm({
        name: aiData.name || "",
        category: aiData.category || "",
        colorPrimary: aiData.colorPrimary || "",
        brand: aiData.brand || "",
        formalityLevel: aiData.formalityLevel || "casual",
        season: aiData.season?.length ? aiData.season : ["all"],
        styleTags: aiData.styleTags || [],
        notes: "",
      });

      toast.success("AI analysis complete! Review and save.");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  }

  async function saveItem() {
    if (!uploadedImageUrl || !form.name || !form.category) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/wardrobe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          imageUrl: uploadedImageUrl,
          aiAnalysis: analysis,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      toast.success("Added to your closet!");
      router.push("/wardrobe");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function toggleSeason(s: string) {
    setForm((prev) => ({
      ...prev,
      season: prev.season.includes(s) ? prev.season.filter((x) => x !== s) : [...prev.season, s],
    }));
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/wardrobe">
          <Button variant="ghost" size="icon" className="w-9 h-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-3xl font-semibold">Add to Closet</h1>
          <p className="text-sm text-muted-foreground">Upload a photo — AI will tag everything automatically</p>
        </div>
      </div>

      {/* Upload zone */}
      {!imagePreview ? (
        <div
          onDrop={handleFileDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-primary/25 rounded-3xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-all"
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
          />
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7 text-primary" />
          </div>
          <p className="font-heading text-xl font-semibold mb-1">Drop your photo here</p>
          <p className="text-sm text-muted-foreground">or click to browse — JPG, PNG up to 10MB</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Image preview + AI panel */}
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="relative w-full sm:w-56 h-56 rounded-2xl overflow-hidden border border-border shrink-0">
              <Image src={imagePreview} alt="Preview" fill className="object-cover" />
              <button
                onClick={() => { setImagePreview(null); setImageFile(null); setAnalysis(null); setUploadedImageUrl(null); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1">
              {!analysis && !uploading && !analyzing && (
                <Card className="p-6 border-dashed border-primary/20 text-center h-full flex flex-col items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary/40 mb-3" />
                  <p className="font-medium text-sm mb-1">Ready to analyze</p>
                  <p className="text-xs text-muted-foreground mb-4">AI will auto-detect category, color, style, and more</p>
                  <Button onClick={uploadAndAnalyze} className="shadow-rose gap-2">
                    <Sparkles className="w-4 h-4" />
                    Analyze with AI
                  </Button>
                </Card>
              )}

              {(uploading || analyzing) && (
                <Card className="p-6 h-full flex flex-col items-center justify-center border-primary/20">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                  <p className="font-medium text-sm">{uploading ? "Uploading..." : "AI is analyzing your item..."}</p>
                  <p className="text-xs text-muted-foreground mt-1">This takes just a moment</p>
                </Card>
              )}

              {analysis && !uploading && !analyzing && (
                <Card className="p-4 border border-primary/20 bg-secondary/30 h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium">AI Analysis Complete</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {Math.round(analysis.confidence * 100)}% confident
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {analysis.colorPrimary && <p>🎨 Color: <span className="text-foreground">{analysis.colorPrimary}</span></p>}
                    {analysis.pattern && <p>✦ Pattern: <span className="text-foreground">{analysis.pattern}</span></p>}
                    {analysis.material && <p>🧵 Material: <span className="text-foreground">{analysis.material}</span></p>}
                    {analysis.styleTags?.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {analysis.styleTags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={uploadAndAnalyze}
                    className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Re-analyze
                  </button>
                </Card>
              )}
            </div>
          </div>

          {/* Form — always shown after image upload */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Item name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. White linen blazer"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  placeholder="e.g. Zara, H&M"
                  value={form.brand}
                  onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((p) => ({ ...p, category: v as WardrobeCategory }))}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {WARDROBE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.emoji} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Formality</Label>
                <Select
                  value={form.formalityLevel}
                  onValueChange={(v) => setForm((p) => ({ ...p, formalityLevel: v ?? "" }))}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMALITY_LEVELS.map((f) => (
                      <SelectItem key={f} value={f}>{f.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Season</Label>
              <div className="flex gap-2 flex-wrap">
                {SEASONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSeason(s)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm border transition-all capitalize",
                      form.season.includes(s)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="e.g. Great for summer evenings, slightly oversized..."
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="resize-none h-20"
              />
            </div>

            <Button
              onClick={saveItem}
              className="w-full h-11 shadow-rose"
              disabled={saving || !uploadedImageUrl}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save to my closet"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
