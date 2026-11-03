# Votre première capsule SCORM 1.2

Bienvenue ! Ce gabarit permet de créer une capsule pédagogique avec de simples fichiers HTML, CSS et JavaScript. Aucun serveur applicatif, framework, abonnement ou téléchargement de bibliothèque n'est nécessaire pour l'utiliser.

**Pour commencer : ouvrez `index.html` par double-clic.** Le bandeau « Simulation locale » signifie que vous expérimentez dans votre navigateur. Pour transmettre de vrais résultats, importez ensuite `gabarit-scorm12.zip` dans un LMS.

## 1. Sur quoi repose ce gabarit ?

Sur les livres originaux **ADL SCORM 1.2 — Content Aggregation Model (CAM)** et **Run-Time Environment (RTE)**, datés du 1er octobre 2001. Le premier décrit le colis, le second le dialogue avec le LMS. Les copies consultées, leur provenance et les pages utiles sont indiquées dans [docs/SOURCES.md](docs/SOURCES.md).

L'architecture comporte **un seul SCO**, qui reste ouvert pendant la navigation entre trois écrans. C'est un choix du gabarit, pas une obligation de SCORM. Les fonctions couvrent toutes les feuilles du modèle de données SCORM 1.2, y compris les éléments optionnels. Les activités démontrent les huit types d'interactions définis dans ce modèle.

SCORM ne fournit pas une bibliothèque d'exercices : vous créez les activités en HTML/JavaScript, puis vous décrivez leurs traces au LMS. Une simulation, une vidéo, une carte interactive ou un scénario à embranchements peuvent employer les mêmes fonctions. Le modèle n'impose ni animation ni méthode pédagogique.

La compatibilité vise les LMS qui implémentent SCORM 1.2 et rendent leur API accessible au contenu. Une promesse de fonctionnement identique sur *tous* les LMS serait trompeuse : certains éléments sont optionnels et les rapports disponibles varient. Un test local ne constitue pas une certification ADL. La recette dans Moodle, Cornerstone, TalentLMS ou votre plateforme cible reste nécessaire.

## 2. Cinq mots pour comprendre

| Mot | Une image simple |
|---|---|
| **LMS** — plateforme de formation | L'école : elle inscrit les apprenants et conserve leurs résultats. |
| **SCO** — Sharable Content Object | Une salle de cours autonome, suivie individuellement par le LMS. |
| **API** — interface de programmation | L'interprète fourni par le LMS : huit boutons pour dialoguer avec lui. |
| **Manifest** — manifeste | Le bordereau du colis : il dit au LMS quoi ouvrir et quels fichiers emporter. |
| **Commit** — demande de sauvegarde | « Merci de ranger maintenant ces informations dans mon dossier. » Son acceptation dépend du LMS. |

## 3. Les fichiers, sans mystère

```text
Gabritscorm1.2/
├── imsmanifest.xml             ← Livrable 1 : bordereau, titres et inventaire
├── scorm_api_wrapper.js        ← Livrable 2 : moteur autonome et simulateur
├── index.html                  ← Livrable 3 : contenu et exemples à copier
├── styles.css                  ← Couleurs, mise en page et adaptation aux écrans
├── demo.js                     ← Comportement des huit activités et de l'interface
├── README.md                   ← Livrable 4 : ce guide
├── ARCHITECTURE.md             ← Choix d'organisation
├── imscp_rootv1p1p2.xsd        ← Schéma IMS du paquetage
├── adlcp_rootv1p2.xsd          ← Extensions ADL SCORM 1.2
├── imsmd_rootv1p2p1.xsd        ← Schéma IMS des métadonnées
├── ims_xml.xsd                ← Attributs XML utilisés par les schémas
├── docs/
│   ├── REFERENCE-CMI.md        ← Toutes les données, accès et limites
│   ├── SOURCES.md              ← Références et provenance
│   ├── PAQUETAGE-AVANCE.md     ← Métadonnées, ressources, prérequis et multi-SCO
│   └── VALIDATION.md           ← Vérifications effectuées et recette LMS
├── examples/
│   ├── minimal.html            ← Petite capsule autonome à adapter
│   └── imsmanifest-multisco.xml ← Manifeste alternatif pour deux SCO
├── tests/
│   ├── scorm.test.cjs          ← Tests reproductibles du moteur
│   └── lms-harness.html        ← Banc d'essai avec une API dans le parent
├── tools/
│   ├── package.py             ← Fabrique le ZIP sans dossier parent
│   ├── check-content.py       ← Vérifie les exemples et les liens de fichiers
│   └── validate.ps1           ← Valide le XML avec les schémas locaux
├── references/                ← Copies de travail des documents ADL, hors ZIP LMS
└── gabarit-scorm12.zip         ← Archive prête à importer, générée par l'outil
```

