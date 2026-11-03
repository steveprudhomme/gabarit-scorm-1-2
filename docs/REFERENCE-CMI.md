# Référence SCORM 1.2 : données et échanges

Source : **ADL, SCORM 1.2 Run-Time Environment, §3.3 et §3.4**. La provenance est détaillée dans [SOURCES.md](SOURCES.md). Cette référence distingue l'accès autorisé au SCO et le caractère obligatoire **pour le LMS**. « Optionnel » ne signifie pas que la syntaxe peut changer.

## Huit fonctions natives

| Fonction | Paramètres | Retour |
|---|---|---|
| `LMSInitialize("")` | chaîne vide obligatoire | `"true"` ou `"false"` |
| `LMSFinish("")` | chaîne vide obligatoire | `"true"` ou `"false"` |
| `LMSGetValue(element)` | nom exact, sensible à la casse | chaîne, parfois vide même en cas de succès |
| `LMSSetValue(element, value)` | deux chaînes | `"true"` ou `"false"` |
| `LMSCommit("")` | chaîne vide obligatoire | `"true"` ou `"false"` |
| `LMSGetLastError()` | aucun | code sous forme de chaîne |
| `LMSGetErrorString(code)` | code d'erreur | description |
| `LMSGetDiagnostic(code)` | code ; chaîne vide possible pour le diagnostic courant | détail propre au LMS |

Initialize ouvre le dialogue avant les échanges de données. Finish le ferme ; il ne signifie pas « réussi ». Les fonctions de diagnostic permettent d'examiner un échec, y compris d'initialisation. Un SetValue accepté n'est pas une preuve que la base de données du LMS a terminé son écriture : Commit et les retours d'erreur restent nécessaires.

Le moteur cherche l'objet nommé **`API`** dans la fenêtre courante et ses parents, puis dans les fenêtres ouvrantes et leurs parents. Il borne la recherche et intercepte les accès interdits par le navigateur. Une API trouvée doit proposer les huit méthodes. Aucune autre version d'API n'est utilisée.

## Toutes les feuilles du modèle

**L** = lecture ; **E** = écriture ; **L/E** = les deux. `n` est un index numérique à partir de zéro. Les numéros sont contigus : 0, 1, 2… Les noms de groupe seuls ne retournent pas un objet JSON.

| Élément | Accès | LMS | Type / fonction |
|---|---|---|---|
| `cmi.core.student_id` | L | Obligatoire | CMIIdentifier, identité |
| `cmi.core.student_name` | L | Obligatoire | CMIString255, nom fourni par le LMS |
| `cmi.core.lesson_location` | L/E | Obligatoire | CMIString255, marque-page |
| `cmi.core.credit` | L | Obligatoire | `credit`, `no-credit` |
| `cmi.core.lesson_status` | L/E | Obligatoire | Statut, vocabulaire ci-dessous |
| `cmi.core.entry` | L | Obligatoire | `ab-initio`, `resume`, `""` |
| `cmi.core.score.raw` | L/E | Obligatoire | CMIDecimal ou chaîne vide |
| `cmi.core.score.min` | L/E | Optionnel | CMIDecimal ou chaîne vide |
| `cmi.core.score.max` | L/E | Optionnel | CMIDecimal ou chaîne vide |
| `cmi.core.total_time` | L | Obligatoire | CMITimespan, cumul antérieur à la session courante |
| `cmi.core.lesson_mode` | L | Optionnel | `normal`, `browse`, `review` ; en l'absence d'indication, comportement normal |
| `cmi.core.exit` | E | Obligatoire | `suspend`, `logout`, `time-out`, `""` |
| `cmi.core.session_time` | E | Obligatoire | CMITimespan, durée courante remplaçable |
| `cmi.suspend_data` | L/E | Obligatoire | CMIString4096, reprise propre au SCO |
| `cmi.launch_data` | L | Obligatoire | CMIString4096, paramètre fourni au lancement |
| `cmi.comments` | L/E | Optionnel | CMIString4096, commentaire libre du SCO |
| `cmi.comments_from_lms` | L | Optionnel | CMIString4096, commentaire fourni par le LMS |
| `cmi.objectives.n.id` | L/E | Optionnel | CMIIdentifier |
| `cmi.objectives.n.score.raw` | L/E | Optionnel | CMIDecimal ou chaîne vide |
| `cmi.objectives.n.score.min` | L/E | Optionnel | CMIDecimal ou chaîne vide |
| `cmi.objectives.n.score.max` | L/E | Optionnel | CMIDecimal ou chaîne vide |
| `cmi.objectives.n.status` | L/E | Optionnel | Même vocabulaire de statut |
| `cmi.student_data.mastery_score` | L | Optionnel | CMIDecimal, seuil transmis par le LMS |
| `cmi.student_data.max_time_allowed` | L | Optionnel | CMITimespan, durée autorisée |
| `cmi.student_data.time_limit_action` | L | Optionnel | Vocabulaire ci-dessous |
| `cmi.student_preference.audio` | L/E | Optionnel | Entier : −1 coupé, 0 défaut, 1–100 volume |
| `cmi.student_preference.language` | L/E | Optionnel | CMIString255, souhait de langue |
| `cmi.student_preference.speed` | L/E | Optionnel | Entier −100 à 100, 0 défaut |
| `cmi.student_preference.text` | L/E | Optionnel | −1 masquer, 0 défaut, 1 afficher |
| `cmi.interactions.n.id` | E | Optionnel | CMIIdentifier |
| `cmi.interactions.n.objectives.n.id` | E | Optionnel | CMIIdentifier, lien vers un objectif |
| `cmi.interactions.n.time` | E | Optionnel | CMITime, heure locale de réponse |
| `cmi.interactions.n.type` | E | Optionnel | Un des huit types d'interactions |
| `cmi.interactions.n.correct_responses.n.pattern` | E | Optionnel | CMIFeedback, réponse acceptable |
| `cmi.interactions.n.student_response` | E | Optionnel | CMIFeedback, réponse donnée |
| `cmi.interactions.n.result` | E | Optionnel | Résultat ou CMIDecimal |
| `cmi.interactions.n.weighting` | E | Optionnel | CMIDecimal, poids ; 0 = hors note pondérée |
| `cmi.interactions.n.latency` | E | Optionnel | CMITimespan, temps nécessaire pour répondre |

