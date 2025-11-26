import React, { createContext, useState, useContext } from 'react';

const FiltroContext = createContext();

// Componente que envuelve mainjsx y proveerá el estado del filtro
export function FiltroProvider({ children }) {
  // 30 días por defecto. 0 significa "Hoy".
  const [rangoDias, setRangoDias] = useState(0); 

  return (
    <FiltroContext.Provider value={{ rangoDias, setRangoDias }}>
      {children}
    </FiltroContext.Provider>
  );
}

export function useFiltro() {
  const context = useContext(FiltroContext);
  if (!context) {
    throw new Error('useFiltro debe ser usado dentro de un FiltroProvider');
  }
  return context;
}
