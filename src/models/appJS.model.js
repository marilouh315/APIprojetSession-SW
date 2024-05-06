const sql = require("../config/db_pg.js");

const Taches = (taches) => {}

/**
 * Vérifie si le id passé, existe
 * @param {Le id d'une tâche (pas une sous-tâche)} id_tache 
 * @returns 
 */
Taches.verifierExistenceID = (id_tache) => {
    return new Promise((resolve, reject) => {
        const requete = "SELECT COUNT(*) AS nbre_id FROM taches WHERE id = $1";
        sql.query(requete, [id_tache], (err, resultats) => {
            if (err) {
                reject(err);
                return;
            }
            else {
                resolve(resultats.rows[0].nbre_id > 0);
            }
        });
    });
}

/**
 * Vérifie si le id de la sous-tâche passé, existe
 * @param {Le id d'une sous-tâche } id_sous_tache 
 * @returns 
 */
Taches.verifierExistenceIdSousTache = (id_sous_tache) => {
    return new Promise((resolve, reject) => {
        const requete = "SELECT COUNT(*) AS nbre_id FROM sous_tache WHERE id = $1";
        sql.query(requete, [id_sous_tache], (err, resultats) => {
            if (err) {
                reject(err);
                return;
            }
            else {
                resolve(resultats.rows[0].nbre_id > 0);
            }
        });
    });
}

/**
 * Obtenir l'ID de l'utilisateur avec la clé API
 * @param {La clé d'API} cleApi 
 * @returns 
 */
Taches.obtenirIDUtilisateur = (cleApi) => {
    return new Promise((resolve, reject) => {
        let requete = "SELECT id FROM utilisateur WHERE cle_api = $1";
        let params = [cleApi];
        sql.query(requete, params, (erreur, resultats) => {
            if (erreur) {
                console.log(erreur);
                reject(erreur);
            } else {
                resolve(resultats.rows[0].utilisateur_id);
            }
        });
    });
}
///////////////////////////////////////////////////////////////////////////////////
/**
 * Affiche toutes les tâches 
 * @param {La clé d'API de l'utilisateur} cleAPI
 */
Taches.afficherToutesTaches = (cleAPI) => {
    return new Promise((resolve, reject) => {
        const utilisateur_id = Taches.obtenirIDUtilisateur(cleAPI);
        const requete = `SELECT t.id, t.titre, t.complete FROM taches t WHERE utilisateur_id = $1`;
        const params = [utilisateur_id];
        sql.query(requete, params, (erreur, resultat) => {
            if (erreur) {
                reject(erreur);
            }
            else {
                resolve(resultat.rows);
            }
        })
    })
    
}
/**
 * Affiche toutes les tâches par défaut (incomplètes) 
 * @param {La clé d'API de l'utilisateur} cleAPI
 */
Taches.afficherTachesParDefaut = (cleAPI) => {

    return new Promise((resolve, reject) => {
        const utilisateur_id = Taches.obtenirIDUtilisateur(cleAPI);
        const requete = `SELECT t.id, t.titre, t.complete FROM taches t WHERE complete = false AND utilisateur_id = $1`;
        const params = [utilisateur_id];
        sql.query(requete, params, (erreur, resultat) => {
            if (erreur) {
                reject(erreur);
            }
            else{
                resolve(resultat.rows);
            }
        })
    })
    
}
///////////////////////////////////////////////////////////////////////////////////
/**
 * Affiche le détail d'une tâche (et de ses sous-tâches, s'il y a lieu)
 * @param {Le id d'une tâche (pas une sous-tâche)} id_tache 
 * @param {La clé d'API de l'utilisateur} cle_api
 * @returns Boolean (vrai s'il existe ou non)
 */