Les schémas XSD sont des « règles de grammaire » pour vérifier le XML. Ils ne sont pas exécutés par la capsule. Les noms et espaces de noms historiques, même en `http://`, sont des identifiants XML : ne les modernisez pas en les remplaçant par `https://`.

## 4. Votre premier essai, en cinq minutes

1. Ouvrez `index.html`. Vérifiez le bandeau **Simulation locale**.
2. Cliquez sur **Suivant** : le marque-page devient `slide-2`.
3. Répondez au QCM : le tableau de bord montre un score. Le laboratoire voisin propose les huit types d'interactions.
4. Écrivez une note avec des accents, puis cliquez sur **Sauvegarder ma progression**.
5. Cliquez sur **Sauvegarder et suspendre**, puis rechargez la page. Vous devez retrouver l'écran et la note. La session précédente doit figurer dans le temps cumulé.
6. Marquez la capsule comme terminée. Observez que le statut change sans fermer immédiatement la communication.

Le journal permet de suivre les appels sans afficher le contenu de vos réponses. En simulation, ces appels sont aussi visibles dans la console du navigateur. Le moteur utilise `localStorage`, un petit tiroir associé au navigateur et à l'adresse du fichier. Ce tiroir n'est ni partagé entre navigateurs ni envoyé au LMS. Le comportement de `file://` dépend du navigateur ; la navigation privée peut limiter sa conservation. Si le tiroir est refusé, un message indique le fonctionnement en mémoire ou l'échec de sauvegarde.

Pour repartir à zéro en simulation, ouvrez les outils de développement du navigateur, rubrique **Application/Stockage**, et supprimez uniquement la clé commençant par `gabarit-scorm12-v1:` pour cette capsule. Évitez d'effacer tout le stockage d'autres sites.

Un serveur local est facultatif. Avec Python installé, ouvrez un terminal dans ce dossier et lancez :

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Ouvrez ensuite `http://127.0.0.1:8000/`. Cette adresse possède un stockage distinct de l'ouverture par double-clic. Arrêtez le serveur avec Ctrl+C.

## 5. Modifier le contenu sereinement

Commencez par copier le dossier pour conserver un exemplaire intact. Modifiez les textes de `index.html`, puis les trois écrans dans le tableau `slides` de `demo.js`. Les couleurs sont regroupées au début de `styles.css`.

Cherchez **DÉBUT DU BLOC À COPIER-COLLER** dans le HTML et le JavaScript. Les mêmes noms vous aident à retrouver l'interface et son comportement. Pour copier une activité dans une autre capsule, prenez son bloc HTML et son bloc JavaScript, gardez les identifiants correspondants, puis adaptez-les ensemble. Si vous dupliquez un bloc sur la même page, donnez des identifiants HTML uniques à ses contrôles et mettez à jour les sélecteurs JavaScript. Les exemples sous « Voir le code » montrent les appels SCORM essentiels, avec des valeurs faciles à remplacer.

**Conservez le chargement de `scorm_api_wrapper.js` avant votre script pédagogique.** Appelez `SCORM12.initialize()` une seule fois. Dans cette démonstration, `demo.js` s'en charge déjà : ne rajoutez pas une deuxième initialisation.

Pour une base plus courte, consultez [examples/minimal.html](examples/minimal.html). Ses chemins relatifs supposent qu'il reste dans `examples/`. Pour en faire votre point d'entrée, copiez son contenu dans `index.html`, remplacez `../scorm_api_wrapper.js` par `scorm_api_wrapper.js`, et retirez `../` du chemin CSS. Le manifeste principal lance déjà `index.html`.

Dans `imsmanifest.xml`, modifiez les deux titres signalés, gardez les liens entre `identifier`, `identifierref` et `resource`, puis ajoutez une ligne `<file href="..."/>` pour chaque nouveau fichier utilisé. Exemple :

