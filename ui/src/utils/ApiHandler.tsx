import axios from 'axios'

const ApiHandler = async (
  url: string,
  payload: any = '',
  method: 'get' | 'post' | 'delete' | 'put' = 'get'
): Promise<any> => {
  const fetcher = async (
    url: string,
    payload?: any,
    method: 'get' | 'post' | 'delete' | 'put' = 'get'
  ) => {
    switch (method) {
      case 'get':
        return await axios.get(`/api${url}`).then((res) => res.data)
      case 'post':
        return await axios.post(`/api${url}`, payload).then((res) => res.data)
      case 'put':
        return await axios.put(`/api${url}`, payload).then((res) => res.data)
      case 'delete':
        return await axios.delete(`/api${url}`, payload).then((res) => res.data)
    }
  }
  const data = await fetcher(url, payload, method)

  if (data) {
    return data
  } else {
    return null
  }
}

export const GetApiHandler = async (url: string) => {
  return await ApiHandler(url)
}

export const PostApiHandler = async (url: string, payload: any) => {
  return await ApiHandler(url, payload, 'post')
}

export const DeleteApiHandler = async (url: string, payload: any = '') => {
  return await ApiHandler(url, payload, 'delete')
}

export const PutApiHandler = async (url: string, payload: any) => {
  return await ApiHandler(url, payload, 'put')
}

export default GetApiHandler
