
const express = require('express');
const router = express.Router();
const appJSController = require('../controllers/appJS.controller');

// Afficher toutes les tâches (incomplètes ou toutes)
router.get('/all', appJSController.afficherToutesTaches);
// Afficher toutes les tâches (incomplètes ou toutes)
router.get('/', appJSController.afficherTachesParDefaut);

// Afficher le detail d'une tâche
router.get('/detail/:id_tache', appJSController.afficherDetailTache);
////////////////////////////////////////////////////////////////////////////////////
//Ajouter une tâche
router.post('/tache', appJSController.ajouterTache);

//Modifier le statut d'une tâche
router.put('/tache/update_statut', appJSController.modifierStatutTache);

//Modifier une tâche (au complet)
router.put('/tache', appJSController.modifierAuCompletTache);

//Supprimer une tâche
router.delete('/tache/:id_tache', appJSController.supprimerTache);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Ajouter une sous-tâche
router.post('/sous_tache', appJSController.ajouterSousTache);

//Modifier le statut d'une sous-tâche
router.put('/sous_tache/update_statut', appJSController.modifierStatutSousTache);

//Modifier une sous-tâche (au complet)
router.put('/sous_tache', appJSController.modifierAuCompletSousTache);

//Supprimer une sous-tâche
router.delete('/sous_tache/:id_sous_tache', appJSController.supprimerSousTache);

module.exports = router;
