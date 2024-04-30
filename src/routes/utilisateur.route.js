const express = require('express');
const router = express.Router();
// À ajuster selon la structure
const utilisateurController = require('../controllers/utilisateur.controller');

// Créer nouveau utilisateur
router.post('/', utilisateurController.creerUtilisateur);

//Usager demande une nouvelle clé API associée à son compte
router.put('/', utilisateurController.recevoirNouvCleAPI);

//Afficher les données de l'utilisateur avec le courriel
router.get('/', utilisateurController.afficherUtilisateur)

module.exports = router;


