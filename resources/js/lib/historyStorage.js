// Utilitário para gerenciar histórico de cálculos no localStorage

const HISTORY_KEY = 'fuel_calculator_history';
const MAX_HISTORY_ITEMS = 50;

export const saveCalculation = (calculationData) => {
  try {
    const history = getHistory();
    
    const newCalculation = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...calculationData,
    };
    
    // Adiciona no início do array
    history.unshift(newCalculation);
    
    // Limita o tamanho do histórico
    if (history.length > MAX_HISTORY_ITEMS) {
      history.splice(MAX_HISTORY_ITEMS);
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    
    return newCalculation;
  } catch (error) {
    console.error('Erro ao salvar cálculo no histórico:', error);
    return null;
  }
};

export const getHistory = () => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    return [];
  }
};

export const clearHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch (error) {
    console.error('Erro ao limpar histórico:', error);
    return false;
  }
};

export const deleteCalculation = (id) => {
  try {
    const history = getHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Erro ao deletar cálculo:', error);
    return false;
  }
};
