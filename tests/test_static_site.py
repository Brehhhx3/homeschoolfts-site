"""Dependency-free smoke tests for the static site entry page."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import unittest


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
INDEX_PAGE = REPOSITORY_ROOT / "index.html"
SITE_ORIGINS = {"homeschoolfts.com", "www.homeschoolfts.com"}


class AssetReferenceParser(HTMLParser):
    """Collect local image/icon paths declared by page metadata."""

    def __init__(self):
        super().__init__()
        self.local_asset_paths = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)

        if tag == "meta" and attributes.get("property") in {"og:image"}:
            self._add_local_path(attributes.get("content"))
        elif tag == "meta" and attributes.get("name") == "twitter:image":
            self._add_local_path(attributes.get("content"))
        elif tag == "link" and "icon" in attributes.get("rel", "").split():
            self._add_local_path(attributes.get("href"))

    def _add_local_path(self, value):
        if not value:
            return

        parsed = urlparse(value)
        if parsed.scheme or parsed.netloc:
            if parsed.scheme in {"http", "https"} and parsed.netloc in SITE_ORIGINS:
                self.local_asset_paths.append(parsed.path or "/")
            return

        if value.startswith("/"):
            self.local_asset_paths.append(value)
        elif not parsed.scheme:
            self.local_asset_paths.append(value)


class StaticSiteTests(unittest.TestCase):
    def setUp(self):
        self.assertTrue(INDEX_PAGE.is_file(), f"Entry page is missing: {INDEX_PAGE}")
        self.html = INDEX_PAGE.read_text(encoding="utf-8")

    def test_markup_has_no_literal_escaped_newlines(self):
        self.assertNotIn(r"\n", self.html)

    def test_metadata_and_icon_assets_exist_locally(self):
        parser = AssetReferenceParser()
        parser.feed(self.html)

        self.assertTrue(
            parser.local_asset_paths,
            "No local metadata or icon assets were found.",
        )

        for asset_path in parser.local_asset_paths:
            with self.subTest(asset_path=asset_path):
                normalized = asset_path.split("?", 1)[0].split("#", 1)[0]
                self.assertTrue(
                    (REPOSITORY_ROOT / normalized.lstrip("/")).is_file(),
                    f"Referenced local asset is missing: {asset_path}",
                )


if __name__ == "__main__":
    unittest.main()
