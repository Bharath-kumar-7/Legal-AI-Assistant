import { createRoot } from 'react-dom/client';
import { setAuthTokenGetter, setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// In production, VITE_API_URL must be set to the deployed backend URL.
// In development, the Vite proxy handles /api → localhost:3000.
const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl) {
  setBaseUrl(apiUrl);
}

setAuthTokenGetter(() => localStorage.getItem('nyaya_token'));

createRoot(document.getElementById('root')!).render(<App />);
