// TypeScript interfaces for KrishiMitra

export interface User {
  id: number;
  name: string;
  mobile: string;
  role: string;
  preferred_language: string;
}

export interface FarmerProfile {
  village: string;
  district: string;
  state: string;
  land_size: number;
  land_unit: string;
  soil_type: string;
  irrigation_available: boolean;
  irrigation_type: string;
  preferred_crops: string;
  latitude: number;
  longitude: number;
}

export interface Crop {
  id: number;
  name: string;
  name_hi: string;
  category: string;
  avg_duration_days: number;
  stages: CropStage[];
}

export interface CropStage {
  name: string;
  name_hi: string;
  start_day: number;
  end_day: number;
}

export interface FarmerCrop {
  id: number;
  crop_id: number;
  crop: Crop;
  crop_name?: string;
  crop_name_hi?: string;
  variety: string;
  sowing_date: string;
  field_size: number;
  field_unit: string;
  status: string;
  current_stage?: CropStage;
  growth_stage?: {
    current_stage: string;
    day: number;
    progress?: number;
    stages?: any[];
  };
  days_since_sowing: number;
  notes: string;
}

export interface FarmingActivity {
  id: number;
  farmer_crop_id: number;
  activity_type: string;
  description: string;
  activity_date: string;
  notes: string;
}

export interface CalendarEntry {
  id: number;
  farmer_crop_id: number;
  activity_type: string;
  title: string;
  description: string;
  scheduled_date: string;
  status: string;
  crop_name?: string;
}

export interface WeatherCurrent {
  temperature: number;
  humidity: number;
  precipitation: number;
  wind_speed: number;
  weather_code: number;
}

export interface DailyForecast {
  date: string;
  temp_max: number;
  temp_min: number;
  precipitation_sum: number;
  precipitation_probability: number;
  wind_speed_max: number;
  weather_code: number;
}

export interface WeatherData {
  current: WeatherCurrent;
  daily: DailyForecast[];
  alerts?: string[];
}

export interface Notification {
  id: number;
  category: string;
  title: string;
  message: string;
  priority: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  title: string;
  crop_id: number;
  created_at: string;
}

export interface Message {
  id: number;
  role: string;
  content: string;
  created_at: string;
}

export interface DiseaseReport {
  id: number;
  crop_id: number;
  image_path: string;
  diagnosis: string;
  confidence: string;
  suggestions: string;
  created_at: string;
}

export interface SoilRecord {
  id: number;
  soil_type: string;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  notes: string;
  recommendations?: string;
  created_at?: string;
}

export interface KnowledgeArticle {
  id: number;
  category: string;
  crop_id: number;
  title: string;
  title_hi: string;
  content: string;
  content_hi: string;
  source: string;
}

export interface AdminStats {
  total_farmers: number;
  total_crops: number;
  total_conversations: number;
  total_reports: number;
}

export interface RegisterData {
  name: string;
  mobile: string;
  password: string;
  preferred_language: string;
  village?: string;
  district?: string;
  state?: string;
  land_size?: number;
  soil_type?: string;
  irrigation_available?: boolean;
  irrigation_type?: string;
  preferred_crops?: string;
}
