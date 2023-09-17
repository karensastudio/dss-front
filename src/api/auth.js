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

export const registerAPI = async (request) => {
    return youzAxios.post('/api/v1/auth/register', request).then((response) => {
        if (response.data.status == 'success') {
            return {
                status: 'success',
                variant: 'default',
                message: response.data.message,
                response: response
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
            message: response.data.message,
            response: response
        }
    })
};

export const loginAPI = async (request) => {
    return youzAxios.post('/api/v1/auth/login', request).then((response) => {
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

export const getMeAPI = async (authHeader) => {
    try {
        const response = await youzAxios.get('/api/v1/auth/me', {
            headers: {
                Authorization: authHeader
            }
        });
        
        if (response.data.status === 'success') {
            return {
                status: 'success',
                variant: 'default',
                message: response.data.message,
                response: response.data
            };
        } else {
            return {
                status: 'error',
                variant: 'error',
                message: response.data.message,
                response: response.data
            };
        }
    } catch (error) {
        return {
            status: 'error',
            variant: 'error',
            message: error.response?.data?.message || 'An error occurred',
            response: error.response?.data || null
        };
    }
};

export const logoutAPI = async (authHeader) => {
        return youzAxios.post('/api/v1/auth/logout', null, {
            headers: {
                Authorization: authHeader
            }
        }).then((response) => {
            if (response.data.status === 'success') {
                return {
                    status: 'success',
                    variant: 'default',
                    message: response.data.message,
                    response: response.data
                };
            } else {
                return {
                    status: 'error',
                    variant: 'error',
                    message: response.data.message,
                    response: response.data
                };
            }
        }).catch((response) => {
            return {
                status: 'error',
                variant: 'error',
                message: error.response?.data?.message || 'An error occurred',
                response: error.response?.data || null
            }
        });
};

export const changePasswordAPI = async (request) => {
    return youzAxios.post('/api/v1/auth/change-password', request).then((response) => {
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