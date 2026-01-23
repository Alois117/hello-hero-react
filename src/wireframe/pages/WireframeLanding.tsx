import { Link } from "react-router-dom";
import { WireframeBox, WireframeText, WireframeButton, WireframeCard } from "../components";

const WireframeLanding = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <WireframeBox label="Navigation" className="rounded-none border-x-0 border-t-0">
        <div className="flex items-center justify-between">
          <WireframeText variant="h3">[JARVIS Logo]</WireframeText>
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-muted-foreground">[Features]</span>
            <span className="text-sm font-mono text-muted-foreground">[Pricing]</span>
            <span className="text-sm font-mono text-muted-foreground">[Demo]</span>
            <Link to="/wireframe/auth/login">
              <WireframeButton label="Login" variant="outline" size="sm" />
            </Link>
            <Link to="/wireframe/auth/signup">
              <WireframeButton label="Get Started" variant="primary" size="sm" />
            </Link>
          </div>
        </div>
      </WireframeBox>

      {/* Hero Section */}
      <WireframeBox label="Hero Section" className="py-20 text-center mx-4 mt-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <WireframeText variant="h1">[AI-Powered Monitoring Platform]</WireframeText>
          <WireframeText variant="body">[Tagline: Enterprise-grade Zabbix monitoring with AI insights]</WireframeText>
          <div className="flex justify-center gap-4 pt-4">
            <WireframeButton label="Start Free Trial" variant="primary" size="lg" />
            <WireframeButton label="Watch Demo" variant="outline" size="lg" />
          </div>
          <WireframeBox label="Holographic Dashboard Preview" className="h-64 mt-8">
            <div className="h-full flex items-center justify-center">
              <WireframeText variant="caption">[Animated 3D Dashboard Preview]</WireframeText>
            </div>
          </WireframeBox>
        </div>
      </WireframeBox>

      {/* Logo Marquee */}
      <WireframeBox label="Logo Marquee - Trusted By" className="py-8 mx-4 mt-4">
        <div className="flex items-center justify-center gap-8">
          {["Company 1", "Company 2", "Company 3", "Company 4", "Company 5"].map((c, i) => (
            <div key={i} className="w-24 h-8 border-2 border-dashed border-muted-foreground/20 rounded flex items-center justify-center">
              <span className="text-xs font-mono text-muted-foreground/50">[{c}]</span>
            </div>
          ))}
        </div>
      </WireframeBox>

      {/* Problem/Solution Section */}
      <WireframeBox label="Problem/Solution Section" className="py-16 mx-4 mt-4">
        <div className="grid md:grid-cols-2 gap-8">
          <WireframeCard label="The Problem" title="Traditional Monitoring" icon="❌">
            <ul className="space-y-2 mt-4">
              <li className="text-sm font-mono text-muted-foreground">• [Alert fatigue from noise]</li>
              <li className="text-sm font-mono text-muted-foreground">• [Manual correlation required]</li>
              <li className="text-sm font-mono text-muted-foreground">• [Slow incident response]</li>
            </ul>
          </WireframeCard>
          <WireframeCard label="The Solution" title="JARVIS AI" icon="✓">
            <ul className="space-y-2 mt-4">
              <li className="text-sm font-mono text-muted-foreground">• [Intelligent alert correlation]</li>
              <li className="text-sm font-mono text-muted-foreground">• [Automated root cause analysis]</li>
              <li className="text-sm font-mono text-muted-foreground">• [Predictive insights]</li>
            </ul>
          </WireframeCard>
        </div>
      </WireframeBox>

      {/* Features Carousel */}
      <WireframeBox label="Features Carousel" className="py-16 mx-4 mt-4">
        <WireframeText variant="h2" className="text-center mb-8">[Key Features]</WireframeText>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "AI Insights", desc: "ML-powered anomaly detection" },
            { title: "Real-time Alerts", desc: "Instant notification system" },
            { title: "Multi-tenant", desc: "Enterprise-grade isolation" },
            { title: "Custom Dashboards", desc: "Drag-and-drop widgets" },
            { title: "API Integration", desc: "Connect any data source" },
            { title: "Compliance", desc: "SOC2 & GDPR ready" },
          ].map((f, i) => (
            <WireframeCard key={i} title={f.title} subtitle={f.desc} icon="★" />
          ))}
        </div>
      </WireframeBox>

      {/* AI Showcase */}
      <WireframeBox label="AI Showcase Section" className="py-16 mx-4 mt-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <WireframeText variant="h2">[AI-Powered Analysis]</WireframeText>
            <WireframeText variant="body">[Natural language queries, predictive alerts, automated recommendations]</WireframeText>
            <WireframeButton label="Try AI Chat" variant="primary" />
          </div>
          <WireframeBox label="AI Chat Demo" className="h-64">
            <div className="space-y-2">
              <div className="bg-muted/30 rounded p-2 text-xs font-mono">[User: What caused the spike?]</div>
              <div className="bg-primary/10 rounded p-2 text-xs font-mono">[AI: Analysis of metrics shows...]</div>
            </div>
          </WireframeBox>
        </div>
      </WireframeBox>

      {/* Live Demo Section */}
      <WireframeBox label="Live Demo Section" className="py-16 mx-4 mt-4">
        <WireframeText variant="h2" className="text-center mb-8">[Interactive Demo]</WireframeText>
        <WireframeBox label="Embedded Dashboard Demo" className="h-96">
          <div className="h-full flex items-center justify-center">
            <WireframeText variant="caption">[Interactive Dashboard Preview]</WireframeText>
          </div>
        </WireframeBox>
      </WireframeBox>

      {/* Technology Section */}
      <WireframeBox label="Technology Stack" className="py-16 mx-4 mt-4">
        <WireframeText variant="h2" className="text-center mb-8">[Built with Modern Tech]</WireframeText>
        <div className="flex justify-center gap-8">
          {["React", "TypeScript", "PostgreSQL", "AI/ML", "Zabbix"].map((t, i) => (
            <div key={i} className="w-20 h-20 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
              <span className="text-xs font-mono text-muted-foreground">[{t}]</span>
            </div>
          ))}
        </div>
      </WireframeBox>

      {/* Pricing Section */}
      <WireframeBox label="Pricing Section" className="py-16 mx-4 mt-4">
        <WireframeText variant="h2" className="text-center mb-8">[Pricing Plans]</WireframeText>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Starter", price: "$99/mo", features: ["10 hosts", "Basic AI", "Email support"] },
            { name: "Professional", price: "$299/mo", features: ["50 hosts", "Advanced AI", "Priority support"] },
            { name: "Enterprise", price: "Custom", features: ["Unlimited hosts", "Full AI suite", "Dedicated support"] },
          ].map((p, i) => (
            <WireframeCard key={i} label={i === 1 ? "Popular" : undefined} title={p.name} value={p.price}>
              <ul className="space-y-2 mt-4">
                {p.features.map((f, j) => (
                  <li key={j} className="text-xs font-mono text-muted-foreground">• {f}</li>
                ))}
              </ul>
              <WireframeButton label="Choose Plan" variant={i === 1 ? "primary" : "outline"} className="w-full mt-4" />
            </WireframeCard>
          ))}
        </div>
      </WireframeBox>

      {/* Final CTA */}
      <WireframeBox label="Final CTA" className="py-16 mx-4 mt-4 text-center">
        <WireframeText variant="h2">[Ready to Transform Your Monitoring?]</WireframeText>
        <div className="flex justify-center gap-4 mt-6">
          <WireframeButton label="Start Free Trial" variant="primary" size="lg" />
          <WireframeButton label="Schedule Demo" variant="outline" size="lg" />
        </div>
      </WireframeBox>

      {/* Footer */}
      <WireframeBox label="Footer" className="py-8 mx-4 mt-4 mb-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <WireframeText variant="h3">[JARVIS]</WireframeText>
            <WireframeText variant="caption" className="block mt-2">[AI-Powered Monitoring]</WireframeText>
          </div>
          {["Product", "Company", "Resources"].map((section, i) => (
            <div key={i}>
              <WireframeText variant="label">{section}</WireframeText>
              <ul className="space-y-1 mt-2">
                <li className="text-xs font-mono text-muted-foreground">[Link 1]</li>
                <li className="text-xs font-mono text-muted-foreground">[Link 2]</li>
                <li className="text-xs font-mono text-muted-foreground">[Link 3]</li>
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-4 border-t-2 border-dashed border-muted-foreground/20 text-center">
          <WireframeText variant="caption">[© 2024 JARVIS. All rights reserved.]</WireframeText>
        </div>
      </WireframeBox>
    </div>
  );
};

export default WireframeLanding;
