import axios from 'axios';

const service = axios.create({
  baseURL: '',
  timeout: 10000
});

service.interceptors.request.use(
  config => {
    // before request send...
    return config;
  },
  err => {
    // after request error...
    return Promise.reject(err);
  }
);

service.interceptors.response.use(
  res => {
    // do something with response data
    return res;
  },
  err => {
    // error handling
    return Promise.reject(err);
  }
);

export default service;
