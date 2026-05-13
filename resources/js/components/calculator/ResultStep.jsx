import React from 'react';
import { Button, Card, Space, Descriptions, Progress, Tag } from 'antd';

export default function ResultStep({ 
  routeResult, 
  vehicleData, 
  locationData, 
  onComplete, 
  onBack 
}) {
  const { route, fuel } = routeResult;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDistance = (km) => {
    return `${km.toFixed(2)} km`;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-route text-blue-600" />
          Resumo da Viagem
        </h3>

        <Card className="mb-4">
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Origem">
              <strong>{locationData.origin.cityName}, {locationData.origin.stateName}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Destino">
              <strong>{locationData.destination.cityName}, {locationData.destination.stateName}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Distância Total">
              <strong className="text-blue-600">{formatDistance(route.distance)}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Tempo Estimado">
              <strong className="text-green-600">{formatDuration(route.duration)}</strong>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-car text-purple-600" />
          Veículo Selecionado
        </h3>

        <Card>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Marca">
              {vehicleData.brandName}
            </Descriptions.Item>
            <Descriptions.Item label="Modelo">
              {vehicleData.modelName}
            </Descriptions.Item>
            <Descriptions.Item label="Ano">
              {vehicleData.year}
            </Descriptions.Item>
            <Descriptions.Item label="Versão">
              {vehicleData.version.name}
            </Descriptions.Item>
            <Descriptions.Item label="Combustível">
              <Tag color="orange">{vehicleData.fuelType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Preço por Litro">
              {formatCurrency(vehicleData.fuelPrice)}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-road text-gray-600" />
          Tipos de Via
        </h3>

        {route.waytype_details.map((detail, index) => (
          <Card key={index} className="mb-3">
            <div className="mb-2">
              <strong>{detail.type_name}</strong>
              <Tag color="blue" className="ml-2">{detail.percentage.toFixed(2)}%</Tag>
            </div>
            <Progress 
              percent={parseFloat(detail.percentage.toFixed(2))} 
              status="active"
              strokeColor="#1890ff"
            />
            <div className="mt-3 text-sm text-gray-600">
              <div>Distância: {formatDistance(detail.distance)}</div>
              <div>Consumo médio: {detail.consumption.toFixed(2)} km/l</div>
              <div>Litros necessários: {detail.liters.toFixed(2)} L</div>
              <div>Custo: {formatCurrency(detail.cost)}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-gas-pump text-orange-600" />
          Custo Total
        </h3>

        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50">
          <div className="text-center">
            <div className="text-gray-600 mb-2 text-sm sm:text-base">Total de Combustível</div>
            <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1">
              {fuel.total_liters.toFixed(2)} L
            </div>
            <div className="text-gray-600 mb-4 text-sm sm:text-base">
              @ {formatCurrency(fuel.price_per_liter)}/L
            </div>
            
            <div className="border-t-2 border-orange-200 pt-4 mt-4">
              <div className="text-gray-600 mb-2 text-sm sm:text-base">Valor Total a Pagar</div>
              <div className="text-3xl sm:text-4xl font-bold text-green-600">
                {formatCurrency(fuel.total_cost)}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Space className="w-full" direction="vertical" size="middle">
        <Button 
          type="primary" 
          onClick={onComplete} 
          block 
          size="large"
          className="bg-green-600 hover:bg-green-700"
        >
          Compartilhar Despesas <i className="fas fa-share-alt ml-2" />
        </Button>
        <Button onClick={onBack} block>
          <i className="fas fa-arrow-left mr-2" /> Voltar
        </Button>
      </Space>
    </div>
  );
}
