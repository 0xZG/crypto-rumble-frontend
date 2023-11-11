import { message } from 'antd';

export const CopyIt = (text: string) => {
  navigator.clipboard.writeText(text);
  message.success('Copy success');
};
