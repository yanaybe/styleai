"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Sparkles, Loader2, Check, X, Link } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserPartner {
  name: string | null;
  avatarUrl: string | null;
  userId: string;
}

interface Connection {
  id: string;
  status: string;
  userIdOne: string;
  userIdTwo: string;
  userOne: UserPartner;
  userTwo: UserPartner;
  connectedAt?: Date | null;
}

interface CouplesPageProps {
  connection: Connection | null;
  currentUserId: string;
  currentUserName: string;
}

export function CouplesPage({ connection, currentUserId, currentUserName }: CouplesPageProps) {
  const [partnerEmail, setPartnerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [localConnection, setLocalConnection] = useState(connection);

  const partner = localConnection
    ? localConnection.userIdOne === currentUserId
      ? localConnection.userTwo
      : localConnection.userOne
    : null;

  const isIncoming = localConnection?.status === "pending" && localConnection.userIdTwo === currentUserId;

  async function sendInvite() {
    if (!partnerEmail) return;
    setLoading(true);
    try {
      const res = await fetch("/api/couples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerEmail }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setLocalConnection(data);
      toast.success("Invite sent! ✨");
    } catch {
      toast.error("Failed to send invite");
    } finally {
      setLoading(false);
    }
  }

  async function acceptInvite() {
    if (!localConnection) return;
    setLoading(true);
    try {
      const res = await fetch("/api/couples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", connectionId: localConnection.id }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error("Failed"); return; }
      setLocalConnection({ ...localConnection, status: "active", connectedAt: new Date() });
      toast.success("Connected! 💕");
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  }

  async function disconnect() {
    if (!localConnection) return;
    setLoading(true);
    try {
      const res = await fetch("/api/couples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect", connectionId: localConnection.id }),
      });
      if (!res.ok) { toast.error("Failed"); return; }
      setLocalConnection(null);
      toast.success("Disconnected");
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold">Couples Mode</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Coordinate outfits with your partner for any occasion.
        </p>
      </div>

      {/* Active connection */}
      {localConnection?.status === "active" && partner && (
        <div className="space-y-5">
          <Card className="p-6 border border-primary/20 bg-secondary/20 shadow-none">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <span className="font-heading text-xl font-semibold text-primary">
                    {currentUserName?.[0]?.toUpperCase() ?? "Y"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Heart className="w-5 h-5 text-primary fill-primary" />
                <div className="w-16 h-px bg-primary/30" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
                <span className="font-heading text-xl font-semibold text-rose-500">
                  {partner.name?.[0]?.toUpperCase() ?? "P"}
                </span>
              </div>
              <div className="ml-2">
                <p className="font-semibold">{partner.name ?? "Your partner"}</p>
                <Badge className="mt-1 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px]">
                  <Check className="w-2.5 h-2.5 mr-1" /> Connected
                </Badge>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: "💑", title: "Date Night", desc: "Coordinate for a romantic evening out" },
              { icon: "✈️", title: "Travel Together", desc: "Match your vacation looks" },
              { icon: "💒", title: "Wedding / Event", desc: "Look stunning as a couple" },
              { icon: "🌅", title: "Weekend Casual", desc: "Effortlessly coordinated downtime" },
            ].map((occasion) => (
              <Card key={occasion.title} className="p-4 border border-border hover:shadow-soft transition-all cursor-pointer hover:border-primary/30">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{occasion.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{occasion.title}</p>
                    <p className="text-xs text-muted-foreground">{occasion.desc}</p>
                  </div>
                  <Sparkles className="w-4 h-4 text-primary ml-auto" />
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">Outfit coordination features coming soon ✨</p>
            <Button variant="outline" size="sm" onClick={disconnect} disabled={loading}
              className="text-muted-foreground text-xs">
              Disconnect from partner
            </Button>
          </div>
        </div>
      )}

      {/* Pending incoming */}
      {isIncoming && partner && (
        <Card className="p-6 border border-primary/20 bg-secondary/20 shadow-none">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-primary" />
            <p className="font-heading text-lg font-semibold">Couple invite</p>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            <span className="font-medium text-foreground">{partner.name ?? "Someone"}</span> wants to connect wardrobes with you ❤️
          </p>
          <div className="flex gap-3">
            <Button onClick={acceptInvite} disabled={loading} className="gap-2 shadow-rose flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Accept
            </Button>
            <Button variant="outline" onClick={disconnect} disabled={loading} className="gap-2">
              <X className="w-4 h-4" /> Decline
            </Button>
          </div>
        </Card>
      )}

      {/* Pending outgoing */}
      {localConnection?.status === "pending" && !isIncoming && partner && (
        <Card className="p-6 border border-border shadow-none text-center">
          <Loader2 className="w-8 h-8 text-primary/40 animate-spin mx-auto mb-3" />
          <p className="font-medium">Invite sent to {partner.name ?? "your partner"}</p>
          <p className="text-sm text-muted-foreground mt-1">Waiting for them to accept...</p>
          <Button variant="outline" size="sm" onClick={disconnect} disabled={loading} className="mt-4">
            Cancel invite
          </Button>
        </Card>
      )}

      {/* No connection */}
      {!localConnection && (
        <div className="space-y-6">
          <Card className="p-8 border-dashed border-2 border-primary/20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-heading text-2xl font-semibold mb-2">Connect with your partner</h3>
            <p className="text-sm text-muted-foreground mb-1">
              Coordinate outfits for date nights, events, and travel.
            </p>
            <p className="text-xs text-muted-foreground">Your partner needs a StyleAI account first.</p>
          </Card>

          <Card className="p-6 border border-border shadow-none space-y-4">
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-primary" />
              <p className="font-medium">Invite your partner</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="partnerEmail">Partner&apos;s email</Label>
              <Input
                id="partnerEmail"
                type="email"
                placeholder="partner@email.com"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                className="h-10"
                onKeyDown={(e) => e.key === "Enter" && sendInvite()}
              />
            </div>
            <Button onClick={sendInvite} disabled={loading || !partnerEmail} className="w-full gap-2 shadow-rose">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
              Send invite
            </Button>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: "💑", text: "Date night coordination" },
              { emoji: "✈️", text: "Travel outfit planning" },
              { emoji: "💒", text: "Event color matching" },
              { emoji: "📸", text: "Instagram-ready looks" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/40 text-sm">
                <span>{f.emoji}</span>
                <span className="text-muted-foreground">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
