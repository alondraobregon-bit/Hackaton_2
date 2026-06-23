import apiClient from './client'
import type { Sector, SectorStory } from '../types/api'

export async function getSectors(): Promise<Sector[]> {
  const response = await apiClient.get<Sector[]>('/sectors')
  return response.data
}

export async function getSectorStory(id: string): Promise<SectorStory> {
  const response = await apiClient.get<SectorStory>(`/sectors/${id}/story`)
  return response.data
}