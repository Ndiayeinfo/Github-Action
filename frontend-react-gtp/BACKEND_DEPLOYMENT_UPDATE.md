# Mise à jour du Jenkinsfile du repo backend-deployment

## Contexte

Votre repo `backend-deployment` a déjà un Jenkinsfile qui gère le déploiement du backend. Il faut maintenant l'adapter pour qu'il gère aussi le frontend.

## Modifications nécessaires

### 1. Ajouter les paramètres du frontend dans le job Jenkins

Dans Jenkins, pour le job `backend-deployment-pipeline`, vous devez ajouter deux nouveaux paramètres :

1. **FRONTEND_IMAGE** (String) - Exemple : `ndiayeinf/frontend-react-gtp`
2. **FRONTEND_IMAGE_TAG** (String) - Exemple : `1.23` ou `latest`

Les paramètres existants (BACKEND_IMAGE et BACKEND_IMAGE_TAG) restent inchangés.

### 2. Modifier le Jenkinsfile du repo backend-deployment

Le Jenkinsfile doit être mis à jour pour :

1. Accepter les paramètres du frontend (FRONTEND_IMAGE, FRONTEND_IMAGE_TAG)
2. Mettre à jour le docker-compose.yml avec les images backend ET frontend
3. Déployer les deux services ensemble

## Exemple de Jenkinsfile pour backend-deployment

Voici un exemple de Jenkinsfile qui gère les deux services :

```groovy
pipeline {
    agent {
        label 'agent-windows'  // ou votre agent
    }
    
    parameters {
        string(name: 'BACKEND_IMAGE', defaultValue: 'ndiayeinf/backend-fastapi-gtp', description: 'Image Docker du backend')
        string(name: 'BACKEND_IMAGE_TAG', defaultValue: 'latest', description: 'Tag de l\'image backend')
        string(name: 'FRONTEND_IMAGE', defaultValue: '', description: 'Image Docker du frontend (optionnel)')
        string(name: 'FRONTEND_IMAGE_TAG', defaultValue: '', description: 'Tag de l\'image frontend (optionnel)')
    }
    
    environment {
        DEPLOYMENT_REPO_URL = 'https://github.com/Ndiayeinfo/backend-deployment.git'
        DEPLOYMENT_REPO_BRANCH = 'main'
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
        
        stage('Update docker-compose.yml') {
            steps {
                script {
                    // Mettre à jour le docker-compose.yml avec les images
                    def composeFile = 'docker-compose.yaml' // ou docker-compose.yml selon votre repo
                    
                    // Lire le fichier actuel
                    def composeContent = readFile(file: composeFile)
                    
                    // Mettre à jour l'image backend
                    composeContent = composeContent.replaceAll(
                        /(backend:[\s\S]*?image:\s*)[^\n]+/,
                        "\$1${params.BACKEND_IMAGE}:${params.BACKEND_IMAGE_TAG}"
                    )
                    
                    // Mettre à jour ou ajouter l'image frontend si les paramètres sont fournis
                    if (params.FRONTEND_IMAGE && params.FRONTEND_IMAGE_TAG) {
                        def frontendImage = "${params.FRONTEND_IMAGE}:${params.FRONTEND_IMAGE_TAG}"
                        
                        if (composeContent.contains('frontend:')) {
                            // Mettre à jour l'image frontend existante
                            composeContent = composeContent.replaceAll(
                                /(frontend:[\s\S]*?image:\s*)[^\n]+/,
                                "\$1${frontendImage}"
                            )
                        } else {
                            // Ajouter la section frontend
                            def frontendService = """
  frontend:
    image: ${frontendImage}
    ports:
      - "3000:3000"
    environment:
      - HOST=0.0.0.0
      - CHOKIDAR_USEPOLLING=true
      - REACT_APP_API_URL=http://backend:8000
    depends_on:
      - backend
    restart: unless-stopped
"""
                            // Ajouter après la section services:
                            composeContent = composeContent.replace('services:', "services:${frontendService}")
                        }
                    }
                    
                    // Écrire le fichier mis à jour
                    writeFile(file: composeFile, text: composeContent)
                }
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
        
        stage('Health Check') {
            steps {
                script {
                    // Attendre que les services soient prêts
                    sleep(time: 10, unit: 'SECONDS')
                    
                    // Vérifier le backend
                    bat """
                        curl -f http://localhost:8000/health || echo "Backend health check failed"
                    """
                    
                    // Vérifier le frontend si déployé
                    if (params.FRONTEND_IMAGE && params.FRONTEND_IMAGE_TAG) {
                        bat """
                            curl -f http://localhost:3000 || echo "Frontend health check failed"
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo "Déploiement réussi !"
            echo "Backend: ${params.BACKEND_IMAGE}:${params.BACKEND_IMAGE_TAG}"
            if (params.FRONTEND_IMAGE && params.FRONTEND_IMAGE_TAG) {
                echo "Frontend: ${params.FRONTEND_IMAGE}:${params.FRONTEND_IMAGE_TAG}"
            }
        }
        failure {
            echo "Le déploiement a échoué, vérifiez les logs."
        }
    }
}
```