Taches.afficherDetailTache = (id_tache, cle_api) => {
    return new Promise((resolve, reject) => {
        const utilisateur_id = Taches.obtenirIDUtilisateur(cle_api);
        const requete = `SELECT t.titre AS tache_titre, t.description, t.date_debut, t.date_echeance FROM taches t WHERE t.id = $1 AND t.utilisateur_id = $2`;
        const params = [id_tache, utilisateur_id];

        sql.query(requete, params, (erreur, resultat) => {
            if (erreur) {
                reject(erreur);
            }
            else {
                resolve(resultat.rows);
            }
        })
    })
}
/**
 * Affiches les détails d'une sous-tâche reliée à une tâche
 * @param {Le id d'une tâche (pas une sous-tâche)} id_tache 
 * @returns 
 */
Taches.afficherSousTaches = (id_tache) => {
    return new Promise((resolve, reject) => {
        const requete = `SELECT st.titre AS titre_sous_tache, st.complete AS complete_sous_tache FROM sous_tache st WHERE st.tache_id = $1`;
        const params = [id_tache];

        sql.query(requete, params, (erreur, resultat) => {
            if (erreur) {
                reject(erreur);
            }
            else {
                resolve(resultat.rows);
            }
        })
    })
}
///////////////////////////////////////////////////////////////////////////////////
/**
 * Vérifie si le id de l'utilisateur passé, existe
 * @param {Le id d'un utilisateur} utilisateur_id 
 * @returns 
 */
Taches.verifierExistenceIdUtilisateur = (utilisateur_id) => {
    return new Promise((resolve, reject) => {
        const requete = "SELECT COUNT(*) AS nbre_id FROM utilisateur WHERE id = $1";
        sql.query(requete, [utilisateur_id], (err, resultats) => {
            if (err) {
                reject(err);
                return;
            }
            else {
                resolve(resultats.rows[0].nbre_id > 0);
            }
        });
    });
}
/**
 * Ajoute une tâche
 * @param {La clé d'API de l'utilisateur} cle_api
 * @param {Le titre d'une tâche} titre_tache 
 * @param {La description donnée à une tâche} description 
 * @param {La date de début de la tâche} date_debut 
 * @param {La date d'échéance de la tâche} date_echeance 
 * @param {Le statut de la tâche (complété ou pas)} complete_tache 
 * @returns 
 */
Taches.ajouterTache = (
    cle_api, titre_tache, description, date_debut, date_echeance, complete_tache
) => {
    return new Promise((resolve, reject) => {
        const utilisateur_id = Taches.obtenirIDUtilisateur(cle_api);
        const requete = `INSERT INTO taches (utilisateur_id, titre, description, date_debut, date_echeance, complete) VALUES ($1, $2, $3, $4, $5, $6)`;
        const params = [utilisateur_id, titre_tache, description, date_debut, date_echeance, complete_tache]

        sql.query(requete, params, (erreur, resultat) => {
            if (erreur) {
                reject(erreur);
            }
            else {
                resolve(resultat.rows);
            }
        })
    }) 
}
//////////////////////////////////////////////////////////////////////////////////////////
/**
 * Modifier une tâche (au complet)
 * @param {La clé d'API de l'utilisateur} cle_api
 * @param {Le titre d'une tâche} titre_tache 
 * @param {La description donnée à une tâche} description 
 * @param {La date de début de la tâche} date_debut 
 * @param {La date d'échéance de la tâche} date_echeance 
 * @param {Le statut de la tâche (complété ou pas)} complete_tache 
 * @param {Le id d'une tâche} id_tache
*/
Taches.modifierAuCompletTache = (
    cle_api,
    titre_tache,
    description,
    date_debut,
    date_echeance,
    complete_tache,
    id_tache
) => {
    return new Promise((resolve, reject) => {
        const utilisateur_id = Taches.obtenirIDUtilisateur(cle_api);
        const update_requete = 'UPDATE taches SET utilisateur_id = $1, titre = $2, description = $3, date_debut = $4, date_echeance = $5, complete = $6 WHERE id = $7 AND utilisateur_id = $8';
        const params_update = [utilisateur_id, titre_tache, description, date_debut, date_echeance, complete_tache, id_tache, utilisateur_id]

        sql.query(update_requete, params_update, (erreur, update_resultat) => {
            if (erreur) {
                reject(erreur);
            }
            else {
                resolve(update_resultat.rows);
            }
        })
    }) 

}
//////////////////////////////////////////////////////////////////////////////////////////
/**
 * Modifier le statut d'une tâche
 * @param {Le statut d'une tâche (complétée ou pas)} complete_tache 
 * @param {Le id d'une tâche} id_tache 
 * @param {La clé d'API de l'utilisateur} cle_api
 * @returns 
 */
