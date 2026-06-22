import apiClient from './client'
import type { Signal, SignalFeed, SignalFeedParams, SignalStatusUpdate } from '../types/api'

export async function getSignalFeed(params: SignalFeedParams): Promise<SignalFeed> {
  const response = await apiClient.get<SignalFeed>('/signals/feed', { params })
  return response.data
}

export async function getSignal(id: string): Promise<Signal> {
  const response = await apiClient.get<Signal>(`/signals/${id}`)
  return response.data
}

export async function updateSignalStatus(id: string, data: SignalStatusUpdate): Promise<Signal> {
  const response = await apiClient.patch<Signal>(`/signals/${id}/status`, data)
  return response.data
}
