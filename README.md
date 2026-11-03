# Gabarit pédagogique SCORM 1.2

Une capsule en HTML5, CSS3 et JavaScript sans framework, avec huit types d'activités, simulation locale et commentaires de code en français et en anglais.

## Mission et licence

Permettre aux concepteurs pédagogiques et aux programmeurs débutants de comprendre, adapter et partager une capsule SCORM 1.2 sans dépendance technique complexe. Le projet privilégie les exemples concrets, les commentaires bilingues et la transparence sur les limites du standard.

Le code original et la documentation originale sont **libres et open source sous GNU GPL version 3 uniquement (`GPL-3.0-only`)**. Le [texte intégral de la licence](LICENSE.md) est fourni. Les documents et schémas ADL/IMS conservent leurs droits propres, détaillés dans [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Copyright du travail original : 2026 Steve Prud'Homme et les contributeurs.

## Fonctionnalités et état du projet

- Manifeste mono-SCO, huit fonctions natives et accès aux familles de données SCORM 1.2.
- Simulation locale, scores, marque-pages, temps de session et reprise JSON avec accents.
- Huit types d'interactions, objectifs pédagogiques, commentaires et préférences apprenant.
- Blocs de code à copier, capsule minimale et exemple multi-SCO.
- Guides détaillés et vérifications reproductibles, complétés par GitHub Actions.

**État : gabarit fonctionnel en développement, sans version numérotée publiée ni certification ADL.** Les essais initiaux dans le navigateur sont documentés ; les intégrations réelles avec les LMS restent à vérifier. L'[historique](CHANGELOG.md) distingue les étapes réalisées des changements non encore publiés.

## Organisation du dépôt

```text
gabarit-scorm-1-2/
├── .github/     Modèles de tickets et de pull request, responsables et CI
├── src/         Capsule SCORM : manifeste, HTML, CSS, JavaScript et schémas XSD
├── doc/         Guide débutant, architecture, référence CMI, sources et validation
├── examples/    Capsule minimale et manifeste alternatif multi-SCO
├── tests/       Tests du moteur, du paquetage et banc d'essai LMS factice
├── tools/       Vérification du contenu, validation XML et génération du ZIP
├── references/ Documents ADL et schémas originaux de référence
├── dist/        ZIP généré localement, ignoré par Git
├── LICENSE.md   Texte intégral de la GPL v3 pour le travail original
├── CONTRIBUTING.md, CODE_OF_CONDUCT.md, MAINTAINERS.md
├── INSTALL.md, CHANGELOG.md, THIRD_PARTY_NOTICES.md
└── README.md    Présentation du dépôt et démarrage rapide
```

**`src/` contient la capsule.** Les guides, exemples, références et tests restent dans le dépôt et ne sont pas ajoutés au ZIP LMS. Les deux notices légales de la racine accompagnent toutefois le code dans toute archive générée.

## Essayer la capsule

Ouvrez [src/index.html](src/index.html) dans votre navigateur pour utiliser la simulation locale. Vous pouvez aussi lancer, depuis la racine du dépôt :

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Ouvrez ensuite [la capsule sur localhost](http://127.0.0.1:8000/src/). Le banc d'essai avec une API dans la fenêtre parente se trouve dans `tests/lms-harness.html`.

Exemple d'appel dans votre script, après une unique initialisation :

```javascript
// [FR] Cette initialisation remplace celle de demo.js dans une capsule personnelle.
// [EN] This initialization replaces the one in demo.js in a custom lesson.
if (SCORM12.initialize()) {
    const saved = SCORM12.setBookmark("slide-2");
    if (saved) SCORM12.commit();
}
```

Dans la démonstration fournie, `demo.js` initialise déjà la session : ne rajoutez pas une seconde initialisation. Les [instructions détaillées d'installation](INSTALL.md) expliquent les essais, prérequis facultatifs et commandes de contribution.

## Construire et importer le paquetage

Depuis la racine du dépôt :

```powershell
python tools/package.py
```

Le résultat local est `dist/gabarit-scorm12.zip`. Importez **ce ZIP** dans Moodle, SCORM Cloud ou votre LMS compatible SCORM 1.2. Il contient le manifeste directement à sa racine, sans dossier `src/` englobant. L'outil inclut les fichiers déclarés dans `src/imsmanifest.xml`, les schémas de validation et les mentions légales.

Le ZIP et les autres fichiers générés sont exclus des nouveaux commits. La [CI GitHub Actions](https://github.com/steveprudhomme/gabarit-scorm-1-2/actions) fournit le paquetage en artefact après une exécution réussie. Les copies locales existantes, les guides et les références normatives sont conservés.

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
python tests/dco_test.py
python tools/check-style.py
powershell -NoProfile -File tools/validate.ps1
python tools/package.py
python tools/check-content.py
```

Les tests utilisent les bibliothèques standard de Node et Python. Le validateur XML utilise .NET sous Windows. La simulation et les vérifications locales ne remplacent pas une recette dans votre LMS ; ce projet ne revendique pas de certification ADL.

## Communauté et contributions

Posez vos questions, signalez un défaut ou proposez une activité dans les [tickets GitHub](https://github.com/steveprudhomme/gabarit-scorm-1-2/issues). Les discussions sur un correctif se font dans sa pull request. Aucun autre canal communautaire officiel n'est annoncé actuellement.

Avant de contribuer, consultez [CONTRIBUTING.md](CONTRIBUTING.md), le [code de conduite](CODE_OF_CONDUCT.md) et les [responsables](MAINTAINERS.md). Les nouvelles contributions utilisent le DCO et une ligne `Signed-off-by:` par commit. La CI vérifie le code, le paquetage, le style et cette attestation pour les nouvelles pull requests.