Taches.modifierStatutTache = (complete_tache, id_tache, cle_api) => {
    const utilisateur_id = Taches.obtenirIDUtilisateur(cle_api);
    return new Promise((resolve, reject) => {
        const update_requete = 'UPDATE taches SET complete = $1 WHERE id = $2 AND utilisateur_id = $3';
        const params_update = [complete_tache, id_tache, utilisateur_id]

        sql.query(update_requete, params_update, (erreur, update_resultat) => {
            if (erreur) {
                reject(erreur);
            }
            else {
                resolve(update_resultat.rows);
            }
        })
    }) 
}
//////////////////////////////////////////////////////////////////////////////////////////
/**
 * Supprime une tâche
 * @param {Le id d'une tâche} id_tache 
 * @returns 
 */
Taches.supprimerTache = (id_tache) => {
    return new Promise((resolve, reject) => {
        // Récupérer les identifiants des sous-tâches liées à la tâche
        const selectSousTachesQuery = 'SELECT id FROM sous_tache WHERE tache_id = $1';
        sql.query(selectSousTachesQuery, [id_tache], (err, sousTaches) => {
            if (err) {
                reject(err);
                return;
            }
            console.log("sous-taches : ", sousTaches.rows);
            if (sousTaches.rows.length === 0) {
                // Aucune sous-tâche associée, supprimer directement la tâche principale
                const deleteTacheQuery = 'DELETE FROM taches WHERE id = $1';
                sql.query(deleteTacheQuery, [id_tache], (err, deleteTacheResult1) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    else {
                        resolve({ tache: deleteTacheResult1.rows, sous_taches: [] });
                    }
                    
                });
            }
            else {
                // Supprimer les sous-tâches associées
                const sousTacheIds = sousTaches.rows.map(sousTache => sousTache.id);
                const deleteSousTachesQuery = 'DELETE FROM sous_tache WHERE tache_id IN ($1)';
                sql.query(deleteSousTachesQuery, [sousTacheIds], (err, deleteSousTachesResult) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    // Supprimer la tâche principale
                    const deleteTacheQuery = 'DELETE FROM taches WHERE id = $1';
                    sql.query(deleteTacheQuery, [id_tache], (err, deleteTacheResult2) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        else {
                            resolve({ tache: deleteTacheResult2.rows, sous_taches: deleteSousTachesResult.rows });
                        }
                    });
                });
            }
        });
    });
};

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
/**
 * Ajoute une sous-tâche
 * @param {Le id d'une tâche} id_tache 
 * @param {Le titre de la sous-tâche} titre_sous_tache
 * @param {Le statut de la sous-tâche (incomplète ou non)} complete_sous_tache 
 * @returns 
 */
Taches.ajouterSousTache = (id_tache, titre_sous_tache, complete_sous_tache) => {
    return new Promise((resolve, reject) => {
        const requete = `INSERT INTO sous_tache (tache_id, titre, complete) VALUES ($1, $2, $3)`;
        const params = [id_tache, titre_sous_tache, complete_sous_tache]

        sql.query(requete, params, (erreur, resultat) => {
            if (erreur) {
                reject(erreur);
            }
            else {
                resolve(resultat.rows);
            }
        })
    }) 
}
//////////////////////////////////////////////////////////////////////////////////////////
/**
 * Modifier le statut d'une sous-tâche
 * @param {Le statut d'une sous-tâche (complétée ou pas)} complete_sous_tache 
 * @param {Le id d'une sous-tâche} id_sous_tache
 * @returns 
 */
