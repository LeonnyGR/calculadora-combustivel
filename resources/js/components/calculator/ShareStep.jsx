import React, { useState } from 'react';
import { Form, Button, Space, InputNumber, Input, Radio, Card, Divider, List, message, Tag } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

export default function ShareStep({ routeResult, vehicleData, locationData, onBack }) {
  const [form] = Form.useForm();
  const [divisionType, setDivisionType] = useState('equal');
  const [people, setPeople] = useState([{ id: 1, name: '', phone: '', value: 0 }]);
  const [pixKey, setPixKey] = useState('');

  const { fuel } = routeResult;
  const totalCost = fuel.total_cost;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const addPerson = () => {
    const newId = people.length > 0 ? Math.max(...people.map(p => p.id)) + 1 : 1;
    setPeople([...people, { id: newId, name: '', phone: '', value: 0 }]);
  };

  const removePerson = (id) => {
    if (people.length > 1) {
      setPeople(people.filter(p => p.id !== id));
    }
  };

  const updatePerson = (id, field, value) => {
    setPeople(people.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const calculateEqualShare = () => {
    const numberOfPeople = people.length;
    return totalCost / numberOfPeople;
  };

  const getTotalCustomShare = () => {
    return people.reduce((sum, person) => sum + (parseFloat(person.value) || 0), 0);
  };

  const getShareAmount = (person) => {
    if (divisionType === 'equal') {
      return calculateEqualShare();
    }
    return parseFloat(person.value) || 0;
  };

  const generateWhatsAppMessage = (person) => {
    const shareAmount = getShareAmount(person);
    const personName = person.name || 'Pessoa';

    let message = `*Divisão de Combustível*\n\n`;
    message += `Olá ${personName}!\n\n`;
    message += `Segue os detalhes da nossa viagem:\n\n`;
    message += `*Origem:* ${locationData.origin.cityName}, ${locationData.origin.stateName}\n`;
    message += `*Destino:* ${locationData.destination.cityName}, ${locationData.destination.stateName}\n`;
    message += `*Distância:* ${routeResult.route.distance.toFixed(2)} km\n\n`;
    message += `*Veículo:* ${vehicleData.brandName} ${vehicleData.modelName} ${vehicleData.year}\n`;
    message += `*Combustível:* ${vehicleData.fuelType} - ${formatCurrency(vehicleData.fuelPrice)}/L\n\n`;
    message += `*Total da Viagem:* ${formatCurrency(totalCost)}\n`;
    message += `*Pessoas:* ${people.length}\n\n`;
    message += `*Sua Parte:* ${formatCurrency(shareAmount)}\n\n`;
    
    if (pixKey) {
      message += `*Chave PIX:* ${pixKey}\n\n`;
    }
    
    message += `Obrigado!`;

    return encodeURIComponent(message);
  };

  const handleShare = (person) => {
    if (!person.phone) {
      message.error('Informe o telefone da pessoa');
      return;
    }

    const whatsappMessage = generateWhatsAppMessage(person);
    const cleanPhone = person.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${whatsappMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleShareAll = () => {
    const missingPhone = people.find(p => !p.phone);
    if (missingPhone) {
      message.error('Todos devem ter telefone informado');
      return;
    }

    people.forEach((person, index) => {
      setTimeout(() => {
        handleShare(person);
      }, index * 500);
    });
  };

  const isCustomShareValid = () => {
    if (divisionType === 'equal') return true;
    const total = getTotalCustomShare();
    return Math.abs(total - totalCost) < 0.01;
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-share-alt text-purple-600" />
          Compartilhar Despesas
        </h3>

        <Card className="mb-4 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="text-center">
            <div className="text-gray-600 mb-2">Valor Total</div>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(totalCost)}
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-key text-orange-600" />
          Chave PIX (Opcional)
        </h3>

        <Input
          placeholder="Digite sua chave PIX"
          value={pixKey}
          onChange={(e) => setPixKey(e.target.value)}
          prefix={<i className="fas fa-key" />}
          size="large"
        />
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-users text-blue-600" />
          Tipo de Divisão
        </h3>

        <Radio.Group
          value={divisionType}
          onChange={(e) => setDivisionType(e.target.value)}
          className="mb-4"
        >
          <Space direction="vertical">
            <Radio value="equal">
              Dividir igualmente entre todos
            </Radio>
            <Radio value="custom">
              Personalizar valor de cada pessoa
            </Radio>
          </Space>
        </Radio.Group>

        {divisionType === 'equal' && (
          <Card className="bg-blue-50">
            <div className="text-center">
              <div className="text-gray-600 mb-1">Valor por pessoa</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(calculateEqualShare())}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {people.length} {people.length === 1 ? 'pessoa' : 'pessoas'}
              </div>
            </div>
          </Card>
        )}

        {divisionType === 'custom' && (
          <Card className="bg-yellow-50">
            <div className="mb-2 text-sm text-gray-600">
              Total atribuído: {formatCurrency(getTotalCustomShare())}
              {!isCustomShareValid() && (
                <Tag color="red" className="ml-2">
                  Diferença: {formatCurrency(Math.abs(getTotalCustomShare() - totalCost))}
                </Tag>
              )}
            </div>
            {isCustomShareValid() && (
              <Tag color="green">
                <i className="fas fa-check mr-1" /> Valores corretos
              </Tag>
            )}
          </Card>
        )}
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <i className="fas fa-user-friends text-green-600" />
            Pessoas ({people.length})
          </h3>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addPerson}
          >
            Adicionar
          </Button>
        </div>

        <Space direction="vertical" className="w-full" size="middle">
          {people.map((person, index) => (
            <Card key={person.id} size="small">
              <div className="mb-3">
                <strong>Pessoa {index + 1}</strong>
                {people.length > 1 && (
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removePerson(person.id)}
                    className="float-right"
                  />
                )}
              </div>

              <Space direction="vertical" className="w-full">
                <Input
                  placeholder="Nome"
                  value={person.name}
                  onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                  prefix={<i className="fas fa-user" />}
                />

                <Input
                  placeholder="Telefone (apenas números)"
                  value={person.phone}
                  onChange={(e) => updatePerson(person.id, 'phone', e.target.value)}
                  prefix={<i className="fas fa-phone" />}
                  maxLength={11}
                />

                {divisionType === 'custom' && (
                  <InputNumber
                    placeholder="Valor R$"
                    value={person.value}
                    onChange={(value) => updatePerson(person.id, 'value', value || 0)}
                    style={{ width: '100%' }}
                    min={0}
                    max={totalCost}
                    step={0.01}
                    precision={2}
                    prefix="R$"
                  />
                )}

                {divisionType === 'equal' && (
                  <div className="bg-gray-100 p-2 rounded text-center">
                    <strong className="text-green-600">
                      {formatCurrency(getShareAmount(person))}
                    </strong>
                  </div>
                )}

                <Button
                  type="primary"
                  icon={<i className="fas fa-share-alt mr-2" />}
                  onClick={() => handleShare(person)}
                  disabled={!person.phone || (divisionType === 'custom' && !isCustomShareValid())}
                  block
                  className="bg-green-600 hover:bg-green-700"
                >
                  Enviar para {person.name || 'esta pessoa'}
                </Button>
              </Space>
            </Card>
          ))}
        </Space>
      </div>

      <Space className="w-full" direction="vertical" size="middle">
        <Button
          type="primary"
          icon={<i className="fas fa-share-nodes mr-2" />}
          onClick={handleShareAll}
          disabled={!isCustomShareValid() || people.some(p => !p.phone)}
          block
          size="large"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Enviar para Todos
        </Button>
        <Button onClick={onBack} block>
          <i className="fas fa-arrow-left mr-2" /> Voltar
        </Button>
      </Space>
    </div>
  );
}
