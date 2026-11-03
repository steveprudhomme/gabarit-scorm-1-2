# [FR] Copyright (C) 2026 Steve Prud'Homme et les contributeurs. SPDX-License-Identifier: GPL-3.0-only
# [EN] Copyright (C) 2026 Steve Prud'Homme and contributors. SPDX-License-Identifier: GPL-3.0-only
# [FR] Redistribution et modification sous GPL v3, sans garantie ; voir LICENSE.md.
# [EN] Redistribution and modification under GPL v3, without warranty; see LICENSE.md.
# [FR] Construire un colis SCORM à partir du manifeste, sans dépendance externe.
# [EN] Build a SCORM package from its manifest without external dependencies.
from pathlib import Path
import os
import tempfile
import xml.etree.ElementTree as ET
from urllib.parse import urlsplit, unquote
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src"
NS = {"cp": "http://www.imsproject.org/xsd/imscp_rootv1p1p2"}
OUTPUT = ROOT / "dist" / "gabarit-scorm12.zip"


def safe_file(reference):
    # [FR] Les fichiers du paquetage doivent rester dans src/ ; les médias distants ne sont pas incorporés.
    # [EN] Package files must stay inside src/; remote media are not embedded.
    url = urlsplit(reference)
    if url.scheme or url.netloc or not url.path or "\\" in reference:
        raise ValueError(f"Référence locale invalide / Invalid local reference: {reference}")
    target = (SOURCE / unquote(url.path)).resolve()
    if not target.is_relative_to(SOURCE.resolve()) or not target.is_file():
        raise ValueError(f"Fichier manquant ou interdit / Missing or forbidden file: {reference}")
    return target


def build():
    manifest = ET.parse(SOURCE / "imsmanifest.xml")
    files = {SOURCE / "imsmanifest.xml"}
    # [FR] Le manifeste est la source de vérité : inventorier aussi chaque point d'entrée.
    # [EN] The manifest is the source of truth: include every launch entry point too.
    for resource in manifest.findall("cp:resources/cp:resource", NS):
        if resource.get("href"):
            files.add(safe_file(resource.get("href")))
        for element in resource.findall("cp:file", NS):
            files.add(safe_file(element.get("href", "")))
    # [FR] Emporter les schémas ; la documentation, les exemples et les tests restent dans le dépôt.
    # [EN] Include schemas; documentation, examples and tests stay in the repository.
    for name in ["imscp_rootv1p1p2.xsd", "adlcp_rootv1p2.xsd", "imsmd_rootv1p2p1.xsd", "ims_xml.xsd"]:
        files.add(safe_file(name))
    # [FR] Les mentions légales accompagnent toute distribution ; seules ces deux sources fixes viennent de la racine.
    # [EN] Legal notices accompany every distribution; only these two fixed source files come from the root.
    entries = {path.relative_to(SOURCE).as_posix(): path for path in files}
    for name in ["LICENSE.md", "THIRD_PARTY_NOTICES.md"]:
        legal_file = (ROOT / name).resolve()
        if not legal_file.is_relative_to(ROOT.resolve()) or not legal_file.is_file():
            raise ValueError("Mention légale absente ou invalide / Missing or invalid legal notice: " + name)
        entries[name] = legal_file
    # [FR] Une archive temporaire évite de remplacer un ZIP valide par une écriture interrompue.
    # [EN] A temporary archive prevents replacing a valid ZIP with an interrupted write.
    temporary = None
    try:
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(dir=OUTPUT.parent, prefix="scorm-build-", suffix=".tmp", delete=False) as handle:
            temporary = Path(handle.name)
        with ZipFile(temporary, "w", ZIP_DEFLATED) as archive:
            for name, path in sorted(entries.items()):
                # [FR] Retirer le préfixe src/ pour placer le manifeste directement à la racine du ZIP.
                # [EN] Remove the src/ prefix to place the manifest directly at the ZIP root.
                archive.write(path, name)
        with ZipFile(temporary) as archive:
            if "imsmanifest.xml" not in archive.namelist() or archive.testzip() is not None:
                raise ValueError("Archive invalide / Invalid archive")
        os.replace(temporary, OUTPUT)
    finally:
        if temporary and temporary.exists():
            temporary.unlink()
    print(f"ZIP créé / ZIP created: {OUTPUT.relative_to(ROOT).as_posix()} ({len(entries)} fichiers / files, {OUTPUT.stat().st_size} octets / bytes)")


if __name__ == "__main__":
    build()
