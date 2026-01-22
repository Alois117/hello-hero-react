import { Helmet } from "react-helmet-async";

const SchemaMetadata = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Jarvis",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "799",
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "799",
        "priceCurrency": "USD",
        "billingDuration": "P1M",
        "billingIncrement": 1
      }
    },
    "description": "AI-powered, real-time Zabbix monitoring platform that predicts outages before they happen. Analyze every problem in <1 second with auto-triage, root cause analysis, and one-click fixes.",
    "url": "https://Jarvis.com",
    "image": "https://Jarvis.com/og-image.jpg",
    "screenshot": "https://Jarvis.com/screenshot.jpg",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "532"
    },
    "featureList": [
      "AI Root Cause Analysis <1s",
      "Real-Time Event Streaming",
      "Smart Traps Intelligence",
      "One-Click Auto-Remediation",
      "Enterprise RBAC & Multi-Tenant SaaS",
      "White-Label & Reseller Ready",
      "Offline PWA Mode"
    ],
    "softwareVersion": "3.0",
    "provider": {
      "@type": "Organization",
      "name": "Jarvis Inc.",
      "url": "https://Jarvis.com"
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>Jarvis™ - AI-Powered Zabbix Monitoring That Predicts Outages</title>
      <meta
        name="title"
        content="Jarvis™ - AI-Powered Zabbix Monitoring That Predicts Outages"
      />
      <meta
        name="description"
        content="The only Zabbix platform that predicts outages before they happen. AI analyzes every problem in <1 second with auto-triage, root cause analysis, and one-click fixes. Monitor 1.8M+ hosts with 90% less noise."
      />
      <meta
        name="keywords"
        content="Zabbix, monitoring, AI monitoring, predictive analytics, infrastructure monitoring, DevOps, SRE, IT operations, network monitoring, server monitoring"
      />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://Jarvis.com/" />
      <meta
        property="og:title"
        content="Jarvis™ - AI-Powered Zabbix Monitoring That Predicts Outages"
      />
      <meta
        property="og:description"
        content="The only Zabbix platform that predicts outages before they happen. AI analyzes every problem in <1 second. Monitor 1.8M+ hosts with 90% less noise."
      />
      <meta property="og:image" content="https://Jarvis.com/og-image.jpg" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://Jarvis.com/" />
      <meta
        property="twitter:title"
        content="Jarvis™ - AI-Powered Zabbix Monitoring That Predicts Outages"
      />
      <meta
        property="twitter:description"
        content="The only Zabbix platform that predicts outages before they happen. AI analyzes every problem in <1 second. Monitor 1.8M+ hosts with 90% less noise."
      />
      <meta property="twitter:image" content="https://Jarvis.com/og-image.jpg" />

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(schema)}</script>

      {/* Additional SEO Tags */}
      <link rel="canonical" href="https://Jarvis.com/" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Jarvis Team" />
    </Helmet>
  );
};

export default SchemaMetadata;
