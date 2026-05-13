import React, { useState, useEffect } from 'react';
import { Form, Select, Button, Space, Spin, message } from 'antd';
import axios from 'axios';

export default function LocationStep({ onComplete }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [originCities, setOriginCities] = useState([]);
  const [destinationCities, setDestinationCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingOriginCities, setLoadingOriginCities] = useState(false);
  const [loadingDestinationCities, setLoadingDestinationCities] = useState(false);

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    setLoadingStates(true);
    try {
      const response = await axios.get('/api/states');
      const sortedStates = response.data.sort((a, b) => 
        a.nome.localeCompare(b.nome)
      );
      setStates(sortedStates);
    } catch (error) {
      message.error('Erro ao carregar estados');
    } finally {
      setLoadingStates(false);
    }
  };

  const loadOriginCities = async (stateCode) => {
    setLoadingOriginCities(true);
    try {
      const response = await axios.get(`/api/cities/${stateCode}`);
      const sortedCities = response.data.sort((a, b) => 
        a.nome.localeCompare(b.nome)
      );
      setOriginCities(sortedCities);
      form.setFieldValue('originCity', undefined);
    } catch (error) {
      message.error('Erro ao carregar cidades de origem');
    } finally {
      setLoadingOriginCities(false);
    }
  };

  const loadDestinationCities = async (stateCode) => {
    setLoadingDestinationCities(true);
    try {
      const response = await axios.get(`/api/cities/${stateCode}`);
      const sortedCities = response.data.sort((a, b) => 
        a.nome.localeCompare(b.nome)
      );
      setDestinationCities(sortedCities);
      form.setFieldValue('destinationCity', undefined);
    } catch (error) {
      message.error('Erro ao carregar cidades de destino');
    } finally {
      setLoadingDestinationCities(false);
    }
  };

  const getCoordinates = async (cityName, stateName) => {
    try {
      const response = await axios.post('/api/coordinates', {
        city: cityName,
        state: stateName,
      });
      
      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lon: parseFloat(response.data[0].lon),
        };
      }
      throw new Error('Coordenadas não encontradas');
    } catch (error) {
      throw new Error('Erro ao buscar coordenadas');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const originState = states.find(s => s.sigla === values.originState);
      const destinationState = states.find(s => s.sigla === values.destinationState);
      const originCity = originCities.find(c => c.id === values.originCity);
      const destinationCity = destinationCities.find(c => c.id === values.destinationCity);

      if (!originState || !destinationState || !originCity || !destinationCity) {
        message.error('Dados inválidos');
        return;
      }

      // Get coordinates
      const originCoords = await getCoordinates(originCity.nome, originState.nome);
      const destinationCoords = await getCoordinates(destinationCity.nome, destinationState.nome);

      onComplete({
        origin: {
          state: originState.sigla,
          stateName: originState.nome,
          city: String(originCity.id),
          cityName: originCity.nome,
          lat: originCoords.lat,
          lon: originCoords.lon,
        },
        destination: {
          state: destinationState.sigla,
          stateName: destinationState.nome,
          city: String(destinationCity.id),
          cityName: destinationCity.nome,
          lat: destinationCoords.lat,
          lon: destinationCoords.lon,
        },
      });
    } catch (error) {
      message.error(error.message || 'Erro ao processar endereços');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-map-marker-alt text-green-600" />
          Origem
        </h3>
        
        <Form.Item
          label="Estado"
          name="originState"
          rules={[{ required: true, message: 'Selecione o estado de origem' }]}
        >
          <Select
            placeholder="Selecione o estado"
            loading={loadingStates}
            showSearch
            optionFilterProp="children"
            onChange={loadOriginCities}
          >
            {states.map(state => (
              <Select.Option key={state.id} value={state.sigla}>
                {state.nome} ({state.sigla})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Cidade"
          name="originCity"
          rules={[{ required: true, message: 'Selecione a cidade de origem' }]}
        >
          <Select
            placeholder="Selecione a cidade"
            loading={loadingOriginCities}
            showSearch
            optionFilterProp="children"
            disabled={originCities.length === 0}
          >
            {originCities.map(city => (
              <Select.Option key={city.id} value={city.id}>
                {city.nome}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-map-marker-alt text-red-600" />
          Destino
        </h3>
        
        <Form.Item
          label="Estado"
          name="destinationState"
          rules={[{ required: true, message: 'Selecione o estado de destino' }]}
        >
          <Select
            placeholder="Selecione o estado"
            loading={loadingStates}
            showSearch
            optionFilterProp="children"
            onChange={loadDestinationCities}
          >
            {states.map(state => (
              <Select.Option key={state.id} value={state.sigla}>
                {state.nome} ({state.sigla})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Cidade"
          name="destinationCity"
          rules={[{ required: true, message: 'Selecione a cidade de destino' }]}
        >
          <Select
            placeholder="Selecione a cidade"
            loading={loadingDestinationCities}
            showSearch
            optionFilterProp="children"
            disabled={destinationCities.length === 0}
          >
            {destinationCities.map(city => (
              <Select.Option key={city.id} value={city.id}>
                {city.nome}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </div>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block size="large">
          Próximo <i className="fas fa-arrow-right ml-2" />
        </Button>
      </Form.Item>
    </Form>
  );
}
