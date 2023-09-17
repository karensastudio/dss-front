import axios from "axios";

const youzAxios = axios.create({
    baseURL: import.meta.env.VITE_API_BASE,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
    }
});

export const APIUploadFile = async (file) => {
    if (file.size / 1024 > 10000) {
        return {
            status: 'error',
            variant: 'error',
            message: 'Image size is too large. Maximum size is 10MB.'
        }
    }

    if (file.type != 'image/jpeg' && file.type != 'image/png' && file.type != 'image/heic') {
        return {
            status: 'error',
            variant: 'error',
            message: 'Image type is not supported. Supported types are: JPEG, PNG, HEIC.'
        }
    }

    return youzAxios.post('/api/v1/files/upload', {
        file: file
    }).then((response) => {
        if (response.data.status == 'success') {
            return {
                status: 'success',
                variant: 'default',
                message: response.data.message,
                response: response.data.file
            }
        }
        else {
            return {
                status: 'error',
                variant: 'error',
                message: response.data.message,
                response: response
            }
        }
    }).catch((response) => {
        return {
            status: 'error',
            variant: 'error',
            message: 'An error occurred while uploading the image. Please try again later.',
            response: response
        }
    })
}