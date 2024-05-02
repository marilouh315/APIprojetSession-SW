const appJSModel = require("../models/appJS.model.js");

/**
 * Afficher toutes les tâches 
 * @param {*} req 
 * @param {*} res 
 */
exports.afficherToutesTaches = (req, res) => {

    appJSModel.afficherToutesTaches()
    .then((taches_resultat) => {
        if (!taches_resultat) {
            res.status(404).json;
            res.send({
                erreur: `Donnée(s) non trouvée(s).`,
                message: `Aucunes tâches ont été trouvées.`
            });
            return;
        }
        //Si fonctionné
        else {
            res.status(200).json({
                result: taches_resultat,
            });
        }
    })
    .catch((erreur) => {
        console.log('Erreur : ', erreur);
        res.status(500).json
        res.send({
            erreur: `Erreur serveur`,
            message: "Erreur lors de la récupération de toutes les tâches."
        });
    });
}

/**
 * Afficher toutes les tâches par défaut (incomplètes)
 */
exports.afficherTachesParDefaut = (req, res) => {

    appJSModel.afficherTachesParDefaut()
    .then((taches_resultat) => {
        if (!taches_resultat) {
            res.status(404).json;
            res.send({
                erreur: `Donnée(s) non trouvée(s).`,
                message: `Aucunes tâches par défaut ont été trouvées.`
            });
            return;
        }
        //Si fonctionné
        else {
            res.status(200).json({
                result: taches_resultat,
            });
        }
    })
    .catch((erreur) => {
        console.log('Erreur : ', erreur);
        res.status(500).json
        res.send({
            erreur: `Erreur serveur`,
            message: "Erreur lors de la récupération des tâches par défaut."
        });
    });
}

