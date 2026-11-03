# [FR] Copyright (C) 2026 Steve Prud'Homme et les contributeurs. SPDX-License-Identifier: GPL-3.0-only
# [EN] Copyright (C) 2026 Steve Prud'Homme and contributors. SPDX-License-Identifier: GPL-3.0-only
# [FR] Redistribution et modification sous GPL v3, sans garantie ; voir LICENSE.md.
# [EN] Redistribution and modification under GPL v3, without warranty; see LICENSE.md.
# [FR] Tests du colis généré : exécuter python tests/package_test.py depuis la racine du dépôt.
# [EN] Generated package tests: run python tests/package_test.py from the repository root.
from contextlib import redirect_stdout
import importlib.util
from io import StringIO
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("scorm_packager", ROOT / "tools/package.py")
packager = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(packager)


class PackageTests(unittest.TestCase):
    def setUp(self):
        self.temporary = TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.source = self.root / "src"
        self.source.mkdir()
        self.original_paths = packager.ROOT, packager.SOURCE, packager.OUTPUT
        self.addCleanup(self.restore_paths)
        packager.ROOT, packager.SOURCE = self.root, self.source
        packager.OUTPUT = self.root / "dist/gabarit-scorm12.zip"
        for name in ["imscp_rootv1p1p2.xsd", "adlcp_rootv1p2.xsd", "imsmd_rootv1p2p1.xsd", "ims_xml.xsd"]:
            (self.source / name).write_text("schema fixture", encoding="utf-8")
        (self.source / "index.html").write_text("<h1>Capsule</h1>", encoding="utf-8")
        (self.root / "LICENSE.md").write_text("license fixture", encoding="utf-8")
        (self.root / "THIRD_PARTY_NOTICES.md").write_text("third-party fixture", encoding="utf-8")

    def restore_paths(self):
        packager.ROOT, packager.SOURCE, packager.OUTPUT = self.original_paths

    def manifest(self, reference="index.html"):
        (self.source / "imsmanifest.xml").write_text(
            '<manifest xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2">'
            '<resources><resource identifier="lesson" href="index.html">'
            f'<file href="{reference}"/>'
            '</resource></resources></manifest>', encoding="utf-8")

    def build(self):
        with redirect_stdout(StringIO()):
            packager.build()

    def test_archive_separates_capsule_from_repository(self):
        # [FR] Aucun document de travail ni fichier src non déclaré ne doit se glisser dans le ZIP.
        # [EN] Neither working documents nor undeclared src files may leak into the ZIP.
        self.manifest()
        for relative in ["README.md", "doc/GUIDE.md", "tests/fixture.txt", "tools/fixture.py", "examples/minimal.html", "references/book.pdf", "src/unused.txt"]:
            path = self.root / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("outside package", encoding="utf-8")
        self.build()
        with ZipFile(packager.OUTPUT) as archive:
            self.assertIn("imsmanifest.xml", archive.namelist())
            self.assertIn("index.html", archive.namelist())
            self.assertEqual(len(archive.namelist()), 8)
            self.assertEqual(archive.read("LICENSE.md"), b"license fixture")
            self.assertEqual(archive.read("THIRD_PARTY_NOTICES.md"), b"third-party fixture")
            self.assertIsNone(archive.testzip())
            self.assertFalse(any(name.startswith(("src/", "doc/", "tests/", "tools/", "references/", "examples/")) for name in archive.namelist()))

    def test_declared_nested_assets_keep_their_relative_paths(self):
        self.manifest("images/diagram.svg")
        (self.source / "images").mkdir()
        (self.source / "images/diagram.svg").write_text("<svg/>", encoding="utf-8")
        self.build()
        with ZipFile(packager.OUTPUT) as archive:
            self.assertEqual(archive.read("images/diagram.svg"), b"<svg/>")
            self.assertNotIn("src/images/diagram.svg", archive.namelist())

    def test_equivalent_source_paths_use_one_normalized_base(self):
        self.manifest()
        # [FR] Simuler une base équivalente mais non normalisée, comme les alias temporaires Windows.
        # [EN] Simulate an equivalent but unnormalized base, like Windows temporary-directory aliases.
        packager.SOURCE = self.source / ".." / "src"
        self.build()
        with ZipFile(packager.OUTPUT) as archive:
            self.assertIn("index.html", archive.namelist())
            self.assertIn("imsmanifest.xml", archive.namelist())

    def test_missing_asset_preserves_the_previous_archive(self):
        self.manifest("missing.html")
        packager.OUTPUT.parent.mkdir()
        packager.OUTPUT.write_bytes(b"previous package")
        with self.assertRaises(ValueError):
            self.build()
        self.assertEqual(packager.OUTPUT.read_bytes(), b"previous package")

    def test_missing_legal_notice_blocks_distribution(self):
        self.manifest()
        (self.root / "LICENSE.md").unlink()
        with self.assertRaises(ValueError):
            self.build()
        self.assertFalse(packager.OUTPUT.exists())

    def test_references_cannot_escape_the_capsule_source(self):
        (self.root / "private.txt").write_text("not part of the capsule", encoding="utf-8")
        for reference in ["../private.txt", "%2e%2e/private.txt", "https://example.com/index.html", "file:///private.txt", "..\\private.txt"]:
            with self.subTest(reference=reference):
                self.manifest(reference)
                with self.assertRaises(ValueError):
                    self.build()
                self.assertFalse(packager.OUTPUT.exists())


if __name__ == "__main__":
    unittest.main()
