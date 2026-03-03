# Configuration du Job Jenkins backend-deployment

## Situation actuelle

Vous avez déjà un job Jenkins `backend-deployment` qui déploie le backend. Maintenant que le frontend met à jour le `docker-compose.yml` dans le repo `backend-deployment`, vous devez mettre à jour ce job pour qu'il déploie **les deux services ensemble**.

## Étapes à suivre

### 1. Modifier le job backend-deployment dans Jenkins

Dans votre job Jenkins `backend-deployment`, vous devez vous assurer que :

#### A. Le job checkout le bon repo
- **Repository URL** : `https://github.com/Ndiayeinfo/backend-deployment.git`
- **Branch** : `master`
- **Credentials** : Vos credentials GitHub

#### B. Le job utilise docker-compose pour déployer

Le job doit exécuter les commandes suivantes :

```batch
# Arrêter les conteneurs existants (si nécessaire)
docker-compose down

# Pull les dernières images
docker-compose pull

# Démarrer les services (backend + frontend)
docker-compose up -d --build
```

### 2. Structure du docker-compose.yml attendue

Le `docker-compose.yml` dans le repo `backend-deployment` doit contenir :

```yaml
services:
  backend:
    image: ndiayeinf/backend-fastapi-gtp:1.XXX
    ports:
      - "8000:8000"
    # ... autres configurations backend
    
  frontend:
    image: ndiayeinf/frontend-react-gtp:1.XXX
    ports:
      - "3000:3000"
    environment:
      - HOST=0.0.0.0
      - CHOKIDAR_USEPOLLING=true
      - REACT_APP_API_URL=http://backend:8000
    depends_on:
      - backend
    restart: unless-stopped
```

### 3. Configuration recommandée du job

#### Option 1 : Pipeline Script (recommandé)

Si votre job utilise un pipeline script, voici un exemple :

```groovy
pipeline {
    agent {
        label 'agent-windows'  // ou votre agent
    }
    
    environment {
        DEPLOYMENT_REPO_URL = 'https://github.com/Ndiayeinfo/backend-deployment.git'
        DEPLOYMENT_REPO_BRANCH = 'master'
        DEPLOYMENT_CREDENTIALS = 'github-backend-fastapi-gtp'
    }
    
    stages {
        stage('Checkout Deployment Repo') {
            steps {
                git branch: env.DEPLOYMENT_REPO_BRANCH,
                    url: env.DEPLOYMENT_REPO_URL,
                    credentialsId: env.DEPLOYMENT_CREDENTIALS
            }
        }
        
        stage('Deploy Services') {
            steps {
                bat """
                    docker-compose down || echo "No containers to stop"
                    docker-compose pull
                    docker-compose up -d --build
                """
            }
        }
    }
    
    post {
        success {
            echo "Déploiement backend et frontend réussi !"
        }
        failure {
            echo "Le déploiement a échoué, vérifiez les logs."
        }
    }
}
```

#### Option 2 : Job Freestyle

Si vous utilisez un job Freestyle :

1. **Source Code Management** :
   - Git
   - Repository URL : `https://github.com/Ndiayeinfo/backend-deployment.git`
   - Branch : `master`
   - Credentials : Vos credentials GitHub

2. **Build Steps** :
   - Ajouter "Execute Windows batch command" ou "Execute shell" :
   ```batch
   docker-compose down || echo "No containers to stop"
   docker-compose pull
   docker-compose up -d --build
   ```

3. **Build Triggers** (optionnel) :
   - Vous pouvez configurer un webhook GitHub pour déclencher le job automatiquement quand le repo est mis à jour

### 4. Déclenchement automatique (optionnel)

Pour que le job se déclenche automatiquement quand le frontend ou le backend met à jour le repo :

#### A. Webhook GitHub
1. Dans votre repo `backend-deployment` sur GitHub
2. Settings → Webhooks → Add webhook
3. Payload URL : `http://votre-jenkins-url/github-webhook/`
4. Content type : `application/json`
5. Events : "Just the push event"

#### B. Poll SCM dans Jenkins
Dans votre job, configurez "Poll SCM" :
- Schedule : `H/5 * * * *` (toutes les 5 minutes)

### 5. Vérification

Après configuration, testez :

1. Le job frontend met à jour le `docker-compose.yml` avec la nouvelle image frontend
2. Le job `backend-deployment` se déclenche (manuellement ou automatiquement)
3. Les deux services (backend + frontend) sont déployés ensemble
4. Vérifiez que les services sont accessibles :
   - Backend : http://votre-serveur:8000
   - Frontend : http://votre-serveur:3000

## Résumé du flux

```
1. Pipeline Frontend
   └─> Build image frontend
   └─> Push vers DockerHub
   └─> Met à jour docker-compose.yml dans backend-deployment
   └─> Commit + Push vers backend-deployment

2. Pipeline Backend (si vous en avez un)
   └─> Build image backend
   └─> Push vers DockerHub
   └─> Met à jour docker-compose.yml dans backend-deployment
   └─> Commit + Push vers backend-deployment

3. Job backend-deployment
   └─> Checkout repo backend-deployment
   └─> docker-compose pull (récupère les dernières images)
   └─> docker-compose up -d (déploie backend + frontend)
```

## Notes importantes

- Le `docker-compose.yml` dans `backend-deployment` est la source de vérité pour le déploiement
- Les deux pipelines (frontend et backend) mettent à jour ce fichier
- Le job `backend-deployment` déploie ce qui est dans ce fichier
- Assurez-vous que les noms de services dans docker-compose.yml correspondent (backend, frontend)

