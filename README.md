# KrishiMitra – Smart Farming Decision Assistant
**कृषि मित्र – स्मार्ट कृषि निर्णय सहायक**

KrishiMitra is a comprehensive, farmer-friendly agricultural decision-support platform designed specifically for Indian farmers. It combines real-time weather data, AI-powered agricultural advisory, crop lifecycle stage calculations, farming calendars, disease diagnosis, soil testing recommendations, and an agricultural knowledge repository.

---

## 🌾 Key Features

1. **Farmer Authentication & Profiles**
   - Simple mobile number & password login/registration
   - Tracks village, district, state, land acreage, soil type, and irrigation availability
   - Supports Hindi and English with full translation dictionary (180+ keys)

2. **Personalized Farmer Dashboard**
   - Welcome greeting with farmer's name
   - Real-time weather card with conditions and temperatures
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

5. **AI Smart Farming Assistant**
   - Agricultural advisory powered by Gemini API
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

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts
- **Backend**: Node.js, Express.js
- **Database**: SQLite (12 relational tables with foreign keys and WAL mode)
- **AI Integration**: Google Gemini API with fallback handling
- **Weather API**: Open-Meteo (free, no API key required)
- **Audio / Voice**: HTML5 Web Speech API (SpeechRecognition & SpeechSynthesis)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Backend Setup
```bash
cd server
npm install
npm start
```
The server will run on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The client will run on `http://localhost:5173`.

---

## 👥 Default Accounts

| Role | Mobile | Password |
|---|---|---|
| **Admin** | `9999999999` | `admin123` |
| **Demo Farmer** | `9876543210` | `password123` |

You can also register a new farmer account directly through the registration screen.
