# [FR] Copyright (C) 2026 Steve Prud'Homme et les contributeurs. SPDX-License-Identifier: GPL-3.0-only
# [EN] Copyright (C) 2026 Steve Prud'Homme and contributors. SPDX-License-Identifier: GPL-3.0-only
# [FR] Redistribution et modification sous GPL v3, sans garantie ; voir LICENSE.md.
# [EN] Redistribution and modification under GPL v3, without warranty; see LICENSE.md.
# [FR] Tests des trailers DCO et du rejet d'entrées non conformes.
# [EN] Tests for DCO trailers and rejection of invalid inputs.
import importlib.util
from contextlib import redirect_stderr, redirect_stdout
from io import StringIO
from pathlib import Path
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("dco_checker", ROOT / "tools/check-dco.py")
dco = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(dco)


class DCOTests(unittest.TestCase):
    def test_accepts_named_signoff_and_github_privacy_address(self):
        self.assertTrue(dco.has_signoff("Signed-off-by: Camille Exemple <123+camille@users.noreply.github.com>"))
        self.assertTrue(dco.has_signoff("Reviewed-by: Other <other@example.com>\nsigned-off-by: Camille Exemple <camille@example.com>"))

    def test_rejects_missing_name_address_and_unrelated_trailers(self):
        for trailers in ["", "Signed-off-by:", "Signed-off-by: Camille", "Signed-off-by: <camille@example.com>", "Signed-off-by: Camille <not-an-email>", "Reviewed-by: Camille <camille@example.com>"]:
            with self.subTest(trailers=trailers):
                self.assertFalse(dco.has_signoff(trailers))

    def test_rejects_arbitrary_git_expressions_before_calling_git(self):
        with patch.object(dco, "git") as git:
            with self.assertRaises(ValueError):
                dco.check("--all", "a" * 40)
            git.assert_not_called()

    def test_git_extracted_trailers_determine_the_commit_result(self):
        base, head = "a" * 40, "b" * 40
        with redirect_stdout(StringIO()), patch.object(dco, "git", side_effect=[base, head, head + "\n", "Message\n\nSigned-off-by: Camille <camille@example.com>\n", "Signed-off-by: Camille <camille@example.com>\n"]):
            self.assertTrue(dco.check(base, head))
        with redirect_stderr(StringIO()), patch.object(dco, "git", side_effect=[base, head, head + "\n", "No attestation", ""]):
            self.assertFalse(dco.check(base, head))


if __name__ == "__main__":
    unittest.main()
