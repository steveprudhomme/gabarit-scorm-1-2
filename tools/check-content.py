# [FR] Vérifier les liens locaux, identifiants HTML, exemples JavaScript et repères de commentaires.
# [EN] Check local links, HTML identifiers, JavaScript examples and comment markers.
from pathlib import Path
from html.parser import HTMLParser
import re
import subprocess
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class Inspect(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.refs, self.scripts = [], [], []
        self.codes = {}
        self.code_id = None
        self.in_script = False
        self.script = ""

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if "id" in attributes:
            self.ids.append(attributes["id"])
        if tag == "code":
            self.code_id = attributes.get("id")
        if tag == "script" and "src" not in attributes:
            self.in_script, self.script = True, ""
        if tag in ["script", "link"]:
            reference = attributes.get("src") or attributes.get("href")
            if reference:
                self.refs.append(reference)

    def handle_endtag(self, tag):
        if tag == "code":
            self.code_id = None
        if tag == "script" and self.in_script:
            self.scripts.append(self.script)
            self.in_script = False

    def handle_data(self, data):
        if self.code_id and self.code_id.startswith("code-"):
            self.codes[self.code_id] = self.codes.get(self.code_id, "") + data
        if self.in_script:
            self.script += data


def check():
    checked = []
    for relative in ["src/index.html", "examples/minimal.html", "tests/lms-harness.html"]:
        path = ROOT / relative
        parser = Inspect()
        parser.feed(path.read_text(encoding="utf-8"))
        assert len(parser.ids) == len(set(parser.ids)), f"Identifiant dupliqué / Duplicate id: {path}"
        for reference in parser.refs:
            assert (path.parent / reference).is_file(), f"Fichier absent / Missing asset: {reference}"
        # [FR] Les blocs copiables doivent être du JavaScript valide même s'ils ne sont pas exécutés ici.
        # [EN] Copyable blocks must be valid JavaScript even though they are not executed here.
        snippets = list(parser.codes.items()) + [(f"inline-{i}", source) for i, source in enumerate(parser.scripts)]
        for name, source in snippets:
            result = subprocess.run(
                ["node", "-e", 'new (require("node:vm").Script)(require("node:fs").readFileSync(0,"utf8"))'],
                input=source, encoding="utf-8", capture_output=True, check=False)
            assert result.returncode == 0, f"{relative} {name}: {result.stderr}"
        checked.append(relative)
    main = Inspect()
    main.feed((ROOT / "src/index.html").read_text(encoding="utf-8"))
    for identifier in re.findall(r'\$\("([a-zA-Z0-9-]+)"\)', (ROOT / "src/demo.js").read_text(encoding="utf-8")):
        assert identifier in main.ids, f"Sélecteur inconnu / Unknown selector: {identifier}"
    files = [ROOT / "src/imsmanifest.xml", *(ROOT / "src").glob("*.xsd"), ROOT / "src/index.html", ROOT / "examples/minimal.html", ROOT / "examples/imsmanifest-multisco.xml", ROOT / "tests/lms-harness.html"]
    for path in files:
        for comment in re.findall(r"<!--(.*?)-->", path.read_text(encoding="utf-8"), re.S):
            assert any(marker in comment for marker in ["[FR]", "[EN]", "[COPIER-COLLER"]) or set(comment.strip()) <= {"=", "*"}, f"Commentaire sans langue / Comment without language marker: {path}"
    # [FR] Après un déplacement de dossiers, vérifier aussi les liens relatifs des guides.
    # [EN] After moving directories, also check relative links in the guides.
    for path in [ROOT / "README.md", *(ROOT / "doc").glob("*.md")]:
        for reference in re.findall(r"\[[^\]]*\]\(([^)]+)\)", path.read_text(encoding="utf-8")):
            url = urlsplit(reference)
            if not url.scheme and not url.netloc and url.path:
                target = (path.parent / unquote(url.path)).resolve()
                assert target.is_relative_to(ROOT) and target.exists(), f"Lien absent / Missing link: {path.name}: {reference}"
    print("Contenu vérifié / Content checked: " + ", ".join(checked))
    print("Identifiants, fichiers, exemples et commentaires OK / IDs, files, examples and comments OK.")


if __name__ == "__main__":
    check()
