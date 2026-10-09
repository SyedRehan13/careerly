import { useHealthQuery } from '../../hooks/useHealthQuery'
const labels = {
  checking: 'Connecting',
  connected: 'Connected',
  unavailable: 'Connection unavailable',
} as const

export function StatusIndicator() {
  const { connectionState } = useHealthQuery()
  return (
    <div className="connection" role="status">
      <span className={`connection-dot ${connectionState}`} />
      {labels[connectionState]}
    </div>
  )
}
