'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Maximize2, Minimize2, Search, Info } from 'lucide-react'

// Dynamically import ForceGraph2D with SSR disabled
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
})

interface GraphNode {
  id: string
  title: string
  folderId?: string | null
  folderName?: string | null
  tags: { id: string; name: string; color?: string }[]
  linkCount: number
  updatedAt: string
}

interface GraphLink {
  fromNoteId: string
  toNoteId: string
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
  statistics: {
    nodeCount: number
    linkCount: number
    orphanedCount: number
    averageConnections: number
  }
  orphanedNotes: { id: string; title: string }[]
  mostConnected: { id: string; title: string; folderName?: string | null; connections: number }[]
}

interface KnowledgeGraphProps {
  height?: number
  onNodeClick?: (nodeId: string) => void
}

export function KnowledgeGraph({ height = 600, onNodeClick }: KnowledgeGraphProps) {
  const router = useRouter()
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showStats, setShowStats] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [graphWidth, setGraphWidth] = useState(800)
  const graphRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Track container width for responsive graph
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setGraphWidth(containerRef.current.clientWidth)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [isFullscreen])

  // Detect theme changes
  useEffect(() => {
    const detectTheme = () => {
      const isDark = document.documentElement.classList.contains('dark') ||
                     window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(isDark)
    }

    // Initial detection
    detectTheme()

    // Listen for theme changes
    const observer = new MutationObserver(detectTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => detectTheme()
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch('/api/notes/graph')
        if (response.ok) {
          const data = await response.json()
          setGraphData(data)
        }
      } catch (error) {
        console.error('Error fetching graph data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGraphData()
  }, [])

  const handleNodeClick = useCallback((node: any) => {
    if (onNodeClick) {
      onNodeClick(node.id)
    }
  }, [onNodeClick])

  const filteredData = graphData ? {
    nodes: graphData.nodes
      .filter(node =>
        searchQuery === '' ||
        node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .map(node => ({
        id: node.id,
        name: node.title,
        folderName: node.folderName,
        val: node.linkCount + 3, // Size based on connections
        color: getNodeColor(node),
      })),
    links: graphData.links
      .filter(link => {
        const fromExists = graphData.nodes.some(n =>
          n.id === link.fromNoteId &&
          (searchQuery === '' || n.title.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        const toExists = graphData.nodes.some(n =>
          n.id === link.toNoteId &&
          (searchQuery === '' || n.title.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        return fromExists && toExists
      })
      .map(link => ({
        source: link.fromNoteId,
        target: link.toNoteId,
      })),
  } : { nodes: [], links: [] }

  function getNodeColor(node: GraphNode) {
    if (node.linkCount === 0) return '#9ca3af' // Gray for orphaned
    if (node.linkCount >= 5) return '#ef4444' // Red for highly connected
    if (node.linkCount >= 3) return '#f59e0b' // Orange
    return '#3b82f6' // Blue for normal
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading knowledge graph...</div>
      </div>
    )
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8" style={{ height: `${height}px` }}>
        <p className="text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
          No notes to visualize
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Create some notes and link them together to see your knowledge graph
        </p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes by title or tag..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        <button
          onClick={() => setShowStats(!showStats)}
          className="p-2 rounded-lg border transition-colors"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
          title="Toggle statistics"
        >
          <Info size={20} />
        </button>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-lg border transition-colors"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* Statistics Panel */}
      {showStats && (
        <div
          className="absolute top-4 right-4 p-4 rounded-lg border shadow-lg max-w-xs z-10"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            marginTop: '60px',
          }}
        >
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Graph Statistics
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Total Notes:</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {graphData.statistics.nodeCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Total Links:</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {graphData.statistics.linkCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Orphaned Notes:</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {graphData.statistics.orphanedCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Avg Connections:</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {graphData.statistics.averageConnections.toFixed(1)}
              </span>
            </div>
          </div>

          {graphData.mostConnected.length > 0 && (
            <>
              <h4 className="font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>
                Most Connected
              </h4>
              <div className="space-y-2 text-xs">
                {graphData.mostConnected.slice(0, 3).map((note) => (
                  <div key={note.id} className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="truncate" style={{ color: 'var(--text-secondary)' }}>
                        {note.title}
                      </div>
                      {note.folderName && (
                        <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          📁 {note.folderName}
                        </div>
                      )}
                    </div>
                    <span className="font-medium flex-shrink-0" style={{ color: 'var(--text-primary)' }}>
                      {note.connections}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Graph */}
      <div
        style={{
          height: isFullscreen ? '100vh' : `${height}px`,
          backgroundColor: 'var(--background)',
        }}
      >
        <ForceGraph2D
          ref={graphRef}
          graphData={filteredData}
          width={graphWidth}
          height={isFullscreen ? window.innerHeight : height}
          nodeLabel={(node: any) => node.folderName ? `${node.name}\nin ${node.folderName}` : node.name}
          nodeColor="color"
          nodeVal="val"
          onNodeClick={handleNodeClick}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          linkColor={() => 'rgba(100, 116, 139, 0.3)'}
          linkWidth={1.5}
          nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const label = node.name
            const fontSize = 12 / globalScale
            const smallFontSize = 10 / globalScale
            ctx.font = `${fontSize}px Sans-Serif`

            // Draw node circle
            ctx.beginPath()
            ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false)
            ctx.fillStyle = node.color
            ctx.fill()

            // Draw main label (note title)
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = isDarkMode ? '#e5e7eb' : '#1f2937'
            ctx.fillText(label, node.x, node.y + node.val + fontSize + 4)

            // Draw folder name below if available
            if (node.folderName) {
              ctx.font = `${smallFontSize}px Sans-Serif`
              ctx.fillStyle = isDarkMode ? '#9ca3af' : '#6b7280'
              const folderText = `📁 ${node.folderName}`
              ctx.fillText(folderText, node.x, node.y + node.val + fontSize + smallFontSize + 8)
            }
          }}
          cooldownTicks={100}
          onEngineStop={() => graphRef.current?.zoomToFit(400)}
        />
      </div>

      {/* Legend */}
      <div
        className="absolute bottom-4 left-4 p-3 rounded-lg border shadow-lg z-10"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="text-xs space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
            <span style={{ color: 'var(--text-secondary)' }}>Normal (1-2 links)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
            <span style={{ color: 'var(--text-secondary)' }}>Connected (3-4 links)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
            <span style={{ color: 'var(--text-secondary)' }}>Hub (5+ links)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9ca3af' }}></div>
            <span style={{ color: 'var(--text-secondary)' }}>Orphaned (0 links)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
