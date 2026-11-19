import re
from app import create_app
from app.extensions import db
from app.models import User

def slugify(text: str) -> str:
    text = (text or "").strip().lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text or "user"

def unique_slug(base: str) -> str:
    slug = base
    i = 2
    while User.query.filter_by(slug=slug).first():
        slug = f"{base}-{i}"
        i += 1
    return slug

def run():
    app = create_app()
    with app.app_context():
        users = User.query.filter((User.slug == None) | (User.slug == "")).all()
        print(f"Found {len(users)} users missing slug")

        for u in users:
            base = slugify(u.full_name)
            u.slug = unique_slug(base)

        db.session.commit()
        print("✅ Backfill complete")

if __name__ == "__main__":
    run()
