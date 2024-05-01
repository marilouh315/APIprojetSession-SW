const sql = require("../config/db_pg.js");
const bcrypt = require('bcrypt');

const Utilisateur = (utilisateur) => {
    this.nom = utilisateur.nom;
    this.courriel = utilisateur.courriel;
    this.motDePasse = utilisateur.motDePasse;
    this.cleAPI = utilisateur.cleAPI;
}

/**
 * Verifie que le courriel est unique dans la table 'utilisateur'
 * @param {*Le courriel envoyé} courriel 
 * @returns Retourne vrai si le courriel est unique, faux pour l'inverse
 */
Utilisateur.verifierCourrielUnique = (courriel) => {
    return new Promise((resolve, reject) => {
        const requeteCourriel = 'SELECT COUNT(*) FROM utilisateur WHERE courriel = $1;';
        sql.query(requeteCourriel, [courriel], (err, result) => {
            if (err) {
                reject(err);
            }
            console.log(courriel);
            console.log(parseInt(result.rows[0]));
            console.log(parseInt(result.rows[0].count));
            
            //resolve(parseInt(result.rows[0].count === 0));
        })
    })
}

/**
 * Créer l'utilisateur en s'assurant de hasher le mot de passe
 * @param {Le nom de l'utilisateur} nom 
 * @param {Le courriel de l'utilisateur} courriel 
 * @param {Le mot de passe de l'utilisateur} motDePasse 
 * @param {La clé d'API générée pour l'utilisateur} cleAPI 
 * @returns Retourne une promesse qui ajoute les informations de l'utilisateur dans la base de donnée, 
 *          ou rejette avec une erreur si une erreur se produit pendant le processus.
 */
Utilisateur.creerUtilisateur = (nom, courriel, motDePasse, cleAPI) => {
    const requeteInsertionUser = 'INSERT INTO utilisateur(nom, courriel, password, cle_api) VALUES ($1, $2, $3, $4)';

    return new Promise((resolve, reject) => {
        //On a déjà vérifié si le courriel était unique

        // Hachage du mot de passe avec BCrypt
        bcrypt.hash(motDePasse, 10, (err, hash) => {
            if (err) {
                reject(err);
            } 
            else {
                console.log(hash);
                const params = [nom, courriel, hash, cleAPI];
                sql.query(requeteInsertionUser, params, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result.rows);
                    }
                });
            }
        });

    });
}

/**
 * Fonction qui vérifie qu'une clé API est unique ou non
 * @param {Longueur de la clé d'API générée} length 
 * @returns Retourne une promesse qui résout avec la clé d'API générée une fois qu'une clé unique est trouvée, 
 *          ou rejette avec une erreur si une erreur se produit pendant le processus.
 */
Utilisateur.verificationCleAPI = (length) => {
    return new Promise((resolve, reject) => {
        let cleAPI = Utilisateur.generateApiKey(length); // Génère une nouvelle clé API

        // Demande au modèle de vérifier si la clé API est unique
        Utilisateur.verifierCleUnique(cleAPI)
            .then(cleAPI_estUnique => {
                if (cleAPI_estUnique) {
                    resolve(cleAPI); // Si la clé est unique, résout avec la clé générée
                } else {
                    // Si la clé n'est pas unique, génère une nouvelle clé et vérifie à nouveau
                    Utilisateur.verificationCleAPI(length)
                    .then(nouvelle_cleAPI => {
                        resolve(nouvelle_cleAPI);
                    })
                    .catch(error => {
                        reject(error);
                    });
                }
            })
            .catch(error => {
                reject(error);
            });
    });
}

/**
 * Vérifie que la clé d'API est unique dans la table 'utilisateur'
 * @param {La clé d'API envoyée} cleAPI 
 * @returns Retourne vrai si la clé est unique, faux pour l'inverse
 */
