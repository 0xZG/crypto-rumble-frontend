import { message, notification } from 'antd';
import React, { HTMLProps, useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { cn } from '_src/constants/Constant';
import { errorParse } from '_src/utils';
import ButtonGreenPng from '_assets/images/Button_Green.png';
import ButtonbluePng from '_assets/images/Button_Blue.png';
import { LoadingOutlined } from '@ant-design/icons';

interface CptTypes {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => any;
  loading?: boolean;
  link?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  disabledClick?: boolean;
  width?: number | string;
  id?: string;
  size?: 'mini';
  type?: 'primary' | 'default' | 'blue' | 'error';
  onLoadingChange?: (loading: boolean) => any;
}

export const AppButton: React.FC<CptTypes> = React.memo((props) => {
  props = { ...props };
  if (props.width) props.style = { ...props.style, width: props.width };
  const [loadingTemp, _loading] = useState(false);
  const loading = props.loading || loadingTemp;

  const onClick = useCallback(async () => {
    if (loading) return;
    if (props.disabled && props.disabledClick !== true) return;
    if (!props.onClick) return;
    _loading(true);
    props.onLoadingChange?.(true);
    try {
      await props.onClick();
    } catch (e) {
      console.log('appButton catch', e);
      const tip = errorParse(e);
      if (!tip) return;
      notification.error({ message: 'Error', description: tip });
    } finally {
      _loading(false);
      props.onLoadingChange?.(false);
    }
  }, [props.onClick, loading]);

  return (
    <AppButtonStyle onClick={onClick} style={props.style} id={props.id} className={cn(`type-${props.type || 'primary'}`, `size-${props.size}`, { loading, disabled: props.disabled }, props.className)}>
      {props.link ? (
        <a href={props.link} target="_blank" rel="noreferrer">
          {props.children}
        </a>
      ) : (
        <div>{props.children}</div>
      )}
      {loading && <LoadingOutlined />}
    </AppButtonStyle>
  );
});
const AppButtonStyle = styled.div`
  cursor: pointer;
  position: relative;
  transition: all ease 0.2s;
  user-select: none;
  transition: all 0.2s linear;
  display: flex;
  font-size: 24px;
  width: 254px;
  height: 85px;
  padding-bottom: 10px;
  &.type-primary {
    background-image: url(${ButtonGreenPng});
    display: flex;
    justify-content: center;
    align-items: center;
    background-size: 100% 100%;
    text-shadow: 0px 2px 2px #156a00;
    color: rgb(225 255 201);
  }
  &.type-blue {
    background-image: url(${ButtonbluePng});
    display: flex;
    justify-content: center;
    align-items: center;
    background-size: 100% 100%;
    text-shadow: 2px 2px 0px #53797e;
    color: #c3eaed;
  }
  &.disabled {
    filter: grayscale(100%);
    cursor: not-allowed;
    > div,
    > a {
      pointer-events: none;
    }
  }
  > div,
  > a {
    text-decoration: none;
    text-align: center;
  }
  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }
  &.loading {
    cursor: wait;
  }
`;
