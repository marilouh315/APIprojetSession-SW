const sql = require("../config/db.js");

const Taches = (taches) => {}

/**
 * Vérifie si le id passé, existe
 * @param {Le id d'une tâche (pas une sous-tâche)} id_tache 
 * @returns 
 */
Taches.verifierExistenceID = (id_tache) => {
    return new Promise((resolve, reject) => {
        const requete = "SELECT COUNT(*) AS nbre_id FROM taches WHERE id = ?";
        sql.query(requete, [id_tache], (err, resultats) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(resultats[0].nbre_id > 0);
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
        const requete = "SELECT COUNT(*) AS nbre_id FROM sous_tache WHERE id = ?";
        sql.query(requete, [id_sous_tache], (err, resultats) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(resultats[0].nbre_id > 0);
        });
    });
}
///////////////////////////////////////////////////////////////////////////////////
/**
 * Affiche toutes les tâches 
 * @param {Boolean si la tâche est incomplète ou non} complete_tache 
 */
Taches.afficherToutesTaches = (complete_tache) => {
    return new Promise((resolve, reject) => {
        const requete = `SELECT t.id, t.titre, t.complete FROM taches t`;
        sql.query(requete, (erreur, resultat) => {
            if (erreur) {
                reject(erreur);
            }
            resolve(resultat);
        })
    })
    
}
/**
 * Affiche toutes les tâches par défaut (incomplètes) 
 */
Taches.afficherTachesParDefaut = () => {
    return new Promise((resolve, reject) => {
        const requete = `SELECT t.id, t.titre, t.complete FROM taches t WHERE complete = 0`;
        sql.query(requete, (erreur, resultat) => {
            if (erreur) {
                reject(erreur);
            }
            resolve(resultat);
        })
    })
    
}
///////////////////////////////////////////////////////////////////////////////////
/**
 * Affiche le détail d'une tâche (et de ses sous-tâches, s'il y a lieu)
 * @param {Le id d'une tâche (pas une sous-tâche)} id_tache 
 * @returns Boolean (vrai s'il existe ou non)
 */
