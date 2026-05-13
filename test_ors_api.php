<?php

require __DIR__.'/vendor/autoload.php';

use Illuminate\Support\Facades\Http;

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$response = \Illuminate\Support\Facades\Http::withHeaders([
    'Authorization' => 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImVjYmIzMzFlZDZiZDQ2YTI5ODM4ZjE0NGMzOTk5ZDJlIiwiaCI6Im11cm11cjY0In0=',
])->post(
    'https://api.openrouteservice.org/v2/directions/driving-car',
    [
        'coordinates' => [
            [-43.9345, -19.9167], // BH
            [-42.8818, -20.7539], // Ponte Nova
        ],
        'extra_info' => [
            'waytype',
            'roadaccessrestrictions'
        ]
    ]
);

echo "Status Code: " . $response->status() . "\n\n";

if ($response->successful()) {
    $data = $response->json();
    echo "Response Data:\n";
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
} else {
    echo "Error Response:\n";
    echo $response->body() . "\n";
}
