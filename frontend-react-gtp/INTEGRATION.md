# Intégration Frontend-Backend

## Configuration actuelle

### Frontend (React)
- **URL**: http://localhost:3000
- **Service API**: `src/services/employeeService.js`
- **URL de l'API Backend**: `http://localhost:8000/employees/`

### Backend (FastAPI)
- **URL**: http://localhost:8000
- **Endpoint**: `/employees/`

## Vérification de la communication

✅ **Backend accessible**: Le backend répond correctement sur `http://localhost:8000/employees/` (Status 200)

✅ **Configuration Frontend**: Le service `employeeService` est configuré pour utiliser `http://localhost:8000/employees/`

## Points importants

1. **CORS (Cross-Origin Resource Sharing)**: 
   - Le frontend s'exécute sur `http://localhost:3000`
   - Le backend doit autoriser les requêtes depuis cette origine
   - Vérifiez que votre backend FastAPI a la configuration CORS suivante :
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. **Fichier de configuration**: 
   - `public/config.js` : Configuration runtime pour l'URL de l'API
   - Modifiable sans rebuild si nécessaire

3. **Test de connexion**:
   - Ouvrez http://localhost:3000 dans votre navigateur
   - Ouvrez la console du navigateur (F12)
   - Vérifiez qu'il n'y a pas d'erreurs CORS
   - Testez la création d'un employé

## Commandes utiles

```bash
# Démarrer le frontend
docker compose up -d

# Voir les logs
docker compose logs -f frontend

# Arrêter le frontend
docker compose down

# Tester l'API backend
curl http://localhost:8000/employees/
```

## Structure des données

L'API attend les données suivantes pour un employé :

```json
{
  "matricule": "EMP-SN-2024-0156",
  "nom": "Amadou Diop",
  "poste": "Développeur Full Stack",
  "salaire": 450000
}
```