Taches.afficherDetailTache = (id_tache) => {
    return new Promise((resolve, reject) => {
        const requete = 
        `SELECT t.titre AS tache_titre, t.description, t.date_debut, t.date_echeance FROM taches t WHERE t.id = ?`;
        const params = [id_tache];

        sql.query(requete, params, (erreur, resultat) => {
            if (erreur) {
                reject(erreur);
            }
            resolve(resultat);
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
        const requete = 
        `SELECT st.titre AS titre_sous_tache, st.complete AS complete_sous_tache FROM sous_tache st WHERE st.tache_id = ?`;
        const params = [id_tache];

        sql.query(requete, params, (erreur, resultat) => {
            if (erreur) {
                reject(erreur);
            }
            resolve(resultat);
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
        const requete = "SELECT COUNT(*) AS nbre_id FROM utilisateur WHERE id = ?";
        sql.query(requete, [utilisateur_id], (err, resultats) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(resultats[0].nbre_id > 0);
        });
    });
}
/**
 * Ajoute une tâche
 * @param {Le id d'un utilisateur} utilisateur_id 
 * @param {Le titre d'une tâche} titre_tache 
 * @param {La description donnée à une tâche} description 
 * @param {La date de début de la tâche} date_debut 
 * @param {La date d'échéance de la tâche} date_echeance 
 * @param {Le statut de la tâche (complété ou pas)} complete_tache 
 * @returns 
 */
Taches.ajouterTache = (
    utilisateur_id, titre_tache, description, date_debut, date_echeance, complete_tache
) => {
    return new Promise((resolve, reject) => {
        const requete = `INSERT INTO taches (utilisateur_id, titre, description, date_debut, date_echeance, complete) VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [utilisateur_id, titre_tache, description, date_debut, date_echeance, complete_tache]

        sql.query(requete, params, (erreur, resultat) => {
            if (erreur) {
                reject(erreur);
            }
            resolve(resultat);
        })
    }) 
}
//////////////////////////////////////////////////////////////////////////////////////////
/**
 * Modifier une tâche (au complet)
 * @param {Le id d'un utilisateur} utilisateur_id 
 * @param {Le titre d'une tâche} titre_tache 
 * @param {La description donnée à une tâche} description 
 * @param {La date de début de la tâche} date_debut 
 * @param {La date d'échéance de la tâche} date_echeance 
 * @param {Le statut de la tâche (complété ou pas)} complete_tache 
 * @param {Le id d'une tâche} id_tache
*/
Taches.modifierAuCompletTache = (
    utilisateur_id,
    titre_tache,
    description,
    date_debut,
    date_echeance,
    complete_tache,
    id_tache
) => {
    return new Promise((resolve, reject) => {
        const update_requete = 'UPDATE taches SET utilisateur_id = ?, titre = ?, description = ?, date_debut = ?, date_echeance = ?, complete = ? WHERE id = ?';
        const params_update = [utilisateur_id, titre_tache, description, date_debut, date_echeance, complete_tache, id_tache]

        sql.query(update_requete, params_update, (erreur, update_resultat) => {
            if (erreur) {
                reject(erreur);
            }
            resolve(update_resultat);
        })
    }) 

}
//////////////////////////////////////////////////////////////////////////////////////////
/**
 * Modifier le statut d'une tâche
 * @param {Le statut d'une tâche (complétée ou pas)} complete_tache 
 * @param {Le id d'une tâche} id_tache 
 * @returns 
 */
Taches.modifierStatutTache = (complete_tache, id_tache) => {
    return new Promise((resolve, reject) => {
        const update_requete = 'UPDATE taches SET complete = ? WHERE id = ?';
        const params_update = [complete_tache, id_tache]

        sql.query(update_requete, params_update, (erreur, update_resultat) => {
            if (erreur) {
                reject(erreur);
            }
            resolve(update_resultat);
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
        const selectSousTachesQuery = 'SELECT id FROM sous_tache WHERE tache_id = ?';
        sql.query(selectSousTachesQuery, [id_tache], (err, sousTaches) => {
            if (err) {
                reject(err);
                return;
            }
            if (sousTaches.length === 0) {
                // Aucune sous-tâche associée, supprimer directement la tâche principale
                const deleteTacheQuery = 'DELETE FROM taches WHERE id = ?';
                sql.query(deleteTacheQuery, [id_tache], (err, deleteTacheResult) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve({ tache: deleteTacheResult, sous_taches: [] });
                });
            }
            else {
                // Supprimer les sous-tâches associées
                const sousTacheIds = sousTaches.map(sousTache => sousTache.id);
                const deleteSousTachesQuery = 'DELETE FROM sous_tache WHERE tache_id IN (?)';
                sql.query(deleteSousTachesQuery, [sousTacheIds], (err, deleteSousTachesResult) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    // Supprimer la tâche principale
                    const deleteTacheQuery = 'DELETE FROM taches WHERE id = ?';
                    sql.query(deleteTacheQuery, [id_tache], (err, deleteTacheResult) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve({ tache: deleteTacheResult, sous_taches: deleteSousTachesResult });
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
        const requete = `INSERT INTO sous_tache (tache_id, titre, complete) VALUES (?, ?, ?)`;
        const params = [id_tache, titre_sous_tache, complete_sous_tache]

        sql.query(requete, params, (erreur, resultat) => {
            if (erreur) {
                reject(erreur);
            }
            resolve(resultat);
        })
    }) 
}
//////////////////////////////////////////////////////////////////////////////////////////
/**
 * Modifier le statut d'une sous-tâche
 * @param {Le statut d'une sous-tâche (complétée ou pas)} complete_sous_tache 
 * @param {Le id d'une tâche} id_tache 
 * @param {Le id d'une sous-tâche} id_sous_tache
 * @returns 
 */
Taches.modifierStatutSousTache = (complete_sous_tache, id_tache, id_sous_tache) => {
    return new Promise((resolve, reject) => {
        const update_requete = 'UPDATE sous_tache SET complete = ? WHERE id = ?';
        const params_update = [complete_sous_tache, id_tache, id_sous_tache]

        sql.query(update_requete, params_update, (erreur, update_resultat) => {
            if (erreur) {
                reject(erreur);
            }
            resolve(update_resultat);
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
        const update_requete = 'UPDATE sous_tache SET tache_id = ?, titre = ?, complete = ? WHERE id = ?';
        const params_update = [id_tache, titre_sous_tache, complete_sous_tache, id_sous_tache]

        sql.query(update_requete, params_update, (erreur, update_resultat) => {
            if (erreur) {
                reject(erreur);
            }
            resolve(update_resultat);
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
    const delete_requete = 'DELETE FROM sous_tache WHERE id = ?';
    return new Promise((resolve, reject) => {
        sql.query(delete_requete, id_sous_tache, (erreur, delete_resultat) => {
            if (erreur) {
                reject(erreur);
            }
            else {
                resolve(delete_resultat)
            }
        })
    })
}
module.exports = Taches;
