import { useEffect, useState } from 'react';
import type { HealthStatus } from '@app/shared';

export function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json() as Promise<HealthStatus>)
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  return (
    <main style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h1>Codebase Map</h1>
      <p>
        Hello. Server: {health ? `${health.status} (up ${health.uptimeSeconds}s)` : 'connecting…'}
      </p>
    </main>
  );
}
