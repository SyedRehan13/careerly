import { useQuery } from '@tanstack/react-query'
import { getHealth } from '../services/api'
import type { ConnectionState } from '../types/api'

export function useHealthQuery() {
  const query = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    refetchInterval: 60_000,
  })

  const connectionState: ConnectionState = query.isPending
    ? 'checking'
    : query.isSuccess
      ? 'connected'
      : 'unavailable'

  return { ...query, connectionState }
}

