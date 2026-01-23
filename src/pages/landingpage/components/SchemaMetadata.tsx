import { Helmet } from "react-helmet-async";

const SchemaMetadata = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Avis",
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
    "description": "Enterprise-grade monitoring platform with real-time intelligence and AI-powered insights",
    "url": "https://Avis.com",
    "image": "https://Avis.com/og-image.jpg",
    "screenshot": "https://Avis.com/screenshot.jpg",
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
      "name": "Avis Inc.",
      "url": "https://Avis.com"
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>Avis™ - AI-Powered Monitoring Intelligence</title>
      <meta
        name="title"
        content="Avis™ - AI-Powered Monitoring Tool That Predicts Outages"
      />
      <meta
        name="description"
        content="Enterprise-grade monitoring platform with real-time intelligence and AI-powered insights"
      />
      <meta
        name="keywords"
        content="Zabbix,veeam, monitoring, AI monitoring, predictive analytics, infrastructure monitoring, DevOps, SRE, IT operations, network monitoring, server monitoring"
      />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://Avis.com/" />
      <meta
        property="og:title"
        content="Avis™ - AI-Powered Monitoring Tool That Predicts Outages"
      />
      <meta
        property="og:description"
        content="Enterprise-grade monitoring platform with real-time intelligence and AI-powered insights"
      />
      <meta property="og:image" content="https://Avis.com/og-image.jpg" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://Avis.com/" />
      <meta
        property="twitter:title"
        content="Avis™ - AI-Powered Monitoring Tool That Predicts Outages"
      />
      <meta
        property="twitter:description"
        content="Enterprise-grade monitoring platform with real-time intelligence and AI-powered insights"
      />
      <meta property="twitter:image" content="https://Avis.com/og-image.jpg" />

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(schema)}</script>

      {/* Additional SEO Tags */}
      <link rel="canonical" href="https://Avis.com/" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Avis Team" />
    </Helmet>
  );
};

export default SchemaMetadata;