Utilisateur.verifierCleUnique = (cleAPI) => {
    return new Promise((resolve, reject) => {
        // Requête SQL pour vérifier si la clé API est unique
        const checkQuery = 'SELECT COUNT(*) AS count FROM utilisateur WHERE cle_api = $1';
        sql.query(checkQuery, cleAPI, (err, result) => {
            if (err) {
                reject(err);
            } else {
                // Résout avec un booléen indiquant si la clé est unique ou non
                let nbreCleAPI = result.rows[0].count;
                resolve(nbreCleAPI === 0);
            }
        });
    });
}

/**
 * Fonction qui génère une clé d'API aléatoire composée de chiffres.
 * @param {*la longueur de la clé d'API à générer} length 
 * @returns Retourne la clé d'API générée aléatoirement
 */
Utilisateur.generateApiKey = (length) => {
    let clé_API_generee = '';
    const characters = '0123456789';
    for (let i = 0; i < length; i++) {
        clé_API_generee += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return clé_API_generee;
}


//////////////////////////////////////////////////////////////////////////////////////////
/**
 * Vérifie les champs passés en paramètres pour voir s'ils correspondent
 * @param {Le courriel de l'utilisateur} courriel_utilisateur 
 * @param {Le mot de passe de l'utilisateur} motDePasse_utilisateur 
 * @returns 
 */
Utilisateur.verifierChampsCorrespondent = (courriel_utilisateur, motDePasse_utilisateur) => {
    return new Promise((resolve, reject) => {
        const requeteMDP = 'SELECT password FROM utilisateur WHERE courriel = $1';

        sql.query(requeteMDP, courriel_utilisateur, (err, result) => {
            if (err) {
                reject(err);
            } 
            const mdpHashe = result.rows[0].password;

            bcrypt.compare(motDePasse_utilisateur, mdpHashe, (erreur, resultatMDP) => {
                if (erreur) {
                    reject(erreur);
                }
                resolve(resultatMDP.rows)
            })
            
        });
    })

}

/**
 * Update la table utilisateur pour changer la nouvelle clé générée
 * @param {Le courriel de l'utilisateur} courriel_utilisateur 
 * @param {La nouvelle clé à update} cleAPI 
 * @returns 
 */
Utilisateur.updateCleAPI = (courriel_utilisateur, cleAPI) => {
    return new Promise((resolve, reject) => {
        const update_requete = 'UPDATE utilisateur SET cle_api = $1 WHERE courriel = $1';
        const params_update = [cleAPI, courriel_utilisateur]

        sql.query(update_requete, params_update, (erreur, update_resultat) => {
            if (erreur) {
                reject(erreur);
            }
            resolve(update_resultat.rows);
        })
    }) 
}

/**
 * Recherche les données assignées au compte
 * @param {Le courriel de l'utilisateur} courriel_utilisateur 
 * @returns 
 */
Utilisateur.getDonnees = (courriel_utilisateur) => {
    return new Promise((resolve, reject) => {
        const selectCle = 'SELECT cle_api FROM utilisateur WHERE courriel = $1';

        sql.query(selectCle, courriel_utilisateur, (erreur, resultat) => {
            if (erreur) {
                reject(erreur);
            }
            resolve(resultat.rows);
        })
    }) 
}

/**
 * Vérifie si la clé API est valide
 * @param {La clé d'API d'un utilisateur} cleAPI 
 * @returns 
 */
Utilisateur.validationCle = (cleAPI) => {
    return new Promise((resolve, reject) => {
        const requeteValidation = 'SELECT COUNT(*) AS nbUsager FROM utilisateur u WHERE cle_api = $1';
        const parametres = [cleAPI];

        sql.query(requeteValidation, parametres, (erreur, resultat) => {
            if (erreur) {
                console.log(`Erreur sqlState ${erreur.sqlState} : ${erreur.sqlMessage}`);
                reject(erreur);
            }
            if (resultat.rows[0].nbUsager <= 0) {
                resolve(false);
            }
            else {
                resolve(true); 
            }
        })
    })
}

module.exports = Utilisateur;






