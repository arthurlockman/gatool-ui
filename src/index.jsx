import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

import App from './App';
import reportWebVitals from './reportWebVitals';
import { Auth0Provider } from "@auth0/auth0-react";
import { AuthClientContextProvider } from './contextProviders/AuthClientContext';
import { ToastContainer } from 'react-toastify';
import { OnlineStatusProvider } from './contextProviders/OnlineContext';
import { HotkeysProvider } from 'react-hotkeys-hook'
import { SnackbarProvider } from 'notistack';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* see https://github.com/JohannesKlauss/react-hotkeys-hook/issues/854#issuecomment-1345235881 for why the 'none' scope is needed */}
    <HotkeysProvider initiallyActiveScopes={['matchNavigation', 'tabNavigation', 'none']}>
      <OnlineStatusProvider>
        <Auth0Provider
          domain="auth.gatool.org"
          clientId="afsE1dlAGS609U32NjmvNMaYSQmtO3NT"
          redirectUri={window.location.origin}
          useRefreshTokens={true}
          cacheLocation='localstorage'
          connection='email'
        >
          <AuthClientContextProvider>
            <SnackbarProvider>
              <App />
            </SnackbarProvider>
          </AuthClientContextProvider>
        </Auth0Provider>
        <ToastContainer
          position='bottom-right'
          autoClose={5000}
          closeOnClick
          pauseOnHover
          pauseOnFocusLoss={true}
          draggable
          theme="colored"
        />
      </OnlineStatusProvider>
    </HotkeysProvider>
  </React.StrictMode >
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
