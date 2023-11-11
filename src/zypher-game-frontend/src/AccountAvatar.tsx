import { RainbowKitProvider, AvatarComponent } from '@rainbow-me/rainbowkit';
import React, { CSSProperties, useEffect, useState } from 'react';

export const ZypherAccountAvatar: AvatarComponent = ({ address, ensImage, size }) => {
  return ensImage ? (
    <img src={ensImage} width={size} height={size} style={{ borderRadius: 999 }} />
  ) : (
    <img style={{ width: '100%', height: '100%' }} src="https://static.zypher.game/img/avatar/default.png" />
  );
};
