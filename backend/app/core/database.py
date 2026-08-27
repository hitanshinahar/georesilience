"""
SQLite database initialization and connection management for GeoResilience.
Uses Python's built-in sqlite3 module. No external dependencies required.
"""

import sqlite3
import os
import logging

logger = logging.getLogger(__name__)

DB_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")
DB_PATH = os.path.join(DB_DIR, "georesilience.db")


def get_connection() -> sqlite3.Connection:
    """Returns a thread-safe SQLite connection with row factory enabled."""
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    """Creates all required tables if they do not exist."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS reports (
            report_id TEXT PRIMARY KEY,
            report_text TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            location_name TEXT,
            reporter_type TEXT NOT NULL DEFAULT 'citizen',
            timestamp TEXT NOT NULL,
            image_url TEXT,
            status TEXT NOT NULL DEFAULT 'SUBMITTED',
            slm_analysis TEXT,
            linked_incident_id TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (linked_incident_id) REFERENCES incidents(incident_id)
        );

        CREATE TABLE IF NOT EXISTS incidents (
            incident_id TEXT PRIMARY KEY,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            location_name TEXT,
            status TEXT NOT NULL DEFAULT 'OPEN',
            risk_level TEXT NOT NULL,
            risk_score REAL NOT NULL DEFAULT 0.0,
            evidence_coverage REAL NOT NULL DEFAULT 0.0,
            model_agreement TEXT NOT NULL DEFAULT 'insufficient_data',
            requires_human_review INTEGER NOT NULL DEFAULT 0,
            recommended_action TEXT,
            source TEXT NOT NULL DEFAULT 'assessment',
            assessment_data TEXT,
            linked_report_ids TEXT DEFAULT '[]',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS alerts (
            alert_id TEXT PRIMARY KEY,
            incident_id TEXT,
            severity TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            target_area TEXT,
            status TEXT NOT NULL DEFAULT 'ACTIVE',
            created_at TEXT NOT NULL,
            FOREIGN KEY (incident_id) REFERENCES incidents(incident_id)
        );

        CREATE TABLE IF NOT EXISTS review_actions (
            review_id TEXT PRIMARY KEY,
            incident_id TEXT NOT NULL,
            action TEXT NOT NULL,
            reviewer_id TEXT NOT NULL DEFAULT 'operator',
            note TEXT,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (incident_id) REFERENCES incidents(incident_id)
        );
    """)

    conn.commit()
    conn.close()
    logger.info("Database initialized at %s", DB_PATH)
