# Documents et composants tiers

La GPL v3 du projet couvre son code original, ses outils, ses exemples et sa documentation originale. Elle **ne remplace pas** les droits des documents normatifs, des schémas historiques et des textes de licence fournis par d'autres auteurs.

Copyright du travail original : 2026 Steve Prud'Homme et les contributeurs au projet. Le texte complet de la licence du projet se trouve dans [LICENSE.md](LICENSE.md). Son identifiant est **GPL-3.0-only**.

## Livres ADL SCORM 1.2

Les deux documents originaux dans `references/` proviennent d'Advanced Distributed Learning :

- `ADL-SCORM-1.2-RTE.pdf` — The SCORM Run-Time Environment, version 1.2, 1er octobre 2001.
- `SCORM-12-CAM.pdf` — The SCORM Content Aggregation Model, version 1.2, 1er octobre 2001.

Leurs mentions de copyright et de droits restent celles de leurs auteurs. Ils sont conservés comme références normatives, hors du paquetage LMS, et ne sont pas présentés comme du code GPL du projet. Les extractions de texte réalisées localement ne modifient pas ces droits. La provenance et les liens de consultation sont détaillés dans [doc/SOURCES.md du dépôt](https://github.com/steveprudhomme/gabarit-scorm-1-2/blob/main/doc/SOURCES.md).

## Schémas IMS/ADL

| Fichiers | Origine |
|---|---|
| `src/imscp_rootv1p1p2.xsd` et son original dans `references/original-schemas/` | IMS Global Learning Consortium, Inc., schéma Content Packaging 1.1.2 ; copyright 2001 conservé. |
| `src/imsmd_rootv1p2p1.xsd`, `src/ims_xml.xsd` et leurs originaux | Schémas IMS de métadonnées et d'attributs XML, avec attributions historiques conservées. |
| `src/adlcp_rootv1p2.xsd` et son original | Extensions de paquetage ADL SCORM 1.2. |

Les schémas ne sont pas relicenciés sous GPL par ce dépôt. Les attributions présentes dans leurs contenus restent applicables. Les commentaires pédagogiques bilingues et l'ajustement du préfixe XML de `ims_xml.xsd` sont documentés dans `doc/SOURCES.md` ; les originaux restent conservés pour comparaison.

Consultez les [conditions de spécification IMS/1EdTech](https://www.imsglobal.org/license.html) et la [page officielle du binding CP 1.1.2](https://www.imsglobal.org/content/packaging/cpv1p1p2/imscp_bindv1p1p2.html) pour les droits correspondants. La présence d'un fichier dans le dépôt ne constitue pas une autorisation de le redistribuer sous une autre licence ou de revendiquer une certification.

## Textes de licence et DCO

Le texte de la GNU GPL version 3 est reproduit sans modification depuis [GNU](https://www.gnu.org/licenses/gpl-3.0.txt). Il conserve ses propres mentions de copyright.

Le [Developer Certificate of Origin 1.1](https://developercertificate.org/) est référencé par le guide de contribution. Le projet ne modifie pas son texte et ne le présente pas comme une création de ses responsables.

## Dans le ZIP SCORM

Le générateur ajoute `LICENSE.md` et `THIRD_PARTY_NOTICES.md` à la racine du ZIP pour accompagner le code distribué. Ces deux notices constituent une exception volontaire à la séparation entre la capsule et la documentation de travail : les guides, tests et références PDF ne sont pas ajoutés au ZIP.
