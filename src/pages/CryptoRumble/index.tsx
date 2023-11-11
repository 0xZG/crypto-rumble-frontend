import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ZypherHeader } from '_src/zypher-game-frontend/src/ZypherHeader';
import { InitZypherConstants } from '_src/zypher-game-frontend/src/InitZypherConstants';
import { CryptoRumbleGameBody } from './GameBody';

InitZypherConstants({});

export const PageCryptoRumble: React.FC<{}> = (props) => {
  const [resizeStyle, _resizeStyle] = useState<CSSProperties>({});

  useEffect(() => {
    const widthBg = 612;
    const heightBg = 740 + 60;
    const ratioBg = widthBg / heightBg;
    const resize = () => {
      const width = window.document.body.clientWidth;
      const height = window.document.body.clientHeight;
      const style: CSSProperties = {};
      const ratio = width / height;

      let scale = 1;
      if (ratio > ratioBg) scale = height / heightBg;
      else scale = width / widthBg;
      scale = Math.min(1, scale);
      const transform = `scale(${scale})`;
      style.WebkitTransform = transform;
      style.transform = transform;
      _resizeStyle(style);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <PageIndexStyle>
      <img className="bg-1" src="/CryptoRumble/static/background/2.jpg" />
      <ZypherHeader />
      <CryptoRumbleGameBody style={resizeStyle} />
    </PageIndexStyle>
  );
};

const PageIndexStyle = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  > .bg-1 {
    position: absolute;
    z-index: -1;
    top: 0;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    object-position: center bottom;
  }
`;