La langue est un souhait textuel ; `fr` et `en` sont des conventions raisonnables du gabarit. Le SCO décide comment appliquer ces préférences. Le livre RTE indique également que toute valeur négative d'audio peut servir de commande d'arrêt ; le helper se limite volontairement à −1, valeur portable présentée dans la démonstration.

## Mots-clés lisibles

| Chemin | LMS | Signification |
|---|---|---|
| `cmi.core._children` | Obligatoire | Liste des enfants de core |
| `cmi.core.score._children` | Obligatoire | Au minimum raw ; min/max selon support |
| `cmi.objectives._children` | Optionnel | Enfants d'un objectif : id, score, status |
| `cmi.objectives._count` | Optionnel | Nombre d'objectifs |
| `cmi.objectives.n.score._children` | Optionnel | Champs de score de cet objectif |
| `cmi.student_data._children` | Optionnel | Données apprenant disponibles |
| `cmi.student_preference._children` | Optionnel | Préférences disponibles |
| `cmi.interactions._children` | Optionnel | Champs d'interactions disponibles |
| `cmi.interactions._count` | Optionnel | Nombre d'interactions |
| `cmi.interactions.n.objectives._count` | Optionnel | Nombre de liens vers des objectifs |
| `cmi.interactions.n.correct_responses._count` | Optionnel | Nombre de réponses acceptables |

Ces mots-clés ne se modifient pas. Par exemple, `_count="3"` signifie que 0, 1 et 2 sont occupés ; la prochaine insertion utilise 3. Les compteurs d'interactions sont lisibles même si leurs détails ne le sont pas. `_children` donne une liste séparée par des virgules, pas nécessairement identique sur chaque LMS. Un succès sur un groupe n'assure pas que tous ses sous-champs soient pris en charge : contrôlez aussi les retours d'écriture.

## Vocabulaires exacts

- Statut : `passed`, `completed`, `failed`, `incomplete`, `browsed`, `not attempted`. Pour la leçon, le LMS initialise `not attempted` ; ne vous en servez pas comme bouton de remise à zéro d'une tentative.
- Résultat d'interaction : `correct`, **`wrong`**, `unanticipated`, `neutral`, ou une valeur numérique CMIDecimal. Le SCO calcule ce résultat ; le LMS n'est pas tenu de corriger vos questions.
- Délai : `exit,message`, `exit,no message`, `continue,message`, `continue,no message`. Le SCO interprète ces instructions lorsqu'elles sont fournies. Une limite de temps n'est pas automatiquement appliquée par une simple balise HTML.

Une note, un statut de leçon et un statut d'objectif sont trois informations différentes. Lier une interaction à un objectif ne modifie pas automatiquement le score de cet objectif. Le RTE 1.2 exige des scores raw/min/max normalisés entre **0 et 100**, pour la leçon comme pour les objectifs. Les scores peuvent aussi être vides avant évaluation. Une note calculée sur 20 se convertit avant transmission. Le gabarit exige en plus min ≤ raw ≤ max pour le helper de score de leçon.

`cmi.comments` est un champ lu et écrit, mais le comportement prévu est une **concaténation** des commentaires transmis par le SCO. Envoyez seulement le nouveau fragment, avec votre séparateur, et contrôlez la capacité cumulée de 4096 caractères. Ce champ n'offre pas de commande universelle pour supprimer les observations précédentes.

