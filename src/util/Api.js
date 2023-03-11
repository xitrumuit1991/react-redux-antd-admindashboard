/* eslint-disable */
import axios from 'axios';
import {API_URL} from './config.js';

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, 
});
instance.defaults.timeout = 30000;


let convertObjectIdToId=(data)=>{
  if(Array.isArray(data)){
    return data.map(r=>{
      return convertObjectIdToId(r);
    })
  }else if(typeof data === "object" && data){
    if(data.objectId && !data.id){
      data.id = data.objectId;
    }
    for(let k of Object.keys(data)){
      if(Array.isArray(data[k])){
        data[k] = data[k].map(r=>{
          if(typeof r === 'object' && r)
            return convertObjectIdToId(r);
          return r;
        });
      }
      else if(typeof data[k] ==='object' && data[k] ){
        data[k] = convertObjectIdToId(data[k]);
      }else{
        data[k] = data[k];
      }
    }
    return data;
  }
  return data;
}


instance.interceptors.request.use(function (config) {
  if(!config.headers.authorization){
    if(localStorage.getItem('token')){
      config.headers.authorization = localStorage.getItem('token');
    }
  }
  config.headers['content-type'] = 'application/json';
  return config;
}, function (error) {
  return Promise.reject(error);
});



// Add a response interceptor
instance.interceptors.response.use(function (res) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  try{
    if(res && res.data && res.data.data && Array.isArray(res.data.data.data)){
      res.data.data.data = convertObjectIdToId(res.data.data.data);
    }else if(res && res.data && res.data.data && Array.isArray(res.data.data.items)){
      
      res.data.data.items = convertObjectIdToId(res.data.data.items);
    }else if(res && res.data && Array.isArray(res.data.data)){
      
      res.data.data = convertObjectIdToId(res.data.data);
    }else if(res && res.data && Array.isArray(res.data)){
      
      res.data = convertObjectIdToId(res.data);
    }
  
    if(res && res.data && res.data.data && res.data.data.data && res.data.data.data.objectId){
      res.data.data.data  = convertObjectIdToId(res.data.data.data);
    }else if(res && res.data && res.data.data && res.data.data.objectId ){
      res.data.data  = convertObjectIdToId(res.data.data);
    } else if(res && res.data && res.data &&  res.data.objectId ){
      res.data  = convertObjectIdToId(res.data);
    }
  }catch(e){
    console.log(e, e.stack, e.trace);
  }

  return res;
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  // console.log(`axios.interceptors.response`, error);
  // message.error( error.message || error.toString() );
  if(error && error.response){
    if(error.response.status === 401 || error.response.statusCode === 401){
      console.log(`API 401 redirect signin`, error);
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("user");
      window.localStorage.clear();
      window.location.href = '/signin';
      return;
    }
  }
  if(error && error.response && error.response.data){
    if(error.response.data.errors){
      if(error.response.data.errors.message)
        return Promise.reject(error.response.data.errors.message);
      return Promise.reject(JSON.stringify(error.response.data.errors));
    }

    if(error.response.data.error){
      if(error.response.data.error.message)
        return Promise.reject(error.response.data.error.message);
      return Promise.reject(JSON.stringify(error.response.data.error));
    }
    
    if(error.response.data){
      if(error.response.data.message)
        return Promise.reject(error.response.data.message);
      return Promise.reject(JSON.stringify(error.response.data));
    }
  }
  return Promise.reject(error);
});

instance.getFullListData = async (funcApi, params = {}, options = {})=>{
  let items = [];
  let limit = params.limit || 1000;
  let page = 0;
  let total = 0;
  let totalPage = 0;
  try {
    let rsFirstPage = await funcApi({
      ...params,
      page: 0,
      limit,
    });
    if (rsFirstPage.data.total) {
      // note total old version is totalPage ?????
      total = rsFirstPage.data.total;
      totalPage = Math.ceil(total / limit);
    }
    if (Array.isArray(rsFirstPage.data.items)) {
      items = rsFirstPage.data.items;
    } else if (Array.isArray(rsFirstPage.data.data)) {
      items = rsFirstPage.data.data;
    }
    // console.log(`rsFirstPage`, rsFirstPage);
    if (total == 0) {
      return items || [];
    }
    if (totalPage <= 1) {
      return items;
    }
    if (totalPage > 1) {
      let arrPromise = [];
      for (page = 1; page < totalPage; page++) {
        arrPromise.push(funcApi({
          ...params,
          limit,
          page,
        }));
      }
      if (arrPromise.length > 0) {
        // console.log(`arrPromise`, arrPromise, `totalPage`, totalPage);
        let rsPromies = await Promise.all(arrPromise);
        for (let rs of rsPromies) {
          // console.log(`rs perPage`, rs);
          if (rs.data && Array.isArray(rs.data.items)) {
            items = [...items, ...rs.data.items];
          }else if (rs.data && Array.isArray(rs.data.data)) {
            items = [...items, ...rs.data.data];
          }
        }
      }
    }
    return items;
  } catch (e) {
    console.log(`[ERROR] getFullListData error`, e);
    throw e;
  }
}


export default instance;