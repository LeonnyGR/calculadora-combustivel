<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class VehicleController extends Controller
{
    public function getBrands()
    {
        try {
            $response = Http::get('http://calc-combustivel.test/api/marcas');
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json(['error' => 'Failed to fetch brands'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getModels($brandSlug)
    {
        try {
            $response = Http::get("http://calc-combustivel.test/api/{$brandSlug}");
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json(['error' => 'Failed to fetch models'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getYears($brandSlug, $modelSlug)
    {
        try {
            $response = Http::get("http://calc-combustivel.test/api/{$brandSlug}/{$modelSlug}");
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json(['error' => 'Failed to fetch years'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getVersions($brandSlug, $modelSlug, $year)
    {
        try {
            $response = Http::get("http://calc-combustivel.test/api/{$brandSlug}/{$modelSlug}/{$year}");
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json(['error' => 'Failed to fetch versions'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
