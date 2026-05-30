import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Heart } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-secondary/50 blur-3xl" />
      </div>

      <div className="relative text-center max-w-lg mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-heading text-xl font-semibold tracking-tight">StyleAI</span>
        </div>

        {/* Main heading */}
        <h1 className="font-heading text-6xl sm:text-7xl font-semibold leading-[1.05] tracking-tight mb-5">
          Good morning,{" "}
          <span className="text-gradient italic">Talia.</span>
        </h1>

        <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-sm mx-auto">
          Your personal AI stylist is ready. Let&apos;s figure out what you&apos;re wearing today.
        </p>

        <Link href="/login">
          <Button size="lg" className="shadow-rose h-12 px-10 text-base gap-2">
            Enter
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>

        <p className="mt-10 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          Made with <Heart className="w-3 h-3 fill-primary text-primary" /> just for you
        </p>
      </div>
    </div>
  );
}
