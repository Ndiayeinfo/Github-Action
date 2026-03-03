// Service pour gérer les employés via l'API backend
class EmployeeService {
  constructor() {
    // Utilise la configuration runtime ou la variable d'environnement ou localhost par défaut
    const apiBaseUrl = 
      (window.APP_CONFIG && window.APP_CONFIG.API_URL) ||
      process.env.REACT_APP_API_URL || 
      'http://localhost:8000';
    this.apiUrl = `${apiBaseUrl}/employees/`; // URL pour les employés
  }

  // Récupérer tous les employés
  async getAllEmployees() {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      // S'assurer que les données sont toujours un tableau
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error);
      throw error;
    }
  }

  // Créer un nouvel employé
  async createEmployee(employeeData) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(employeeData)
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la création de l'employé");
    }
    return await response.json();
  }

  // Mettre à jour un employé
  async updateEmployee(id, employeeData) {
    const response = await fetch(`${this.apiUrl}${id}/`, {
      method: 'PUT', // ou PATCH selon votre API
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(employeeData)
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour de l'employé");
    }
    return await response.json();
  }

  // Supprimer un employé
  async deleteEmployee(id) {
    const response = await fetch(`${this.apiUrl}${id}/`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression de l'employé");
    }
    return true;
  }
}

export const employeeService = new EmployeeService();
