import React, { HTMLProps, useCallback, useContext, useEffect, useState } from 'react';
import { ReactComponent as ExitSvg } from '_assets/svg/exit.svg';
import styled from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';
import { errorParse } from '_src/utils';
import { message } from 'antd';

export const ExitLeft: React.FC<{
  className?: string;
  onClick?: () => any;
  style?: React.CSSProperties;
  loading?: boolean;
}> = React.memo((props) => {
  props = { ...props };
  const [loadingTemp, _loading] = useState(false);
  const loading = props.loading ?? loadingTemp;

  const onClick = useCallback(async () => {
    if (loading) return;
    if (!props.onClick) return;
    _loading(true);
    try {
      await props.onClick();
    } catch (e) {
      const tip = errorParse(e);
      message.error(tip);
    } finally {
      _loading(false);
    }
  }, [props.onClick, loading]);
  return (
    <CptStyle onClick={onClick} className={props.className} style={props.style}>
      {loading ? <LoadingOutlined /> : <ExitSvg />}
    </CptStyle>
  );
});

const CptStyle = styled.div`
  display: inline-flex;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: radial-gradient(103.68% 103.68% at 36.36% 13.64%, #8388ce 0%, #7a7daa 100%);
  color: #fff;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all ease 0.3s;
  &:hover {
    opacity: 0.8;
  }
`;
