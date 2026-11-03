# Historique des changements

Cet historique conserve les étapes du projet et les évolutions à venir, dans l'ordre antéchronologique. Les entrées ci-dessous sont des étapes de développement ; aucune version numérotée ni publication de release n'a encore été créée.

## Non publié

### Ajouts

- Préparation de l'accueil open source : contribution, code de conduite, installation, responsables, modèles de tickets et de pull request.
- Licence GPL v3 pour le travail original, avec inventaire séparé des documents et schémas tiers.
- Vérifications automatiques GitHub Actions : moteur, génération du paquetage, liens, style, XML et attestation DCO des nouvelles propositions.
- Production du ZIP comme artefact de CI.

### Gestion du dépôt

- Les fichiers générés ne sont plus suivis dans les nouveaux commits : ZIP, captures, rapports, caches et extractions automatiques des PDF.
- Les guides, explications, exemples et documents normatifs originaux sont conservés. Les fichiers générés existants restent sur le poste de travail et dans l'historique Git antérieur.
- Le dépôt devient public le 2 novembre 2026, à la demande de son propriétaire.

## 2026-11-02 — Séparation de la capsule et du dépôt

- Déplacement des fichiers SCORM dans `src/` et des guides dans `doc/`.
- Génération du paquetage dans `dist/`, sans dossier parent dans le ZIP.
- Séparation des exemples, tests, outils et références du contenu destiné au LMS.
- Conservation du guide complet et ajout d'un README de démarrage rapide.
- Mise à jour des chemins, validation des deux manifestes et ajout de quatre tests de paquetage.

## 2026-11-01 — Première réalisation locale

- Création du manifeste SCORM 1.2, du moteur autonome et du simulateur local.
- Démonstration des huit types d'interactions, scores, objectifs, commentaires, préférences, temps et reprise JSON.
- Commentaires de code bilingues et repères de blocs à copier.
- Rédaction du guide débutant, de la référence CMI et des explications de provenance ADL.
- Première série de tests du moteur et d'essais dans le navigateur ; aucune certification ADL ou recette LMS réelle annoncée.
