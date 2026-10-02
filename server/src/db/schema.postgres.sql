-- PostgreSQL Schema for Xiaomi HealthKit Integration

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    xiaomi_user_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS xiaomi_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(100) NOT NULL,
    connection_info VARCHAR(255) DEFAULT 'Mi Fitness Cloud Sync (Cloud-to-Cloud)',
    last_sync_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS health_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255),
    data_type VARCHAR(150) NOT NULL,
    value NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(100) NOT NULL DEFAULT 'Xiaomi HealthKit',
    raw_data_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    endpoint VARCHAR(255) NOT NULL,
    http_status INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    data_type VARCHAR(150),
    sanitized_response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Appropriate Indexes
CREATE INDEX IF NOT EXISTS idx_health_data_user_id ON health_data (user_id);
CREATE INDEX IF NOT EXISTS idx_health_data_device_id ON health_data (device_id);
CREATE INDEX IF NOT EXISTS idx_health_data_data_type ON health_data (data_type);
CREATE INDEX IF NOT EXISTS idx_health_data_timestamp ON health_data (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices (user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs (created_at DESC);
