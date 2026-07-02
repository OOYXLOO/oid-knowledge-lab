<?php

use Illuminate\Support\Facades\File;

it('prints a safe markdown certificate OID review', function () {
    $fixturePath = base_path('storage/app/samples/example.pem');

    expect(File::exists($fixturePath))->toBeTrue();

    $this->artisan('cert:oid-inspect', [
        'path' => $fixturePath,
        '--format' => 'markdown',
    ])
        ->assertSuccessful()
        ->expectsOutputToContain('# Certificate OID Review')
        ->expectsOutputToContain('Subject Alternative Name')
        ->expectsOutputToContain('No private keys');
});

it('rejects missing certificate files', function () {
    $this->artisan('cert:oid-inspect', [
        'path' => base_path('storage/app/samples/missing.pem'),
    ])->assertFailed();
});