## Alternative : Utiliser PowerShell pour Windows

Si vous êtes sur Windows et préférez PowerShell :

```groovy
stage('Update docker-compose.yml') {
    steps {
        script {
            def composeFile = 'docker-compose.yaml'
            
            // Script PowerShell pour mettre à jour le fichier
            bat """
                powershell -ExecutionPolicy Bypass -Command ^
                "$content = Get-Content '${composeFile}' -Raw; ^
                $content = $content -replace '(backend:.*?image:\\s+)[^\\r\\n]+', '\$1${params.BACKEND_IMAGE}:${params.BACKEND_IMAGE_TAG}'; ^
                if ('${params.FRONTEND_IMAGE}' -and '${params.FRONTEND_IMAGE_TAG}') { ^
                    if ($content -match 'frontend:') { ^
                        $content = $content -replace '(frontend:.*?image:\\s+)[^\\r\\n]+', '\$1${params.FRONTEND_IMAGE}:${params.FRONTEND_IMAGE_TAG}' ^
                    } else { ^
                        $frontendBlock = \"`n  frontend:`n    image: ${params.FRONTEND_IMAGE}:${params.FRONTEND_IMAGE_TAG}`n    ports:`n      - \\\"3000:3000\\\"`n    environment:`n      - HOST=0.0.0.0`n      - REACT_APP_API_URL=http://backend:8000`n    depends_on:`n      - backend`n    restart: unless-stopped\"; ^
                        $content = $content -replace '(services:)', '\$1$frontendBlock' ^
                    } ^
                }; ^
                Set-Content '${composeFile}' -Value $content -NoNewline"
            """
        }
    }
}
```

## Flux complet

### Quand le backend est déployé :
1. Pipeline Backend CI → Build + Push image
2. Pipeline Backend CI → Déclenche `backend-deployment-pipeline` avec :
   - `BACKEND_IMAGE=ndiayeinf/backend-fastapi-gtp`
   - `BACKEND_IMAGE_TAG=1.23`
3. Job `backend-deployment-pipeline` → Met à jour docker-compose.yml avec le backend
4. Job `backend-deployment-pipeline` → Déploie avec docker-compose

### Quand le frontend est déployé :
1. Pipeline Frontend CI → Build + Push image
2. Pipeline Frontend CI → Déclenche `backend-deployment-pipeline` avec :
   - `FRONTEND_IMAGE=ndiayeinf/frontend-react-gtp`
   - `FRONTEND_IMAGE_TAG=1.23`
3. Job `backend-deployment-pipeline` → Met à jour docker-compose.yml avec le frontend
4. Job `backend-deployment-pipeline` → Déploie avec docker-compose (backend + frontend)

## Points importants

1. **Paramètres optionnels** : Les paramètres FRONTEND_IMAGE et FRONTEND_IMAGE_TAG peuvent être vides si seul le backend est déployé
2. **Préservation** : Le script doit préserver les autres services (PostgreSQL, PGAdmin) dans docker-compose.yml
3. **Dépendances** : Le frontend dépend du backend (depends_on: backend)
4. **Variables d'environnement** : Le frontend doit pointer vers `http://backend:8000` pour l'API

## Vérification

Après configuration, testez :

1. Déclencher le job avec seulement BACKEND_IMAGE et BACKEND_IMAGE_TAG → Seul le backend doit être mis à jour
2. Déclencher le job avec FRONTEND_IMAGE et FRONTEND_IMAGE_TAG → Le frontend doit être ajouté/mis à jour
3. Déclencher le job avec les 4 paramètres → Les deux services doivent être déployés

