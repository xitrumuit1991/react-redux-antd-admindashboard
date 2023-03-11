
if (!process.env.REACT_APP_ENV) {
  process.env.REACT_APP_ENV = 'development';
}
export const isProd = process.env.REACT_APP_ENV === 'production';
let _API_URL = isProd ? 'https://api.dikauri.com' : 'https://tabletopapi.dikauri.com';
// let SOCKET_URL = isProd ? 'wss://api.dikauri.com' : 'wss://tabletopapi.dikauri.com';

console.log(`%c env app started`, 'background:green; font-size:20px; color:white; padding:10px', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_ENV: process.env.REACT_APP_ENV,
  API_URL: _API_URL,
  // SOCKET_URL: SOCKET_URL,
});

export const BIZMAN_VERSION = 'v1.0.55';
export const API_URL = _API_URL;
export const footerText = 'Copyright Company Name © 2019';