import unittest

from duration_parser import parse_duration


class ParseDurationTests(unittest.TestCase):
    def test_parses_seconds_minutes_hours_and_days(self):
        self.assertEqual(parse_duration("10s"), 10)
        self.assertEqual(parse_duration("5m"), 300)
        self.assertEqual(parse_duration("2h"), 7200)
        self.assertEqual(parse_duration("1d"), 86400)

    def test_trims_surrounding_whitespace(self):
        self.assertEqual(parse_duration(" 15m "), 900)

    def test_accepts_uppercase_units(self):
        self.assertEqual(parse_duration("3H"), 10800)

    def test_rejects_unknown_units(self):
        with self.assertRaisesRegex(ValueError, "unknown duration unit"):
            parse_duration("7w")

    def test_rejects_empty_input(self):
        for value in ("", "   "):
            with self.subTest(value=repr(value)):
                with self.assertRaisesRegex(ValueError, "duration is required"):
                    parse_duration(value)

    def test_rejects_negative_values(self):
        with self.assertRaisesRegex(ValueError, "non-negative integer"):
            parse_duration("-5m")

    def test_rejects_decimal_values(self):
        with self.assertRaisesRegex(ValueError, "non-negative integer"):
            parse_duration("1.5h")

    def test_rejects_non_string_values(self):
        with self.assertRaisesRegex(TypeError, "duration must be a string"):
            parse_duration(None)


if __name__ == "__main__":
    unittest.main(verbosity=2)
