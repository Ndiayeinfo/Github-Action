import psycopg2


def check_connection() -> None:
    """Vérifie manuellement la connexion à la base PostgreSQL locale."""
    try:
        psycopg2.connect("postgresql://admin:admin123@localhost:5434/gptdb")
        print("Connexion OK")
    except UnicodeDecodeError as exc:
        print(exc.object.decode("latin-1"))


if __name__ == "__main__":
    # Permet de tester la connexion en local sans casser la CI/pytest
    check_connection()
