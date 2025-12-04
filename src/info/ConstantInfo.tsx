// Блок констант
const ConstantInfo = {
  // База
  serverPort: '8084',
  fileDir: window.config.ip_api + ':8084/',

  // Авторизация и т.п.
  restApiLogin: '/api/auth/login',
  restApiCheckAuth: '/api/auth/check_auth',
  restApiRefreshToken: '/api/auth/refresh_token',
  restApiLogout: '/logout',
  checkAuthPeriod: 50000, // таймер проверки авторизации (в мс)

};

export default ConstantInfo;
