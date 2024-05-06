const utilisateurs = require("../models/utilisateur.model.js");

//CRÉER UTILISATEUR - VÉRIFICATION QUE TOUS LES CHAMPS SONT PRÉSENTS
/**
 * Créer un nouvel utilisateur 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.creerUtilisateur = (req, res) => {

    //tous les champs nécessaires sont présent et que le courriel est unique dans la table.
    const {
        nom_utilisateur,
        courriel_utilisateur,
        motDePasse_utilisateur
    } = req.body;
    const champsManquants = [];

    if (!nom_utilisateur) champsManquants.push("nom_utilisateur");
    if (!courriel_utilisateur) champsManquants.push("courriel_utilisateur");
    if (!motDePasse_utilisateur) champsManquants.push("motDePasse_utilisateur");

    if (champsManquants.length > 0) {
        return res.status(400).json({
            erreur: `Donnée(s) non valide(s).`,
            message: `Le format des données est invalide. Tous les champs sont obligatoires.`,
            champs_manquants: champsManquants
        });
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = regexEmail.test(courriel_utilisateur);
    if (!isValidEmail) {
        return res.status(400).json({
            erreur: `Donnée(s) non valide(s).`,
            message: `Le format du email n'est pas bon. Format : email@email.com`
        });
    }
    

    //Vérifie le courriel unique
    utilisateurs.verifierCourrielUnique(courriel_utilisateur)
    .then(courrielEstUnique => {
        if (courrielEstUnique == false) {
            res.status(400);
            res.send({
                erreur: `Donnée(s) non valide(s).`,
                message: 'Le courriel est déjà utilisé. Veuillez en choisir un autre.'
            });
            return;
        }
        else {
            utilisateurs.verificationCleAPI(8)
            .then(cleAPI => {// Attendez que la promesse soit résolue
                if (!cleAPI) {
                    res.status(404);
                    res.send({
                        erreur: `Errreur de génération de clé d'API.`,
                        message: `La clé d'API n'a pas pu être générée. Un problème est survenu.`
                    });
                    return;
                }
                else {
                    console.log(cleAPI); // Maintenant cleAPI est résolu et contient la clé API générée
                
                    utilisateurs.creerUtilisateur(nom_utilisateur, courriel_utilisateur, motDePasse_utilisateur, cleAPI)
                    .then(resultat_utilisateur => {
                        if (!resultat_utilisateur) {
                            res.status(404).json;
                                res.send({
                                    erreur: `Erreur d'ajout.`,
                                    message: `L'utilisateur n'a pas pu être ajoutée. Un problème est survenu.`
                                });
                                return;
                        }
                        res.status(200).json({
                            message: `L'utilisateur ${nom_utilisateur} a été ajouté avec succès.`,
                            utilisateur_ajoute: {
                                lastID: resultat_utilisateur.insertId,
                                nom_utilisateur,
                                courriel_utilisateur,
                                motDePasse_utilisateur,
                                cleAPI
                            }
                        });
                    })
                    .catch(erreur => {
                        console.log('Erreur : ', erreur);
                        res.status(500).json
                        res.send({
                            erreur: `Erreur serveur`,
                            message: `Erreur lors de l\'ajout de l\'utilisateur.`
                        });
                    });
                }
            })
            .catch(erreur => {
                console.log('Erreur : ', erreur);
                res.status(500).json
                res.send({
                    erreur: `Erreur serveur`,
                    message: `Erreur lors de la génération de la clé API.`
                });
            });
        }
    })
    .catch(erreur => {
        console.log('Erreur : ', erreur);
        res.status(500).json
        res.send({
            erreur: `Erreur serveur`,
            message: `Erreur lors de la vérification du courriel.`
        });
    });    
};

//////////////////////////////////////////////////////////////////////////////////////////
/**
 * Génère une nouvelle clé d'API et l'enregistre comme nouvelle clé dans la BD
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.recevoirNouvCleAPI = (req, res) => {
    const {
        courriel_utilisateur,
        motDePasse_utilisateur
    } = req.body;
    const champsManquants = [];

    if (!courriel_utilisateur) champsManquants.push("courriel_utilisateur");
    if (!motDePasse_utilisateur) champsManquants.push("motDePasse_utilisateur");

    if (champsManquants.length > 0) {
        return res.status(400).json({
            erreur: `Donnée(s) non valide(s).`,
            message: `Le format des données est invalide. Tous les champs sont obligatoires.`,
            champs_manquants: champsManquants
        });
    }

    utilisateurs.verifierChampsCorrespondent(courriel_utilisateur, motDePasse_utilisateur)
    .then(champsCorrespondent => {
        if (!champsCorrespondent) {
            return res.status(404).json({
                erreur: `Donnée(s) non valide(s).`,
                message: `Mauvais courriel ou mot de passe. Les champs passés en paramètre ne correspondent pas.`
            });
        }
        else {
            utilisateurs.verificationCleAPI(8)
            .then(nouvelleCleAPI => {// Attendez que la promesse soit résolue
                if (!nouvelleCleAPI) {
                    res.status(404);
                    res.send({
                        erreur: `Errreur de génération de clé d'API.`,
                        message: `La clé d'API n'a pas pu être générée. Un problème est survenu.`
                    });
                    return;
                }
                else {
                    console.log(nouvelleCleAPI); // Maintenant cleAPI est résolu et contient la clé API générée
                
                    utilisateurs.updateCleAPI(courriel_utilisateur, nouvelleCleAPI)
                    .then(resultat_update => {
                        if (!resultat_update) {
                            res.status(404).json;
                                res.send({
                                    erreur: `Erreur de modification.`,
                                    message: `L'utilisateur n'a pas pu être modifié. Un problème est survenu.`
                                });
                                return;
                        }
                        res.status(200).json({
                            message: `Voici la nouvelle clé d'API générée : ${nouvelleCleAPI}`
                        });
                    })
                    .catch(erreur => {
                        console.log('Erreur : ', erreur);
                        res.status(500).json
                        res.send({
                            erreur: `Erreur serveur`,
                            message: `Erreur lors de la modification de la clé d'API pour l'utilisateur avec le courriel ${courriel_utilisateur}.`
                        });
                    });
                }
            })
            .catch(erreur => {
                console.log('Erreur : ', erreur);
                res.status(500).json
                res.send({
                    erreur: `Erreur serveur`,
                    message: `Erreur lors de la génération de la clé API.`
                });
            });
        }
    }) 
    .catch(erreur => {
        console.log('Erreur : ', erreur);
        res.status(500).json
        res.send({
            erreur: `Erreur serveur`,
            message: `Erreur lors de la vérification des champs : courriel et mot de passe.`
        });
    });
}


/////////////////////////////////////////////////////////////////////////////////////////
/**
 * Affiche la clé d'API d'un utilisateur 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.afficherUtilisateur = (req, res) => {
    const {
        courriel_utilisateur,
        motDePasse_utilisateur
    } = req.body;
    const champsManquants = [];

    if (!courriel_utilisateur) champsManquants.push("courriel_utilisateur");
    if (!motDePasse_utilisateur) champsManquants.push("motDePasse_utilisateur");

    if (champsManquants.length > 0) {
        return res.status(400).json({
            erreur: `Donnée(s) non valide(s).`,
            message: `Le courriel et le mot de passe sont obligatoires pour vérifier la clé d'API.`,
            champs_manquants: champsManquants
        });
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = regexEmail.test(courriel_utilisateur);
    if (!isValidEmail) {
        return res.status(400).json({
            erreur: `Donnée(s) non valide(s).`,
            message: `Le format du email n'est pas bon. Format : email@email.com`
        });
    }

    utilisateurs.verifierChampsCorrespondent(courriel_utilisateur, motDePasse_utilisateur)
    .then(champsCorrespondent => {
        if (!champsCorrespondent) {
            return res.status(404).json({
                erreur: `Donnée(s) non valide(s).`,
                message: `Mauvais courriel ou mot de passe. Les champs passés en paramètre ne correspondent pas.`
            });
        }
        else {
            utilisateurs.getDonnees(courriel_utilisateur)
            .then(resultat_donnees => {
                if (!resultat_donnees) {
                    res.status(404).json;
                    res.send({
                        erreur: `Donnée(s) non trouvée(s).`,
                        message: `Les données sont introuvables pour l'utilisateur avec le courriel : ${courriel_utilisateur}.`
                    });
                    return;
                }
                else {
                    res.status(200).json({
                        message: `Voici la clé d'API assignée au compte (${courriel_utilisateur}) : ${resultat_donnees[0].cle_api}`
                    });
                }
            })
            .catch(erreur => {
                console.log('Erreur : ', erreur);
                res.status(500).json
                res.send({
                    erreur: `Erreur serveur`,
                    message: `Erreur lors de la récupération des données.`
                });
            });
        }
    })
    .catch(erreur => {
        console.log('Erreur : ', erreur);
        res.status(500).json
        res.send({
            erreur: `Erreur serveur`,
            message: `Erreur lors de la vérification des champs : courriel et mot de passe.`
        });
    });
}

//////////////////////////////////////////////////////////////////////////////////////////  
/**
 * Affiche tous les utilisateurs
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.afficherTousUtilisateurs = (req, res) => {
    utilisateurs.afficherTousUtilisateurs()
    .then(resultat_utilisateurs => {
        if (!resultat_utilisateurs) {
            res.status(404).json;
            res.send({
                erreur: `Donnée(s) non trouvée(s).`,
                message: `Les données sont introuvables pour les utilisateurs.`
            });
            return;
        }
        else {
            res.status(200).json({
                message: `Voici les utilisateurs : `,
                utilisateurs: resultat_utilisateurs
            });
        }
    })
    .catch(erreur => {
        console.log('Erreur : ', erreur);
        res.status(500).json
        res.send({
            erreur: `Erreur serveur`,
            message: `Erreur lors de la récupération des données.`
        });
    });
}