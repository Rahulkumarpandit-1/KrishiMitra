# KrishiMitra – Smart Farming Decision Assistant
**कृषि मित्र – स्मार्ट कृषि निर्णय सहायक**

KrishiMitra is a comprehensive, farmer-friendly agricultural decision-support platform designed specifically for Indian farmers. Built with a modern **Nature-Tech Glassmorphism UI**, it brings real-time Open-Meteo weather intelligence, dynamic crop lifecycle calendar tracking, AI-powered agricultural advisory with bilingual voice interaction (Hindi & English), plant disease computer vision diagnostics, soil health recommendations, and ICAR-backed farming guides together in one unified app.

---

## 🎨 Design Philosophy: Nature-Tech Glassmorphism

The frontend design draws inspiration from modern eco-tech dashboards:
- **Seedling Hero Showcase**: Dynamic visual status indicators showcasing plant health score (92%), leaf hydration, and moisture.
- **Floating Glass Frosted Cards**: Multi-layered backdrop blurs (`backdrop-blur-xl`), emerald-highlighted borders, and glowing accents.
- **Iridescent AI Orb**: 3D floating orb reflecting real-time conversational states and voice synthesis animations.
- **Crop Health Radar**: Multi-axis biometric chart displaying yield estimate, moisture, temperature tolerance, and NDVI.
- **7-Day Weather Temperature Ranges**: Visual gradient horizontal bars displaying weekly forecast ranges and weather alerts.
- **High-Contrast Typography**: Specially tuned for readability in bright sunlight and dark modes.

---

## 🌾 Key Features

1. **Farmer Authentication & Profiles**
   - Simple mobile number & password login/registration
   - Tracks village, district, state, land acreage, soil type, and irrigation availability
   - Supports Hindi and English with an extensive bilingual translation dictionary
   - Pre-seeded with test accounts for immediate evaluation

2. **Personalized Farmer Dashboard**
   - Greeting with farmer's name and farm overview
   - Real-time weather card with live temperature, humidity, wind, and alerts
   - Active crops list with calculated growth stages
   - Today's pending agricultural tasks from the crop calendar
   - Quick-action shortcuts (Ask Assistant, Add Crop, Scan Disease, View Weather)

3. **Crop Management & Dynamic Lifecycle Calendar**
   - Track multiple crops (Rice, Wheat, Maize, Cotton, Tomato, Potato, Onion, Sugarcane, Soybean, Mustard)
   - Automatic calculation of current growth stage based on sowing date and crop lifecycle
   - Generates personalized, stage-based agricultural calendars (Land Prep, Sowing, Irrigation, Fertilizer, Weed Control, Pest Scouting, Harvesting)
   - View by Daily, Weekly, or Monthly view with one-click complete/skip status

4. **Weather Monitoring & Agricultural Alerts (Open-Meteo)**
   - Live temperature, rainfall probability, humidity, and wind speed
   - 7-day daily forecast with rainfall probability and temperature ranges
   - Automated agricultural alerts:
     - Heavy rainfall warnings (avoid unnecessary irrigation & delay fertilizer)
     - High wind alerts (avoid pesticide/herbicide spraying)
     - Extreme heat alerts (monitor crop water requirements)
   - Automatic browser geolocation with manual search fallback

5. **AI Smart Farming Assistant with Voice Interaction**
   - Multi-provider AI conversational engine (xAI Grok / Google Gemini / Built-in ICAR Advisory Fallback)
   - Context-aware: includes farmer's location, soil, active crops, and growth stage
   - Web Speech API integration for **voice input** (SpeechRecognition) and **voice output** (SpeechSynthesis in Hindi & English)
   - Quick-question prompts for easy exploration
   - Multi-session conversation history

6. **Image-Based Crop Disease Detection**
   - Leaf/plant photo upload or camera capture
   - Disease diagnosis with symptoms, severity, and actionable management steps
   - Clear uncertainty disclaimers and recommendations for local Krishi Vigyan Kendra (KVK) verification
   - Historical disease report archive

