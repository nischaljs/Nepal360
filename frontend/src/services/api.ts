import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 403 && error.response.data?.message === "KYC approval required.") {
//       // Redirect to the KYC submission page
//       router.navigate('/kyc/submit');
//       // Optionally, you can show a toast message
//       // toast.error("Action Blocked", { description: "KYC approval is required to perform this action." });
//     }
//     return Promise.reject(error);
//   }
// );

export default api;
