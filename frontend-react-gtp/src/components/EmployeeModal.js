import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faSave,
  faUserTie,
  faIdBadge,
  faBriefcase,
  faMoneyBillWave
} from '@fortawesome/free-solid-svg-icons';

const EmployeeModal = ({ employee, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    poste: '',
    salaire: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        matricule: employee.matricule || '',
        nom: employee.nom || '',
        poste: employee.poste || '',
        salaire: employee.salaire || ''
      });
    }
  }, [employee]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.matricule.trim()) newErrors.matricule = 'Le matricule est requis';
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.poste.trim()) newErrors.poste = 'Le poste est requis';
    if (!formData.salaire.trim()) {
      newErrors.salaire = 'Le salaire est requis';
    } else if (isNaN(formData.salaire)) {
      newErrors.salaire = 'Le salaire doit être un nombre';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FontAwesomeIcon icon={faUserTie} style={{marginRight: '10px'}} />
            {employee ? "Modifier l'employé" : "Nouvel employé"}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">

          {/* Matricule */}
          <div className="form-group">
            <label htmlFor="matricule">
              <FontAwesomeIcon icon={faIdBadge} style={{marginRight: '8px'}} />
              Matricule *
            </label>
            <input
              type="text"
              id="matricule"
              name="matricule"
              value={formData.matricule}
              onChange={handleChange}
              className={errors.matricule ? 'error' : ''}
              placeholder="Entrez le matricule"
            />
            {errors.matricule && <span className="error-message">{errors.matricule}</span>}
          </div>

          {/* Nom */}
          <div className="form-group">
            <label htmlFor="nom">
              <FontAwesomeIcon icon={faUserTie} style={{marginRight: '8px'}} />
              Nom *
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={errors.nom ? 'error' : ''}
              placeholder="Entrez le nom"
            />
            {errors.nom && <span className="error-message">{errors.nom}</span>}
          </div>

          {/* Poste */}
          <div className="form-group">
            <label htmlFor="poste">
              <FontAwesomeIcon icon={faBriefcase} style={{marginRight: '8px'}} />
              Poste *
            </label>
            <input
              type="text"
              id="poste"
              name="poste"
              value={formData.poste}
              onChange={handleChange}
              className={errors.poste ? 'error' : ''}
              placeholder="Entrez le poste"
            />
            {errors.poste && <span className="error-message">{errors.poste}</span>}
          </div>

          {/* Salaire */}
          <div className="form-group">
            <label htmlFor="salaire">
              <FontAwesomeIcon icon={faMoneyBillWave} style={{marginRight: '8px'}} />
              Salaire *
            </label>
            <input
              type="number"
              id="salaire"
              name="salaire"
              value={formData.salaire}
              onChange={handleChange}
              className={errors.salaire ? 'error' : ''}
              placeholder="Entrez le salaire"
            />
            {errors.salaire && <span className="error-message">{errors.salaire}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              <FontAwesomeIcon icon={faSave} style={{marginRight: '5px'}} />
              {employee ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
