import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useMatch } from 'react-router-dom';
import AppConstants, { GlobalVar } from '_src/constants/Constant';
import styled from 'styled-components';
import { useAppSelector } from '_src/store/hooks';
import { useNetwork, useSwitchNetwork, useWalletClient } from 'wagmi';
import chooseSlice from '_src/store/choose/reducer';
import gameSlice from '_src/store/game/reducer';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { ChainInfo, SupportNetworks } from '_src/constants/Contracts';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '_src/store';

export const AppEnterPage: React.FC<{}> = (props) => {
  const match = useMatch('*');
  const choose = useAppSelector((s) => s.choose);
  const dispatch = useDispatch<AppDispatch>();
  GlobalVar.dispatch = dispatch;
  const chain = useAppSelector((s) => s.game.Chain);
  const net = useNetwork();
  const switchNet = useSwitchNetwork();
  const [globalLoading, setGlobalLoading] = useState(true);

  useEffect(() => {
    if (!net.chain) return;
    if (net.chain.unsupported) return;
    const find = SupportNetworks.find((i) => i.id === net.chain?.id);
    if (!find) return;
    GlobalVar.dispatch(gameSlice.actions.Update({ Chain: find }));
  }, [net.chain?.id]);

  useEffect(() => {
    setTimeout(() => {
      const el = document.querySelector('#rootLoading');
      if (el) el.remove();
      setGlobalLoading(false);
    }, 1000);

    const url = new URL(location.href);
    const gameId = url.searchParams.get('gameId');
    if (gameId) {
      GlobalVar.dispatch(chooseSlice.actions.Update({ modalGamePlaybackId: gameId }));
    }
  }, []);

  useEffect(() => {
    if (!switchNet.switchNetworkAsync) return;
    const url = new URL(location.href);
    const chainId = url.searchParams.get('chainId');
    if (!chainId) return;
    const chainIdNum = parseInt(chainId);
    const find = SupportNetworks.find((i) => i.id === chainIdNum);
    if (!find) return;
    switchNet.switchNetworkAsync(find.id);
  }, [switchNet.switchNetworkAsync]);

  const apolloClient = useMemo(() => {
    return new ApolloClient({ uri: ChainInfo[chain.id].BASE_GF_URL, cache: new InMemoryCache() });
  }, [chain.id]);

  if (globalLoading) return null;
  return (
    <ApolloProvider client={apolloClient}>
      <PageStyle className={`page-${match?.pathname.replace(/\//g, '') || ''}`}>
        <Outlet />
      </PageStyle>
    </ApolloProvider>
  );
};

const PageStyle = styled.div`
  min-height: 100vh;
  width: 100%;
`;
