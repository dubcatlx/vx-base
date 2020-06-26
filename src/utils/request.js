import axios from "axios";
import { Toast } from "vant";
import store from "@/store";
import { getToken } from "@/utils/auth";

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true,
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000, // request timeout
});

// request interceptor
service.interceptors.request.use(
  (config) => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      // xhr.setRequestHeader("Authorization", "Bearer " + $.cookie("xzb_token"));
      config.headers["Authorization"] = "Bearer " + getToken();
    }
    return config;
  },
  (error) => {
    // do something with request error
    console.log(error); // for debug
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  (response) => {
    const res = response.data;
    // if the custom code is not 20000, it is judged as an error.
    if (response.status !== 200) {
      return Promise.reject(new Error(response.Result || "Error"));
    } else {
      return res;
    }
  },
  (error) => {
    if (error.response.data instanceof Array) {
      Toast(error.response.data[0]);
    } else {
      if (error.toString().indexOf("404") > 0) {
        Toast("页面丢失");
      } else if (error.toString().indexOf("401") > 0) {
        Toast("登录过期，请重新登录");
        store.dispatch('user/logout')
      } else if (error.toString().indexOf("500") > 0) {
        Toast("出错了");
      } else {
        Toast(error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default service;
