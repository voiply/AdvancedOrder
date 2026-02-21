-- D1 Database Schema for Voiply Checkout Sessions
-- This schema stores checkout session data for user continuity

-- Sessions table: Stores all checkout session data
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  
  -- Contact Information
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  mobile_number TEXT,
  
  -- Shipping Address
  address TEXT,
  address2 TEXT,
  street TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Billing Address
  billing_same_as_shipping INTEGER DEFAULT 1,
  billing_address TEXT,
  billing_address2 TEXT,
  billing_street TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_zip_code TEXT,
  
  -- Phone Selection
  has_phone INTEGER,
  phone_number TEXT,
  area_code TEXT,
  selected_new_number TEXT,
  portability_checked INTEGER DEFAULT 0,
  can_port INTEGER,
  
  -- Plan & Bundle Selection
  selected_plan TEXT,
  selected_bundle TEXT,
  own_device INTEGER DEFAULT 0,
  
  -- Protection Plan
  protection_plan INTEGER DEFAULT 0,
  protection_plan_term TEXT,
  
  -- Payment Information (DO NOT store card details)
  stripe_customer_id TEXT,
  payment_intent_id TEXT,
  
  -- Session Metadata
  current_step INTEGER DEFAULT 1,
  completed INTEGER DEFAULT 0,
  order_placed INTEGER DEFAULT 0,
  ip_address TEXT,
  user_agent TEXT
);

-- Index on email for quick lookup of returning customers
CREATE INDEX IF NOT EXISTS idx_sessions_email ON sessions(email);

-- Index on created_at for cleanup of old sessions
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);

-- Index on expires_at for finding expired sessions
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Index on stripe_customer_id for linking to Stripe records
CREATE INDEX IF NOT EXISTS idx_sessions_stripe_customer ON sessions(stripe_customer_id);

-- Session history table: Track session events
CREATE TABLE IF NOT EXISTS session_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Index on session_id for event lookup
CREATE INDEX IF NOT EXISTS idx_session_events_session_id ON session_events(session_id);

-- Index on event_type for analytics
CREATE INDEX IF NOT EXISTS idx_session_events_type ON session_events(event_type);
