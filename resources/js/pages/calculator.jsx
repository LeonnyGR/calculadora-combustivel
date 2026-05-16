import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Steps, Card, Button } from 'antd';
import LocationStep from '@/components/calculator/LocationStep';
import VehicleStep from '@/components/calculator/VehicleStep';
import ResultStep from '@/components/calculator/ResultStep';
import ShareStep from '@/components/calculator/ShareStep';
import HistoryModal from '@/components/calculator/HistoryModal';
import { saveCalculation } from '@/lib/historyStorage';

export default function Calculator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [locationData, setLocationData] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [routeResult, setRouteResult] = useState(null);
  const [historyVisible, setHistoryVisible] = useState(false);

  const steps = [
    {
      title: 'Endereços',
      icon: <i className="fas fa-map-marker-alt" />,
    },
    {
      title: 'Veículo',
      icon: <i className="fas fa-car" />,
    },
    {
      title: 'Resultado',
      icon: <i className="fas fa-calculator" />,
    },
    {
      title: 'Compartilhar',
      icon: <i className="fas fa-share-alt" />,
    },
  ];

  const handleLocationComplete = (data) => {
    setLocationData(data);
    setCurrentStep(1);
  };

  const handleVehicleComplete = (data, result) => {
    setVehicleData(data);
    setRouteResult(result);
    
    // Salva no histórico
    saveCalculation({
      locationData,
      vehicleData: data,
      routeResult: result,
    });
    
    setCurrentStep(2);
  };

  const handleResultComplete = () => {
    setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNewCalculation = () => {
    setCurrentStep(0);
    setLocationData(null);
    setVehicleData(null);
    setRouteResult(null);
  };

  return (
    <>
      <Head title="Calculadora de Combustível" />
      
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    Calculadora de Combustíveis
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Calcule quanto você gastará em sua viagem
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {currentStep > 0 && (
                    <Button
                      type="default"
                      icon={<i className="fas fa-plus" />}
                      onClick={handleNewCalculation}
                      className="flex-1 sm:flex-none"
                    >
                      <span className="ml-2">Novo Cálculo</span>
                    </Button>
                  )}
                  <Button
                    type="primary"
                    icon={<i className="fas fa-history" />}
                    onClick={() => setHistoryVisible(true)}
                    className="flex-1 sm:flex-none"
                  >
                    <span className="ml-2">Histórico</span>
                  </Button>
                </div>
              </div>
            </div>

            <Steps
              current={currentStep}
              items={steps}
              className="mb-8"
            />

            <div className="mt-8">
              {currentStep === 0 && (
                <LocationStep onComplete={handleLocationComplete} />
              )}

              {currentStep === 1 && locationData && (
                <VehicleStep
                  locationData={locationData}
                  onComplete={handleVehicleComplete}
                  onBack={handleBack}
                />
              )}

              {currentStep === 2 && routeResult && vehicleData && locationData && (
                <ResultStep
                  routeResult={routeResult}
                  vehicleData={vehicleData}
                  locationData={locationData}
                  onComplete={handleResultComplete}
                  onBack={handleBack}
                />
              )}

              {currentStep === 3 && routeResult && vehicleData && locationData && (
                <ShareStep
                  routeResult={routeResult}
                  vehicleData={vehicleData}
                  locationData={locationData}
                  onBack={handleBack}
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      <HistoryModal
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
      />
    </>
  );
}