```xml
<!-- [FR] Ajouter votre image au colis après l'avoir placée dans images/. -->
<!-- [EN] Add your image to the package after placing it in images/. -->
<file href="images/schema-capsule.png"/>
```

Utilisez des noms simples, par exemple `schema-capsule.png`. Respectez les majuscules : un fichier trouvé sous Windows peut devenir introuvable sur le serveur du LMS si son nom diffère. En XML, écrivez `&amp;` pour un `&` dans un texte ou une adresse. Enregistrez les fichiers en UTF-8.

## 6. Les fonctions à copier

Les méthodes courantes renvoient un booléen, un **rapport** ou une valeur. Un rapport est un objet avec `ok` et un détail des champs ; **ne testez pas directement `if (rapport)`**, car même un rapport d'échec est un objet JavaScript considéré comme vrai. Testez `rapport.ok`.

| Besoin | Exemple | Retour et précaution |
|---|---|---|
| Ouvrir | `SCORM12.initialize()` | booléen ; une fois par page/session |
| Identifier | `SCORM12.getIdentity()` | rapport `.values.name`, `.values.id`, crédit, mode, entrée, lancement |
| Lire un élément avec diagnostic | `SCORM12.read("cmi.core.entry")` | `{ok, value, code, message, diagnostic}` |
| Lire simplement | `SCORM12.get("cmi.core.entry", "")` | chaîne ; privilégier `read` si une chaîne vide doit être distinguée d'une erreur |
| Écrire directement | `SCORM12.set("cmi.core.lesson_location", "slide-2")` | booléen ; respecter l'accès du champ |
| Retenir l'écran | `SCORM12.setBookmark("slide-2")` | booléen ; ASCII, 255 maximum |
| Relire le signet | `SCORM12.getBookmark()` | chaîne |
| Terminer le contenu | `SCORM12.setStatus("completed")` | booléen ; ne ferme pas la session |
| Signaler réussite/échec | `SCORM12.setStatus("passed")` ou `"failed"` | les autres choix sont `incomplete`, `browsed` |
| Envoyer le score | `SCORM12.setScore(80, 0, 100)` | rapport ; raw obligatoire au LMS, min/max optionnels |
| Lire le score | `SCORM12.getScore()` | rapport ; une valeur vide ne signifie pas zéro |
| Garder une progression | `SCORM12.saveState({version:1, slide:2})` | booléen ; encode JSON en ASCII, refuse un dépassement |
| Reprendre | `SCORM12.loadState({version:1})` | objet ou repli ; inspecter `lastError` en cas de JSON invalide |
| Décrire une réponse | `SCORM12.recordInteraction({...})` | rapport et `.index` ; voir l'exemple complet ci-dessous |
| Fixer un objectif | `SCORM12.setObjective({id:"obj_1", raw:80, min:0, max:100, status:"passed"})` | rapport et index ; met à jour l'objectif de même id |
| Lire un objectif | `SCORM12.getObjective(0)` | rapport ; les objectifs sont relisibles |
| Lier une réponse à un objectif | `objectiveIds:["obj_1"]` dans l'interaction | l'objectif doit être créé séparément si vous voulez son score/statut |
| Écrire un commentaire | `SCORM12.setComments("Un autre exemple serait utile.\n")` | booléen ; ASCII, commentaires concaténés par le LMS, 4096 au total |
| Lire les commentaires | `SCORM12.getComments()` | rapport `.values.learner` et `.values.lms` |
| Lire/écrire les préférences | `SCORM12.getPreferences()` / `SCORM12.setPreferences({language:"fr", text:1})` | rapport ; appliquer ensuite ces souhaits dans votre interface |
| Lire le seuil et la durée | `SCORM12.getStudentData()` | rapport ; éléments optionnels transmis par le LMS |
| Découvrir les champs | `SCORM12.getChildren("cmi.student_preference")` | résultat de lecture ; séparer `.value` par virgules |
| Compter les réponses | `SCORM12.getCount("cmi.interactions")` | résultat ; `_count` est une quantité, pas le dernier index |
| Sauvegarder | `SCORM12.commit()` | booléen ; met aussi à jour la durée de session |
| Envoyer seulement la durée | `SCORM12.saveSessionTime()` | booléen ; durée totale depuis cette initialisation |
| Choisir la sortie | `SCORM12.setExit("suspend")` | booléen ; autres choix : `logout`, `time-out`, `""` |
| Sauvegarder et fermer | `SCORM12.finish("suspend")` | booléen ; garde la session ouverte si la sauvegarde échoue |
| Formater une durée | `SCORM12.formatTime(65230)` | `"0000:01:05.23"` ; argument en millisecondes |
| Lire une durée | `SCORM12.parseTime("0000:01:05.23")` | millisecondes ou `NaN` |

