import { useTimedown } from '_src/hook/useTimeLimit';
import { ICryptoRumbleTile } from '_src/types/CryptoGame';
import classNames from 'classnames';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

const CryptoTile: React.FC<{ tile: ICryptoRumbleTile; active?: boolean; onClick?: (e: any, tile: ICryptoRumbleTile) => any }> = React.memo((props) => {
  const { tile } = props;
  return (
    <div
      key={tile.id}
      onClick={(e) => props.onClick?.(e, tile)}
      className={classNames(`tiles-index-${tile.index}`, `tile-value-${tile.value}`, `temp-y-${tile.tempY}`, `status-${tile.status}`, `active-${props.active}`)}
    >
      <div className={classNames('sprites-tiles-v1', `tiles-v1-${tile.value}`)}></div>
    </div>
  );
});

export default CryptoTile;
