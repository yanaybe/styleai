"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User, Upload, X, Sparkles, CheckCircle,
  Loader2, Trash2, Camera, Info,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatar {
  id: string;
  imageUrl: string;
  imageType: string;
  isPrimary: boolean;
  uploadedAt: Date;
}

interface AvatarPageProps {
  initialAvatars: UserAvatar[];
}

const TIPS = [
  "Stand straight, facing forward, full body visible (head to toe)",
  "Wear fitted clothes or activewear — the AI replaces them digitally",
  "Good lighting is everything — natural daylight or a bright room",
  "Neutral or plain background makes results look more beautiful",
  "The better your photo, the more stunning the try-on results ✨",
];

export function AvatarPage({ initialAvatars }: AvatarPageProps) {
  const [avatars, setAvatars] = useState(initialAvatars);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const primaryAvatar = avatars.find((a) => a.isPrimary && a.imageType === "full_body")
    ?? avatars.find((a) => a.imageType === "full_body")
    ?? avatars[0];

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
  }

  async function upload() {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("imageType", "full_body");

      const res = await fetch("/api/avatar", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const avatar = await res.json();

      setAvatars((prev) => [
        avatar,
        ...prev.map((a) => ({ ...a, isPrimary: false })),
      ]);
      setPreview(null);
      setFile(null);
      toast.success("Photo saved! Your try-ons will use this. ✨");
    } catch {
      toast.error("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  async function deleteAvatar(id: string) {
    try {
      const res = await fetch("/api/avatar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      setAvatars((prev) => prev.filter((a) => a.id !== id));
      toast.success("Photo removed");
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold">My Photos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a full-body photo so the AI can dress outfit suggestions on you.
        </p>
      </div>

      {/* Tips */}
      <Card className="p-4 border border-primary/20 bg-secondary/30 shadow-none">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-primary" />
          <p className="text-sm font-medium">For best try-on results:</p>
        </div>
        <ul className="space-y-1">
          {TIPS.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="text-primary mt-0.5 shrink-0">✦</span> {tip}
            </li>
          ))}
        </ul>
      </Card>

      {/* Current primary photo */}
      {primaryAvatar && !preview && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Active photo
            </p>
            <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200">
              Used for try-ons
            </Badge>
          </div>
          <div className="relative w-48 rounded-3xl overflow-hidden border-2 border-primary/20 shadow-soft">
            <Image
              src={primaryAvatar.imageUrl}
              alt="Your photo"
              width={192}
              height={320}
              className="object-cover w-full"
              style={{ aspectRatio: "3/5" }}
            />
            <button
              onClick={() => deleteAvatar(primaryAvatar.id)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </button>
          </div>
        </div>
      )}

      {/* Upload zone */}
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("avatarInput")?.click()}
          className={cn(
            "border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all",
            primaryAvatar
              ? "border-border hover:border-primary/40 hover:bg-secondary/20"
              : "border-primary/25 hover:border-primary/50 hover:bg-secondary/30"
          )}
        >
          <input
            id="avatarInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
          />
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {primaryAvatar ? <Camera className="w-6 h-6 text-primary" /> : <User className="w-6 h-6 text-primary" />}
          </div>
          <p className="font-heading text-xl font-semibold mb-1">
            {primaryAvatar ? "Update your photo" : "Upload your photo"}
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            Full body, standing, good lighting
          </p>
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="w-3.5 h-3.5" />
            Choose photo
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            {/* Preview */}
            <div className="relative w-44 rounded-3xl overflow-hidden border-2 border-primary/20 shadow-soft shrink-0">
              <Image
                src={preview}
                alt="Preview"
                width={176}
                height={293}
                className="object-cover w-full"
                style={{ aspectRatio: "3/5" }}
              />
              <button
                onClick={() => { setPreview(null); setFile(null); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 pt-2">
              <p className="font-medium mb-1">Looks good?</p>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                This photo will be used when generating outfit try-ons. You can always change it later.
              </p>
              <Button
                onClick={upload}
                disabled={uploading}
                className="gap-2 shadow-rose w-full"
              >
                {uploading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  : <><Sparkles className="w-4 h-4" /> Use this photo</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* All photos */}
      {avatars.length > 1 && (
        <div>
          <p className="text-sm font-medium mb-3">All photos</p>
          <div className="grid grid-cols-3 gap-3">
            {avatars.map((avatar) => (
              <div key={avatar.id} className={cn(
                "relative rounded-2xl overflow-hidden border-2",
                avatar.isPrimary ? "border-primary/40" : "border-border"
              )}>
                <Image
                  src={avatar.imageUrl}
                  alt="Avatar"
                  width={120}
                  height={180}
                  className="object-cover w-full"
                  style={{ aspectRatio: "2/3" }}
                />
                {avatar.isPrimary && (
                  <div className="absolute bottom-1.5 left-1.5">
                    <Badge className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5">Active</Badge>
                  </div>
                )}
                <button
                  onClick={() => deleteAvatar(avatar.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 shadow flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