7. **Soil & Crop Recommendation Engine**
   - Soil type, pH, N-P-K nutrient input
   - Generates tailored crop suitability recommendations and soil management advice
   - Clear disclaimer distinguishing preliminary advisory from lab testing

8. **Farming Knowledge Centre**
   - 10+ ICAR-sourced guides covering cultivation, pest management, irrigation techniques, fertilizer schedules, and government schemes (PM-KISAN, PM Fasal Bima Yojana, Soil Health Card)
   - Searchable and categorized with dual Hindi/English content

9. **Smart Notifications & Reminders**
   - Centralized notifications with priorities (Low, Normal, High, Urgent)
   - Filter by categories (Weather, Irrigation, Fertilizer, Crop Stage, Pest/Disease, Calendar)
   - Read/unread status and mark-all-read capabilities

10. **Admin Dashboard**
    - High-level platform statistics (Farmers, Crops, Conversations, Reports)
    - Farmer user directory
    - Reference crop manager
    - Knowledge base article editor
    - Disease diagnostic review

---

## 🗄️ Database Architecture & Status

KrishiMitra includes a production-grade relational database schema across **12 tables**:
- `users`: Authentication credentials and user roles (`farmer`, `admin`)
- `farmer_profiles`: Land size, village, district, state, soil type, irrigation source
- `crops`: Reference crop catalog with typical duration, optimal season, and water requirement
- `farmer_crops`: Individual crops planted by farmers with sowing date, variety, and acreage
- `farming_activities`: Farm event log (irrigation, fertilization, spraying, harvesting)
- `farming_calendar`: Auto-generated schedule of scheduled farm tasks
- `notifications`: Alert dispatch records with priority and category tags
- `assistant_conversations`: Chat sessions grouped by date and topic
- `assistant_messages`: Granular query and response transcript logs
- `disease_reports`: Leaf image analyses, diagnosed issues, and remediation suggestions
- `soil_records`: Soil test logs with N-P-K and pH readings
- `knowledge_articles`: Curated agricultural knowledge articles

### Which database is currently in use?
- **SQLite (Default & Active)**:
  - Location: `server/data/krishimitra.db`
  - Connected and fully operational out of the box with zero installation overhead.
  - Enabled with **WAL mode (Write-Ahead Logging)** and foreign key enforcement for high performance and transactional integrity.
  - Automatically initializes tables and seeds test data on first start.
- **MySQL (Supported)**:
  - For teams running an external MySQL cluster, a complete DDL and seed script is provided at:
    `server/src/config/setup-mysql.sql`
  - Simply run `mysql -u root -p < server/src/config/setup-mysql.sql` and set `DB_CLIENT=mysql` in `server/.env`.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts
- **Backend**: Node.js, Express.js
- **Database**: SQLite (Active default) / MySQL (Schema provided)
- **AI Integration**: xAI Grok API / Google Gemini API / ICAR Agricultural Expert System Fallback
- **Weather API**: Open-Meteo (real-time meteorological telemetry, no key required)
- **Audio / Voice**: HTML5 Web Speech API (SpeechRecognition & SpeechSynthesis)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Quick Setup & Seed Database
From the root directory:
```bash
# Run one-step database initialization and seeding
npm run setup:db
```

### 3. Start Backend Server
```bash
cd server
npm install
npm run dev
```
The server will run on `http://localhost:5000`.

### 4. Start Frontend Application
```bash
cd client
npm install
npm run dev
```
The client will run on `http://localhost:5173`.

---

## 👥 Default Test Accounts

| Role | Mobile | Password | Notes |
|---|---|---|---|
| **Admin** | `9999999999` | `admin123` | Full access to platform analytics, user directory, and article editor |
| **Demo Farmer** | `9876543210` | `password123` | Pre-loaded with active wheat and rice crops, calendar events, and notifications |
| **Farmer (Rahul)** | `6299400242` | `password123` | Custom test account |

New farmers can also register directly via the registration screen.
