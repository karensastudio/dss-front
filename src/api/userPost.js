import axios from "axios";

axios.interceptors.response.use(response => {
    return response;
}, error => {
    if (error.response && error.response.status === 401) {
        //place your reentry code
    }
    return Promise.reject(error); // Make sure to properly reject errors
});

const youzAxios = axios.create({
    baseURL: import.meta.env.VITE_API_BASE,
    headers: {
        'Accept': 'application/json',
    }
});

export const getUserPostsApi = async (authHeader) => {
    return youzAxios.get('/api/v1/posts', {
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

export const getUserGraphApi = async (authHeader) => {
    return youzAxios.get('/api/v1/graph', {
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

export const getMindmapApi = async (authHeader) => {
    try {
        const response = await youzAxios.get('/api/v1/mindmap', {
            headers: {
                Authorization: authHeader
            }
        });
        
        if (response.data.status === 'success') {
            return {
                status: 'success',
                variant: 'default',
                message: response.data.message,
                response: response?.data
            };
        } else {
            return {
                status: 'error',
                variant: 'error',
                message: response?.data?.message,
                response: response
            };
        }
    } catch (error) {
        return {
            status: 'error',
            variant: 'error',
            message: error?.response?.data?.message || 'An error occurred while retrieving the mindmap data.',
            response: error?.response?.data
        };
    }
};

export const getPostBySlugApi = async (authHeader, slug) => {
    try {
        const response = await youzAxios.get(`/api/v1/posts/${slug}`, {
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
            message: error.response?.data?.message || 'An error occurred while retrieving the post.',
            response: error.response
        };
    }
};
