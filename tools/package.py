# [FR] Construire un colis SCORM à partir du manifeste, sans dépendance externe.
# [EN] Build a SCORM package from its manifest without external dependencies.
from pathlib import Path
import os
import tempfile
import xml.etree.ElementTree as ET
from urllib.parse import urlsplit, unquote
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
NS = {"cp": "http://www.imsproject.org/xsd/imscp_rootv1p1p2"}
OUTPUT = ROOT / "gabarit-scorm12.zip"


def safe_file(reference):
    # [FR] Les fichiers doivent rester dans le projet ; les médias distants ne sont pas incorporés.
    # [EN] Files must stay inside the project; remote media are not embedded.
    url = urlsplit(reference)
    if url.scheme or url.netloc or not url.path or "\\" in reference:
        raise ValueError(f"Référence locale invalide / Invalid local reference: {reference}")
    target = (ROOT / unquote(url.path)).resolve()
    if not target.is_relative_to(ROOT) or not target.is_file() or target == OUTPUT:
        raise ValueError(f"Fichier manquant ou interdit / Missing or forbidden file: {reference}")
    return target


def build():
    manifest = ET.parse(ROOT / "imsmanifest.xml")
    files = {ROOT / "imsmanifest.xml"}
    # [FR] Le manifeste est la source de vérité : inventorier aussi chaque point d'entrée.
    # [EN] The manifest is the source of truth: include every launch entry point too.
    for resource in manifest.findall("cp:resources/cp:resource", NS):
        if resource.get("href"):
            files.add(safe_file(resource.get("href")))
        for element in resource.findall("cp:file", NS):
            files.add(safe_file(element.get("href", "")))
    # [FR] Emporter les schémas, le guide et les exemples ; laisser les PDF de recherche hors LMS.
    # [EN] Include schemas, the guide and examples; keep research PDFs outside the LMS.
    for name in ["imscp_rootv1p1p2.xsd", "adlcp_rootv1p2.xsd", "imsmd_rootv1p2p1.xsd", "ims_xml.xsd", "README.md", "ARCHITECTURE.md"]:
        files.add(safe_file(name))
    for folder in ["docs", "examples"]:
        files.update(path for path in (ROOT / folder).rglob("*") if path.is_file())
    # [FR] Une archive temporaire évite de remplacer un ZIP valide par une écriture interrompue.
    # [EN] A temporary archive prevents replacing a valid ZIP with an interrupted write.
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=ROOT, prefix="scorm-build-", suffix=".tmp", delete=False) as handle:
            temporary = Path(handle.name)
        with ZipFile(temporary, "w", ZIP_DEFLATED) as archive:
            for path in sorted(files):
                archive.write(path, path.relative_to(ROOT).as_posix())
        with ZipFile(temporary) as archive:
            if "imsmanifest.xml" not in archive.namelist() or archive.testzip() is not None:
                raise ValueError("Archive invalide / Invalid archive")
        os.replace(temporary, OUTPUT)
    finally:
        if temporary and temporary.exists():
            temporary.unlink()
    print(f"ZIP créé / ZIP created: {OUTPUT.name} ({len(files)} fichiers / files, {OUTPUT.stat().st_size} octets / bytes)")


if __name__ == "__main__":
    build()
