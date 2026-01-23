# AVIS-Sentramind

**AVIS** is an enterprise-grade, multi-tenant monitoring platform that provides unified visibility into Zabbix alerts, Veeam backup infrastructure, and system health metrics. It delivers centralized monitoring through role-based dashboards, enhanced with AI-powered insights to help teams quickly understand system status, identify issues, and make informed decisions. The platform also generates automated daily, weekly, and monthly reports distributed via email, and sends real-time alert notifications through Telegram to ensure timely awareness and response.

---

## Problem & Objective

Modern IT teams operate complex infrastructure across multiple monitoring and backup systems, which often leads to fragmented visibility, delayed responses, and manual reporting overhead. **AVIS** addresses this challenge by consolidating monitoring data from Zabbix and Veeam into a single, centralized platform. It provides role-based dashboards, intelligent alerting with real-time Telegram notifications, and automated daily, weekly, and monthly reporting via email, supported by AI-assisted insights to help teams maintain visibility, respond faster to issues, and make informed operational decisions.

---

## Key Features

### Monitoring & Alerting
- **Unified Alert Dashboard** — Centralized view of all alerts with severity-based filtering
- **Veeam Backup & Replication Integration** — Real-time alarms and VM infrastructure monitoring
- **Host Management** — Track and manage monitored hosts with detailed metrics

### Role-Based Access Control (RBAC)
- **User Dashboard** (`/dashboard/*`) — Standard monitoring views and reports
- **Organization Admin** (`/admin/*`) — User management, billing, alert configuration, maintenance windows
- **Super Admin** (`/super-admin/*`) — Multi-tenant management, global analytics, feature flags, reseller portal

### AI Assistant
- **Floating AI Chat** — Context-aware assistant available across all internal dashboards
- **AI-Powered Insights** — Intelligent analysis and recommendations for alerts

### Additional Features
- **Dark/Light Theme Toggle** — User-configurable theme preference
- **Responsive Design** — Optimized for desktop and mobile viewports

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite 5 |
| **Styling** | Tailwind CSS 3, shadcn/ui components |
| **State Management** | Redux Toolkit, Redux Persist, React Query |
| **Routing** | React Router v6 |
| **Animations** | Framer Motion, GSAP |
| **3D Graphics** | Three.js, React Three Fiber |
| **Forms** | React Hook Form, Zod validation |
| **Charts** | Recharts |
| **Internationalization** | i18n support |

---

## Project Structure

```
src/
├── components/
│   ├── ai/                 # AI chat assistant components
│   ├── alerts/             # Alert management UI
│   ├── dashboard/          # Dashboard widgets and cards
│   ├── layout/             # App layout, header, sidebar
│   ├── loading/            # Skeleton loading states
│   ├── rbac/               # Role-based access components
│   ├── security/           # Audit logging components
│   ├── sli/                # SLI metrics components
│   ├── ui/                 # shadcn/ui base components
│   └── veeam/              # Veeam-specific components
├── hooks/
│   ├── useAlerts.ts        # Alert data fetching
│   ├── useHosts.ts         # Host management
│   ├── useVeeamAlarms.ts   # Veeam alarms integration
│   └── useVeeamInfrastructure.ts  # Veeam VM infrastructure
├── layouts/
│   ├── OrgAdminLayout.tsx  # Organization admin layout
│   ├── SuperAdminLayout.tsx # Super admin layout
│   └── UserLayout.tsx      # Standard user layout
├── pages/
│   ├── landingpage/        # Public landing page
│   ├── org-admin/          # Organization admin pages
│   ├── super-admin/        # Super admin pages
│   └── user/               # User dashboard pages
├── store/                  # Redux store configuration
├── utils/                  # Utility functions (auth, RBAC, masking)
├── i18n/                   # Internationalization config
└── wireframe/              # Wireframe prototypes
```

---

## Environment Setup

### Prerequisites
- Node.js 18+ 
- npm or bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/SentramindAI/AVIS-portal.git
cd AVIS-portal

# Install dependencies
npm install
# or
bun install
```

---

## Running Locally

```bash
# Start development server
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:5173`

---

## External Integrations

The application integrates with external monitoring systems via webhooks:

| Integration | Endpoint Purpose |
|-------------|-----------------|
| Veeam Alarms | Fetches backup and replication alarm data |
| Veeam Infrastructure | Fetches VM infrastructure details |
| Zabbix Alerts | Fetches Zabbix Problems and other details |
| Zabbix Hosts | Fetches Zabbix hosts and there details |

---

## Current Status

**In Development** — The frontend application is feature-complete for core monitoring workflows. Backend integration via webhooks is functional for Veeam data sources. Full Zabbix integration and authentication are pending backend implementation.

---

## License

Proprietary — All rights reserved.