## Formats des huit interactions

| Type | Réponse acceptée — exemple | Réponse apprenant — exemple | Activité de démonstration |
|---|---|---|---|
| `true-false` | `f` | `f` | Commit ferme-t-il la session ? |
| `choice` | `b` ou `{a,b}` | `b` ou `a,b` | QCM simple ou choix multiples |
| `fill-in` | `suspend_data` | `suspend_data` | Texte à compléter |
| `matching` | `{1.a,2.b}` | `1.a,2.b` | Associer fonction et rôle |
| `performance` | `manifest=1;commit=1;test=1` | même format libre | Liste de vérification d'une mise en situation |
| `sequencing` | `b,c,a` | `b,c,a` | Remettre les appels dans l'ordre |
| `likert` | aucun attendu nécessaire | `3` | Autoévaluation, résultat neutral |
| `numeric` | `8` | `8` | Nombre de fonctions natives |

Un identifiant de choix est **un seul caractère** `0–9` ou `a–z`. Une virgule sépare des choix ; un point sépare les deux éléments d'une association. Les accolades indiquent que tous les choix ou toutes les paires du motif sont nécessaires. Une séquence conserve l'ordre. La réponse numeric est un nombre simple ; une éventuelle tolérance se calcule dans votre correction JavaScript. `performance` ne possède pas une grammaire de sous-étapes imposée ici : le petit format `cle=valeur` est une convention du gabarit.

Les libellés affichés aux apprenants peuvent être longs et accentués, mais les traces restent courtes et encodées selon le type. Le helper refuse les réponses non ASCII ; pour une réponse textuelle internationale, conserver le texte dans le JSON et transmettre une trace courte ASCII définie par votre activité. Une phrase ne devient pas un choix SCORM valide simplement parce qu'elle est affichée dans un bouton.

## Types et tailles

- **CMIString255 / CMIString4096** : chaînes ASCII de 255 ou 4096 caractères maximum dans le profil historique. Pour suspend_data, le livre parle aussi explicitement de 4096 octets. L'encodage JSON ASCII rend ces deux comptes identiques.
- **CMIIdentifier** : caractères imprimables sans espace, 255 maximum. Les identifiants générés par le gabarit utilisent le sous-ensemble simple lettres/chiffres/tiret/souligné. La description spécifique de student_id dans le livre est plus restrictive ; ce champ est fourni par le LMS, le SCO ne le modifie pas.
- **CMIDecimal** : nombre décimal, point comme séparateur ; ne pas envoyer la virgule française `80,5`. Le helper refuse NaN, Infinity et les écritures exponentielles pour garder une chaîne décimale explicite.
- **CMIInteger** : entier 0 à 65536 ; **CMISInteger** : entier signé −32768 à 32768, puis éventuelles bornes propres au champ.
- **CMITime** : heure sur 24 heures, `HH:MM:SS.SS`, par exemple `14:05:09.25`.
- **CMITimespan** : durée `HHHH:MM:SS.SS`, heures sur 2 à 4 chiffres, minutes/secondes sur 2 chiffres ; les centièmes sont optionnels dans la norme. Le gabarit émet systématiquement 4 chiffres d'heures et 2 décimales.
- **CMIBoolean** : chaînes `"true"` et `"false"` ; **CMIBlank** : chaîne vide.

Le helper garantit un format de durée sans débordement jusqu'à `9999:59:59.99` ; au-delà, il refuse le calcul. Il ne lit pas `session_time` ni `exit`, qui sont en écriture seule. Pour connaître le temps de la session courante, utilisez `elapsedMilliseconds` côté capsule.

## Erreurs ADL et erreurs du gabarit

| Code ADL | Sens |
|---|---|
| `0` | Pas d'erreur |
| `101` | Exception générale |
| `201` | Argument invalide |
| `202` | L'élément ne peut pas avoir d'enfants |
| `203` | L'élément n'est pas un tableau, donc pas de compteur |
| `301` | Communication non initialisée |
| `401` | Élément non implémenté |
| `402` | Tentative de modifier un mot-clé |
| `403` | Élément en lecture seule |
| `404` | Élément en écriture seule |
| `405` | Type de donnée incorrect |

Le diagnostic détaillé dépend du LMS. Le moteur ajoute des codes textuels **CLIENT_NO_API**, **CLIENT_SESSION**, **CLIENT_VALIDATION**, **CLIENT_JSON**, **CLIENT_EXCEPTION** et **CLIENT_FALSE_RETURN** ; ils ne sont pas des codes de la norme. Un LMS qui renvoie `false` sans erreur exploitable reste signalé comme un échec.

L'historique du moteur conserve 200 opérations et l'interface en affiche 60. Les résultats de lecture dans `SCORM12.history` peuvent contenir des données personnelles : gardez le débogage désactivé en production et ne partagez pas un historique brut contenant de vraies réponses.
