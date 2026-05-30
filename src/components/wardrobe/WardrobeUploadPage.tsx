"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload, X, Sparkles, CheckCircle, Loader2, ArrowLeft, AlertCircle,
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

interface FileItem {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "analyzing" | "ready" | "error";
  imageUrl?: string;
  analysis?: AIAnalysis;
  form: {
    name: string;
    category: WardrobeCategory | "";
    colorPrimary: string;
    brand: string;
    formalityLevel: string;
    season: string[];
    styleTags: string;
  };
  errorMsg?: string;
}

export function WardrobeUploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);

  const addFiles = useCallback((newFiles: File[]) => {
    const imageFiles = newFiles.filter((f) => f.type.startsWith("image/"));
    const items: FileItem[] = imageFiles.map((f) => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      preview: URL.createObjectURL(f),
      status: "pending",
      form: { name: "", category: "", colorPrimary: "", brand: "", formalityLevel: "casual", season: ["all"], styleTags: "" },
    }));
    setFiles((prev) => [...prev, ...items]);
  }, []);

  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 1600;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => resolve(blob ? new File([blob], file.name, { type: "image/jpeg" }) : file),
          "image/jpeg",
          0.82
        );
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function updateForm(id: string, patch: Partial<FileItem["form"]>) {
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, form: { ...f.form, ...patch } } : f));
  }

  async function processAll() {
    const pending = files.filter((f) => f.status === "pending");
    if (pending.length === 0) return;
    setProcessing(true);

    await Promise.all(
      pending.map(async (item) => {
        try {
          // Upload
          setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: "uploading" } : f));
          const compressed = await compressImage(item.file);
          const fd = new FormData();
          fd.append("file", compressed);
          const upRes = await fetch("/api/upload/wardrobe", { method: "POST", body: fd });
          if (!upRes.ok) {
            const body = await upRes.json().catch(() => ({}));
            throw new Error(`Upload failed (${upRes.status}): ${body?.error ?? "unknown"}`);
          }
          const { url: imageUrl } = await upRes.json();

          // Analyze
          setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: "analyzing", imageUrl } : f));
          const anRes = await fetch("/api/wardrobe/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl }),
          });
          if (!anRes.ok) {
            const body = await anRes.json().catch(() => ({}));
            throw new Error(`Analysis failed (${anRes.status}): ${body?.error ?? "unknown"}`);
          }
          const analysis: AIAnalysis = await anRes.json();

          setFiles((prev) => prev.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  status: "ready",
                  imageUrl,
                  analysis,
                  form: {
                    name: analysis.name,
                    category: analysis.category,
                    colorPrimary: analysis.colorPrimary,
                    brand: analysis.brand ?? "",
                    formalityLevel: analysis.formalityLevel,
                    season: analysis.season,
                    styleTags: analysis.styleTags?.join(", ") ?? "",
                  },
                }
              : f
          ));
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Failed";
          setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: "error", errorMsg: msg } : f));
        }
      })
    );

    setProcessing(false);
  }

  async function saveAll() {
    const ready = files.filter((f) => f.status === "ready" && f.imageUrl);
    if (ready.length === 0) return;
    setSaving(true);

    let saved = 0;
    await Promise.all(
      ready.map(async (item) => {
        try {
          const res = await fetch("/api/wardrobe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageUrl: item.imageUrl,
              ...item.form,
              styleTags: item.form.styleTags.split(",").map((t) => t.trim()).filter(Boolean),
            }),
          });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(`${res.status}: ${JSON.stringify(body?.error ?? body)}`);
          }
          saved++;
        } catch (err) {
          toast.error(`Failed to save: ${err instanceof Error ? err.message : "unknown"}`);
        }
      })
    );

    setSaving(false);
    if (saved > 0) {
      toast.success(`${saved} item${saved !== 1 ? "s" : ""} added to closet ✨`);
      router.push("/wardrobe");
    }
  }

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const readyCount = files.filter((f) => f.status === "ready").length;
  const busyCount = files.filter((f) => f.status === "uploading" || f.status === "analyzing").length;

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Add to Closet</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload multiple photos at once — AI analyzes each one.</p>
        </div>
        <Link href="/wardrobe">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to closet
          </Button>
        </Link>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById("fileInput")?.click()}
        className="border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer hover:border-primary/40 hover:bg-secondary/20 transition-all"
      >
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
        />
        <Upload className="w-10 h-10 text-primary/30 mx-auto mb-3" />
        <p className="font-heading text-lg font-semibold mb-1">Drop photos here</p>
        <p className="text-sm text-muted-foreground mb-4">Select as many as you want — drag & drop or click to browse</p>
        <Button variant="outline" className="gap-2" onClick={(e) => { e.stopPropagation(); document.getElementById("fileInput")?.click(); }}>
          <Upload className="w-4 h-4" /> Choose photos
        </Button>
      </div>

      {/* Items */}
      {files.length > 0 && (
        <div className="space-y-4">
          {files.map((item) => (
            <div key={item.id} className="border border-border rounded-2xl overflow-hidden bg-card">
              <div className="flex gap-4 p-4">
                {/* Thumbnail */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-secondary/40">
                  <Image src={item.preview} alt="preview" fill className="object-cover" />
                  {item.status === "uploading" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                  {item.status === "analyzing" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white animate-pulse" />
                    </div>
                  )}
                  {item.status === "ready" && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Status / form */}
                <div className="flex-1 min-w-0">
                  {item.status === "pending" && (
                    <div className="flex items-center justify-between h-full">
                      <p className="text-sm text-muted-foreground truncate">{item.file.name}</p>
                      <button onClick={() => removeFile(item.id)} className="ml-2 text-muted-foreground hover:text-destructive">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {item.status === "uploading" && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…
                    </p>
                  )}

                  {item.status === "analyzing" && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Analyzing with AI…
                    </p>
                  )}

                  {item.status === "error" && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5" /> {item.errorMsg}
                      </p>
                      <button onClick={() => removeFile(item.id)} className="ml-2 text-muted-foreground hover:text-destructive">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {item.status === "ready" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Name</Label>
                        <Input value={item.form.name} onChange={(e) => updateForm(item.id, { name: e.target.value })} className="h-8 text-sm mt-0.5" />
                      </div>
                      <div>
                        <Label className="text-xs">Category</Label>
                        <Select value={item.form.category} onValueChange={(v) => updateForm(item.id, { category: v as WardrobeCategory })}>
                          <SelectTrigger className="h-8 text-sm mt-0.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {WARDROBE_CATEGORIES.map((c) => (
                              <SelectItem key={c.value} value={c.value}>{c.emoji} {c.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Color</Label>
                        <Input value={item.form.colorPrimary} onChange={(e) => updateForm(item.id, { colorPrimary: e.target.value })} className="h-8 text-sm mt-0.5" />
                      </div>
                      <div>
                        <Label className="text-xs">Brand</Label>
                        <Input value={item.form.brand} onChange={(e) => updateForm(item.id, { brand: e.target.value })} className="h-8 text-sm mt-0.5" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Action bar */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              {files.length} photo{files.length !== 1 ? "s" : ""}
              {readyCount > 0 && ` · ${readyCount} ready`}
              {busyCount > 0 && ` · ${busyCount} processing`}
            </p>
            <div className="flex gap-2">
              {pendingCount > 0 && (
                <Button onClick={processAll} disabled={processing} className="gap-2 shadow-rose">
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Analyze {pendingCount} photo{pendingCount !== 1 ? "s" : ""}
                </Button>
              )}
              {readyCount > 0 && pendingCount === 0 && busyCount === 0 && (
                <Button onClick={saveAll} disabled={saving} className="gap-2 shadow-rose">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Save {readyCount} item{readyCount !== 1 ? "s" : ""} to closet
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
