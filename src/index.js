import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React   from 'react';
import { createRoot } from 'react-dom/client';
import App      from './App';
import { AuthProvider } from './context/AuthContext';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';


createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <PayPalScriptProvider options={{
      "client-id": "AR8TS3pkjQwtCNNhJw8MlXRS8NioyUjY49LaIqX_ygVXYSD6MhZ-fReF3ZC_SgSuOVI73U3ByEA1TTq4",
      components: "buttons",
      currency: "USD"
    }}>
      <App />
    </PayPalScriptProvider>
  </AuthProvider>
);
