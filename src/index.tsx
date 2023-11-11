import React from 'react';
import { createRoot } from 'react-dom/client';
import '_assets/style/index.scss';
import '@rainbow-me/rainbowkit/styles.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import store from '_src/store';
import { ConfigProvider } from 'antd';
import { AppEnterPage } from '_src/pages';
import { WagmiConfig } from 'wagmi';
import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { ZypherAccountAvatar } from '_src/zypher-game-frontend/src/AccountAvatar';
import { RecoilRoot } from 'recoil';
import { chains, wagmiClient } from './wagmi.config';
import { AppRedirect } from './pages/AppRedirect';
import { PageCryptoRumble } from './pages/CryptoRumble';
// eslint-disable-next-line
const { Buffer } = require('buffer');
window.Buffer = Buffer;

const theme = darkTheme({
  accentColor: '#6673FF',
  borderRadius: 'large',
  fontStack: 'system',
});
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiClient}>
      <RainbowKitProvider chains={chains} avatar={ZypherAccountAvatar} appInfo={{ appName: 'Zypher Game' }} theme={theme}>
        <ConfigProvider>
          <ReduxProvider store={store}>
            <RecoilRoot>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<AppRedirect />} />
                  <Route path="/CryptoRumble" element={<AppEnterPage />}>
                    <Route index element={<PageCryptoRumble />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </RecoilRoot>
          </ReduxProvider>
        </ConfigProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>,
);