Un exemple complet :

```javascript
// [FR] Après initialize(), décrire une réponse puis demander la sauvegarde.
// [EN] After initialize(), describe a response and then request persistence.
const report = SCORM12.recordInteraction({
  id: "question_01",
  type: "choice",
  time: SCORM12.clockTime(),
  objectiveIds: ["objectif_01"],
  correctResponses: ["b"],
  studentResponse: "b",
  result: "correct",
  weighting: 1,
  latency: "0000:00:12.50"
});
const committed = SCORM12.commit();
if (!report.ok || !committed) console.warn(report, SCORM12.lastError);
```

`correctResponses` est une liste de réponses acceptables ; chaque entrée devient un `correct_responses.n.pattern`. Pour exiger ensemble deux choix, utilisez `correctResponses: ["{a,b}"]`. Pour deux réponses alternatives, utilisez `["a", "b"]`. Les choix sont des caractères simples `a` à `z` ou `0` à `9`, pas des phrases. Les réponses textuelles et `performance` restent limitées à 255 caractères. Les champs des interactions sont en **écriture seule** : gardez les réponses nécessaires à la reprise dans votre objet de suspension. Le LMS peut conserver les traces sans les présenter dans un rapport lisible.

## 7. Les huit méthodes natives, pour aller plus loin

Le moteur expose aussi les noms exacts du standard :

```javascript
// [FR] Démonstration alternative au démarrage automatique de demo.js.
// [EN] Alternative demonstration to the automatic initialization in demo.js.
if (SCORM12.LMSInitialize("") === "true") {
  const name = SCORM12.LMSGetValue("cmi.core.student_name");
  const written = SCORM12.LMSSetValue("cmi.core.lesson_location", "slide-2");
  const code = SCORM12.LMSGetLastError();
  const explanation = SCORM12.LMSGetErrorString(code);
  const diagnostic = SCORM12.LMSGetDiagnostic(code);
  const committed = SCORM12.LMSCommit("");
  console.log(name, written, code, explanation, diagnostic, committed);
  SCORM12.LMSFinish("");
}
```

Ces façades retournent les chaînes `"true"` / `"false"`, ou une autre chaîne pour les lectures/diagnostics. **`"false"` est vrai dans un simple `if (valeur)` JavaScript !** Comparez explicitement avec `"true"`. Lisez l'erreur immédiatement après l'appel concerné. Le wrapper la mémorise avant qu'une autre lecture réussie ne l'efface. Les codes `CLIENT_*` signalent un problème détecté par le gabarit, sans inventer un code ADL.

Les méthodes natives ne calculent pas automatiquement le temps ni le JSON. Pour la production, les utilitaires `commit()` et `finish()` prennent en charge ce travail. Un `LMSFinish` réussi ferme le dialogue, sans nécessairement fermer la fenêtre ou terminer le contenu. Après fermeture, aucun nouvel échange de données n'est permis dans cette session.

## 8. Les limites qui évitent les mauvaises surprises

