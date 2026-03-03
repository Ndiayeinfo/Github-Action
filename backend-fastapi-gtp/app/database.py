import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Forcer l'encodage UTF-8 pour éviter les erreurs de décodage (PostgreSQL)
os.environ["PGCLIENTENCODING"] = "UTF8"

# Utilise DATABASE_URL depuis les variables d'environnement (Docker/CI)
# sinon utilise la config locale PostgreSQL pour le développement
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://admin:admin123@localhost:5432/gptdb",
)


def _create_engine(url: str):
    """Crée un engine adapté au SGBD (PostgreSQL vs SQLite pour les tests/CI)."""
    if url.startswith("sqlite"):
        # Exemple : sqlite:///./test.db pour le CI / tests
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            pool_pre_ping=True,
        )

    # Cas par défaut : PostgreSQL (local, docker, prod)
    return create_engine(
        url,
        connect_args={
            "client_encoding": "utf8",
            "options": "-c client_encoding=utf8",
        },
        pool_pre_ping=True,
    )


engine = _create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
