"""Seed script — creates default admin user if not present."""
import sys
import os

# Allow running from backend/ directory
sys.path.insert(0, os.path.dirname(__file__))

# Provide required env vars for Settings if .env is missing
os.environ.setdefault("SECRET_KEY", "seed-script-secret")
os.environ.setdefault("JENKINS_URL", "http://localhost:8080")

import bcrypt  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from app.database import SessionLocal, engine, Base  # noqa: E402
import app.models  # noqa: F401, E402
from app.models.user import User  # noqa: E402

ADMIN_USERNAME = "admin"
ADMIN_EMAIL = "admin@localhost"
ADMIN_PASSWORD = "admin123"


def seed():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == ADMIN_USERNAME).first()
        if existing:
            print(f"Admin user '{ADMIN_USERNAME}' already exists — skipping.")
            return

        admin = User(
            username=ADMIN_USERNAME,
            email=ADMIN_EMAIL,
            hashed_password=bcrypt.hashpw(ADMIN_PASSWORD.encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
            role="admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print(f"Admin user '{ADMIN_USERNAME}' created successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