- **Marque-page** : 255 caractères ASCII ; utilisez un identifiant court, comme `chapitre-2`. Il ne fait pas naviguer le LMS : c'est votre code qui restaure l'écran.
- **Suspension** : 4096 caractères ASCII, donc 4096 octets dans ce profil historique. Le moteur échappe accents et emoji en `\uXXXX`, puis contrôle la taille réelle transmise. Un accent prend davantage de place. Il refuse les données trop longues sans couper un JSON au milieu. Gardez des identifiants et de petites réponses ; n'y placez pas d'images ni de vidéos.
- **JSON** : il doit être sérialisable : pas de références circulaires, fonctions ou nœuds HTML. `undefined` et les fonctions ne sont pas des valeurs JSON ; ne les utilisez pas pour vos réponses. Ajoutez un numéro `version` et validez les champs après lecture.
- **Score** : le livre RTE 1.2 demande des valeurs normalisées entre **0 et 100** pour raw, min et max, y compris les scores d'objectifs. Convertissez donc un résultat sur 20 avec `points / 20 * 100`. Le gabarit vérifie aussi `min ≤ raw ≤ max`. `min` et `max` sont optionnels pour le LMS. Le score et le statut restent deux informations distinctes.
- **Statut** : `not attempted` est initialisé par le LMS ; le helper de leçon ne le réécrit pas. Un statut existant `passed`/`completed` n'est pas effacé au démarrage. Le mode `browse` signifie exploration et `review` révision ; les résultats ne donnent pas forcément des crédits (`no-credit`).
- **Durée** : SCORM 1.2 utilise une durée `HHHH:MM:SS.SS` ; pas une durée ISO. La norme accepte 2 à 4 chiffres d'heures, le gabarit en émet toujours 4. `session_time` remplace la valeur précédente et le LMS l'ajoute une fois au total à la fermeture. Le chronomètre mesure le temps écoulé, y compris les pauses et les onglets masqués : adaptez ce choix si votre pédagogie exige du temps actif.
- **Temps maximal** : la démonstration lit les éléments optionnels `student_data` et applique `exit`/`continue` et `message`/`no message`. Elle inclut le temps des sessions précédentes de la tentative. Si le LMS ne fournit pas ces éléments, aucune limite n'est imposée par cette démonstration.
- **Sortie** : `suspend` demande une reprise dans la même tentative. `logout` ne déconnecte pas directement le compte. La sortie normale est `""`. `time-out` signale un dépassement de temps. `finish("suspend", true)` est réservé au dernier recours lors du départ du navigateur et peut terminer malgré un échec de sauvegarde.
- **Sauvegarde** : Commit est appelé après les actions, après 700 ms d'inactivité dans la note, toutes les 30 secondes et quand l'onglet devient masqué. `pagehide` tente une fermeture quand la page n'est pas conservée dans le cache de navigation. Une fermeture brutale, une panne réseau ou l'arrêt de l'appareil ne garantissent aucun dernier appel : les sauvegardes régulières restent essentielles.
- **Origine web** : le navigateur doit pouvoir accéder à `window.API` dans un parent ou une fenêtre ouvrante. Un problème d'origine, de fenêtre isolée ou de configuration LMS ne se résout pas en changeant le nom de l'API. Le moteur ne simule pas automatiquement sur un site distant et ne transforme jamais une initialisation LMS refusée en faux succès local.

## 9. Créer le ZIP au bon niveau

Une archive SCORM doit contenir **`imsmanifest.xml` directement à sa racine**. C'est l'erreur classique du premier colis : on compresse le dossier parent et le LMS ne trouve pas son bordereau.

L'archive fournie est déjà prête. Après vos modifications, avec Python installé :

```powershell
python tools/package.py
```

L'outil relit les ressources du manifeste, refuse les références manquantes ou sortant du projet, inclut les schémas XSD et la documentation, puis crée `gabarit-scorm12.zip` **dans ce dossier**. Il exclut les tests, les outils et les PDF de référence. Il utilise les fichiers déclarés dans le manifeste : ajoutez-y vos nouveaux médias avant de relancer l'outil. Le ZIP précédent est remplacé uniquement à la fin d'une génération réussie. Le ZIP ne s'inclut jamais lui-même.

Sans Python, sélectionnez **les fichiers du paquetage** dans le dossier : `imsmanifest.xml`, `index.html`, les deux scripts, `styles.css`, les quatre XSD et vos médias. Utilisez « Compresser en fichier ZIP ». Ouvrez l'archive pour vérifier que `imsmanifest.xml` est immédiatement visible, sans devoir ouvrir un sous-dossier.

## 10. Tester sur Moodle

