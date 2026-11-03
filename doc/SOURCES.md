# Sources, portée et provenance

Vérification documentaire réalisée le **1er novembre 2026**. Les règles SCORM proviennent des documents originaux ADL **version 1.2**, et non de tableaux mélangeant plusieurs versions.

## Documents normatifs consultés

| Document ADL | Sections utiles | Accès et copie locale |
|---|---|---|
| **The SCORM Run-Time Environment**, version 1.2, 1er octobre 2001 | §3.2 lancement et adaptateur ; §3.3 API et erreurs ; §3.4 modèle de données ; §3.4.5 types et vocabulaires ; §3.5 comportement | [Document original ADL, copie hébergée sur Drupal](https://www.drupal.org/files/issues/2019-04-11/SCORM-12-RunTimeEnv.pdf) ; `references/ADL-SCORM-1.2-RTE.pdf` |
| **The SCORM Content Aggregation Model**, version 1.2, 1er octobre 2001 | §2.1 contenu ; §2.2 métadonnées ; §2.3 paquetage, notamment §2.3.5.3.1.2 pour les extensions d'item | [Document original ADL, copie Cover Pages](https://xml.coverpages.org/SCORM-12-CAM.pdf) ; `references/SCORM-12-CAM.pdf` |

Les hôtes ci-dessus conservent des **copies de la source primaire ADL**. Les textes normatifs sont ceux d'ADL ; ni Drupal ni Cover Pages ne sont l'auteur du standard. Les pages de garde, la version et la date ont été vérifiées dans les PDF. Les numéros de pages imprimés du RTE diffèrent du numéro du lecteur PDF : par exemple les types se trouvent aux pages imprimées **3-57 à 3-59**.

L'[archive officielle de la suite 1.2](https://adlnet.gov/assets/uploads/SCORM_1_2_pdf.zip) est la référence de distribution historique. Ce téléchargement n'a pas répondu pendant cette réalisation ; les copies des deux livres ci-dessus ont été utilisées. Les addenda et une suite de certification ADL n'ont pas été exécutés : le projet ne revendique donc pas de certification ni de vérification de l'ensemble des profils de conformité ADL.

## Repères de lecture

- API : RTE §3.3, pages imprimées 3-7 à 3-15 environ ; huit méthodes et paramètres attendus.
- `core` : RTE §3.4.4, pages imprimées 3-18 à 3-32 ; identité, navigation, statut, score, durée et sortie.
- Suspension et lancement : RTE pages imprimées 3-32 à 3-34 ; limite ASCII de 4096 et origine des données de lancement.
- Commentaires : RTE pages imprimées 3-34 à 3-36 ; `comments` en lecture/écriture, `comments_from_lms` en lecture seule.
- Objectifs : RTE pages imprimées 3-36 à 3-42 ; tableau d'objectifs avec score et statut.
- Données et préférences apprenant : RTE pages imprimées 3-42 à 3-47.
- Interactions : RTE pages imprimées 3-47 à 3-57 ; compteurs lisibles, détails en écriture seule.
- Types : RTE §3.4.5, pages imprimées 3-57 à 3-59 ; ASCII, formats des durées et réponses.
- Manifeste : CAM §2.3.5 ; extensions `prerequisites`, `maxtimeallowed`, `timelimitaction`, `datafromlms`, `masteryscore` aux pages imprimées 2-139 à 2-142.

Les exemples suivent les définitions et vocabulaires du modèle, plutôt que certaines coquilles des exemples du livre (indexations, singular/plural de student_preference, etc.). Les commentaires expliquent explicitement les décisions propres au gabarit.

## Schémas XML distribués

| Fichier | Provenance |
|---|---|
| `imscp_rootv1p1p2.xsd` | [IMS Global, schéma CP 1.1.2](https://www.imsglobal.org/xsd/imscp_rootv1p1p2.xsd) |
| `imsmd_rootv1p2p1.xsd` | [IMS Global, schéma de métadonnées 1.2.1](https://www.imsglobal.org/xsd/imsmd_rootv1p2p1.xsd) |
| `ims_xml.xsd` | [IMS Global, attributs XML](https://www.imsglobal.org/xsd/ims_xml.xsd) |
| `adlcp_rootv1p2.xsd` | [Copie publique du schéma ADL 1.2](https://raw.githubusercontent.com/RicardoAllende/Plantilla_SCORM/master/adlcp_rootv1p2.xsd) ; espace de noms et extensions recoupés avec le livre CAM ADL |

Les commentaires XML des schémas livrés dans `src/` (à la racine du ZIP) ont été accompagnés d'une version française ; les attributions anglaises ont été conservées. Un seul ajustement de syntaxe a été effectué dans `ims_xml.xsd` : le schéma historique liait le namespace XML réservé au préfixe vide ; il le lie maintenant à `xml`, ce qui permet sa lecture par un processeur XML actuel. Les attributs déclarés et les règles SCORM ne sont pas modifiés.

Les téléchargements originaux, non traduits, sont conservés dans `references/original-schemas/` et leurs empreintes SHA-256 initiales dans `references/schema-hashes.json`. Ces copies de provenance sont hors du ZIP LMS. Les annotations documentaires d'origine des schémas sont conservées en anglais ; elles ne sont pas des commentaires pédagogiques ajoutés au code.

Le validateur fourni charge les schémas CP, ADL et les attributs XML. Le manifeste principal n'emploie pas de métadonnées LOM embarquées ; il ne charge donc pas le schéma IMS MD, dont certains anciens modèles ont une ambiguïté de grammaire pour les validateurs modernes. Ajouter des métadonnées détaillées demande une vérification dédiée.

## Sources pratiques, distinctes de la norme

- [Moodle : réglages d'une activité SCORM](https://docs.moodle.org/en/SCORM_settings), pour l'import du ZIP, les tentatives, les notes et les réglages de compatibilité.
- [Rustici Software : importer et tester dans SCORM Cloud](https://support.scorm.com/hc/en-us/articles/206163666-Importing-and-Testing-Content), pour la procédure de test.
- [Rustici Software : un test Cloud n'est pas une certification](https://support.scorm.com/hc/en-us/articles/206164666-I-ran-my-course-through-SCORM-Cloud-is-it-SCORM-conformant).

Ces sources expliquent des produits ; elles n'étendent pas les obligations du standard.

## Ce que le gabarit ajoute

Le simulateur local, le nom public `SCORM12`, les fonctions utilitaires, les rapports `{ok, fields}`, l'encodage JSON ASCII, les écrans, les règles de correction, l'autosauvegarde, les événements `scorm:log` et `scorm:error` et les codes `CLIENT_*` sont **des choix d'implémentation**. Ils ne sont pas de nouvelles fonctions natives ou de nouveaux éléments SCORM.

Le simulateur implémente les huit signatures et les familles de données nécessaires aux démonstrations. Il ne simule pas un serveur, un système d'inscriptions, les règles de crédit, la politique d'un LMS ou sa gestion complète des nouvelles tentatives. Il conserve les données entre ses lancements et traite `exit=suspend` comme une reprise. Son seuil est une valeur simulée, sans politique automatique de changement de statut. Ne l'utilisez pas comme oracle de conformité : les tests vérifient le moteur et les comportements annoncés, la recette LMS vérifie l'intégration.
