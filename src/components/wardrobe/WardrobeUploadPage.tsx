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
  Upload, X, Sparkles, CheckCircle, Loader2, ArrowLeft, RefreshCw, Library, Shirt,
} from "lucide-react";
import { WARDROBE_CATEGORIES } from "@/types";
import type { WardrobeCategory } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { CLOTHING_LIBRARY } from "@/lib/clothing-library";

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
  const [tab, setTab] = useState<"upload" | "library">("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [selectedLibraryItems, setSelectedLibraryItems] = useState<Set<string>>(new Set());
  const [addingLibrary, setAddingLibrary] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "" as WardrobeCategory | "",
    colorPrimary: "",
    brand: "",
    formalityLevel: "casual",
    season: ["all"],
    styleTags: "",
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) processImage(f);
  }, []);

  function processImage(f: File) {
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(f);
    setAnalysis(null);
  }

  async function uploadImage() {
    if (!imageFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", imageFile);
      const res = await fetch("/api/upload/wardrobe", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setUploadedImageUrl(url);
      toast.success("Photo uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function analyzeImage() {
    if (!uploadedImageUrl) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/wardrobe/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadedImageUrl }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAnalysis(data);
      setForm((p) => ({
        ...p,
        name: data.name,
        category: data.category,
        colorPrimary: data.colorPrimary,
        brand: data.brand ?? "",
        formalityLevel: data.formalityLevel,
        season: data.season,
        styleTags: data.styleTags?.join(", ") ?? "",
      }));
    } catch {
      toast.error("Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  async function saveItem() {
    if (!analysis || !uploadedImageUrl) return;
    setSaving(true);
    try {
      const res = await fetch("/api/wardrobe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: uploadedImageUrl,
          ...form,
          styleTags: form.styleTags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Item saved to closet! ✨");
      router.push("/wardrobe");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function addLibraryItems() {
    if (selectedLibraryItems.size === 0) {
      toast.error("Select at least one item");
      return;
    }
    setAddingLibrary(true);
    try {
      const items = Array.from(selectedLibraryItems)
        .map((id) => CLOTHING_LIBRARY.find((i) => i.id === id))
        .filter(Boolean);

      const res = await fetch("/api/wardrobe/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Added ${selectedLibraryItems.size} items to your closet! ✨`);
      router.push("/wardrobe");
    } catch {
      toast.error("Failed to add items");
    } finally {
      setAddingLibrary(false);
    }
  }

  const selectedCount = selectedLibraryItems.size;
  const groupedLibrary = CLOTHING_LIBRARY.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof CLOTHING_LIBRARY>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Add to Closet</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload photos or pick from the library.</p>
        </div>
        <Link href="/wardrobe">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to closet
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl w-fit">
        <button
          onClick={() => setTab("upload")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            tab === "upload" ? "bg-white shadow-sm" : "text-muted-foreground"
          )}
        >
          <Upload className="w-4 h-4" /> Upload photo
        </button>
        <button
          onClick={() => setTab("library")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            tab === "library" ? "bg-white shadow-sm" : "text-muted-foreground"
          )}
        >
          <Library className="w-4 h-4" /> Library ({CLOTHING_LIBRARY.length})
        </button>
      </div>

      {/* UPLOAD TAB */}
      {tab === "upload" && (
        <div className="space-y-4">
          {!imagePreview ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById("fileInput")?.click()}
              className="border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer hover:border-primary/40 hover:bg-secondary/20 transition-all"
            >
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && processImage(e.target.files[0])}
              />
              <Upload className="w-12 h-12 text-primary/30 mx-auto mb-4" />
              <p className="font-heading text-lg font-semibold mb-1">Add a clothing photo</p>
              <p className="text-sm text-muted-foreground mb-4">Drag & drop or click to browse</p>
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" /> Choose photo
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border-2 border-primary/20">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={400}
                  height={400}
                  className="w-full object-cover"
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                    setAnalysis(null);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!uploadedImageUrl && (
                <Button onClick={uploadImage} disabled={uploading} className="w-full gap-2 shadow-rose">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload photo
                </Button>
              )}

              {uploadedImageUrl && !analysis && (
                <Button onClick={analyzeImage} disabled={analyzing} className="w-full gap-2 shadow-rose">
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Analyze with AI
                </Button>
              )}

              {analysis && (
                <div className="space-y-3 p-4 bg-secondary/40 rounded-2xl border border-border">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        className="h-9 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Category</Label>
                      <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v as WardrobeCategory }))}>
                        <SelectTrigger className="h-9 text-sm mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WARDROBE_CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Color</Label>
                      <Input
                        value={form.colorPrimary}
                        onChange={(e) => setForm((p) => ({ ...p, colorPrimary: e.target.value }))}
                        className="h-9 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Brand</Label>
                      <Input
                        value={form.brand}
                        onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
                        className="h-9 text-sm mt-1"
                      />
                    </div>
                  </div>
                  <Button onClick={saveItem} disabled={saving} className="w-full gap-2 shadow-rose">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Save to closet
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* LIBRARY TAB */}
      {tab === "library" && (
        <div className="space-y-4">
          <div className="space-y-3">
            {Object.entries(groupedLibrary).map(([category, items]) => (
              <div key={category}>
                <h3 className="font-heading text-sm font-semibold mb-2 flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-primary" />
                  {category}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {items.map((item) => {
                    const isSelected = selectedLibraryItems.has(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          const newSelected = new Set(selectedLibraryItems);
                          if (isSelected) newSelected.delete(item.id);
                          else newSelected.add(item.id);
                          setSelectedLibraryItems(newSelected);
                        }}
                        className={cn(
                          "rounded-2xl overflow-hidden border-2 transition-all relative",
                          isSelected ? "border-primary shadow-rose" : "border-border hover:border-primary/40"
                        )}
                      >
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={150}
                          height={150}
                          className="w-full aspect-square object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2">
                          <p className="text-xs font-medium truncate">{item.name}</p>
                          <p className="text-[10px] opacity-75">{item.color}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {selectedCount > 0 && (
            <div className="sticky bottom-0 bg-white border-t border-border p-4 rounded-t-2xl shadow-lg flex items-center justify-between">
              <p className="font-medium">{selectedCount} item{selectedCount !== 1 ? "s" : ""} selected</p>
              <Button onClick={addLibraryItems} disabled={addingLibrary} className="gap-2 shadow-rose">
                {addingLibrary ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Add to closet
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
