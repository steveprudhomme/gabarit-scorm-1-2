# [FR] Copyright (C) 2026 Steve Prud'Homme et les contributeurs. SPDX-License-Identifier: GPL-3.0-only
# [EN] Copyright (C) 2026 Steve Prud'Homme and contributors. SPDX-License-Identifier: GPL-3.0-only
# [FR] Redistribution et modification sous GPL v3, sans garantie ; voir LICENSE.md.
# [EN] Redistribution and modification under GPL v3, without warranty; see LICENSE.md.
# [FR] Contrôle de style léger, sans dépendance, sur le code et la documentation originaux.
# [EN] Lightweight dependency-free style checks for original code and documentation.
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
EXTENSIONS = {".md", ".js", ".cjs", ".py", ".ps1", ".html", ".css", ".yml", ".yaml"}


def check():
    paths = {path for path in ROOT.iterdir() if path.is_file() and path.suffix in EXTENSIONS and path.name != "LICENSE.md"}
    for folder in [".github", "src", "doc", "examples", "tests", "tools"]:
        paths.update(path for path in (ROOT / folder).rglob("*") if path.is_file() and path.suffix in EXTENSIONS)
    errors = []
    for path in sorted(paths):
        data = path.read_bytes()
        relative = path.relative_to(ROOT).as_posix()
        try:
            content = data.decode("utf-8")
        except UnicodeDecodeError:
            errors.append(relative + ": UTF-8 requis / UTF-8 required")
            continue
        # [FR] Tolérer CRLF sur un poste Windows ; Git conserve LF selon .gitattributes.
        # [EN] Allow CRLF on a Windows workstation; Git stores LF according to .gitattributes.
        if "\r" in content.replace("\r\n", ""):
            errors.append(relative + ": fin de ligne CR isolée / isolated CR line ending")
        if not content.endswith("\n"):
            errors.append(relative + ": retour final manquant / missing final newline")
        for number, line in enumerate(content.splitlines(), 1):
            if line.rstrip(" \t") != line:
                errors.append(f"{relative}:{number}: espace en fin de ligne / trailing whitespace")
            if line.startswith("\t"):
                errors.append(f"{relative}:{number}: indentation par espaces requise / space indentation required")
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return False
    print(f"Style : {len(paths)} fichier(s) verifies / file(s) checked.")
    return True


if __name__ == "__main__":
    sys.exit(0 if check() else 1)
