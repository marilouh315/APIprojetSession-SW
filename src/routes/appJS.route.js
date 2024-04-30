
const express = require('express');
const router = express.Router();
const appJSController = require('../controllers/appJS.controller');
const authentification = require('../middlewares/authentification');

// Afficher toutes les tâches (incomplètes ou toutes)
router.get('/all', authentification, appJSController.afficherToutesTaches);
// Afficher toutes les tâches par défaut (incomplètes)
router.get('/', authentification, appJSController.afficherTachesParDefaut);

// Afficher le detail d'une tâche
router.get('/detail/:id_tache', authentification, appJSController.afficherDetailTache);
////////////////////////////////////////////////////////////////////////////////////
//Ajouter une tâche
router.post('/tache', authentification, appJSController.ajouterTache);

//Modifier le statut d'une tâche
router.put('/tache/update_statut', authentification, appJSController.modifierStatutTache);

//Modifier une tâche (au complet)
router.put('/tache', authentification, appJSController.modifierAuCompletTache);

//Supprimer une tâche
router.delete('/tache/:id_tache', authentification, appJSController.supprimerTache);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Ajouter une sous-tâche
router.post('/sous_tache', authentification, appJSController.ajouterSousTache);

//Modifier le statut d'une sous-tâche
router.put('/sous_tache/update_statut', authentification, appJSController.modifierStatutSousTache);

//Modifier une sous-tâche (au complet)
router.put('/sous_tache', authentification, appJSController.modifierAuCompletSousTache);

//Supprimer une sous-tâche
router.delete('/sous_tache/:id_sous_tache', authentification, appJSController.supprimerSousTache);

module.exports = router;
