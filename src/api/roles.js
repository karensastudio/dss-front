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

export const getRolesApi = async (authHeader) => {
  return youzAxios.get('/api/admin/roles', {
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

export const grantAccessApi = async (authHeader, userData) => {
  return youzAxios.patch('/api/admin/users/' + userData.id, userData, {
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
}