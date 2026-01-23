import { WireframeBox, WireframeText, WireframeButton, WireframeBadge, WireframeCard } from "../../components";
import WireframeDashboardLayout from "../../layouts/WireframeDashboardLayout";

const WireframeUserInsights = () => {
  return (
    <WireframeDashboardLayout role="user" title="Insights">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div>
          <WireframeText variant="h1">[AI Insights]</WireframeText>
          <WireframeText variant="body">[Intelligent recommendations and predictions]</WireframeText>
        </div>

        {/* Insights List */}
        <WireframeBox label="AI Insights List">
          <div className="space-y-4">
            {[
              { 
                type: "Prediction", 
                title: "Memory Exhaustion Risk", 
                desc: "web-server-01 may run out of memory in 4 hours",
                impact: "High",
                confidence: 87,
                recommendation: "Scale horizontally or restart service"
              },
              { 
                type: "Anomaly", 
                title: "Unusual Traffic Pattern", 
                desc: "API requests increased 300% in last hour",
                impact: "Medium",
                confidence: 92,
                recommendation: "Review load balancer and check for attacks"
              },
              { 
                type: "Optimization", 
                title: "Resource Optimization", 
                desc: "db-replica-02 is underutilized",
                impact: "Low",
                confidence: 95,
                recommendation: "Consider consolidating workloads"
              },
            ].map((insight, i) => (
              <WireframeBox key={i} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center">
                      <span className="text-sm">
                        {insight.type === "Prediction" ? "🔮" : insight.type === "Anomaly" ? "⚡" : "💡"}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <WireframeBadge label={insight.type} variant="info" />
                        <WireframeText variant="h3">[{insight.title}]</WireframeText>
                      </div>
                      <WireframeText variant="body">[{insight.desc}]</WireframeText>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <WireframeText variant="caption">[Impact:]</WireframeText>
                          <WireframeBadge 
                            label={insight.impact} 
                            variant={insight.impact === "High" ? "critical" : insight.impact === "Medium" ? "warning" : "info"} 
                          />
                        </div>
                        <WireframeText variant="caption">[Confidence: {insight.confidence}%]</WireframeText>
                      </div>
                      <WireframeBox dashed className="p-2 mt-2">
                        <WireframeText variant="label">[Recommendation]</WireframeText>
                        <WireframeText variant="body">[{insight.recommendation}]</WireframeText>
                      </WireframeBox>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <WireframeButton label="Learn More" variant="outline" size="sm" />
                    <WireframeButton label="Apply" variant="primary" size="sm" />
                  </div>
                </div>
              </WireframeBox>
            ))}
          </div>
        </WireframeBox>
      </div>
    </WireframeDashboardLayout>
  );
};

export default WireframeUserInsights;
