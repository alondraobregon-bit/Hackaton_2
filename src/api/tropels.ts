import apiClient from './client'
import type { TropelPage, TropelFilters } from '../types/api'

export async function getTropels(filters: TropelFilters): Promise<TropelPage> {
  const response = await apiClient.get<TropelPage>('/tropels', { params: filters })
  return response.data
}