///////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Affiche le détail d'une tâche (avec ses sous-tâches, s'il y a lieu)
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.afficherDetailTache = (req, res) => {
    const id_tache = parseInt(req.params.id_tache);

    // Teste si le paramètre id est présent et valide
    if(!id_tache || id_tache === undefined || id_tache === null || isNaN(id_tache) || id_tache <= 0){
        res.status(400).json;
        res.send({
            erreur: `Erreur des données.`,
            message: "L'id de la tâche est obligatoire et doit être supérieur à 0.",
            champs_manquants: ["id_tache"]
        });
        return;
    }
    appJSModel.verifierExistenceID(id_tache)
    .then((idExiste) => {
        if (idExiste == false) {
            res.status(400).json;
            res.send({
                erreur: `Erreur des données.`,
                message: `Le id ${id_tache} n'existe pas dans la base de donnée.`
            });
            return;
        }
        else {
            appJSModel.afficherDetailTache(id_tache)
            .then((tache_resultat) => {
                if (!tache_resultat) {
                    res.status(404).json;
                    res.send({
                        erreur: `Donnée(s) non trouvée(s).`,
                        message: `La tâche est introuvable avec l'id ${id_tache}.`
                    });
                    return;
                }
                else {
                    appJSModel.afficherSousTaches(id_tache)
                    .then((sous_tache_resultat) => {
                        if (sous_tache_resultat){
                            // Ajouter le tableau de sous-tâches aux détails de la tâche
                            tache_resultat[0].sous_taches = sous_tache_resultat;
                            // Envoyer la réponse JSON avec les détails de la tâche et ses sous-tâches
                            res.status(200).json({
                                result: {
                                    taches: tache_resultat
                                }
                            });
                        }
                        else {
                            res.status(404).json;
                            res.send({
                                erreur: `Donnée(s) non trouvée(s).`,
                                message: `Aucunes données trouvées avec l'id ${id_tache}.`
                            });
                            return;
                        }
                    })
                    .catch(err => {
                        console.error("Erreur :", err);
                        res.status(500).json({
                            erreur: "Erreur serveur",
                            message: "Une erreur s'est produite lors de la récupération des sous-tâches."
                        });
                    });
                }
            })
            // S'il y a eu une erreur au niveau de la requête, on retourne un erreur 500 car c'est du serveur que provient l'erreur.
            .catch((erreur) => {
                console.log('Erreur : ', erreur);
                res.status(500).json
                res.send({
                    erreur: `Erreur serveur`,
                    message: `Erreur lors de la récupération de la tâche.`
                });
            });
        }//else
    })
    .catch(erreur => {
        console.log('Erreur : ', erreur);
        res.status(500).json
        res.send({
            erreur: `Erreur serveur`,
            message: `Erreur lors de la vérification de l'existence du ID de la tâche dans la bd.`
        });
    });
}
//////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Ajoute une tâche et vérifie tout d'abord si le id de l'utilisateur existe
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.ajouterTache = (req, res) => {
    const {
        utilisateur_id,
        titre_tache,
        description,
        date_debut,
        date_echeance,
        complete_tache
    } = req.body;

    const champsManquants = [];

    // Vérification de chaque champ et ajout à champsManquants s'il est manquant
    if (!utilisateur_id) champsManquants.push("utilisateur_id");
    if (!titre_tache) champsManquants.push("titre_tache");
    if (!description) champsManquants.push("description");
    if (!date_debut) champsManquants.push("date_debut");
    if (!date_echeance) champsManquants.push("date_echeance");
    if (complete_tache === undefined || complete_tache === null) {
        champsManquants.push("complete_tache");
    } 
    if (champsManquants.length > 0) {
        return res.status(400).json({
            erreur: `Donnée(s) non valide(s).`,
            message: `Le format des données est invalide.`,
            champs_manquants: champsManquants
        });
    }

    if (complete_tache !== false && complete_tache !== true) {
        res.status(400).json;
        res.send({
            erreur: `Erreur des données.`,
            message: `Le champ 'complete_tache' est un booléean, seulement true or false.`
        });
        return;
    }
    
    appJSModel.verifierExistenceIdUtilisateur(utilisateur_id)
    .then((existe) => {
        if (!existe) {
            res.status(400).json;
            res.send({
                erreur: `Erreur des données.`,
                message: `Le id de l'utilisateur entré ${utilisateur_id} n'existe pas dans la base de donnée.`
            });
            return;
        }
        else {
            appJSModel.ajouterTache(
                utilisateur_id, titre_tache, description, date_debut, date_echeance, complete_tache
            )
            .then((tache_ajoute) => {
                if (!tache_ajoute) {
                    res.status(404).json;
                    res.send({
                        erreur: `Erreur d'ajout.`,
                        message: `La tache n'a pas pu être ajoutée. Un problème est survenu.`
                    });
                    return;
                }
                else {
                    const last_insertID = tache_ajoute.insertId; // Récupérer l'ID de la tâche nouvellement ajoutée
                    res.status(200).json({
                        message: `La tâche : ${titre_tache} (ID: ${last_insertID}) a été ajoutée avec succès!`,
                        tache_ajoutee: {
                            last_insertID,
                            utilisateur_id,
                            titre_tache,
                            description,
                            date_debut,
                            date_echeance,
                            complete_tache
                        }
                    });
                }
            })
            // S'il y a eu une erreur au niveau de la requête, on retourne une erreur 500 car c'est du serveur que provient l'erreur.
            .catch((erreur) => {
                console.log('Erreur : ', erreur);
                res.status(500);
                res.send({
                    erreur: `Erreur serveur`,
                    message: "Erreur lors de l'ajout de la tâche."
                });
            });
        }
    })
     // S'il y a eu une erreur au niveau de la requête, on retourne une erreur 500 car c'est du serveur que provient l'erreur.
    .catch((erreur) => {
        console.log('Erreur : ', erreur);
        res.status(500);
        res.send({
            erreur: `Erreur serveur`,
            message: "Erreur lors de la vérification de l'existence du ID de l'utilisateur dans la bd."
        });
    }); 
}
//////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Modifier le statut d'une tâche
 * @param {*} req 
 * @param {*} res 
 */
