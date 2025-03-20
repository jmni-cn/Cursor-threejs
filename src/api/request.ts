import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

export const STATIC_URL = import.meta.env.VITE_STATIC_URL
export const BASE_URL = import.meta.env.VITE_API_URL


const request = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
});
request.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.status === 200 || response.status === 201) {
      const res = response.data
      return res
    } else {
      return Promise.reject(response);
    }
  },
  (error: AxiosError) => {
    if(error.config?.url?.includes('notice')){
      return Promise.reject(error)
    }
    return Promise.reject(error)
  }
);
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)
export default request;
export const get = (url:string, data?:object) => request.get(url, { params: data })
export const post = (url:string, data?:object) => request.post(url, data)