Taches.modifierStatutSousTache = (complete_sous_tache, id_sous_tache) => {
    return new Promise((resolve, reject) => {
        const update_requete = 'UPDATE sous_tache SET complete = $1 WHERE id = $2';
        const params_update = [complete_sous_tache, id_sous_tache]

        sql.query(update_requete, params_update, (erreur, update_resultat) => {
            if (erreur) {
                reject(erreur);
            }
            else {
                resolve(update_resultat.rows);
            }
        })
    }) 
}
//////////////////////////////////////////////////////////////////////////////////////////
/**
 * Modifier une sous-tâche au complet
 * @param {Le statut d'une sous-tâche (complétée ou pas)} complete_sous_tache 
 * @param {Le titre d'une sous-tâche} titre_sous_tache
 * @param {Le id d'une tâche} id_tache 
 * @param {Le id d'une sous-tâche} id_sous_tache
 * @returns 
 */
Taches.modifierAuCompletSousTache = (id_tache, titre_sous_tache, complete_sous_tache, id_sous_tache) => {
    return new Promise((resolve, reject) => {
        const update_requete = 'UPDATE sous_tache SET tache_id = $1, titre = $2, complete = $3 WHERE id = $4';
        const params_update = [id_tache, titre_sous_tache, complete_sous_tache, id_sous_tache]

        sql.query(update_requete, params_update, (erreur, update_resultat) => {
            if (erreur) {
                reject(erreur);
            }
            else {
                resolve(update_resultat.rows);
            }
        })
    }) 
}
//////////////////////////////////////////////////////////////////////////////////////////
/**
 * Supprime une sous-tâche
 * @param {Le id d'une sous-tâche} id_sous_tache 
 * @returns 
 */
Taches.supprimerSousTache = (id_sous_tache) => {
    const delete_requete = 'DELETE FROM sous_tache WHERE id = $1';
    return new Promise((resolve, reject) => {
        sql.query(delete_requete, [id_sous_tache], (erreur, delete_resultat) => {
            if (erreur) {
                reject(erreur);
            }
            else {
                resolve(delete_resultat.rows)
            }
        })
    })
}





/**
 * Vérifie si l'utilisateur a le droit d'accéder à une tâche
 * @param {Le id d'une tâche} id_tache 
 * @param {La clé d'API de l'utilisateur} cleApi 
 * @returns 
 */
Taches.validerAuthorization = (id_tache, cleApi) => {
    return new Promise((resolve, reject) => {
        const requeteValidation = 'SELECT COUNT(*) AS nbTache FROM taches t INNER JOIN utilisateur u  ON t.utilisateur_id = u.id WHERE t.id = $1 AND u.cle_api = $2';
        const parametres = [id_tache, cleApi];

        sql.query(requeteValidation, parametres, (erreur, resultat) => {
            if (erreur) {
                reject(erreur);
            }
            const nbTache = parseInt(resultat.rows[0].nbtache);
            if (nbTache <= 0) {
                resolve(false);
            }
            else {
                resolve(true); 
            }
        })
    })
}

/**
 * Vérifie si l'utilisateur a le droit d'accéder à une sous-tâche
 * @param {Le id de la sous-tâche} id_sous_tache 
 * @param {La clé d'API d'un utilisateur} cleApi 
 * @returns 
 */
Taches.validerAuthorizationSousTaches = (id_sous_tache, cleApi) => {
    return new Promise((resolve, reject) => {
        const requeteValidation = 'SELECT COUNT(*) AS nbtache FROM utilisateur u INNER JOIN taches t ON u.id = t.utilisateur_id INNER JOIN sous_tache st ON t.id = st.tache_id WHERE st.id = $1 AND u.cle_api = $2';
        const parametres = [id_sous_tache, cleApi];

        sql.query(requeteValidation, parametres, (erreur, resultat) => {
            if (erreur) {
                reject(erreur);
            }
            const nbSousTache = parseInt(resultat.rows[0].nbtache);
            if (nbSousTache <= 0) {
                resolve(false);
            }
            else {
                resolve(true); 
            }
        })
    })
}
module.exports = Taches;
