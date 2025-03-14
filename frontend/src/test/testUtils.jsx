// frontend/src/test/testUtils.jsx

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LobbyContext } from '../context/LobbyContext';

/**
 * Renders a component within BrowserRouter
 */
export const renderWithRouter = (ui, route = '/', locationState = {}) => {
  return render(
    <MemoryRouter initialEntries={[{ pathname: route, state: locationState }]}>
      {ui}
    </MemoryRouter>,
  );
};

/**
 * Renders a component with LobbyContext.Provider and BrowserRouter
 */
export const renderWithLobbyContext = (ui, contextValue, route = '/') => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <LobbyContext.Provider value={contextValue}>{ui}</LobbyContext.Provider>
    </MemoryRouter>,
  );
};
