"""Reviewed duration parser example for AI-generated code evaluation.

The rejected generated draft was:

    def parse_duration(value):
        unit = value[-1]
        amount = int(value[:-1])
        if unit == "s":
            return amount
        if unit == "m":
            return amount * 60
        if unit == "h":
            return amount * 3600
        if unit == "d":
            return amount * 86400
        return 0

Returning 0 for unknown units hides invalid input, so the implementation below
uses explicit errors instead.
"""


UNIT_SECONDS = {
    "s": 1,
    "m": 60,
    "h": 3600,
    "d": 86400,
}


def parse_duration(value):
    """Parse a simple duration string such as '10s', '5m', '2h', or '1d'."""
    if not isinstance(value, str):
        raise TypeError("duration must be a string")

    text = value.strip()
    if not text:
        raise ValueError("duration is required")

    unit = text[-1].lower()
    amount_text = text[:-1]

    if unit not in UNIT_SECONDS:
        raise ValueError("unknown duration unit")
    if not amount_text.isdigit():
        raise ValueError("duration amount must be a non-negative integer")

    return int(amount_text) * UNIT_SECONDS[unit]
