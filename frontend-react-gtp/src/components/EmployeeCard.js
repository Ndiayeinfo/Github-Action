import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faIdCard, 
  faUserTag, 
  faMoneyBill 
} from '@fortawesome/free-solid-svg-icons';
import '../styles/App.css';

const EmployeeCard = ({ employee, onEdit, onDelete }) => {
  // Formater le salaire avec des séparateurs de milliers
  const formatSalary = (salary) => {
    if (!salary) return "Non renseigné";
    return new Intl.NumberFormat('fr-FR').format(salary) + " FCFA";
  };

  return (
    <div className="employee-card">
      {/* Avatar */}
      <div className="employee-card-header">
        <img 
          src={employee.avatar || `https://i.pravatar.cc/150?u=${employee.matricule || employee.id}`} 
          alt={employee.nom || "Employé"}
          className="employee-avatar"
        />
      </div>

      {/* Nom */}
      <h3 className="employee-name">{employee.nom || "Nom indisponible"}</h3>

      {/* Détails */}
      <div className="employee-details">
        <div className="employee-detail">
          <FontAwesomeIcon icon={faIdCard} className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Matricule</span>
            <span className="detail-value">{employee.matricule || "N/A"}</span>
          </div>
        </div>
        
        <div className="employee-detail">
          <FontAwesomeIcon icon={faUserTag} className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Poste</span>
            <span className="detail-value">{employee.poste || "Non défini"}</span>
          </div>
        </div>
        
        <div className="employee-detail">
          <FontAwesomeIcon icon={faMoneyBill} className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Salaire</span>
            <span className="detail-value">{formatSalary(employee.salaire)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="employee-card-actions">
        <button 
          className="btn-action btn-edit"
          onClick={() => onEdit(employee)}
          title="Modifier"
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>
        <button 
          className="btn-action btn-delete"
          onClick={() => onDelete(employee.id)}
          title="Supprimer"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );
};

export default EmployeeCard;
