import React, { useState, useEffect } from 'react';
import EmployeeModal from './components/EmployeeModal';
import EmployeeCard from './components/EmployeeCard';
import { employeeService } from './services/employeeService';
import './styles/App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getAllEmployees();
      console.log('Employés chargés:', data);
      // S'assurer que data est un tableau
      const employeesArray = Array.isArray(data) ? data : [];
      setEmployees(employeesArray);
      console.log(`Nombre d'employés affichés: ${employeesArray.length}`);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      // Afficher un message d'erreur à l'utilisateur
      alert(`Erreur lors du chargement des employés: ${error.message}`);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (employeeData) => {
    try {
      await employeeService.createEmployee(employeeData);
      await loadEmployees();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating employee:', error);
    }
  };

  const handleUpdateEmployee = async (employeeData) => {
    try {
      await employeeService.updateEmployee(editingEmployee.id, employeeData);
      await loadEmployees();
      setIsModalOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await employeeService.deleteEmployee(employeeId);
        await loadEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  // 🔹 Filtrage (nom, prénom, poste, email, matricule)
  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.nom || ''} ${employee.prenom || ''}`.toLowerCase();
    const poste = (employee.poste || '').toLowerCase();
    const matricule = (employee.matricule || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    return fullName.includes(term) || poste.includes(term) || matricule.includes(term);
  });

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="app-header">
          <h1 className="app-title">
            <i className="fas fa-users"></i>
            Gestion des Employés
          </h1>
          <p className="app-subtitle">Application CRUD moderne et responsive</p>
        </header>

        {/* Controls */}
        <div className="controls">
          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-secondary"
              onClick={loadEmployees}
              title="Rafraîchir la liste"
            >
              <i className="fas fa-sync-alt"></i>
              Actualiser
            </button>
            <button 
              className="btn btn-primary"
              onClick={openCreateModal}
            >
              <i className="fas fa-plus"></i>
              Nouvel Employé
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Chargement des employés...</p>
          </div>
        )}

        {/* Employees Grid */}
        <div className="employees-grid">
          {filteredEmployees.map(employee => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={openEditModal}
              onDelete={handleDeleteEmployee}
            />
          ))}
        </div>

        {/* Empty State */}
        {!loading && filteredEmployees.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-user-slash"></i>
            <h3>Aucun employé trouvé</h3>
            <p>
              {searchTerm 
                ? "Aucun employé ne correspond à votre recherche"
                : "Commencez par ajouter un nouvel employé"
              }
            </p>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <EmployeeModal
            employee={editingEmployee}
            onSave={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
}

export default App;