exports.modifierStatutTache = (req, res) => {
    const {
        complete_tache,
        id_tache
    } = req.body;
    const champsManquants = [];

    if (complete_tache === undefined || complete_tache === null) {
        champsManquants.push("complete_tache");
    } 
    if (!id_tache) champsManquants.push("id_tache");

    if (champsManquants.length > 0) {
        return res.status(400).json({
            erreur: `Donnée(s) non valide(s).`,
            message: `Le format des données est invalide. Tous les champs sont obligatoires.`,
            champs_manquants: champsManquants
        });
    }

    if (complete_tache !== false && complete_tache !== true) {
        res.status(400).json;
        res.send({
            erreur: `Erreur des données.`,
            message: `Le champ 'complete_tache' est un booléean, seulement true or false.`
        });
        return;
    } 

    appJSModel.verifierExistenceID(id_tache)
    .then((idExiste) => {
        if (idExiste == false) {
            res.status(400).json;
            res.send({
                erreur: `Erreur des données.`,
                message: `Le id ${id_tache} n'existe pas dans la base de donnée.`
            });
            return;
        }
        else {
            const cleApi = req.headers.authorization;
            appJSModel.validerAuthorization(id_tache, cleApi)
            .then((cleValide) => {
                if (!cleValide) {
                    return res.status(403).json({
                        erreur: `Accès refusé.`,
                        message: `Vous n'êtes pas autorisé à modifier le statut de cette tâche. Clé API invalide ou manquante.`
                    });
                } 
                else {
                    appJSModel.modifierStatutTache(complete_tache, id_tache)
                    .then((resultat_modif_statut) => {
                        if (!resultat_modif_statut) {
                            res.status(404).json;
                            res.send({
                                erreur: `Erreur de modification.`,
                                message: `Le statut de la tâche n'a pas pu être modifié. Un problème est survenu.`
                            });
                            return;
                        }
                        else {
                            res.status(200).json({
                                message: `Le statut de la tâche, avec l'id ${id_tache}, a été modifié avec succès. Nouveau statut : ${complete_tache}.`
                            });
                        }
                    })
                    .catch(erreur => {
                        console.log('Erreur : ', erreur);
                        res.status(500).json
                        res.send({
                            erreur: `Erreur serveur`,
                            message: `Erreur lors de la mise à jour du statut de la tâche avec l'ID ${id_tache}.`
                        });
                    });
                }
            })
            .catch(erreur => {
                console.log('Erreur : ', erreur);
                res.status(500).json
                res.send({
                    erreur: `Erreur serveur`,
                    message: `Erreur lors de la validation de la clé API.`
                });
            });
        }
    })
    .catch(erreur => {
        console.log('Erreur : ', erreur);
        res.status(500).json
        res.send({
            erreur: `Erreur serveur`,
            message: `Erreur lors de la vérification de l'existence du ID de la tâche dans la bd.`
        });
    });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Modifier une tâche (au complet)
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.modifierAuCompletTache = (req, res) => {
    const {
        utilisateur_id,
        titre_tache,
        description,
        date_debut,
        date_echeance,
        complete_tache,
        id_tache
    } = req.body;
    const champsManquants = [];

    // Vérification de chaque champ et ajout à champsManquants s'il est manquant
    if (!utilisateur_id) champsManquants.push("utilisateur_id");
    if (!titre_tache) champsManquants.push("titre_tache");
    if (!description) champsManquants.push("description");
    if (!date_debut) champsManquants.push("date_debut");
    if (!date_echeance) champsManquants.push("date_echeance");
    if (complete_tache === undefined || complete_tache === null) {
        champsManquants.push("complete_tache");
    } 
    if (!id_tache) champsManquants.push("id_tache");

    if (champsManquants.length > 0) {
        console.log('complete_tache : ', complete_tache);

        return res.status(400).json({
            erreur: `Donnée(s) non valide(s).`,
            message: `Le format des données est invalide. Tous les champs sont obligatoires.`,
            champs_manquants: champsManquants
        });
    }
    
    if (complete_tache !== false && complete_tache !== true) {
        res.status(400).json;
        res.send({
            erreur: `Erreur des données.`,
            message: `Le champ 'complete_tache' est un booléean, seulement true or false.`
        });
        return;
    }


    appJSModel.verifierExistenceIdUtilisateur(utilisateur_id)
    .then((existe) => {
        if (!existe) {
            res.status(400).json;
            res.send({
                erreur: `Erreur des données.`,
                message: `Le id de l'utilisateur entré ${utilisateur_id} n'existe pas dans la base de donnée.`
            });
            return;
        }
        else {
            appJSModel.verifierExistenceID(id_tache)
            .then((idExiste) => {
                if (idExiste == false) {
                    res.status(400).json;
                    res.send({
                        erreur: `Erreur des données.`,
                        message: `Le id ${id_tache} n'existe pas dans la base de donnée.`
                    });
                    return;
                }
                else {
                    const cleApi = req.headers.authorization;
                    appJSModel.validerAuthorization(id_tache, cleApi)
                    .then((cleValide) => {
                        if (!cleValide) {
                            return res.status(403).json({
                                erreur: `Accès refusé.`,
                                message: `Vous n'êtes pas autorisé à modifier cette tâche. Clé API invalide ou manquante.`
                            });
                        } 
                        else {
                            appJSModel.modifierAuCompletTache(
                                utilisateur_id,
                                titre_tache,
                                description,
                                date_debut,
                                date_echeance,
                                complete_tache,
                                id_tache
                            )
                            .then((resultat_update) => {
                                if (!resultat_update) {
                                    res.status(404).json;
                                    res.send({
                                        erreur: `Erreur de modification.`,
                                        message: `La tache n'a pas pu être modifiée. Un problème est survenu.`
                                    });
                                    return;
                                }
                                else {
                                    res.status(200).json({
                                        message: `La tâche avec l'ID ${id_tache} a été mise à jour avec succès`,
                                        tache_modifiee: {
                                            id_tache,
                                            utilisateur_id,
                                            titre_tache,
                                            description,
                                            date_debut,
                                            date_echeance,
                                            complete_tache
                                        }
                                    });
                                }
                            })
                            .catch(erreur => {
                                console.log('Erreur : ', erreur);
                                res.status(500).json
                                res.send({
                                    erreur: `Erreur serveur`,
                                    message: `Erreur lors de la mise à jour de la tâche avec l'ID ${id_tache}.`
                                });
                            });
                        }
                    })
                    .catch(erreur => {
                        console.log('Erreur : ', erreur);
                        res.status(500).json
                        res.send({
                            erreur: `Erreur serveur`,
                            message: `Erreur lors de la validation de la clé API.`
                        });
                    });
                }
            })
            .catch(erreur => {
                console.log('Erreur : ', erreur);
                res.status(500).json
                res.send({
                    erreur: `Erreur serveur`,
                    message: `Erreur lors de la vérification de l'existence du ID de la tâche dans la bd.`
                });
            });
        }
    })
    .catch((erreur) => {
        console.log('Erreur : ', erreur);
        res.status(500);
        res.send({
            erreur: `Erreur serveur`,
            message: "Erreur lors de la vérification de l'existence du ID de l'utilisateur dans la bd."
        });
    }); 

    
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Supprimer une tâche
 * @param {*} req 
 * @param {*} res 
 */
exports.supprimerTache = (req, res) => {
    const id_tache = parseInt(req.params.id_tache);

    // Teste si le paramètre id est présent et valide
    if(!id_tache || id_tache === undefined || id_tache === null || isNaN(id_tache) || id_tache <= 0){
        res.status(400).json;
        res.send({
            erreur: `Erreur des données.`,
            message: "L'id de la tâche est manquant ou invalide",
            champs_manquants: ["id_tache"]
        });
        return;
    }

    appJSModel.verifierExistenceID(id_tache)
    .then((idExiste) => {
        if (idExiste == false) {
            res.status(400).json;
            res.send({
                erreur: `Erreur des données.`,
                message: `Le id ${id_tache} n'existe pas dans la base de donnée.`
            });
            return;
        }
        else {
            const cleApi = req.headers.authorization;
            appJSModel.validerAuthorization(id_tache, cleApi)
            .then((cleValide) => {
                if (!cleValide) {
                    return res.status(403).json({
                        erreur: `Accès refusé.`,
                        message: `Vous n'êtes pas autorisé à supprimer cette tâche. Clé API invalide ou manquante.`
                    });
                } 
                else {
                    appJSModel.supprimerTache(id_tache)
                    .then((resultat_supprime) => {
                        if (!resultat_supprime) {
                            res.status(404).json;
                            res.send({
                                erreur: `Erreur de suppression.`,
                                message: `La tache n'a pas pu être supprimée. Un problème est survenu.`
                            });
                            return;
                        }
                        else {
                            appJSModel.verifierExistenceID(id_tache)
                            .then((idExiste) => {
                                if (idExiste == false) {
                                    //Ici c'est contre indicatif, mais s'il le id n'existe plus, 
                                    //c'est qu'il a été bel et bien supprimé de la BD
                                    res.status(200).json({
                                        message: `La tâche avec l'ID ${id_tache}, ainsi que tous ses sous-tâches reliées (s'il y a lieu) ont été supprimés avec succès`,
                                    })
                                }
                                else {
                                    //Ici, c'est qu'il est encore présent, et donc n'a pas été correctement supprimé
                                    res.status(404).json;
                                    res.send({
                                        erreur: `Erreur de suppression.`,
                                        message: `La tache n'a pas pu être supprimée. Un problème est survenu.`
                                    });
                                    return;
                                }
                                
                            })
                            .catch(erreur => {
                                console.log('Erreur : ', erreur);
                                res.status(500).json
                                res.send({
                                    erreur: `Erreur serveur`,
                                    message: `Erreur lors de la vérification de l'existence du ID de la tâche dans la bd.`
                                });
                            });
                        }
                    })
                    .catch(erreur => {
                        console.log('Erreur : ', erreur);
                        res.status(500).json
                        res.send({
                            erreur: `Erreur serveur`,
                            message: `Erreur lors de la suppression de la tâche avec l'ID ${id_tache}.`
                        });
                    });
                }
            })
            .catch(erreur => {
                console.log('Erreur : ', erreur);
                res.status(500).json
                res.send({
                    erreur: `Erreur serveur`,
                    message: `Erreur lors de la validation de la clé API.`
                });
            });
        }
    })
    .catch(erreur => {
        console.log('Erreur : ', erreur);
        res.status(500).json
        res.send({
            erreur: `Erreur serveur`,
            message: `Erreur lors de la vérification de l'existence du ID de la tâche dans la bd.`
        });
    });
}







/**
 * Ajoute une tâche et vérifie tout d'abord si le id de l'utilisateur existe
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.ajouterSousTache = (req, res) => {
    const {
        id_tache,
        titre_sous_tache,
        complete_sous_tache
    } = req.body;

    const champsManquants = [];

    // Vérification de chaque champ et ajout à champsManquants s'il est manquant
    if (!id_tache) champsManquants.push("id_tache");
    if (!titre_sous_tache) champsManquants.push("titre_sous_tache");
    if (complete_sous_tache === undefined || complete_sous_tache === null) {
        champsManquants.push("complete_sous_tache");
    } 
    if (champsManquants.length > 0) {
        return res.status(400).json({
            erreur: `Donnée(s) non valide(s).`,
            message: `Le format des données est invalide.`,
            champs_manquants: champsManquants
        });
    }

    if (complete_sous_tache !== false && complete_sous_tache !== true) {
        res.status(400).json;
        res.send({
            erreur: `Erreur des données.`,
            message: `Le champ 'complete_sous_tache' est un booléean, seulement true or false.`
        });
        return;
    }
    
    appJSModel.verifierExistenceID(id_tache)
    .then((existe) => {
        if (!existe) {
            res.status(400).json;
            res.send({
                erreur: `Erreur des données.`,
                message: `Le id de la tâche entré ${id_tache} n'existe pas dans la base de donnée.`
            });
            return;
        }
        else {
            appJSModel.ajouterSousTache(id_tache, titre_sous_tache, complete_sous_tache)
            .then((sous_tache_ajoute) => {
                if (!sous_tache_ajoute) {
                    res.status(404).json;
                    res.send({
                        erreur: `Erreur d'ajout.`,
                        message: `La sous-tâche n'a pas pu être ajoutée. Un problème est survenu.`
                    });
                    return;
                }
                else {
                    res.status(200).json({
                        message: `La sous-tâche : (${titre_sous_tache}) a été ajoutée avec succès!`,
                        sous_tache_ajoutee: {
                            id_tache,
                            titre_sous_tache,
                            complete_sous_tache
                        }
                    });
                }
            })
            // S'il y a eu une erreur au niveau de la requête, on retourne une erreur 500 car c'est du serveur que provient l'erreur.
            .catch((erreur) => {
                console.log('Erreur : ', erreur);
                res.status(500);
                res.send({
                    erreur: `Erreur serveur`,
                    message: "Erreur lors de l'ajout de la sous-tâche."
                });
            });
        }
    })
     // S'il y a eu une erreur au niveau de la requête, on retourne une erreur 500 car c'est du serveur que provient l'erreur.
     .catch((erreur) => {
        console.log('Erreur : ', erreur);
        res.status(500);
        res.send({
            erreur: `Erreur serveur`,
            message: "Erreur lors de la vérification de l'existence du ID de l'utilisateur dans la bd."
        });
    }); 
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Modifier le statut d'une sous-tâche
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.modifierStatutSousTache = (req, res) => {
    const {
        complete_sous_tache,
        id_sous_tache
    } = req.body;
    const champsManquants = [];

    if (complete_sous_tache === undefined || complete_sous_tache === null) {
        champsManquants.push("complete_sous_tache");
    } 
    if (!id_tache || id_tache === undefined || id_tache === null || isNaN(id_tache) || id_tache <= 0) champsManquants.push("id_sous_tache");

    if (champsManquants.length > 0) {
        return res.status(400).json({
            erreur: `Donnée(s) non valide(s).`,
            message: `Le format des données est invalide. Tous les champs sont obligatoires.`,
            champs_manquants: champsManquants
        });
    }

    if (complete_sous_tache !== false && complete_sous_tache !== true) {
        res.status(400).json;
        res.send({
            erreur: `Erreur des données.`,
            message: `Le champ 'complete_sous_tache' est un booléean, seulement true or false.`
        });
        return;
    }

    appJSModel.verifierExistenceIdSousTache(id_sous_tache)
    .then((idExiste) => {
        if (idExiste == false) {
            res.status(400).json;
            res.send({
                erreur: `Erreur des données.`,
                message: `Le id de la sous-tâche ${id_sous_tache} n'existe pas dans la base de donnée.`
            });
            return;
        }
        else {
            const cleApi = req.headers.authorization;
            appJSModel.validerAuthorizationSousTaches(id_sous_tache, cleApi)
            .then((cleValide) => {
                if (!cleValide) {
                    return res.status(403).json({
                        erreur: `Accès refusé.`,
                        message: `Vous n'êtes pas autorisé à modifier le statut de cette sous-tâche. Clé API invalide ou manquante.`
                    });
                }
                else {
                    appJSModel.modifierStatutSousTache(complete_sous_tache, id_sous_tache)
                    .then((resultat_modif_statut) => {
                        if (!resultat_modif_statut) {
                            res.status(404).json;
                            res.send({
                                erreur: `Erreur de modification.`,
                                message: `Le statut de la sous-tâche n'a pas pu être modifié. Un problème est survenu.`
                            });
                            return;
                        }
                        else {
                            res.status(200).json({
                                message: `Le statut de la sous-tâche, avec l'id ${id_sous_tache}, a été modifié avec succès. Nouveau statut : ${complete_sous_tache}.`
                            });
                        }
                    })
                    .catch(erreur => {
                        console.log('Erreur : ', erreur);
                        res.status(500).json
                        res.send({
                            erreur: `Erreur serveur`,
                            message: `Erreur lors de la mise à jour du statut de la sous-tâche avec l'ID ${id_sous_tache}.`
                        });
                    });
                }

            })
            .catch(erreur => {
                console.log('Erreur : ', erreur);
                res.status(500).json
                res.send({
                    erreur: `Erreur serveur`,
                    message: `Erreur lors de la validation de la clé API.`
                });
            });
        }
    })
    .catch(erreur => {
        console.log('Erreur : ', erreur);
        res.status(500).json
        res.send({
            erreur: `Erreur serveur`,
            message: `Erreur lors de la vérification de l'existence du ID de la sous-tâche dans la bd.`
        });
    });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Modifier une sous-tâche (au complet)
 * @param {*} req 
 * @param {*} res 
 */
exports.modifierAuCompletSousTache = (req, res) => {
    const {
        id_tache,
        titre_sous_tache,
        complete_sous_tache,
        id_sous_tache
    } = req.body;
    const champsManquants = [];

    // Vérification de chaque champ et ajout à champsManquants s'il est manquant
    if (!titre_sous_tache) champsManquants.push("titre_sous_tache");
    if (complete_sous_tache === undefined || complete_sous_tache === null) {
        champsManquants.push("complete_sous_tache");
    } 
    if (!id_tache) champsManquants.push("id_tache");
    if (!id_sous_tache) champsManquants.push("id_sous_tache");

    if (champsManquants.length > 0) {
        return res.status(400).json({
            erreur: `Donnée(s) non valide(s).`,
            message: `Le format des données est invalide. Tous les champs sont obligatoires.`,
            champs_manquants: champsManquants
        });
    }

    if (complete_sous_tache !== false && complete_sous_tache !== true) {
        res.status(400).json;
        res.send({
            erreur: `Erreur des données.`,
            message: `Le champ 'complete_sous_tache' est un booléean, seulement true or false.`
        });
        return;
    }


    appJSModel.verifierExistenceID(id_tache)
    .then((idExiste) => {
        if (idExiste == false) {
            res.status(400).json;
            res.send({
                erreur: `Erreur des données.`,
                message: `Le id ${id_tache} n'existe pas dans la base de donnée.`
            });
            return;
        }
        else {
            appJSModel.verifierExistenceIdSousTache(id_sous_tache)
            .then((idExiste) => {
                if (idExiste == false) {
                    res.status(400).json;
                    res.send({
                        erreur: `Erreur des données.`,
                        message: `Le id de la sous-tâche ${id_sous_tache} n'existe pas dans la base de donnée.`
                    });
                    return;
                }
                else {
                    const cleApi = req.headers.authorization;
                    appJSModel.validerAuthorizationSousTaches(id_sous_tache, cleApi)
                    .then((cleValide) => {
                        if (!cleValide) {
                            return res.status(403).json({
                                erreur: `Accès refusé.`,
                                message: `Vous n'êtes pas autorisé à modifier cette sous-tâche. Clé API invalide ou manquante.`
                            });
                        }
                        else {
                            appJSModel.modifierAuCompletSousTache(
                                id_tache,
                                titre_sous_tache,
                                complete_sous_tache,
                                id_sous_tache
                            )
                            .then((resultat_update) => {
                                if (!resultat_update) {
                                    res.status(404).json;
                                    res.send({
                                        erreur: `Erreur de modification.`,
                                        message: `La sous-tâche n'a pas pu être modifiée. Un problème est survenu.`
                                    });
                                    return;
                                }
                                else {
                                    res.status(200).json({
                                        message: `La sous-tâche avec l'ID ${id_sous_tache} a été mise à jour avec succès`,
                                        sous_tache_modifiee: {
                                            id_tache,
                                            titre_sous_tache,
                                            complete_sous_tache
                                        }
                                    });
                                }
                            })
                            .catch(erreur => {
                                console.log('Erreur : ', erreur);
                                res.status(500).json
                                res.send({
                                    erreur: `Erreur serveur`,
                                    message: `Erreur lors de la mise à jour de la sous-tâche avec l'ID ${id_tache}.`
                                });
                            });
                        }
                    })
                    .catch(erreur => {
                        console.log('Erreur : ', erreur);
                        res.status(500).json
                        res.send({
                            erreur: `Erreur serveur`,
                            message: `Erreur lors de la validation de la clé API.`
                        });
                    });
                }
            })
            .catch(erreur => {
                console.log('Erreur : ', erreur);
                res.status(500).json
                res.send({
                    erreur: `Erreur serveur`,
                    message: `Erreur lors de la vérification de l'existence du ID de la sous-tâche dans la bd.`
                });
            });
        }
    })
    .catch(erreur => {
        console.log('Erreur : ', erreur);
        res.status(500).json
        res.send({
            erreur: `Erreur serveur`,
            message: `Erreur lors de la vérification de l'existence du ID de la tâche dans la bd.`
        });
    });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Supprimer une sous-tâche
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.supprimerSousTache = (req, res) => {
    const id_sous_tache = parseInt(req.params.id_sous_tache);

    // Teste si le paramètre id est présent et valide
    if(!id_sous_tache || parseInt(id_sous_tache) < 0){
        res.status(400).json;
        res.send({
            erreur: `Erreur des données.`,
            message: "L'id de la sous-tâche est obligatoire et doit être supérieur à 0.",
            champs_manquants: ["id_sous_tache"]
        });
        return;
    }

    appJSModel.verifierExistenceIdSousTache(id_sous_tache)
    .then((idExiste) => {
        if (idExiste == false) {
            res.status(400).json;
            res.send({
                erreur: `Erreur des données.`,
                message: `Le id de la sous-tâche ${id_sous_tache} n'existe pas dans la base de donnée.`
            });
            return;
        }
        else {
            const cleApi = req.headers.authorization;
            appJSModel.validerAuthorizationSousTaches(id_sous_tache, cleApi)
            .then((cleValide) => {
                if (!cleValide) {
                    return res.status(403).json({
                        erreur: `Accès refusé.`,
                        message: `Vous n'êtes pas autorisé à supprimer cette sous-tâche. Clé API invalide ou manquante.`
                    });
                }
                else {
                    appJSModel.supprimerSousTache(id_sous_tache)
                    .then((resultat_supprime) => {
                        if (!resultat_supprime) {
                            res.status(404).json;
                            res.send({
                                erreur: `Erreur de suppression.`,
                                message: `La sous-tache n'a pas pu être supprimée. Un problème est survenu.`
                            });
                            return;
                        }
                        else {
                            appJSModel.verifierExistenceIdSousTache(id_sous_tache)
                            .then((idExiste) => {
                                if (idExiste == false) {
                                    //Ici c'est contre indicatif, mais s'il le id n'existe plus, 
                                    //c'est qu'il a été bel et bien supprimé de la BD
                                    res.status(200).json({
                                        message: `La sous-tâche avec l'ID ${id_sous_tache} a été supprimé avec succès`,
                                    })
                                }
                                else {
                                    //Ici, c'est qu'il est encore présent, et donc n'a pas été correctement supprimé
                                    res.status(404).json;
                                    res.send({
                                        erreur: `Erreur de suppression.`,
                                        message: `La sous-tâche n'a pas pu être supprimée. Un problème est survenu.`
                                    });
                                    return;
                                }
                                
                            })
                            .catch(erreur => {
                                console.log('Erreur : ', erreur);
                                res.status(500).json
                                res.send({
                                    erreur: `Erreur serveur`,
                                    message: `Erreur lors de la vérification de l'existence du ID de la sous-tâche dans la bd.`
                                });
                            });
                        }
                    })
                    .catch(erreur => {
                        console.log('Erreur : ', erreur);
                        res.status(500).json
                        res.send({
                            erreur: `Erreur serveur`,
                            message: `Erreur lors de la suppression de la sous-tâche avec l'ID ${id_sous_tache}.`
                        });
                    });
                }
            })
            .catch(erreur => {
                console.log('Erreur : ', erreur);
                res.status(500).json
                res.send({
                    erreur: `Erreur serveur`,
                    message: `Erreur lors de la validation de la clé API.`
                });
            });
        }
    })
    .catch(erreur => {
        console.log('Erreur : ', erreur);
        res.status(500).json
        res.send({
            erreur: `Erreur serveur`,
            message: `Erreur lors de la vérification de l'existence du ID de la sous-tâche dans la bd.`
        });
    });
}


