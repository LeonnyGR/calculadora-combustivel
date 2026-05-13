import React, { useState, useEffect } from 'react';
import { Form, Select, Button, Space, InputNumber, Radio, message, Input, Card, Alert } from 'antd';
import axios from 'axios';

export default function VehicleStep({ locationData, onComplete, onBack }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [availableFuels, setAvailableFuels] = useState([]);
  const [isManualMode, setIsManualMode] = useState(false);
  const [selectedFuelType, setSelectedFuelType] = useState(null);

  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);

  useEffect(() => {
    if (!isManualMode) {
      loadBrands();
    }
  }, [isManualMode]);

  useEffect(() => {
    if (selectedVersion && selectedFuelType && !isManualMode) {
      updateConsumptionFields();
    }
  }, [selectedVersion, selectedFuelType]);

  const loadBrands = async () => {
    setLoadingBrands(true);
    try {
      const response = await axios.get('/api/vehicles/brands');
      setBrands(response.data.data);
    } catch (error) {
      message.error('Erro ao carregar marcas');
    } finally {
      setLoadingBrands(false);
    }
  };

  const loadModels = async (brandSlug) => {
    setLoadingModels(true);
    try {
      const response = await axios.get(`/api/vehicles/brands/${brandSlug}`);
      setModels(response.data.data.models);
      form.setFieldsValue({ model: undefined, year: undefined, version: undefined });
      setYears([]);
      setVersions([]);
      setSelectedVersion(null);
    } catch (error) {
      message.error('Erro ao carregar modelos');
    } finally {
      setLoadingModels(false);
    }
  };

  const loadYears = async (brandSlug, modelSlug) => {
    setLoadingYears(true);
    try {
      const response = await axios.get(`/api/vehicles/brands/${brandSlug}/${modelSlug}`);
      setYears(response.data.data);
      form.setFieldsValue({ year: undefined, version: undefined });
      setVersions([]);
      setSelectedVersion(null);
    } catch (error) {
      message.error('Erro ao carregar anos');
    } finally {
      setLoadingYears(false);
    }
  };

  const loadVersions = async (brandSlug, modelSlug, year) => {
    setLoadingVersions(true);
    try {
      const response = await axios.get(`/api/vehicles/brands/${brandSlug}/${modelSlug}/${year}`);
      setVersions(response.data.data);
      form.setFieldValue('version', undefined);
      setSelectedVersion(null);
    } catch (error) {
      message.error('Erro ao carregar versões');
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleVersionChange = (versionId) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setSelectedVersion(version);
      
      // Determine available fuels
      const fuels = [];
      if (version.fuel === 'Flex') {
        fuels.push('Gasolina', 'Álcool');
      } else if (version.fuel === 'Gasolina') {
        fuels.push('Gasolina');
      } else if (version.fuel === 'Álcool' || version.fuel === 'Etanol') {
        fuels.push('Álcool');
      }
      setAvailableFuels(fuels);
      form.setFieldValue('fuelType', undefined);
      setSelectedFuelType(null);
    }
  };

  const updateConsumptionFields = () => {
    if (!selectedVersion || !selectedFuelType) return;

    const consumptionData = selectedVersion.consumption_data;
    let cityValue = null;
    let highwayValue = null;

    if (consumptionData && consumptionData.city && consumptionData.highway) {
      if (selectedFuelType === 'Gasolina') {
        if (selectedVersion.fuel === 'Flex') {
          cityValue = consumptionData.city.secondary;
          highwayValue = consumptionData.highway.secondary;
        } else {
          cityValue = consumptionData.city.primary;
          highwayValue = consumptionData.highway.primary;
        }
      } else {
        cityValue = consumptionData.city.primary;
        highwayValue = consumptionData.highway.primary;
      }
    }

    // Parse values
    const parsedCity = cityValue ? parseConsumption(cityValue) : null;
    const parsedHighway = highwayValue ? parseConsumption(highwayValue) : null;

    form.setFieldsValue({
      consumption_city: parsedCity,
      consumption_highway: parsedHighway,
    });
  };

  const parseConsumption = (value) => {
    if (!value) return null;
    return parseFloat(value.toString().replace(',', '.').replace(' km/l', ''));
  };

  const [fuelPriceDisplay, setFuelPriceDisplay] = useState('');
  const [fuelPriceValue, setFuelPriceValue] = useState(0);

  const formatCurrencyInput = (value) => {
    // Remove tudo que não é número
    let numbers = value.replace(/\D/g, '');
    
    if (!numbers) return '';
    
    // Adiciona zeros à direita até ter pelo menos 3 dígitos (1 real + 2 centavos)
    while (numbers.length < 3) {
      numbers = numbers + '0';
    }
    
    // Converte para número (centavos) e divide por 100
    const cents = parseInt(numbers);
    const reais = cents / 100;
    
    // Formata com vírgula e ponto
    const formatted = reais.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return formatted;
  };

  const handleFuelPriceChange = (e) => {
    const input = e.target.value;
    
    // Se o input estiver vazio ou for apenas o prefixo R$, limpa tudo
    if (!input || input === 'R$' || input.replace(/\D/g, '') === '') {
      setFuelPriceDisplay('');
      setFuelPriceValue(0);
      form.setFieldValue('fuelPrice', 0);
      return;
    }
    
    const formatted = formatCurrencyInput(input);
    setFuelPriceDisplay(formatted);
    
    // Converte para float para API
    let numbers = input.replace(/\D/g, '');
    
    if (numbers) {
      // Adiciona zeros à direita até ter pelo menos 3 dígitos
      while (numbers.length < 3) {
        numbers = numbers + '0';
      }
      
      const floatValue = parseInt(numbers) / 100;
      setFuelPriceValue(floatValue);
      form.setFieldValue('fuelPrice', floatValue);
    }
  };

  const handleFuelTypeChange = (fuelType) => {
    setSelectedFuelType(fuelType);
  };

  const enableManualMode = () => {
    setIsManualMode(true);
    form.resetFields();
    setSelectedVersion(null);
    setSelectedFuelType(null);
    setAvailableFuels(['Gasolina', 'Álcool']);
    setFuelPriceDisplay('');
    setFuelPriceValue(0);
  };

  const disableManualMode = () => {
    setIsManualMode(false);
    form.resetFields();
    setSelectedVersion(null);
    setSelectedFuelType(null);
    setFuelPriceDisplay('');
    setFuelPriceValue(0);
    loadBrands();
  };

  const handleSubmit = async (values) => {
    // Validate consumption values
    if (!values.consumption_city || !values.consumption_highway) {
      message.error('Preencha os valores de consumo do veículo');
      return;
    }

    setLoading(true);
    try {
      let vehicleData = {};

      if (isManualMode) {
        vehicleData = {
          brandName: values.manualBrand,
          modelName: values.manualModel,
          year: values.manualYear,
          version: { 
            name: values.manualVersion,
            fuel: values.manualFuel
          },
          fuelType: values.fuelType,
          fuelPrice: fuelPriceValue,
        };
      } else {
        const brand = brands.find(b => b.slug === values.brand);
        const model = models.find(m => m.slug === values.model);

        vehicleData = {
          brand: values.brand,
          brandName: brand?.name || '',
          model: values.model,
          modelName: model?.name || '',
          year: values.year,
          version: selectedVersion,
          fuelType: values.fuelType,
          fuelPrice: fuelPriceValue,
        };
      }

      // Get consumption from form
      const consumptionCity = parseFloat(values.consumption_city);
      const consumptionHighway = parseFloat(values.consumption_highway);

      // Calculate route
      const routeResponse = await axios.post('/api/calculate-route', {
        origin: locationData.origin,
        destination: locationData.destination,
        vehicle: {
          consumption_city: consumptionCity,
          consumption_highway: consumptionHighway,
        },
        fuel_type: values.fuelType,
        fuel_price: fuelPriceValue,
      });

      onComplete(vehicleData, routeResponse.data);
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao calcular rota');
    } finally {
      setLoading(false);
    }
  };

  const hasConsumptionData = () => {
    if (!selectedVersion || !selectedFuelType) return false;
    
    const consumptionData = selectedVersion.consumption_data;
    if (!consumptionData || !consumptionData.city || !consumptionData.highway) return false;

    let cityValue = null;
    let highwayValue = null;

    if (selectedFuelType === 'Gasolina') {
      if (selectedVersion.fuel === 'Flex') {
        cityValue = consumptionData.city.secondary;
        highwayValue = consumptionData.highway.secondary;
      } else {
        cityValue = consumptionData.city.primary;
        highwayValue = consumptionData.highway.primary;
      }
    } else {
      cityValue = consumptionData.city.primary;
      highwayValue = consumptionData.highway.primary;
    }

    return cityValue && highwayValue;
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <i className="fas fa-car text-blue-600" />
            {isManualMode ? 'Criar Veículo Manualmente' : 'Dados do Veículo'}
          </h3>
          {!isManualMode ? (
            <Button 
              type="dashed" 
              size="small"
              icon={<i className="fas fa-plus" />}
              onClick={enableManualMode}
              className="w-full sm:w-auto"
            >
              <span className="ml-2">Criar Manualmente</span>
            </Button>
          ) : (
            <Button 
              type="link" 
              size="small"
              icon={<i className="fas fa-arrow-left" />}
              onClick={disableManualMode}
              className="w-full sm:w-auto"
            >
              <span className="ml-2">Voltar para Seleção</span>
            </Button>
          )}
        </div>

        {!isManualMode ? (
          <>
            <Form.Item
              label="Marca"
              name="brand"
              rules={[{ required: true, message: 'Selecione a marca' }]}
            >
              <Select
                placeholder="Selecione a marca"
                loading={loadingBrands}
                showSearch
                optionFilterProp="children"
                onChange={(value) => loadModels(value)}
              >
                {brands.map(brand => (
                  <Select.Option key={brand.id} value={brand.slug}>
                    {brand.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {form.getFieldValue('brand') && (
              <Form.Item
                label="Modelo"
                name="model"
                rules={[{ required: true, message: 'Selecione o modelo' }]}
              >
                <Select
                  placeholder="Selecione o modelo"
                  loading={loadingModels}
                  showSearch
                  optionFilterProp="children"
                  disabled={models.length === 0}
                  onChange={(value) => {
                    const brandSlug = form.getFieldValue('brand');
                    loadYears(brandSlug, value);
                  }}
                >
                  {models.map(model => (
                    <Select.Option key={model.id} value={model.slug}>
                      {model.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {form.getFieldValue('model') && (
              <Form.Item
                label="Ano"
                name="year"
                rules={[{ required: true, message: 'Selecione o ano' }]}
              >
                <Select
                  placeholder="Selecione o ano"
                  loading={loadingYears}
                  disabled={years.length === 0}
                  onChange={(value) => {
                    const brandSlug = form.getFieldValue('brand');
                    const modelSlug = form.getFieldValue('model');
                    loadVersions(brandSlug, modelSlug, value);
                  }}
                >
                  {years.map(year => (
                    <Select.Option key={year.year} value={year.year}>
                      {year.year}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {form.getFieldValue('year') && (
              <Form.Item
                label="Versão"
                name="version"
                rules={[{ required: true, message: 'Selecione a versão' }]}
              >
                <Select
                  placeholder="Selecione a versão"
                  loading={loadingVersions}
                  disabled={versions.length === 0}
                  onChange={handleVersionChange}
                >
                  {versions.map(version => (
                    <Select.Option key={version.id} value={version.id}>
                      {version.name} - {version.fuel}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </>
        ) : (
          <>
            <Form.Item
              label="Marca"
              name="manualBrand"
              rules={[{ required: true, message: 'Informe o nome da marca' }]}
            >
              <Input placeholder="Ex: Toyota, Honda, Fiat..." />
            </Form.Item>

            <Form.Item
              label="Modelo"
              name="manualModel"
              rules={[{ required: true, message: 'Informe o nome do modelo' }]}
            >
              <Input placeholder="Ex: Corolla, Civic, Uno..." />
            </Form.Item>

            <Form.Item
              label="Ano"
              name="manualYear"
              rules={[{ required: true, message: 'Informe o ano' }]}
            >
              <InputNumber 
                placeholder="Ex: 2024" 
                style={{ width: '100%' }}
                min={1900}
                max={new Date().getFullYear() + 1}
              />
            </Form.Item>

            <Form.Item
              label="Versão"
              name="manualVersion"
              rules={[{ required: true, message: 'Informe o nome da versão' }]}
            >
              <Input placeholder="Ex: XEi 2.0, EX, 1.0 Fire..." />
            </Form.Item>

            <Form.Item
              label="Tipo de Combustível do Veículo"
              name="manualFuel"
              rules={[{ required: true, message: 'Selecione o tipo de combustível' }]}
              initialValue="Flex"
            >
              <Radio.Group onChange={(e) => {
                const fuel = e.target.value;
                if (fuel === 'Flex') {
                  setAvailableFuels(['Gasolina', 'Álcool']);
                } else if (fuel === 'Gasolina') {
                  setAvailableFuels(['Gasolina']);
                  form.setFieldValue('fuelType', 'Gasolina');
                  setSelectedFuelType('Gasolina');
                } else {
                  setAvailableFuels(['Álcool']);
                  form.setFieldValue('fuelType', 'Álcool');
                  setSelectedFuelType('Álcool');
                }
              }}>
                <Radio value="Flex">Flex</Radio>
                <Radio value="Gasolina">Gasolina</Radio>
                <Radio value="Álcool">Álcool</Radio>
              </Radio.Group>
            </Form.Item>
          </>
        )}
      </div>

      {((selectedVersion && !isManualMode) || (isManualMode && form.getFieldValue('manualFuel'))) && (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-gas-pump text-orange-600" />
              Combustível
            </h3>

            <Form.Item
              label="Tipo de Combustível"
              name="fuelType"
              rules={[{ required: true, message: 'Selecione o tipo de combustível' }]}
            >
              <Radio.Group onChange={(e) => handleFuelTypeChange(e.target.value)}>
                {availableFuels.map(fuel => (
                  <Radio key={fuel} value={fuel}>
                    {fuel}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="Preço por Litro"
              name="fuelPrice"
              rules={[
                { required: true, message: 'Informe o preço do combustível' },
                { 
                  validator: (_, value) => {
                    if (!value || value < 0.01) {
                      return Promise.reject(new Error('Preço deve ser maior que R$ 0,00'));
                    }
                    return Promise.resolve();
                  }
                },
              ]}
            >
              <Input
                placeholder="0,00"
                value={fuelPriceDisplay}
                onChange={handleFuelPriceChange}
                prefix="R$"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          {selectedFuelType && (
            <div className="mb-6">
              <Card>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <i className="fas fa-tachometer-alt text-purple-600" />
                    Consumo do Veículo
                  </h3>
                </div>

                {!isManualMode && !hasConsumptionData() && (
                  <Alert
                    message="Dados de consumo não disponíveis"
                    description="Preencha manualmente os valores de consumo do veículo para este tipo de combustível."
                    type="info"
                    showIcon
                    icon={<i className="fas fa-info-circle" />}
                    className="mb-4"
                  />
                )}

                {!isManualMode && hasConsumptionData() && (
                  <Alert
                    message="Dados de consumo carregados"
                    description="Você pode ajustar os valores abaixo caso não estejam corretos."
                    type="success"
                    showIcon
                    icon={<i className="fas fa-check-circle" />}
                    className="mb-4"
                  />
                )}

                {isManualMode && (
                  <Alert
                    message="Preencha os valores de consumo"
                    description="Informe quanto o veículo consome na cidade e na rodovia com o combustível selecionado."
                    type="warning"
                    showIcon
                    icon={<i className="fas fa-exclamation-triangle" />}
                    className="mb-4"
                  />
                )}

                <Form.Item
                  label="Consumo na Cidade (km/l)"
                  name="consumption_city"
                  rules={[
                    { required: true, message: 'Informe o consumo na cidade' },
                    { type: 'number', min: 0.1, message: 'Consumo deve ser maior que 0' },
                  ]}
                >
                  <InputNumber
                    placeholder="Ex: 11.5"
                    style={{ width: '100%' }}
                    min={0.1}
                    step={0.1}
                    precision={1}
                    suffix="km/l"
                  />
                </Form.Item>

                <Form.Item
                  label="Consumo na Rodovia (km/l)"
                  name="consumption_highway"
                  rules={[
                    { required: true, message: 'Informe o consumo na rodovia' },
                    { type: 'number', min: 0.1, message: 'Consumo deve ser maior que 0' },
                  ]}
                >
                  <InputNumber
                    placeholder="Ex: 14.2"
                    style={{ width: '100%' }}
                    min={0.1}
                    step={0.1}
                    precision={1}
                    suffix="km/l"
                  />
                </Form.Item>
              </Card>
            </div>
          )}
        </>
      )}

      <Form.Item>
        <Space className="w-full" direction="vertical" size="middle">
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            Calcular <i className="fas fa-calculator ml-2" />
          </Button>
          <Button onClick={onBack} block>
            <i className="fas fa-arrow-left mr-2" /> Voltar
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
