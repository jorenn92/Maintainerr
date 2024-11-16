import axios from 'axios'

const ApiHandler = async <Response,>(
  url: string,
  payload: any = '',
  method: 'get' | 'post' | 'delete' | 'put' = 'get',
): Promise<Response> => {
  const fetcher = async (
    url: string,
    payload?: any,
    method: 'get' | 'post' | 'delete' | 'put' = 'get',
  ) => {
    switch (method) {
      case 'get':
        return await axios.get<Response>(`/api${url}`).then((res) => res.data)
      case 'post':
        return await axios
          .post<Response>(`/api${url}`, payload)
          .then((res) => res.data)
      case 'put':
        return await axios
          .put<Response>(`/api${url}`, payload)
          .then((res) => res.data)
      case 'delete':
        return await axios
          .delete<Response>(`/api${url}`, payload)
          .then((res) => res.data)
    }
  }
  const data = await fetcher(url, payload, method)
  return data
}

export const GetApiHandler = async <Response = any,>(url: string) => {
  return await ApiHandler<Response>(url)
}

export const PostApiHandler = async <Response = any,>(
  url: string,
  payload: any,
) => {
  return await ApiHandler<Response>(url, payload, 'post')
}

export const DeleteApiHandler = async <Response = any,>(
  url: string,
  payload?: any,
) => {
  return await ApiHandler<Response>(url, payload, 'delete')
}

export const PutApiHandler = async <Response = any,>(
  url: string,
  payload: any,
) => {
  return await ApiHandler<Response>(url, payload, 'put')
}

export default GetApiHandler
