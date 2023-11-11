import { message } from 'antd';
import React, { HTMLProps, useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { cn } from '_src/constants/Constant';
import { errorParse } from '_src/utils';
import { LoadingOutlined } from '@ant-design/icons';

interface CptTypes {
  className?: string;
  onClick?: () => any;
  loading?: boolean;
  style?: React.CSSProperties;
  icon: React.ReactNode;
}

export const IconButton: React.FC<CptTypes> = React.memo((props) => {
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

  if (loading) {
    return (
      <span className={props.className} style={props.style}>
        <LoadingOutlined className={props.className} style={props.style} />
      </span>
    );
  }
  return (
    <span onClick={onClick} className={props.className} style={props.style}>
      {props.icon}
    </span>
  );
});
