# Dépôt de Déploiement - Backend FastAPI

Ce dépôt contient la configuration de déploiement (CD - Continuous Deployment) pour le backend FastAPI.

## Structure

```
deployment-repo/
├── Jenkinsfile          # Pipeline de déploiement CD
├── docker-compose.yaml  # Configuration Docker Compose pour le déploiement
└── README.md           # Ce fichier
```

## Fonctionnement

### Workflow CI/CD

1. **Repo Backend (CI)** : 
   - Build de l'image Docker
   - Push vers Docker Hub
   - Déclenche automatiquement le pipeline CD

2. **Repo Deployment (CD)** :
   - Récupère la nouvelle image depuis Docker Hub
   - Déploie les services avec Docker Compose
   - Effectue des health checks

### Déclenchement automatique

Le pipeline CD est déclenché automatiquement par le pipeline CI via :
- Un appel `build job` dans Jenkins
- Les paramètres `BACKEND_IMAGE` et `BACKEND_IMAGE_TAG` sont passés automatiquement

### Déploiement manuel

Pour déployer manuellement une version spécifique :

```bash
# Via Jenkins avec paramètres
BACKEND_IMAGE=ndiayeinf/backend-fastapi-gtp
BACKEND_IMAGE_TAG=1.23

# Ou via docker-compose directement
export BACKEND_IMAGE=ndiayeinf/backend-fastapi-gtp
export BACKEND_IMAGE_TAG=1.23
docker-compose up -d --pull always
```

## Services déployés

- **PostgreSQL 16** : Base de données (port 5432)
- **PGAdmin** : Interface d'administration (port 8080)
- **Backend FastAPI** : API backend (port 8000)

## Configuration dans Jenkins

1. Créer un nouveau job Jenkins nommé `backend-deployment-pipeline`
2. Configurer comme pipeline Jenkins avec SCM
3. Pointer vers ce dépôt Git
4. Activer "This project is parameterized" avec :
   - `BACKEND_IMAGE` (string)
   - `BACKEND_IMAGE_TAG` (string)

## Variables d'environnement

Le pipeline utilise les variables suivantes :
- `BACKEND_IMAGE` : Nom de l'image Docker (ex: `ndiayeinf/backend-fastapi-gtp`)
- `BACKEND_IMAGE_TAG` : Tag de l'image (ex: `1.23` ou `latest`)

