<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class RouteCalculatorController extends Controller
{
    private const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImVjYmIzMzFlZDZiZDQ2YTI5ODM4ZjE0NGMzOTk5ZDJlIiwiaCI6Im11cm11cjY0In0=';

    public function getStates()
    {
        try {
            $response = Http::get('https://servicodados.ibge.gov.br/api/v1/localidades/estados/');
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json(['error' => 'Failed to fetch states'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getCities($stateCode)
    {
        try {
            $response = Http::get("https://servicodados.ibge.gov.br/api/v1/localidades/estados/{$stateCode}/municipios");
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json(['error' => 'Failed to fetch cities'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getCoordinates(Request $request)
    {
        try {
            $cityName = $request->input('city');
            $stateName = $request->input('state');
            
            $query = urlencode("{$cityName} {$stateName} Brasil");
            $response = Http::get("https://nominatim.openstreetmap.org/search?q={$query}&format=json&limit=1");
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json(['error' => 'Failed to fetch coordinates'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function calculateRoute(Request $request)
    {
        try {
            $request->validate([
                'origin' => 'required|array',
                'origin.lon' => 'required|numeric',
                'origin.lat' => 'required|numeric',
                'destination' => 'required|array',
                'destination.lon' => 'required|numeric',
                'destination.lat' => 'required|numeric',
                'vehicle' => 'required|array',
                'vehicle.consumption_city' => 'required|numeric',
                'vehicle.consumption_highway' => 'required|numeric',
                'fuel_type' => 'required|string',
                'fuel_price' => 'required|numeric',
            ]);

            $origin = $request->input('origin');
            $destination = $request->input('destination');
            $vehicle = $request->input('vehicle');
            $fuelPrice = $request->input('fuel_price');

            // Call OpenRouteService API
            $response = Http::withHeaders([
                'Authorization' => self::ORS_API_KEY,
            ])->post('https://api.openrouteservice.org/v2/directions/driving-car', [
                'coordinates' => [
                    [(float) $origin['lon'], (float) $origin['lat']],
                    [(float) $destination['lon'], (float) $destination['lat']],
                ],
                'extra_info' => [
                    'waytype',
                    'roadaccessrestrictions'
                ]
            ]);

            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to calculate route'], 500);
            }

            $routeData = $response->json();
            $route = $routeData['routes'][0];
            
            // Extract distance and waytype information
            $totalDistance = $route['summary']['distance']; // in meters
            $duration = $route['summary']['duration']; // in seconds
            $waytypes = $route['extras']['waytype']['summary'];

            // Calculate fuel consumption and cost
            $consumptionCity = (float) $vehicle['consumption_city'];
            $consumptionHighway = (float) $vehicle['consumption_highway'];

            $totalLiters = 0;
            $waytypeDetails = [];

            foreach ($waytypes as $waytype) {
                $value = (int) $waytype['value']; // Convert to int for comparison
                $distance = $waytype['distance'] / 1000; // convert to km
                $percentage = $waytype['amount'];

                // Determine if it's city or highway
                // Type 1 (State Road) -> Highway
                // Type 2 (Road), Type 3 (Street) -> City
                // Others -> Highway (default)
                $isCity = $value === 2 || $value === 3;
                $consumption = $isCity ? $consumptionCity : $consumptionHighway;
                
                $liters = $distance / $consumption;
                $totalLiters += $liters;

                $waytypeDetails[] = [
                    'type' => $value,
                    'type_name' => $this->getWaytypeName($value),
                    'distance' => $distance,
                    'percentage' => $percentage,
                    'consumption' => $consumption,
                    'liters' => $liters,
                    'cost' => $liters * $fuelPrice,
                ];
            }

            $totalCost = $totalLiters * $fuelPrice;

            return response()->json([
                'success' => true,
                'route' => [
                    'distance' => $totalDistance / 1000, // in km
                    'duration' => $duration / 60, // in minutes
                    'waytype_details' => $waytypeDetails,
                ],
                'fuel' => [
                    'total_liters' => round($totalLiters, 2),
                    'price_per_liter' => $fuelPrice,
                    'total_cost' => round($totalCost, 2),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function getWaytypeName($value)
    {
        $names = [
            0 => 'Desconhecido',
            1 => 'Rodovia (Estradas Estaduais/Federais)',
            2 => 'Estrada (Vias Secundárias)',
            3 => 'Rua (Vias Urbanas)',
            4 => 'Caminho',
            5 => 'Trilha',
            6 => 'Ciclovia',
            7 => 'Calçada',
            8 => 'Escadas',
            9 => 'Balsa',
            10 => 'Em Construção',
        ];

        return $names[$value] ?? 'Desconhecido';
    }
}
