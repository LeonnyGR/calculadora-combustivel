import React, { useState, useEffect } from 'react';
import { Modal, List, Card, Button, Empty, Popconfirm, Tag, Descriptions } from 'antd';
import { getHistory, deleteCalculation, clearHistory } from '@/lib/historyStorage';

export default function HistoryModal({ visible, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadHistory();
    }
  }, [visible]);

  const loadHistory = () => {
    const data = getHistory();
    setHistory(data);
  };

  const handleDelete = (id) => {
    setLoading(true);
    const success = deleteCalculation(id);
    if (success) {
      loadHistory();
    }
    setLoading(false);
  };

  const handleClearAll = () => {
    setLoading(true);
    const success = clearHistory();
    if (success) {
      setHistory([]);
    }
    setLoading(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDistance = (km) => {
    return `${km.toFixed(2)} km`;
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <i className="fas fa-history text-blue-600" />
          <span className="text-sm sm:text-base">Histórico de Cálculos</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width="95%"
      style={{ maxWidth: 800 }}
      footer={[
        <Popconfirm
          key="clear"
          title="Limpar histórico"
          description="Tem certeza que deseja limpar todo o histórico?"
          onConfirm={handleClearAll}
          okText="Sim"
          cancelText="Não"
          disabled={history.length === 0}
        >
          <Button danger disabled={history.length === 0}>
            <i className="fas fa-trash mr-2" />
            Limpar Tudo
          </Button>
        </Popconfirm>,
        <Button key="close" onClick={onClose}>
          Fechar
        </Button>,
      ]}
    >
      {history.length === 0 ? (
        <Empty
          description="Nenhum cálculo realizado ainda"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          dataSource={history}
          loading={loading}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={[
                <Popconfirm
                  key="delete"
                  title="Deletar cálculo"
                  description="Tem certeza que deseja deletar este cálculo?"
                  onConfirm={() => handleDelete(item.id)}
                  okText="Sim"
                  cancelText="Não"
                >
                  <Button type="text" danger size="small">
                    <i className="fas fa-trash" />
                  </Button>
                </Popconfirm>,
              ]}
            >
              <Card className="w-full" size="small">
                <div className="mb-2 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="text-xs text-gray-500">
                    {formatDate(item.timestamp)}
                  </div>
                  <Tag color="green" className="w-fit">{formatCurrency(item.routeResult.fuel.total_cost)}</Tag>
                </div>

                <Descriptions column={1} size="small" bordered layout="horizontal" labelStyle={{ fontSize: '12px' }} contentStyle={{ fontSize: '12px' }}>
                  <Descriptions.Item label="Origem">
                    {item.locationData.origin.cityName}, {item.locationData.origin.stateName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Destino">
                    {item.locationData.destination.cityName}, {item.locationData.destination.stateName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Distância">
                    {formatDistance(item.routeResult.route.distance)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Veículo">
                    {item.vehicleData.brandName} {item.vehicleData.modelName} {item.vehicleData.year}
                  </Descriptions.Item>
                  <Descriptions.Item label="Combustível">
                    {item.vehicleData.fuelType} - {formatCurrency(item.vehicleData.fuelPrice)}/L
                  </Descriptions.Item>
                  <Descriptions.Item label="Litros Necessários">
                    {item.routeResult.fuel.total_liters} L
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
}
