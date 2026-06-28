import unittest

from package_names import normalize_package_name


class NormalizePackageNameTests(unittest.TestCase):
    def test_normalizes_common_package_name_variants(self):
        self.assertEqual(
            normalize_package_name("  My_Package Name  "),
            "my-package-name",
        )

    def test_collapses_repeated_internal_whitespace(self):
        self.assertEqual(
            normalize_package_name("Model   Audit\tHelper"),
            "model-audit-helper",
        )

    def test_preserves_existing_hyphen_boundaries(self):
        self.assertEqual(
            normalize_package_name("Evidence-Lab"),
            "evidence-lab",
        )

    def test_rejects_empty_values(self):
        for value in ("", "   ", "\t\n"):
            with self.subTest(value=repr(value)):
                with self.assertRaisesRegex(ValueError, "package name is required"):
                    normalize_package_name(value)

    def test_rejects_path_or_shell_oriented_values(self):
        for value in ("../secret", r"pkg\\secret", "pkg;rm -rf", "pkg|cat"):
            with self.subTest(value=value):
                with self.assertRaisesRegex(ValueError, "unsafe package name"):
                    normalize_package_name(value)

    def test_rejects_non_string_values(self):
        with self.assertRaisesRegex(TypeError, "package name must be a string"):
            normalize_package_name(None)

    def test_error_paths_do_not_leak_input_context(self):
        with self.assertRaisesRegex(ValueError, "^unsafe package name$"):
            normalize_package_name("../private/customer/path")


if __name__ == "__main__":
    unittest.main(verbosity=2)
