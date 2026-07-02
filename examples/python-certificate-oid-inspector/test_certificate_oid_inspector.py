import datetime as dt
import tempfile
import unittest
from pathlib import Path

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import ExtendedKeyUsageOID, NameOID

from certificate_oid_inspector import inspect_certificate, load_certificate, render_markdown


def make_public_certificate() -> bytes:
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    subject = issuer = x509.Name(
        [
            x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "OID Knowledge Lab"),
            x509.NameAttribute(NameOID.COMMON_NAME, "example.test"),
        ]
    )

    now = dt.datetime.now(dt.timezone.utc)
    certificate = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(issuer)
        .public_key(key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(now)
        .not_valid_after(now + dt.timedelta(days=30))
        .add_extension(x509.BasicConstraints(ca=False, path_length=None), critical=True)
        .add_extension(
            x509.SubjectAlternativeName([x509.DNSName("example.test"), x509.DNSName("www.example.test")]),
            critical=False,
        )
        .add_extension(
            x509.ExtendedKeyUsage([ExtendedKeyUsageOID.SERVER_AUTH]),
            critical=False,
        )
        .sign(key, hashes.SHA256())
    )
    return certificate.public_bytes(serialization.Encoding.PEM)


class CertificateOidInspectorTest(unittest.TestCase):
    def test_inspects_certificate_oids_and_renders_markdown(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            certificate_path = Path(tmpdir) / "example.pem"
            certificate_path.write_bytes(make_public_certificate())

            certificate = load_certificate(certificate_path)
            rows = inspect_certificate(certificate)
            markdown = render_markdown(certificate_path, certificate, rows)

        oids = {row.oid for row in rows}
        self.assertIn("2.5.29.19", oids)
        self.assertIn("2.5.29.17", oids)
        self.assertIn("2.5.29.37", oids)
        self.assertIn("1.3.6.1.5.5.7.3.1", oids)
        self.assertIn("Certificate OID Review", markdown)
        self.assertIn("No private keys", markdown)


if __name__ == "__main__":
    unittest.main()

