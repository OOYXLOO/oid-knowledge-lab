<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;

class InspectCertificateOid extends Command
{
    protected $signature = 'cert:oid-inspect
        {path : Path to a local public PEM certificate}
        {--format=table : Output format: table or markdown}';

    protected $description = 'Inspect public certificate OID metadata for safe deployment review notes.';

    /**
     * Common certificate Object Identifiers that are useful during deployment review.
     *
     * Keep this map small in the article. A production tool should load a reviewed registry
     * snapshot and record the source of each friendly name.
     */
    private array $oidNames = [
        '2.5.29.14' => 'Subject Key Identifier',
        '2.5.29.15' => 'Key Usage',
        '2.5.29.17' => 'Subject Alternative Name',
        '2.5.29.19' => 'Basic Constraints',
        '2.5.29.31' => 'CRL Distribution Points',
        '2.5.29.32' => 'Certificate Policies',
        '2.5.29.35' => 'Authority Key Identifier',
        '1.3.6.1.5.5.7.1.1' => 'Authority Information Access',
        '1.3.6.1.5.5.7.3.1' => 'TLS Web Server Authentication',
        '1.3.6.1.5.5.7.3.2' => 'TLS Web Client Authentication',
    ];

    public function handle(): int
    {
        $path = (string) $this->argument('path');

        if (! File::exists($path)) {
            $this->error("Certificate file not found: {$path}");
            return self::FAILURE;
        }

        $pem = File::get($path);
        $certificate = openssl_x509_read($pem);

        if ($certificate === false) {
            $this->error('OpenSSL could not read the certificate. Use a public PEM certificate file.');
            return self::FAILURE;
        }

        $parsed = openssl_x509_parse($certificate, false);
        openssl_x509_free($certificate);

        if (! is_array($parsed)) {
            $this->error('OpenSSL could not parse certificate metadata.');
            return self::FAILURE;
        }

        $rows = $this->buildRows($parsed);

        if ($this->option('format') === 'markdown') {
            $this->line($this->toMarkdown($path, $parsed, $rows));
            return self::SUCCESS;
        }

        $this->table(['OID', 'Name', 'Observed value'], $rows);
        return self::SUCCESS;
    }

    private function buildRows(array $parsed): array
    {
        $extensionMap = [
            'subjectKeyIdentifier' => '2.5.29.14',
            'keyUsage' => '2.5.29.15',
            'subjectAltName' => '2.5.29.17',
            'basicConstraints' => '2.5.29.19',
            'crlDistributionPoints' => '2.5.29.31',
            'certificatePolicies' => '2.5.29.32',
            'authorityKeyIdentifier' => '2.5.29.35',
            'authorityInfoAccess' => '1.3.6.1.5.5.7.1.1',
            'extendedKeyUsage' => '1.3.6.1.5.5.7.3.1',
        ];

        $extensions = Arr::get($parsed, 'extensions', []);
        $rows = [];

        foreach ($extensionMap as $extensionKey => $oid) {
            if (! array_key_exists($extensionKey, $extensions)) {
                continue;
            }

            $rows[] = [
                $oid,
                $this->oidNames[$oid] ?? 'Unknown OID',
                $this->compactValue((string) $extensions[$extensionKey]),
            ];
        }

        return $rows;
    }

    private function compactValue(string $value): string
    {
        $singleLine = preg_replace('/\s+/', ' ', trim($value)) ?? '';
        return mb_strimwidth($singleLine, 0, 120, '...');
    }

    private function toMarkdown(string $path, array $parsed, array $rows): string
    {
        $subject = $this->flattenName(Arr::get($parsed, 'subject', []));
        $issuer = $this->flattenName(Arr::get($parsed, 'issuer', []));
        $validFrom = date('c', (int) Arr::get($parsed, 'validFrom_time_t', 0));
        $validTo = date('c', (int) Arr::get($parsed, 'validTo_time_t', 0));

        $lines = [
            '# Certificate OID Review',
            '',
            '- File: `' . basename($path) . '`',
            '- Subject: ' . $subject,
            '- Issuer: ' . $issuer,
            '- Valid from: ' . $validFrom,
            '- Valid to: ' . $validTo,
            '',
            '| OID | Name | Observed value |',
            '| --- | --- | --- |',
        ];

        foreach ($rows as [$oid, $name, $value]) {
            $lines[] = '| `' . $oid . '` | ' . $name . ' | ' . str_replace('|', '\\|', $value) . ' |';
        }

        $lines[] = '';
        $lines[] = '## Safe Handling Notes';
        $lines[] = '';
        $lines[] = '- Public certificate metadata only.';
        $lines[] = '- No private keys, tokens, account pages, or production logs.';
        $lines[] = '- Attach this note to a deployment or vendor handoff only after review.';

        return implode(PHP_EOL, $lines);
    }

    private function flattenName(array $name): string
    {
        return collect($name)
            ->map(fn ($value, $key) => "{$key}={$value}")
            ->implode(', ');
    }
}

