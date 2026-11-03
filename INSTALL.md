# Installation, essais et génération du paquetage

## Utiliser la capsule sans installer d'outils

Téléchargez les sources depuis GitHub, décompressez-les, puis ouvrez `src/index.html` dans un navigateur moderne. Les commentaires, textes, activités et styles sont directement modifiables dans un éditeur de texte.

La capsule ne demande ni npm, ni framework, ni serveur applicatif. Le bandeau « Simulation locale » indique que les résultats restent dans le navigateur. Les restrictions de stockage liées à `file://` varient selon le navigateur ; le guide explique ce fonctionnement et ses limites.

Pour un vrai suivi apprenant, importez un ZIP généré dans votre LMS. Les archives automatiquement vérifiées sont accessibles comme **artefacts** des exécutions réussies de [GitHub Actions](https://github.com/steveprudhomme/gabarit-scorm-1-2/actions). GitHub peut demander une connexion pour télécharger un artefact. Une archive d'artefact GitHub peut contenir le fichier `gabarit-scorm12.zip` : extrayez alors ce fichier et importez-le dans le LMS.

## Préparer un environnement de contribution

Les versions utilisées pour les vérifications sont **Node 22** et **Python 3.13**. Installez-les depuis leurs sites officiels si vous souhaitez lancer les contrôles et produire un ZIP. Git est utile pour contribuer ; il n'est pas nécessaire pour ouvrir les fichiers de la capsule.

```powershell
git clone https://github.com/steveprudhomme/gabarit-scorm-1-2.git
cd gabarit-scorm-1-2
node --version
python --version
```

Sous certains systèmes, la commande de Python se nomme `python3`. Dans ce cas, remplacez `python` par `python3` dans les commandes ci-dessous. Aucune installation de bibliothèque Python ou JavaScript n'est nécessaire.

## Ouvrir la capsule avec un serveur local facultatif

Depuis la racine du dépôt :

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Ouvrez `http://127.0.0.1:8000/src/`. Pour le banc d'essai d'une API dans la fenêtre parente, ouvrez `http://127.0.0.1:8000/tests/lms-harness.html?scenario=normal`. Arrêtez le serveur avec Ctrl+C.

## Vérifier les sources et générer le ZIP

```powershell
node --check src/scorm_api_wrapper.js
node --check src/demo.js
node tests/scorm.test.cjs
python tests/package_test.py
python tests/dco_test.py
python tools/check-style.py
python tools/package.py
python tools/check-content.py
```

Sous Windows, validez également les deux manifestes avec les schémas locaux :

```powershell
powershell -NoProfile -File tools/validate.ps1
```

La CI réalise cette validation sous Windows avec PowerShell. Les autres contrôles ne nécessitent pas .NET.

Le résultat local est `dist/gabarit-scorm12.zip`. Le générateur place `imsmanifest.xml` directement à la racine, ajoute les fichiers SCORM et leurs mentions de licence, et refuse les références de contenu qui sortent de `src/`. Les guides, exemples de travail, tests et PDF de référence restent hors du ZIP LMS.

Le ZIP est un résultat généré : il est ignoré par Git. Il peut être reconstruit depuis les sources. Les anciennes copies locales restent disponibles, mais doivent être régénérées après toute modification de la capsule ou des mentions de licence.

## Importer dans un LMS

Importez **le fichier `gabarit-scorm12.zip`**, pas le dossier du dépôt ni l'archive ZIP des sources téléchargée depuis GitHub. Testez ensuite le nom de l'apprenant, le score, la suspension/reprise et la fermeture dans la même tentative.

Le [guide débutant](doc/GUIDE.md) conserve les explications complètes pour Moodle et SCORM Cloud, les exemples à copier et les erreurs classiques. La [recette](doc/VALIDATION.md) précise les contrôles à effectuer dans votre propre plateforme.
