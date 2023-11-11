import { Input, Modal } from 'antd';
import React, { HTMLProps, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ReactComponent as ExitSvg } from '_assets/svg/exit.svg';
import { AppButton } from '_components/Com/AppButton';
import { CloseOutlined } from '@ant-design/icons';

export interface InputModalOption {
  title: string;
  desc: string;
  info?: {
    name: string;
    value: string;
  };
  inputToken?: string;
  max?: string;
  onConfirm?: (val: string) => Promise<null | string>;
  _onConfirm?: (val: string) => Promise<null | string>;
  check?: (val: string) => null | string;
  onClose?: () => any;
  defaultValue?: string;
}

let _options: null | React.Dispatch<React.SetStateAction<InputModalOption | null>> = null;

export const useInputModal = () => {
  return (options: InputModalOption) => {
    if (!_options) return;
    return new Promise<string>((resolve, reject) => {
      options._onConfirm = async (val) => {
        resolve(val);
        _options?.(null);
        return null;
      };
      options.onClose = () => {
        _options?.(null);
        reject(new Error('SilenceError: useInputModal close'));
      };
      _options?.(options);
    });
  };
};

export const InputModal: React.FC<{}> = React.memo(() => {
  const [options, _o] = useState<null | InputModalOption>(null);
  const [value, _value] = useState('');
  const [btnLoading, _btnLoading] = useState(false);

  useEffect(() => {
    _value(options?.defaultValue || '');
  }, [options]);

  useEffect(() => {
    _options = _o;
    return () => {
      _options = null;
    };
  }, []);

  if (!options) return null;
  return (
    <Modal width={440} open footer={null} closable={false} wrapClassName="modal-wrap-zero" centered rootClassName="modal-bg-blur-4">
      <CptStyle>
        <div className="exit" onClick={options.onClose}>
          <CloseOutlined />
        </div>
        <div className="title">{options.title}</div>
        <div className="des">{options.desc}</div>
        {options.info && (
          <div className="info">
            <div>{options.info.name}</div>
            <div>{options.info.value}</div>
          </div>
        )}

        <Input
          disabled={btnLoading}
          value={value}
          onChange={(v) => _value(v.target.value)}
          className="input"
          prefix={
            options.inputToken && (
              <InputPrefixStyle>
                <img src={`/2048/token/${options.inputToken}.svg`} />
                {options.inputToken}
              </InputPrefixStyle>
            )
          }
          suffix={options.max && <InputMaxStyle onClick={() => !btnLoading && _value(options.max!)}>MAX</InputMaxStyle>}
        />

        <AppButton
          onLoadingChange={(loading) => _btnLoading(loading)}
          onClick={async () => {
            if (options.check) {
              const res = options.check(value);
              if (typeof res !== 'string') return;
            }

            if (options.onConfirm) {
              const res = await options.onConfirm(value);
              if (typeof res !== 'string') return;
            }
            options._onConfirm?.(value);
          }}
          className="btn"
          type="primary"
        >
          Confirm
        </AppButton>
      </CptStyle>
    </Modal>
  );
});
const InputPrefixStyle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-right: 1px solid #ffffff16;
  padding-right: 10px;
  > img {
    width: 24px;
    height: 24px;
  }
`;
const InputMaxStyle = styled.div`
  display: flex;
  padding: 6px 10px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: rgba(76, 79, 120, 0.05);
  cursor: pointer;
  transition: all ease 0.2s;
  &:hover {
    border-color: #4096ff;
    color: #4096ff;
  }
`;
const CptStyle = styled.div`
  display: flex;
  width: 440px;
  padding: 24px 0px;
  flex-direction: column;
  align-items: center;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #4c4f78;
  color: #fff;
  font-family: Saira;
  margin-top: -80px;
  position: relative;
  font-style: normal;
  > .exit {
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: radial-gradient(103.68% 103.68% at 36.36% 13.64%, #8388ce 0%, #7a7daa 100%);
    position: absolute;
    right: 24px;
    top: 24px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all ease 0.2s;
    font-size: 20px;
    &:hover {
      opacity: 0.6;
    }
  }
  > .btn {
    margin-top: 30px;
    width: 300px;
  }
  > .input {
    width: 390px;
    margin-top: 8px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: var(--Input-BG, rgba(0, 0, 0, 0.3));
    padding: 16px;
    height: 62px;
    color: #fff;
    &.ant-input-affix-wrapper > input.ant-input {
      background-color: transparent;
      color: #fff;
    }
  }

  > .title {
    display: flex;
    padding: 0px 24px 24px 24px;
    justify-content: center;
    align-items: center;
    font-size: 24px;
  }
  > .des {
    font-size: 14px;
    opacity: 0.5;
    width: 100%;
    border-bottom: 1px solid #ffffff22;
    text-align: center;
    padding: 0 16px 24px;
  }
  > .info {
    display: flex;
    padding: 24px 24px 0px 24px;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
    font-size: 12px;
    opacity: 0.5;
  }
`;
