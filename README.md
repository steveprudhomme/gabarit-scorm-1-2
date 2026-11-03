# Gabarit pédagogique SCORM 1.2

Une capsule en HTML5, CSS3 et JavaScript sans framework, avec huit types d'activités, simulation locale et commentaires de code en français et en anglais.

## Organisation du dépôt

```text
gabarit-scorm-1-2/
├── src/         Capsule SCORM : manifeste, HTML, CSS, JavaScript et schémas XSD
├── doc/         Guide débutant, architecture, référence CMI, sources et validation
├── examples/    Capsule minimale et manifeste alternatif multi-SCO
├── tests/       Tests du moteur, du paquetage et banc d'essai LMS factice
├── tools/       Vérification du contenu, validation XML et génération du ZIP
├── references/ Documents ADL et schémas originaux de référence
├── dist/        Archive SCORM prête à importer dans un LMS
└── README.md    Présentation du dépôt et démarrage rapide
```

**`src/` contient uniquement la capsule.** Les guides, exemples, références et tests restent dans le dépôt et ne sont pas ajoutés au ZIP LMS.

## Essayer la capsule

Ouvrez [src/index.html](src/index.html) dans votre navigateur pour utiliser la simulation locale. Vous pouvez aussi lancer, depuis la racine du dépôt :

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Ouvrez ensuite [la capsule sur localhost](http://127.0.0.1:8000/src/). Le banc d'essai avec une API dans la fenêtre parente se trouve dans `tests/lms-harness.html`.

## Construire et importer le paquetage

Depuis la racine du dépôt :

```powershell
python tools/package.py
```

Le résultat est [dist/gabarit-scorm12.zip](dist/gabarit-scorm12.zip). Importez **ce ZIP** dans Moodle, SCORM Cloud ou votre LMS compatible SCORM 1.2. Il contient le manifeste directement à sa racine, sans dossier `src/` englobant. L'outil inclut les fichiers déclarés dans `src/imsmanifest.xml` ainsi que les schémas de validation.

## Documentation

- [Guide complet pour débutants](doc/GUIDE.md)
- [Architecture](doc/ARCHITECTURE.md)
- [Référence des données SCORM 1.2](doc/REFERENCE-CMI.md)
- [Paquetage avancé et exemple multi-SCO](doc/PAQUETAGE-AVANCE.md)
- [Sources normatives et provenance des schémas](doc/SOURCES.md)
- [Vérifications réalisées et recette LMS](doc/VALIDATION.md)

## Vérifier le projet

```powershell
node --check src/scorm_api_wrapper.js
node --check src/demo.js
node tests/scorm.test.cjs
python tests/package_test.py
python tools/check-content.py
powershell -NoProfile -File tools/validate.ps1
python tools/package.py
```

Les tests utilisent les bibliothèques standard de Node et Python. Le validateur XML utilise .NET sous Windows. La simulation et les vérifications locales ne remplacent pas une recette dans votre LMS ; ce projet ne revendique pas de certification ADL.
