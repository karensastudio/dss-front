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

export const getTagsApi = async (authHeader) => {
  return youzAxios.get('/api/admin/tags', {
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

export const createTagApi = async (authHeader, request) => {
  return youzAxios.post('/api/admin/tags', request, {
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

export const updateTagApi = async (authHeader, tagId, updatedData) => {
  try {
    const response = await youzAxios.put(`/api/admin/tags/${tagId}`, updatedData, {
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
      message: error.response?.data?.message || 'An error occurred while updating the tag.',
      response: error.response
    };
  }
};

export const deleteTagApi = async (authHeader, tagId) => {
  try {
    const response = await youzAxios.delete(`/api/admin/tags/${tagId}`, {
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
      message: error.response?.data?.message || 'An error occurred while deleting the tag.',
      response: error.response
    };
  }
};

export const getTagByIdApi = async (authHeader, tagId) => {
  try {
    const response = await youzAxios.get(`/api/admin/tags/${tagId}`, {
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
      message: error.response?.data?.message || 'An error occurred while retrieving the tag.',
      response: error.response
    };
  }
};

export const getUserTags = async (authHeader) => {
  try {
    const response = await youzAxios.get('/api/v1/tags', {
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
      message: error.response?.data?.message || 'An error occurred while retrieving tags.',
      response: error.response
    };
  }
};


export const getUserTagByIdApi = async (authHeader, tagId) => {
  try {
    const response = await youzAxios.get(`/api/v1/tags/${tagId}`, {
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
      message: error.response?.data?.message || 'An error occurred while retrieving the tag.',
      response: error.response
    };
  }
};
