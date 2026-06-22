import apiClient from './client'
import type { SectorStory } from '../types/api'

export async function getSectorStory(id: string): Promise<SectorStory> {
  const response = await apiClient.get<SectorStory>(`/sectors/${id}/story`)
  return response.data
}
