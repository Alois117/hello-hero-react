import { motion } from "framer-motion";
import { WireframeBox, WireframeText, WireframePlaceholder } from "../components/WireframePrimitives";
import { WireframeHeader } from "../components/WireframeLayout";
import { WireframeKPICard } from "../components/WireframeWidgets";

interface LandingWireframeProps {
  onNavigate: (screen: string) => void;
}

export const LandingWireframe = ({ onNavigate }: LandingWireframeProps) => (
  <div className="min-h-screen bg-background">
    <WireframeHeader title="JARVIS" onNavigate={onNavigate} variant="landing" />

    {/* Hero Section */}
    <section className="relative py-20 px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <WireframeBadge>AI-Powered Infrastructure Monitoring</WireframeBadge>
        <WireframeText variant="h1" className="text-4xl md:text-6xl block">
          Next-Gen Infrastructure Intelligence
        </WireframeText>
        <WireframeText variant="body" className="text-lg max-w-2xl mx-auto block">
          Transform your infrastructure monitoring with AI-driven insights, 
          predictive analytics, and automated remediation.
        </WireframeText>
        <div className="flex items-center justify-center gap-4 pt-4">
          <motion.button
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
            whileHover={{ scale: 1.05 }}
            onClick={() => onNavigate("signup")}
          >
            Start Free Trial
          </motion.button>
          <motion.button
            className="px-8 py-3 border border-border rounded-lg"
            whileHover={{ scale: 1.05 }}
            onClick={() => onNavigate("demo")}
          >
            Watch Demo
          </motion.button>
        </div>
      </motion.div>

      {/* Hero Dashboard Preview */}
      <motion.div
        className="mt-16 max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <WireframeBox variant="card" className="p-4 bg-card/50 backdrop-blur">
          <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
            <WireframeText variant="caption">Dashboard Preview</WireframeText>
          </div>
        </WireframeBox>
      </motion.div>
    </section>

    {/* Stats Section */}
    <section className="py-16 px-6 bg-muted/20">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { title: "Hosts Monitored", value: "10M+" },
          { title: "Alerts Processed", value: "1B+" },
          { title: "Uptime", value: "99.99%" },
          { title: "Response Time", value: "<100ms" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="text-center"
          >
            <WireframeText variant="h1" className="text-3xl block">{stat.value}</WireframeText>
            <WireframeText variant="caption" className="block mt-1">{stat.title}</WireframeText>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Features Section */}
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <WireframeText variant="h2" className="text-3xl block">Powerful Features</WireframeText>
          <WireframeText variant="body" className="block mt-2">Everything you need to monitor at scale</WireframeText>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "AI-Powered Insights", desc: "Machine learning algorithms detect anomalies before they become problems" },
            { title: "Real-time Monitoring", desc: "Sub-second metrics collection with instant alerting" },
            { title: "Smart Automation", desc: "Automated remediation workflows triggered by intelligent rules" },
            { title: "Multi-Cloud Support", desc: "Monitor AWS, Azure, GCP and on-premise infrastructure" },
            { title: "Custom Dashboards", desc: "Build personalized views with drag-and-drop widgets" },
            { title: "Enterprise Security", desc: "SOC 2 compliant with role-based access control" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <WireframeBox variant="card" className="p-6 h-full">
                <div className="w-12 h-12 rounded-lg bg-primary/20 mb-4" />
                <WireframeText variant="h3" className="block mb-2">{feature.title}</WireframeText>
                <WireframeText variant="body" className="block">{feature.desc}</WireframeText>
              </WireframeBox>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Pricing Section */}
    <section className="py-20 px-6 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <WireframeText variant="h2" className="text-3xl block">Simple Pricing</WireframeText>
          <WireframeText variant="body" className="block mt-2">Choose the plan that fits your needs</WireframeText>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Starter", price: "$49", features: ["50 Hosts", "7-day retention", "Email alerts"] },
            { name: "Professional", price: "$199", features: ["500 Hosts", "30-day retention", "AI insights", "API access"], popular: true },
            { name: "Enterprise", price: "Custom", features: ["Unlimited hosts", "1-year retention", "SSO", "Dedicated support"] },
          ].map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <WireframeBox
                variant="card"
                className={`p-6 h-full ${plan.popular ? "border-primary ring-2 ring-primary/20" : ""}`}
              >
                {plan.popular && (
                  <WireframeBadge variant="success">Most Popular</WireframeBadge>
                )}
                <WireframeText variant="h3" className="block mt-2">{plan.name}</WireframeText>
                <WireframeText variant="h1" className="text-4xl block my-4">{plan.price}</WireframeText>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-success/30" />
                      <WireframeText variant="body">{f}</WireframeText>
                    </li>
                  ))}
                </ul>
                <motion.button
                  className={`w-full py-2 rounded-lg ${plan.popular ? "bg-primary text-primary-foreground" : "border border-border"}`}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => onNavigate("signup")}
                >
                  Get Started
                </motion.button>
              </WireframeBox>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-20 px-6">
      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <WireframeBox variant="card" className="p-12 bg-gradient-to-br from-primary/10 to-secondary/10">
          <WireframeText variant="h2" className="text-3xl block mb-4">Ready to Transform Your Monitoring?</WireframeText>
          <WireframeText variant="body" className="block mb-8">Start your 14-day free trial today. No credit card required.</WireframeText>
          <motion.button
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
            whileHover={{ scale: 1.05 }}
            onClick={() => onNavigate("signup")}
          >
            Start Free Trial
          </motion.button>
        </WireframeBox>
      </motion.div>
    </section>

    {/* Footer */}
    <footer className="py-12 px-6 border-t border-border/30">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {["Product", "Company", "Resources", "Legal"].map((section, i) => (
          <div key={i}>
            <WireframeText variant="label" className="block mb-4">{section}</WireframeText>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((j) => (
                <WireframePlaceholder key={j} width="w-20" height="h-3" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-border/30 flex items-center justify-between">
        <WireframeText variant="caption">© 2024 JARVIS. All rights reserved.</WireframeText>
        <div className="flex items-center gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-6 h-6 rounded bg-muted/30" />
          ))}
        </div>
      </div>
    </footer>
  </div>
);

const WireframeBadge = ({ children, variant = "default" }: { children: string; variant?: string }) => (
  <span className={`inline-block text-xs px-3 py-1 rounded-full ${
    variant === "success" ? "bg-success/20 text-success" : "bg-primary/20 text-primary"
  }`}>
    {children}
  </span>
);
