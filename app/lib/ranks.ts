export type Rank = {
  name: string
  icon: string
  color: string
  bg: string
  border: string
}

export function getRank(elo: number): Rank {
  if (elo >= 1700) return { name: 'Diamond',  icon: '💎', color: '#22d3ee', bg: 'rgba(34,211,238,0.12)',  border: 'rgba(34,211,238,0.3)'  }
  if (elo >= 1500) return { name: 'Platinum',  icon: '🔷', color: '#a855f7', bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.3)'  }
  if (elo >= 1300) return { name: 'Gold',      icon: '🥇', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  }
  if (elo >= 1100) return { name: 'Silver',    icon: '⚪', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)' }
  return              { name: 'Bronze',    icon: '🥉', color: '#b45309', bg: 'rgba(180,83,9,0.12)',    border: 'rgba(180,83,9,0.3)'    }
}
