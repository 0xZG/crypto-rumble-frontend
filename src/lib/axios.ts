import axios from 'axios';
import AppConstants from '_src/constants/Constant';

interface HTTP_Response_Data<T = any> {
  code: number;
  msg: string;
  data: T;
}

export const httpClient = axios.create({
  baseURL: AppConstants.BASE_URL_API,
});

export const httpGet = async <T = any>(...params: Parameters<typeof httpClient.get>): Promise<HTTP_Response_Data<T>> => {
  return httpClient
    .get(...params)
    .then((res) => {
      if (res.status !== 200) return { code: res.status, msg: typeof res.data === 'string' ? res.data : res.statusText, data: null as any };
      return { code: 0, data: res.data, msg: 'success' } as HTTP_Response_Data<T>;
    })
    .catch((err) => {
      if (err && err.response && err.response.data && typeof err.response.data === 'string') {
        return Promise.resolve({ code: err.response.status, msg: err.response.data, data: null as any });
      }
      return Promise.resolve({ code: 500, msg: String(err).replace(/AxiosError:/, ''), data: null as any });
    });
};

export const httpPost = async <T = any>(...params: Parameters<typeof httpClient.post>): Promise<HTTP_Response_Data<T>> => {
  return httpClient
    .post(...params)
    .then((res) => {
      if (res.status !== 200) {
        return { code: res.status, msg: typeof res.data === 'string' ? res.data : res.statusText, data: null as any };
      }
      return { code: 0, data: res.data, msg: 'success' };
    })
    .catch((err) => {
      if (err && err.response && err.response.data && typeof err.response.data === 'string') {
        return Promise.resolve({ code: err.response.status, msg: err.response.data, data: null as any });
      }
      return Promise.resolve({ code: 500, msg: String(err).replace(/AxiosError:/, ''), data: null as any });
    });
};