1. Dans un cours de test, activez le mode édition et ajoutez une activité **Paquetage SCORM**.
2. Donnez un nom, puis téléversez le ZIP dans le champ de paquetage. Ne le décompressez pas avant l'import.
3. Choisissez l'affichage intégré ou une nouvelle fenêtre selon votre configuration. En nouvelle fenêtre, autorisez son ouverture.
4. Pour ce gabarit, utilisez une note maximale cohérente avec l'échelle choisie, par exemple 100. Les règles de note et d'achèvement de Moodle doivent correspondre à vos intentions.
5. Enregistrez et lancez avec un **compte apprenant de test**. Vérifiez le bandeau **Connecté au LMS**, le vrai nom et le journal.
6. Répondez à une question, écrivez une note, suspendez puis relancez **la même tentative**. Vérifiez écran, réponse, note, score et temps cumulé.
7. Terminez, quittez la capsule, puis examinez le rapport de tentative. Testez séparément une nouvelle tentative : la reprise et le redémarrage n'ont pas le même sens.

Les options « forcer terminé », « nouvelle tentative » ou un seuil de réussite peuvent influencer le résultat observé. Le gabarit ne fixe pas `masteryscore` dans le manifeste principal pour laisser explorer librement les statuts ; le commentaire montre où l'ajouter. Les noms de menus dépendent de la version et de la langue de Moodle. Voir la [documentation officielle des réglages SCORM de Moodle](https://docs.moodle.org/en/SCORM_settings).

## 11. Tester sur SCORM Cloud

1. Ouvrez votre compte [SCORM Cloud](https://cloud.scorm.com/).
2. Importez `gabarit-scorm12.zip` dans votre bibliothèque et examinez les avertissements de l'analyse du colis.
3. Ouvrez l'espace de test du cours et lancez la capsule avec **Launch**.
4. Reproduisez le parcours de test Moodle, puis consultez les journaux de communication et le détail des données.
5. Testez une suspension/reprise dans une même inscription ou tentative ; repartir à zéro vérifie un autre cas.

La procédure d'import et de test est décrite par [Rustici Software](https://support.scorm.com/hc/en-us/articles/206163666-Importing-and-Testing-Content). Un lancement réussi dans SCORM Cloud est une vérification pratique, pas un certificat de conformité ni une garantie pour tous les LMS.

## 12. Petits conseils qui font gagner du temps

| Symptôme | Première vérification |
|---|---|
| « Manifeste introuvable » | Ouvrez le ZIP : le manifeste doit être à la racine. |
| « Simulation locale » dans un LMS | Vérifiez l'adresse de lancement et l'accessibilité de l'API. Ne validez pas une recette dans ce mode. |
| Score affiché dans la page, absent du rapport | Vérifiez le retour de SetValue, Commit et les règles de note du LMS. |
| Erreur 401 sur une interaction | Ce champ optionnel n'est peut-être pas implémenté ; le journal précise lequel. |
| Erreur 404 en lisant une réponse | Les détails d'interactions sont en écriture seule en 1.2. Utilisez votre JSON pour la reprise. |
| Pas de reprise | Vérifiez `exit="suspend"`, Commit, `entry="resume"` et l'absence d'une nouvelle tentative forcée. |
| Accents refusés dans les commentaires | Le profil historique est ASCII ; utilisez `saveState` pour les textes riches en caractères. |
| JSON trop grand | Conservez les identifiants, éliminez les doublons et raccourcissez les réponses libres. Ne tronquez pas le texte sérialisé. |
| Statut modifié à la fermeture | Examinez un éventuel `masteryscore` et les réglages de la plateforme. |
| Résultats différents selon le navigateur | Vérifiez stockage local, origine des fenêtres et droits de lancement. Les fichiers locaux n'ont pas tous les mêmes règles de stockage. |

**Conseil de terrain :** testez très tôt un petit colis avec une seule question et une reprise. Il est beaucoup plus rassurant de vérifier le dialogue avant de produire cinquante écrans. Sauvegardez aux étapes qui comptent ; ne réservez pas tout au bouton final.

## 13. Vérifier le projet

Ces outils sont facultatifs pour l'apprenant ; ils servent à la personne qui adapte le gabarit.

```powershell
node --check scorm_api_wrapper.js
node --check demo.js
node tests/scorm.test.cjs
python tools/check-content.py
powershell -NoProfile -File tools/validate.ps1
python tools/package.py
```

Les tests Node utilisent seulement sa bibliothèque standard. La validation XML utilise les schémas locaux et .NET sous Windows. L'état des vérifications et la liste de recette manuelle sont dans [docs/VALIDATION.md](docs/VALIDATION.md). Aucun test automatisé local ne remplace un lancement réel avec votre LMS.
