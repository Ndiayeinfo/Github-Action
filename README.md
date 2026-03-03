# Github-Action – Frontend React & Backend FastAPI

Ce dépôt contient un **frontend React** (`frontend-react-gtp`) et un **backend FastAPI** (`backend-fastapi-gtp`) packagés avec Docker et déployés via **GitHub Actions** vers Docker Hub.

Ce fichier sert aussi de **compte rendu de mise en place du CI/CD**.

---

## 1. Objectifs du projet

- **Automatiser** les tests et la construction du frontend et du backend.
- **Construire et pousser** les images Docker sur Docker Hub à chaque `push` sur `main` / `release`.
- **Sécuriser** la configuration (secrets GitHub, fichiers sensibles ignorés).

---

## 2. Architecture du projet

- **Frontend** : `frontend-react-gtp`
  - React (Create React App), Node 20
  - Dockerfile basé sur `node:20-alpine`
- **Backend** : `backend-fastapi-gtp`
  - FastAPI, Uvicorn
  - SQLAlchemy + PostgreSQL en local / Docker
  - SQLite utilisée pour les tests dans GitHub Actions
- **CI/CD** :
  - Workflow : `.github/workflows/build-and-deploy.yml`
  - Docker Hub utilisé comme registry d’images.

### 2.1. Vue d’ensemble (schéma)

> Le schéma est stocké dans `docs/image.png`.

![Architecture globale du projet](docs/image.png)

---

## 3. Workflow GitHub Actions

Fichier : `.github/workflows/build-and-deploy.yml`

### 3.1. Déclencheurs

- `push` sur branches `main`, `release` → **tests + build + push Docker**.
- `pull_request` vers `main`, `release` → **tests uniquement** (pas de push Docker).

### 3.2. Jobs

- **Test frontend (React)**
  - `npm ci`
  - `npm test -- --watchAll=false --passWithNoTests`
  - `npm run build`

- **Test backend (FastAPI)**
  - Installation des dépendances à partir de `backend-fastapi-gtp/requirements.txt`
  - Variable d’environnement pour la base de tests :
    - `DATABASE_URL=sqlite:///./test.db`
  - Vérification d’import : `python -c "import app.main"`
  - `pytest -q` (tolérance si aucun test n’est collecté).

- **Build & push Docker images**
  - `frontend-react-gtp` → image `${DOCKER_HUB_USER}/frontend-react-gtp`
  - `backend-fastapi-gtp` → image `${DOCKER_HUB_USER}/backend-fastapi-gtp`
  - Tags :
    - `sha` du commit
    - `latest` pour la branche par défaut

---

## 4. Secrets et sécurité

### 4.1. Secrets GitHub Actions

- `DOCKER_HUB_USER` : nom d’utilisateur Docker Hub.
- `DOCKER_HUB_TOKEN` : access token Docker Hub.

Ces valeurs sont configurées dans :

> `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### 4.2. Fichiers ignorés

- `.gitignore` à la racine et dans les sous-projets :
  - `node_modules`, `build`, `coverage`
  - `.venv`, caches Python
  - `.env`, `*.env`, fichiers de secrets et certificats (`*.pem`, `*.key`, …)
- `.dockerignore` pour frontend et backend afin de ne pas embarquer les fichiers sensibles dans les images.

---

## 5. Lancer le projet en local (Docker)

### 5.1. Frontend uniquement

```bash
docker run -p 3000:3000 DOCKER_HUB_USER/frontend-react-gtp:latest
```

### 5.2. Backend uniquement

Prévoir une base PostgreSQL accessible, puis :

```bash
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql://admin:admin123@host.docker.internal:5434/gptdb" \
  DOCKER_HUB_USER/backend-fastapi-gtp:latest
```

---

## 6. Captures d’écran

Cette section sera remplie avec les captures d’écran que vous fournirez.

### 6.1. CI GitHub Actions

*(à remplir avec une capture du workflow vert)*  
Exemple de syntaxe que nous utiliserons :

```markdown
![Workflow GitHub Actions réussi](docs/images/ci-success.png)
```

### 6.2. Application frontend

*(à remplir avec une capture de l’interface React)*

### 6.3. API backend (Swagger / Requête)

*(à remplir avec une capture de la doc Swagger ou d’un appel API réussi)*

---

## 7. Historique des principaux problèmes résolus

- **Problèmes d’encodage** sur `requirements.txt` backend (UTF‑16) → recréé en UTF‑8.
- **Connexion PostgreSQL en CI** :
  - Ajout de `DATABASE_URL=sqlite:///./test.db` pour les tests.
  - Adaptation de `app/database.py` pour supporter SQLite en CI.
- **Tests qui échouaient lors de la collecte (`pytest`)** :
  - Modification de `temp_conn_test.py` pour ne jamais tenter de se connecter à PostgreSQL pendant la collecte des tests.
- **Gestion des secrets et fichiers sensibles** :
  - Mise à jour des `.gitignore` et `.dockerignore`.

---

## 8. Pistes d’amélioration

- Ajouter de **vrais tests automatisés** (unitaires / d’intégration) pour le backend et le frontend.
- Ajouter un **docker-compose** pour lancer Postgres + backend + frontend ensemble en local.
- Ajouter un **déploiement automatique** vers un environnement (VPS, VM, Kubernetes, etc.).

