import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    return null;
  }

  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      return m;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

// ----------------------------------------------------
// MONGOOSE SCHEMAS & MODELS
// ----------------------------------------------------

// 1. User Schema
const UserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

export const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);

// 2. Lead Schema
const LeadSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    userName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String },
    services: [{ type: String }],
    leadStatus: { type: String, required: true },
    leadAssignDate: { type: String },
    lastFollowDate: { type: String },
    followUpStatus: { type: String, required: true },
    remark: { type: String },
  },
  { timestamps: true }
);

export const MongoLead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

// 3. Deal Schema
const DealSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    leadId: { type: String, required: true },
    title: { type: String, required: true },
    value: { type: Number, required: true },
    currency: { type: String, required: true },
    stage: { type: String, required: true },
    companyName: { type: String, required: true },
    userName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String },
    ownerId: { type: String, required: true },
    probability: { type: Number, required: true },
    expectedCloseDate: { type: String },
  },
  { timestamps: true }
);

export const MongoDeal = mongoose.models.Deal || mongoose.model('Deal', DealSchema);

// 4. LeadLog Schema
const LeadLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  leadId: { type: String, required: true },
  type: { type: String, required: true },
  creatorRole: { type: String, required: true },
  creatorName: { type: String, required: true },
  description: { type: String, required: true },
  details: { type: String },
  timestamp: { type: String, required: true },
});

export const MongoLeadLog = mongoose.models.LeadLog || mongoose.model('LeadLog', LeadLogSchema);

// 5. Settings Schema
const SettingsSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  supportEmail: { type: String, required: true },
  defaultCurrency: { type: String, required: true },
  metaAccessToken: { type: String },
  metaVerifyToken: { type: String },
  metaPageId: { type: String },
});

export const MongoSettings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
