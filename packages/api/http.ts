import axios from 'axios';

const service = axios.create({
  baseURL: '',
  timeout: 10000
});

service.interceptors.request.use(
  config =>
    // before request send...
    config,
  err =>
    // after request error...
    Promise.reject(err)
);

service.interceptors.response.use(
  res =>
    // do something with response data
    res,
  err =>
    // error handling
    Promise.reject(err)
);

export default service;
