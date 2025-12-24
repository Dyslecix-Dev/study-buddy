import DashboardNav from '@/components/dashboard-nav'
import { KnowledgeGraph } from '@/components/graph/knowledge-graph'

export default function GraphPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <DashboardNav />
      <div className="container mx-auto py-8 px-4">
        <KnowledgeGraph />
      </div>
    </div>
  )
}
