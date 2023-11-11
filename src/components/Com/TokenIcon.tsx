import React, { HTMLProps, useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

const DefaultTokenIconMap = {
  ZPOKER: '/2048/token/ZPOKER.svg',
  GP: '/2048/token/GP.png',
  '2048': '/2048/token/2048.svg',
  ETH: '/2048/token/ETH.svg',
};

export const TokenIcon: React.FC<{
  className?: string;
  onClick?: () => any;
  style?: React.CSSProperties;
  symbol: keyof typeof DefaultTokenIconMap;
  width?: number | string;
  height?: number | string;
}> = React.memo((props) => {
  const width = props.width ?? 24;
  const height = props.height ?? 24;
  return (
    <CptStyle src={DefaultTokenIconMap[props.symbol] || `/2048/token/${props.symbol}.svg`} width={width} height={height} onClick={props.onClick} className={props.className} style={props.style} />
  );
});

const CptStyle = styled.img`
  border-radius: 100px;
`;
