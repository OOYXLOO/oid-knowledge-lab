from __future__ import annotations

import argparse
import datetime as dt
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.x509.oid import ExtensionOID, ExtendedKeyUsageOID, NameOID


OID_NAMES = {
    "2.5.29.14": "Subject Key Identifier",
    "2.5.29.15": "Key Usage",
    "2.5.29.17": "Subject Alternative Name",
    "2.5.29.19": "Basic Constraints",
    "2.5.29.31": "CRL Distribution Points",
    "2.5.29.32": "Certificate Policies",
    "2.5.29.35": "Authority Key Identifier",
    "1.3.6.1.5.5.7.1.1": "Authority Information Access",
    "1.3.6.1.5.5.7.3.1": "TLS Web Server Authentication",
    "1.3.6.1.5.5.7.3.2": "TLS Web Client Authentication",
}


@dataclass(frozen=True)
class OidRow:
    oid: str
    name: str
    observed_value: str


def load_certificate(path: Path) -> x509.Certificate:
    data = path.read_bytes()
    try:
        return x509.load_pem_x509_certificate(data, default_backend())
    except ValueError:
        return x509.load_der_x509_certificate(data, default_backend())


def compact(value: object, limit: int = 140) -> str:
    text = " ".join(str(value).replace("\n", " ").split())
    if len(text) <= limit:
        return text
    return text[: limit - 3] + "..."


def name_to_text(name: x509.Name) -> str:
    parts = []
    for attribute in name:
        label = attribute.oid._name or attribute.oid.dotted_string
        parts.append(f"{label}={attribute.value}")
    return ", ".join(parts)


def inspect_certificate(certificate: x509.Certificate) -> list[OidRow]:
    rows: list[OidRow] = []

    for extension in certificate.extensions:
        oid = extension.oid.dotted_string
        rows.append(
            OidRow(
                oid=oid,
                name=OID_NAMES.get(oid, extension.oid._name or "Unknown OID"),
                observed_value=compact(extension.value),
            )
        )

        if extension.oid == ExtensionOID.EXTENDED_KEY_USAGE:
            for usage_oid in extension.value:
                usage = usage_oid.dotted_string
                rows.append(
                    OidRow(
                        oid=usage,
                        name=OID_NAMES.get(usage, usage_oid._name or "Unknown OID"),
                        observed_value="Extended key usage",
                    )
                )

        if extension.oid == ExtensionOID.CERTIFICATE_POLICIES:
            for policy in extension.value:
                policy_oid = policy.policy_identifier.dotted_string
                rows.append(
                    OidRow(
                        oid=policy_oid,
                        name=OID_NAMES.get(policy_oid, "Certificate policy identifier"),
                        observed_value="Certificate policy",
                    )
                )

    return rows


def render_markdown(path: Path, certificate: x509.Certificate, rows: Iterable[OidRow]) -> str:
    lines = [
        "# Certificate OID Review",
        "",
        f"- File: `{path.name}`",
        f"- Subject: {name_to_text(certificate.subject)}",
        f"- Issuer: {name_to_text(certificate.issuer)}",
        f"- Valid from: {certificate.not_valid_before_utc.isoformat()}",
        f"- Valid to: {certificate.not_valid_after_utc.isoformat()}",
        "",
        "| OID | Name | Observed value |",
        "| --- | --- | --- |",
    ]

    for row in rows:
        value = row.observed_value.replace("|", "\\|")
        lines.append(f"| `{row.oid}` | {row.name} | {value} |")

    lines.extend(
        [
            "",
            "## Safe Handling Notes",
            "",
            "- Public certificate metadata only.",
            "- No private keys, tokens, account pages, or production logs.",
            "- Attach this note to a deployment or vendor handoff only after review.",
        ]
    )

    return "\n".join(lines)


def render_table(rows: Iterable[OidRow]) -> str:
    rendered = ["OID | Name | Observed value", "--- | --- | ---"]
    for row in rows:
        rendered.append(f"{row.oid} | {row.name} | {row.observed_value}")
    return "\n".join(rendered)


def main() -> int:
    parser = argparse.ArgumentParser(description="Inspect public certificate OID metadata.")
    parser.add_argument("certificate", type=Path, help="Path to a public PEM or DER certificate")
    parser.add_argument("--format", choices=["markdown", "table"], default="table")
    args = parser.parse_args()

    certificate = load_certificate(args.certificate)
    rows = inspect_certificate(certificate)

    if args.format == "markdown":
        print(render_markdown(args.certificate, certificate, rows))
    else:
        print(render_table(rows))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

