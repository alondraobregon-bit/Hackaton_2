export interface LoginRequest {
  teamCode: string
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  operator: Operator
}

export interface Operator {
  id: string
  name: string
  email: string
  teamCode: string
}

export interface DashboardSummary {
  totalTropels: number
  activeSignals: number
  criticalSignals: number
  sectorsCount: number
}

export interface Tropel {
  id: string
  name: string
  species: string
  vitalState: string
  sectorId: string
  sectorName: string
  chaosIndex: number
  updatedAt: string
}

export interface TropelPage {
  content: Tropel[]
  totalElements: number
  totalPages: number
  currentPage: number
  size: number
}

export interface TropelFilters {
  page?: number
  size?: number
  species?: string
  vitalState?: string
  sectorId?: string
  q?: string
  sort?: string
}

export interface Signal {
  id: string
  title: string
  description: string
  signalType: string
  severity: string
  status: string
  tropelId: string
  tropelName: string
  sectorId: string
  createdAt: string
}

export interface SignalFeed {
  items: Signal[]
  nextCursor: string | null
  hasMore: boolean
  totalEstimate: number
}

export interface SignalFeedParams {
  cursor?: string
  limit?: number
  signalType?: string
  severity?: string
  status?: string
  q?: string
}

export interface SignalStatusUpdate {
  status: 'PROCESANDO' | 'ATENDIDA'
}

export interface Sector {
  id: string
  name: string
  description: string
}

export interface SectorStory {
  id: string
  name: string
  stages: SectorStage[]
  metrics: Record<string, number>
}

export interface SectorStage {
  id: string
  title: string
  description: string
  metrics: Record<string, number>
}
