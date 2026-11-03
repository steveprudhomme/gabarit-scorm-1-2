# Vérifications et recette

État au **1er novembre 2026**. Ces vérifications établissent le comportement décrit du gabarit ; elles ne sont pas une certification ADL.

## Vérifications réalisées

| Vérification | Résultat |
|---|---|
| Syntaxe des deux fichiers JavaScript | Vérifiée avec Node |
| Identifiants HTML, scripts inline, blocs copiables et chemins de fichiers | Vérifiés avec `tools/check-content.py` |
| Moteur et API factices | 14 scénarios de test automatisés réussis, sans dépendance externe |
| Manifeste principal mono-SCO | Validé avec les XSD CP/ADL et les attributs XML locaux |
| Manifeste alternatif multi-SCO | Validé avec le même ensemble de schémas |
| Navigation dans un navigateur, via localhost | Écran suivant, marque-page et progression vérifiés |
| QCM noté | Score raw/min/max et interaction acceptés par la simulation |
| Huit types d'interactions dans l'interface | Vrai/faux, choice, fill-in, matching, performance, sequencing, likert et numeric exercés |
| Suspension et reprise dans l'interface | Écran, note avec accents et emoji et cumul du temps restaurés après fermeture/rechargement |
| Objectif | Enregistrement puis relecture du score, bornes et statut vérifiés |
| Commentaires et préférences | Envoi d'un fragment ASCII et des préférences accepté dans l'interface ; concaténation et limites vérifiées par les tests |
| Statut final | Le bouton « Marquer comme terminé » transmet completed en gardant la communication ouverte |
| API dans la fenêtre parente | Capsule lancée dans l'iframe du banc d'essai ; API découverte et QCM transmis |
| Éléments optionnels absents | Score conservé ; min de score et interactions refusés avec erreur 401 visible ; mode normal utilisé en l'absence de lesson_mode |
| Initialisation refusée | Erreur 101 visible ; aucune fausse simulation et activités indisponibles |
| Commit refusé | Sauvegarde signalée en échec ; bouton de sortie encore utilisable et session maintenue ouverte |
| Console du navigateur pendant les huit activités | Aucune erreur JavaScript constatée |
| Aperçu conservé | `tests/apercu-capsule.png`, capture du tableau de bord local après les essais |
| Ouverture directe file:// dans le navigateur piloté | Non exécutée : la politique de ce navigateur autorise seulement HTTP/HTTPS ; le chemin logique de simulation file:// est testé dans les tests Node |
| Moodle / SCORM Cloud / Cornerstone / TalentLMS réels | Non exécutés ; aucune session LMS réelle n'a été utilisée |

Les tests automatisés couvrent la découverte parent/opener avec cycles et accès interdits, les huit façades natives, les paramètres vides, les accès lecture/écriture, les mots-clés, les limites 255 et 4096, le JSON accentué/cyclique/invalide, les vocabulaires, les scores normalisés, les préférences, les huit formats d'interactions, les liens vers plusieurs objectifs, les compteurs imbriqués, la mise à jour d'objectifs, les succès partiels, les durées et leur cumul, la fermeture idempotente, la concaténation des commentaires et le stockage local refusé.

## Reproduire les vérifications

Depuis le dossier du projet :

```powershell
node --check scorm_api_wrapper.js
node --check demo.js
node tests/scorm.test.cjs
python tools/check-content.py
powershell -NoProfile -File tools/validate.ps1
python tools/package.py
```

Pour le banc d'essai de navigateur, lancez un serveur local puis ouvrez :

- `http://127.0.0.1:8000/tests/lms-harness.html?scenario=normal`
- `http://127.0.0.1:8000/tests/lms-harness.html?scenario=optional`
- `http://127.0.0.1:8000/tests/lms-harness.html?scenario=init-fail`
- `http://127.0.0.1:8000/tests/lms-harness.html?scenario=commit-fail`

Ce parent expose un objet `API` factice ; le bandeau de la capsule dit donc « Connecté au LMS » parce qu'elle a trouvé l'adaptateur. Le titre extérieur précise qu'il s'agit d'un **banc d'essai**, et non d'un LMS réel. Les données de chaque scénario utilisent une clé locale distincte. Les tests et ce banc d'essai sont exclus du ZIP destiné aux apprenants.

Le validateur XML charge les fichiers locaux explicitement. Il contrôle la grammaire des deux manifestes ; il ne vérifie pas toutes les exigences sémantiques du CAM, les règles de profils de métadonnées ou l'exécution d'une politique de prérequis par un LMS. L'outil ZIP vérifie l'existence et le confinement des fichiers déclarés et la lisibilité de l'archive. Les originaux des schémas et l'ajustement du préfixe XML sont expliqués dans SOURCES.md.

## Recette à effectuer dans votre LMS

1. Importer le ZIP dans un cours de test et examiner les avertissements.
2. Lancer comme apprenant en mode normal ; vérifier le nom réel, le crédit et l'absence du bandeau de simulation.
3. Répondre correctement puis incorrectement ; vérifier que l'historique d'interactions ajoute des traces et que le score courant est mis à jour.
4. Tester les huit activités et contrôler les formats dans le journal du LMS, si celui-ci l'expose.
5. Sauvegarder une note proche de la limite ; vérifier le refus au-delà de 4096 **après encodage ASCII**, puis raccourcir et sauvegarder.
6. Suspendre et relancer la même tentative ; contrôler `entry=resume`, le marque-page, le JSON, les réponses et le temps cumulé.
7. Fermer normalement avec le bouton du LMS et vérifier la dernière sauvegarde ; tester aussi une fermeture d'onglet. Le navigateur ne garantit pas tous les événements de départ.
8. Essayer browse, review, no-credit et une nouvelle tentative selon les options de votre plateforme. Vérifier que la révision n'efface pas un statut déjà réussi.
9. Tester l'objectif et les commentaires ; un champ optionnel absent doit être signalé, sans bloquer le reste de l'atelier.
10. Si un `masteryscore` est ajouté au manifeste, vérifier l'effet du seuil sur le statut à la fermeture.
11. Si le LMS fournit les limites de temps, tester les quatre actions avec une limite courte dans un colis de test.
12. Pour l'exemple multi-SCO, vérifier le prérequis et l'indépendance des deux suivis. Valider la navigation fournie par le LMS.

Le succès de cette recette dans une plateforme ne garantit pas automatiquement son résultat dans une autre. Gardez un petit dossier de preuve avec la version du ZIP, les réglages du LMS et les résultats observés.
