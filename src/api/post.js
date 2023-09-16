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

export const getPostsApi = async (authHeader, request) => {
    return youzAxios.get('/api/admin/posts', request, {
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

  export const createPostApi = async (authHeader, request) => {
        return youzAxios.post('/api/admin/posts', request, {
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
  
  export const updatePostApi = async (authHeader, postId, updatedData) => {
    try {
      const response = await youzAxios.put(`/api/admin/posts/${postId}`, updatedData, {
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
        message: error.response?.data?.message || 'An error occurred while updating the post.',
        response: error.response
      };
    }
  };
  
  export const deletePostApi = async (authHeader, postId) => {
    try {
      const response = await youzAxios.delete(`/api/admin/posts/${postId}`, {
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
        message: error.response?.data?.message || 'An error occurred while deleting the post.',
        response: error.response
      };
    }
  };
  
  export const getPostByIdApi = async (authHeader, postId) => {
    try {
      const response = await youzAxios.get(`/api/admin/posts/${postId}`, {
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
  