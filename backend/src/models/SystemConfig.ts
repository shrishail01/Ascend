import { Schema, model } from 'mongoose';

const featureFlagSchema = new Schema({
  featureName: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: true },
  rolloutPercentage: { type: Number, default: 100 },
  description: { type: String },
  environment: { type: String, default: 'production' },
});

const promptVersionSchema = new Schema({
  version: { type: String, required: true },
  template: { type: String, required: true },
  failures: { type: Number, default: 0 },
  successes: { type: Number, default: 0 },
  avgLatencyMs: { type: Number, default: 0 },
});

const systemConfigSchema = new Schema({
  maintenanceMode: { type: Boolean, default: false },
  announcements: [{
    title: { type: String },
    message: { type: String },
    type: { type: String, enum: ['info', 'warning', 'emergency'], default: 'info' },
    createdAt: { type: Date, default: Date.now },
  }],
  faqs: [{
    question: { type: String },
    answer: { type: String },
  }],
  landingPageContent: {
    heroTitle: { type: String, default: 'Supercharge Your Career with AI' },
    heroSubtitle: { type: String, default: 'Optimize resumes, simulate interviews, and build career roadmaps.' },
  },
  pricingContent: {
    starterPrice: { type: Number, default: 499 },
    professionalPrice: { type: Number, default: 999 },
    enterprisePrice: { type: Number, default: 4999 },
  },
  featureFlags: [featureFlagSchema],
  aiConfig: {
    modelName: { type: String, default: 'gemini-1.5-flash' },
    temperature: { type: Number, default: 0.2 },
    topP: { type: Number, default: 0.9 },
    topK: { type: Number, default: 40 },
    maxOutputTokens: { type: Number, default: 8192 },
    activePromptVersion: { type: String, default: 'v1' },
    promptVersions: [promptVersionSchema],
  },
}, { timestamps: true });

export const SystemConfig = model('SystemConfig', systemConfigSchema);
export default SystemConfig;
