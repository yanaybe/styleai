import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  MessageCircle,
  Shirt,
  Calendar,
  Heart,
  TrendingUp,
  Camera,
  ArrowRight,
  Star,
} from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "WhatsApp Stylist",
    description:
      "Get your daily outfit recommendation right in WhatsApp. Chat naturally — 'make it more casual' or 'change the shoes' — and watch your AI stylist respond instantly.",
  },
  {
    icon: Shirt,
    title: "Digital Closet",
    description:
      "Upload your wardrobe once. Our AI auto-tags every piece — color, style, formality, season — so you never have to think about what goes with what.",
  },
  {
    icon: Calendar,
    title: "14-Day Outfit Calendar",
    description:
      "Plan two weeks ahead. Never open your closet wondering what to wear again. Lock, swap, or regenerate any outfit in seconds.",
  },
  {
    icon: Camera,
    title: "Pinterest Recreation",
    description:
      "Screenshot an outfit you love. StyleAI finds the closest match in your own wardrobe and shows you exactly how to recreate the look.",
  },
  {
    icon: TrendingUp,
    title: "Wardrobe Analytics",
    description:
      "See your most-worn pieces, forgotten items, cost per wear, and outfit diversity score. Make smarter choices next time you shop.",
  },
  {
    icon: Heart,
    title: "Couples Mode",
    description:
      "Connect with your partner and coordinate outfits for date nights, events, and vacations. Look effortlessly matched.",
  },
];

const steps = [
  { number: "01", title: "Upload your wardrobe", description: "Add your clothes — our AI tags everything automatically." },
  { number: "02", title: "Tell us your style", description: "A quick 2-minute style quiz personalizes everything." },
  { number: "03", title: "Connect WhatsApp", description: "Your AI stylist lives in your phone, no app needed." },
  { number: "04", title: "Wake up styled", description: "Every morning, a perfect outfit. Just say yes." },
];

const testimonials = [
  { name: "Sophia R.", text: "I used to spend 20 minutes staring at my closet every morning. Now my AI stylist does it for me while I sleep. Obsessed.", role: "Marketing Manager" },
  { name: "Mia K.", text: "The Pinterest recreation feature is INSANE. I uploaded 3 looks and it recreated all of them with stuff I already owned.", role: "Graphic Designer" },
  { name: "Zara L.", text: "My boyfriend and I use the couples mode for date nights. We always look so put-together now.", role: "Architect" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-heading text-xl font-semibold tracking-tight">StyleAI</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Stories</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden md:flex">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="shadow-rose">Get started free</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-hero pt-32 pb-24 px-4 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-accent/15 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <Badge
            variant="secondary"
            className="mb-6 px-4 py-1.5 text-sm font-medium border border-primary/20 bg-secondary text-primary"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Your AI Personal Stylist
          </Badge>

          <h1 className="font-heading text-6xl sm:text-7xl lg:text-8xl font-semibold leading-[1.05] tracking-tight mb-6">
            Wake up to{" "}
            <span className="text-gradient italic">your perfect</span>
            <br />
            outfit, every day.
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            StyleAI is the AI stylist that lives in your WhatsApp. It knows your wardrobe, the
            weather, and your plans — and sends you three outfit options every morning.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="shadow-rose h-12 px-8 text-base gap-2 w-full sm:w-auto">
                Start styling for free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base w-full sm:w-auto border-border hover:bg-secondary">
                See how it works
              </Button>
            </Link>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            No credit card required · Works on any phone · Set up in 5 minutes
          </p>
        </div>

        {/* WhatsApp preview card */}
        <div className="max-w-sm mx-auto mt-20">
          <div className="bg-white rounded-3xl shadow-soft border border-border p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">StyleAI</p>
                <p className="text-xs text-muted-foreground">Your personal stylist</p>
              </div>
            </div>
            <div className="bg-secondary/60 rounded-2xl rounded-tl-sm p-3 text-sm leading-relaxed">
              Good morning, Sophia ✨<br /><br />
              Today is 24°C and sunny — perfect for your client meeting.<br /><br />
              I picked 3 outfits for you. Ready to see them?
            </div>
            <div className="flex gap-2 flex-wrap">
              {["See outfits ✨", "Change plans", "Skip today"].map((reply) => (
                <span key={reply} className="px-3 py-1 rounded-full border border-primary/30 text-xs text-primary bg-primary/5 font-medium cursor-pointer hover:bg-primary/10 transition-colors">
                  {reply}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 border border-primary/20 bg-secondary text-primary">
              Everything you need
            </Badge>
            <h2 className="font-heading text-4xl sm:text-5xl font-semibold mb-4">
              Styling, simplified.
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              From your morning WhatsApp message to a fully planned wardrobe — StyleAI handles the fashion thinking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-border bg-card hover:shadow-soft transition-all duration-200 hover:-translate-y-0.5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-28 px-4 gradient-rose">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 border border-primary/20 bg-white/70 text-primary">
              Simple as it gets
            </Badge>
            <h2 className="font-heading text-4xl sm:text-5xl font-semibold mb-4">
              Up and running in 5 minutes.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-primary/20 z-0" />
                )}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-soft relative z-10">
                  <span className="font-heading text-4xl font-semibold text-primary/30">{step.number}</span>
                  <h3 className="font-heading text-lg font-semibold mt-2 mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-28 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 border border-primary/20 bg-secondary text-primary">
              Real stories
            </Badge>
            <h2 className="font-heading text-4xl sm:text-5xl font-semibold mb-4">
              They never open their closet wondering.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl border border-border bg-card hover:shadow-soft transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4 text-foreground/80">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-4 gradient-hero border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-4xl sm:text-5xl font-semibold mb-4">
            Your closet is full.{" "}
            <span className="text-gradient italic">Let&apos;s prove it.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start for free. Add your wardrobe. Wake up tomorrow to your first AI-styled outfit.
          </p>
          <Link href="/signup">
            <Button size="lg" className="shadow-rose h-12 px-10 text-base gap-2">
              Get started — it&apos;s free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">No credit card. No app to download. Just WhatsApp.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-border bg-card">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-heading font-semibold">StyleAI</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 StyleAI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
