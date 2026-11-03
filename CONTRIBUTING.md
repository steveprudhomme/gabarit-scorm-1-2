# Contribuer au gabarit SCORM 1.2

Merci de contribuer, que ce soit par une correction, une explication plus claire, un essai sur un LMS ou une activité accessible. Les questions de débutants sont les bienvenues. Le [code de conduite](CODE_OF_CONDUCT.md) s'applique à tous les échanges.

## Discuter avant de modifier

Utilisez les [tickets GitHub](https://github.com/steveprudhomme/gabarit-scorm-1-2/issues) pour un problème reproductible, une question ou une proposition. Pour une évolution importante, décrivez d'abord le besoin pédagogique et la solution envisagée. Aucune liste de diffusion ni messagerie instantanée officielle n'est actuellement maintenue.

Les discussions techniques d'une modification se font dans sa pull request, c'est-à-dire une proposition de fusion. Ne joignez jamais les données réelles d'un apprenant, un jeton d'accès ou un export confidentiel de LMS. Préparez un exemple fictif réduit.

## Préparer une modification

1. Consultez [INSTALL.md](INSTALL.md), puis [le guide complet](doc/GUIDE.md) et [l'architecture](doc/ARCHITECTURE.md).
2. Créez une branche dédiée à une seule modification compréhensible.
3. Modifiez les sources dans `src/`, les exemples dans `examples/` et les guides dans `doc/`.
4. Conservez les explications pédagogiques existantes ; précisez-les lorsque le comportement change. N'enlevez pas un exemple utile pour simplifier une modification sans en discuter.
5. Lancez les contrôles ci-dessous et décrivez les résultats dans votre proposition.
6. Ajoutez votre changement à la section « Non publié » de [CHANGELOG.md](CHANGELOG.md).

La capsule doit rester utilisable sans framework, serveur applicatif, installation npm ou connexion à un service distant. Les outils de contribution ne doivent pas devenir des dépendances de l'apprenant.

## Règles de code et de documentation

- Utilisez exclusivement les noms et formats de **SCORM 1.2**, vérifiés dans les sources ADL listées dans [doc/SOURCES.md](doc/SOURCES.md).
- Écrivez chaque commentaire de code en français, puis en anglais, avec `[FR]` et `[EN]`. Préservez les repères des blocs à copier.
- Gardez des noms explicites, des fonctions courtes et des erreurs visibles. Distinguez les fonctions natives des utilitaires du gabarit.
- Respectez [.editorconfig](.editorconfig) : UTF-8, espaces, fin de ligne LF, pas d'espaces en fin de ligne, retour final. Les schémas tiers et les licences d'origine ne doivent pas être reformatés automatiquement.
- Ajoutez un test lorsqu'il protège un comportement nouveau ou corrige un défaut. Une retouche de texte ne nécessite pas un test artificiel.
- Gardez les sources, les fichiers de test et les configurations éditables sous Git. Le ZIP, les captures, les caches, les rapports et les extractions automatiques restent locaux ou deviennent des artefacts de CI.
- Préservez les attributions des schémas et documents tiers. Le choix GPL du projet ne change pas leurs droits ; voir [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Contrôles avant une pull request

Depuis la racine du dépôt, avec Node et Python installés :

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

Sous Windows, ajoutez la validation des deux manifestes :

```powershell
powershell -NoProfile -File tools/validate.ps1
```

La CI exécute ces contrôles, valide les manifestes et conserve le ZIP comme artefact téléchargeable. Elle ne teste pas un véritable LMS. Si votre changement touche le suivi, effectuez aussi la [recette LMS](doc/VALIDATION.md) et précisez ce qui a réellement été vérifié.

## Commits et certificat d'origine DCO

Toute nouvelle contribution proposée par pull request doit respecter le [Developer Certificate of Origin 1.1](https://developercertificate.org/). Le DCO signifie que vous avez le droit de proposer cette contribution sous les droits indiqués et que votre contribution et votre attestation sont conservées publiquement. Lisez le texte officiel avant de signer.

Ajoutez votre attestation à **chaque nouveau commit** :

```powershell
git add src doc
git commit --signoff -m "Corriger la reprise du marque-page"
```

Git ajoute une ligne `Signed-off-by:` avec le nom et l'adresse configurés pour votre identité de contribution. Une adresse GitHub de confidentialité peut être utilisée si elle correspond à votre identité de contribution. Ce sign-off est une attestation, pas une signature cryptographique. Ne signez pas à la place d'une autre personne.

Les commits historiques antérieurs à l'adoption du DCO ne sont pas réécrits. La vérification s'applique aux commits apportés par la nouvelle pull request. Pour contrôler votre branche localement, utilisez les vrais identifiants de commits de sa base et de son sommet :

```powershell
python tools/check-dco.py --base BASE_SHA --head HEAD_SHA
```

Créez des commits atomiques : une correction ou une évolution logique par commit. Utilisez `Fixes #112` seulement si le ticket 112 existe et si le changement le résout réellement. Ne mélangez pas une réécriture du moteur, une nouvelle activité et une mise en forme générale.

## Relecture et fusion

Les [responsables](MAINTAINERS.md) examinent la compatibilité SCORM 1.2, la pédagogie, l'accessibilité, les tests et les droits des fichiers ajoutés. Ils peuvent demander une modification ou une démonstration dans un LMS. Une CI verte aide à relire ; elle n'entraîne pas une fusion automatique.

Le projet n'impose pas de délai de réponse. Pour faciliter la relecture, indiquez le problème, le résultat attendu, les fichiers utiles et les limites des tests, en français ou en anglais.
