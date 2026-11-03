# Aller plus loin dans le paquetage SCORM 1.2

Le manifeste principal utilise volontairement un seul SCO. Vous pouvez déjà créer un parcours riche à l'intérieur de cette capsule. Un découpage en plusieurs SCO sert lorsque le LMS doit suivre et lancer plusieurs unités séparément ; il demande de tester les règles de navigation et les tentatives de chaque unité.

## Ce que représentent les balises

| Élément / attribut | Rôle |
|---|---|
| `manifest` | Enveloppe identifiée du colis ; un manifeste principal se nomme `imsmanifest.xml`. |
| `metadata` | Informations descriptives ; `schema` et `schemaversion` annoncent ADL SCORM 1.2. |
| `organizations` / `default` | Plans possibles du cours et plan choisi par défaut. |
| `organization` | Un plan, avec un titre et des entrées. |
| `item` | Entrée du plan ; peut contenir d'autres items pour former une hiérarchie. |
| `identifierref` | Lien vers l'identifiant d'une resource ; ce n'est pas directement un nom de fichier. |
| `isvisible` | Indique si l'entrée est affichée dans le menu du LMS ; ne constitue pas une protection d'accès. |
| `parameters` | Paramètres statiques de lancement d'un item ; distincts de `cmi.launch_data`. |
| `resources` / `resource` | Inventaire des ressources, avec leurs identifiants. |
| `type="webcontent"` | Contenu web dans ce profil de paquetage. |
| `adlcp:scormtype="sco"` | Unité qui communique avec l'API. La casse de scormtype est importante. |
| `adlcp:scormtype="asset"` | Ressource web sans obligation de communiquer avec l'API. |
| `href` | Point d'entrée d'une ressource ou fichier inclus, selon l'élément qui le porte. |
| `file` | Fichier physique à emporter. |
| `dependency identifierref="..."` | Dépendance vers une autre resource de fichiers partagés. |
| `xml:base` | Base relative de résolution des chemins ; évitée dans le gabarit pour simplifier l'apprentissage. |

Le modèle CAM prévoit aussi les sous-manifestes et les métadonnées associées au paquet, à l'organisation, aux items, aux ressources et aux fichiers. Il ne faut pas confondre une arborescence de contenu avec un moteur universel de scénarios : le LMS reste responsable des lancements, et la capsule contrôle ses activités internes.

## Extensions ADL des items

Ces éléments existent en 1.2. Le manifeste principal montre un temps maximal, son action et des données de lancement. Leur emploi ne signifie pas que tous les champs correspondants du modèle de données sont obligatoires pour le LMS.

```xml
<!-- [FR] Exemple à insérer dans un item de SCO, après son titre et ses éventuels enfants/métadonnées.
     [EN] Example to insert inside a SCO item, after its title and optional child items/metadata. -->
<adlcp:prerequisites type="aicc_script">ITEM_INTRO</adlcp:prerequisites>
<adlcp:maxtimeallowed>0000:30:00.00</adlcp:maxtimeallowed>
<adlcp:timelimitaction>continue,message</adlcp:timelimitaction>
<adlcp:datafromlms>niveau=debutant&amp;langue=fr</adlcp:datafromlms>
<adlcp:masteryscore>80</adlcp:masteryscore>
```

`prerequisites` exprime des prérequis selon la syntaxe AICC de SCORM 1.2 ; l'exemple demande l'item `ITEM_INTRO`. Pour une conjonction, l'esperluette doit être échappée en XML : `ITEM_A&amp;ITEM_B`. L'évaluation appartient au LMS, qui peut exposer cette fonctionnalité différemment. Gardez la recette dans chaque plateforme cible.

`maxtimeallowed`, `timelimitaction`, `datafromlms` et `masteryscore` concernent un item représentant un SCO, pas un simple regroupement sans contenu. Les données fournies par `datafromlms` se lisent dans `cmi.launch_data` ; le livre CAM fixe ici une capacité minimale garantie de 255 caractères, alors que le champ de lancement du RTE a une capacité de 4096. Le gabarit utilise une valeur courte et évite de dépendre d'une capacité supérieure pour ce paramètre du manifeste.

`masteryscore` est un seuil normalisé entre 0 et 100. Il peut amener le LMS à transformer le statut en passed/failed lorsque le SCO a transmis un score. Le manifeste principal le laisse désactivé pour permettre l'exploration des statuts. Dans un cours évalué, fixez votre règle et vérifiez l'accord entre le score, le seuil et le rapport du LMS.

## Exemple multi-SCO et ressource partagée

Le fichier [examples/imsmanifest-multisco.xml](../examples/imsmanifest-multisco.xml) est un **manifeste alternatif**, pas celui importé par défaut. Pour l'essayer, conservez une copie de `src/imsmanifest.xml`, puis remplacez son contenu par celui de l'exemple et reconstruisez le ZIP dans `dist/`. Ne placez pas deux manifestes principaux à la racine sous le même nom.

L'exemple lance la même application avec `?unit=intro` et `?unit=pratique`, comme deux SCO distincts. Le LMS doit leur attribuer deux contextes de suivi indépendants. Les paramètres d'URL n'ajoutent pas un élément cmi ; dans votre application, vous pouvez lire `new URLSearchParams(location.search).get("unit")` pour afficher des contenus différents. Ici les deux SCO montrent les mêmes activités afin d'illustrer le découpage. Le deuxième possède le prérequis du premier. `RES_PARTAGE` contient les fichiers partagés via `dependency`.

La navigation interne des trois écrans reste dans un SCO. Aucun appel JavaScript SCORM 1.2 universel ne commande « lancer le SCO suivant » : laissez le menu et les règles du LMS gérer ce changement.

## Métadonnées plus détaillées

Les métadonnées servent à retrouver et décrire un contenu, comme une fiche de bibliothèque. Le schéma IMS MD 1.2.1 est fourni pour une extension ultérieure. Le gabarit ne prétend pas créer une fiche LOM complète ni implémenter toutes les politiques d'indexation des LMS.

Pour référencer un document de métadonnées externe, la structure ADL est :

```xml
<!-- [FR] Exemple : le document metadata.xml doit être créé dans src/, validé et inclus dans le colis.
     [EN] Example: metadata.xml must be created inside src/, validated and included in the package. -->
<metadata>
  <schema>ADL SCORM</schema>
  <schemaversion>1.2</schemaversion>
  <adlcp:location>metadata.xml</adlcp:location>
</metadata>
```

Ne collez pas ce fragment sans fournir le document pointé. Vous pouvez aussi embarquer les métadonnées avec le bon espace de noms IMS MD, conformément au profil concerné du CAM. Les annotations de schémas anciennes et les règles de profil appellent une validation dédiée : une validation XML du manifeste seul ne prouve pas la conformité d'une fiche descriptive complète.

## Périmètre de l'exhaustivité

Le moteur expose les **huit fonctions natives et toutes les feuilles cmi du RTE 1.2**, avec accès générique et helpers pour chaque famille. La démonstration exerce les huit types d'interactions. Le manifeste principal est un paquetage mono-SCO valide et l'exemple étend les mécanismes de prérequis, de ressources asset et de dépendances.

Cela ne représente pas toutes les combinaisons de paquetage, tous les champs possibles d'une fiche de métadonnées, ni toutes les activités pédagogiques imaginables. La norme n'en donne pas une collection exhaustive de composants d'interface. Cette distinction permet de rester précis et d'éviter une fausse promesse de « tout fonctionner partout ».
