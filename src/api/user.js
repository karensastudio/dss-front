import axios from "axios";

axios.interceptors.response.use(response => {
  return response;
}, error => {
  if (error.response.status === 401) {
    //place your reentry code
  }
  return error;
});

const youzAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  headers: {
    'Accept': 'application/json',
  }
});

export const getUsersApi = async (authHeader) => {
  return youzAxios.get('/api/admin/users', {
    headers: {
      Authorization: authHeader
    }
  }).then((response) => {
    if (response.data.status == 'success') {
      return {
        status: 'success',
        variant: 'default',
        message: response.data.message,
        response: response?.data
      }
    }
    else {
      return {
        status: 'error',
        variant: 'error',
        message: response?.data?.message,
        response: response
      }
    }
  }).catch((response) => {
    return {
      status: 'error',
      variant: 'error',
      message: response?.response?.data?.message,
      response: response?.response?.data
    }
  })
};