-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    mobile_number TEXT,
    address TEXT,
    address2 TEXT,
    address_components TEXT,
    billing_same_as_shipping INTEGER DEFAULT 1,
    billing_address TEXT,
    billing_address2 TEXT,
    billing_components TEXT,
    has_phone INTEGER,
    phone_number TEXT,
    area_code TEXT DEFAULT '412',
    selected_new_number TEXT,
    can_port INTEGER DEFAULT 0,
    selected_plan TEXT DEFAULT 'annually',
    selected_bundle TEXT,
    own_device INTEGER DEFAULT 0,
    protection_plan INTEGER DEFAULT 0,
    protection_plan_term TEXT DEFAULT 'annually',
    stripe_customer_id TEXT,
    payment_intent_id TEXT,
    current_step INTEGER DEFAULT 1,
    completed INTEGER DEFAULT 0,
    order_placed INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_sessions_email ON sessions(email);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_stripe_customer_id ON sessions(stripe_customer_id);

-- Create session_events table for analytics
CREATE TABLE IF NOT EXISTS session_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_data TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Create indexes for session_events
CREATE INDEX IF NOT EXISTS idx_session_events_session_id ON session_events(session_id);
CREATE INDEX IF NOT EXISTS idx_session_events_event_type ON session_events(event_type);
CREATE INDEX IF NOT EXISTS idx_session_events_created_at ON session_events(created_at);
