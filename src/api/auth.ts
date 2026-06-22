import apiClient from './client'
import type { LoginRequest, LoginResponse, Operator } from '../types/api'

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', data)
  return response.data
}

export async function getMe(): Promise<Operator> {
  const response = await apiClient.get<Operator>('/auth/me')
  return response.data
}
