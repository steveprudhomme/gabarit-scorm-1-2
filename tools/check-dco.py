# [FR] Copyright (C) 2026 Steve Prud'Homme et les contributeurs. SPDX-License-Identifier: GPL-3.0-only
# [EN] Copyright (C) 2026 Steve Prud'Homme and contributors. SPDX-License-Identifier: GPL-3.0-only
# [FR] Redistribution et modification sous GPL v3, sans garantie ; voir LICENSE.md.
# [EN] Redistribution and modification under GPL v3, without warranty; see LICENSE.md.
# [FR] Vérifier les attestations DCO dans les trailers des nouveaux commits, sans réécrire l'historique.
# [EN] Check DCO attestations in new commit trailers without rewriting history.
import argparse
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHA = re.compile(r"^[0-9a-fA-F]{40}(?:[0-9a-fA-F]{24})?$")
SIGNOFF = re.compile(r"^Signed-off-by:\s+[^\s<>][^<>\r\n]*?\s+<[^<>\s]+@[^<>\s]+>$", re.IGNORECASE)


def has_signoff(trailers):
    return any(SIGNOFF.fullmatch(line.strip()) for line in trailers.splitlines())


def git(*arguments, input_text=None):
    result = subprocess.run(
        ["git", *arguments], cwd=ROOT, input=input_text,
        capture_output=True, encoding="utf-8", check=True)
    return result.stdout


def check(base, head):
    # [FR] Limiter les entrées aux identifiants complets ; aucune expression Git arbitraire n'est acceptée.
    # [EN] Restrict inputs to full identifiers; arbitrary Git expressions are not accepted.
    if not SHA.fullmatch(base) or not SHA.fullmatch(head):
        raise ValueError("SHA complet attendu / Full commit SHA expected.")
    git("rev-parse", "--verify", base + "^{commit}")
    git("rev-parse", "--verify", head + "^{commit}")
    commits = git("rev-list", "--reverse", base + ".." + head).splitlines()
    missing = []
    for commit in commits:
        message = git("show", "-s", "--format=%B", commit)
        # [FR] Git distingue les vrais trailers d'une ligne simplement citée dans le corps du message.
        # [EN] Git distinguishes actual trailers from a line merely quoted in the message body.
        trailers = git("interpret-trailers", "--parse", input_text=message)
        if not has_signoff(trailers):
            missing.append(commit[:12])
    if missing:
        print("Attestation DCO absente ou invalide / Missing or invalid DCO sign-off: " + ", ".join(missing), file=sys.stderr)
        return False
    print(f"DCO : {len(commits)} commit(s) verifies / commit(s) checked.")
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="DCO sign-off check / Controle des attestations DCO")
    parser.add_argument("--base", required=True)
    parser.add_argument("--head", required=True)
    args = parser.parse_args()
    try:
        sys.exit(0 if check(args.base, args.head) else 1)
    except (ValueError, subprocess.CalledProcessError) as error:
        print("Controle DCO impossible / Cannot check DCO: " + str(error), file=sys.stderr)
        sys.exit(1)
