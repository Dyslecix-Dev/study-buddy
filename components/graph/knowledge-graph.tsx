"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Maximize2, Minimize2, RefreshCw, Filter } from "lucide-react";

// Dynamically import ForceGraph2D with no SSR
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface GraphNode {
  id: string;
  title: string;
  tags: Array<{ id: string; name: string; color?: string }>;
  linkCount: number;
  updatedAt: string;
}

interface GraphLink {
  fromNoteId: string;
  toNoteId: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  statistics: {
    nodeCount: number;
    linkCount: number;
    orphanedCount: number;
    averageConnections: number;
  };
  orphanedNotes: Array<{ id: string; title: string }>;
  mostConnected: Array<{ id: string; title: string; connections: number }>;
}

interface KnowledgeGraphProps {
  folderId?: string;
}

export function KnowledgeGraph({ folderId }: KnowledgeGraphProps = {}) {
  const router = useRouter();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOrphaned, setShowOrphaned] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [textColor, setTextColor] = useState("#000");

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        // Mobile-responsive height: smaller on mobile, larger on desktop
        const isMobile = window.innerWidth < 768;
        const baseHeight = isMobile ? 400 : 600;
        const height = isFullscreen ? window.innerHeight - 100 : baseHeight;
        setDimensions({ width, height });

        // Get the computed text color from CSS variables
        const computedStyle = getComputedStyle(document.documentElement);
        let color = computedStyle.getPropertyValue("--text-primary").trim();

        // If it's empty or just whitespace, try alternative methods
        if (!color) {
          // Check if we're in dark mode
          const isDarkMode = document.documentElement.classList.contains('dark') ||
                            window.matchMedia('(prefers-color-scheme: dark)').matches;
          color = isDarkMode ? "#e5e7eb" : "#1f2937";
        }

        setTextColor(color);
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // Also listen for theme changes
    const observer = new MutationObserver(updateDimensions);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    return () => {
      window.removeEventListener("resize", updateDimensions);
      observer.disconnect();
    };
  }, [isFullscreen]);

  const fetchGraphData = useCallback(async () => {
    setLoading(true);
    try {
      const url = folderId ? `/api/notes/graph?folderId=${folderId}` : "/api/notes/graph";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setGraphData(data);
      }
    } catch (error) {
      console.error("Error fetching graph data:", error);
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  const handleNodeClick = useCallback(
    (node: any) => {
      // Navigate to note - we'll try to find the folder
      router.push(`/notes/all/edit/${node.id}`);
    },
    [router]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-2" size={32} style={{ color: "var(--primary)" }} />
          <p style={{ color: "var(--text-secondary)" }}>Loading knowledge graph...</p>
        </div>
      </div>
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ color: "var(--text-secondary)" }}>No notes to display. Create some notes and link them together to see your knowledge graph.</p>
      </div>
    );
  }

  // Filter nodes based on orphaned setting
  const filteredNodes = showOrphaned
    ? graphData.nodes
    : graphData.nodes.filter((node) => {
        const hasLinks = graphData.links.some((link) => link.fromNoteId === node.id || link.toNoteId === node.id);
        return hasLinks;
      });

  // Prepare data for ForceGraph
  const graphNodes = filteredNodes.map((node) => ({
    id: node.id,
    name: node.title,
    val: node.linkCount + 1, // Size by number of links
    color: node.tags.length > 0 ? node.tags[0].color || "#7ADAA5" : "#7ADAA5",
  }));

  const graphLinks = graphData.links
    .filter((link) => {
      const sourceExists = filteredNodes.some((n) => n.id === link.fromNoteId);
      const targetExists = filteredNodes.some((n) => n.id === link.toNoteId);
      return sourceExists && targetExists;
    })
    .map((link) => ({
      source: link.fromNoteId,
      target: link.toNoteId,
    }));

  return (
    <div
      ref={containerRef}
      className={isFullscreen ? "fixed inset-0 z-50" : "relative"}
      style={isFullscreen ? { backgroundColor: "var(--background)" } : undefined}
    >
      {/* Statistics Bar */}
      <div className="p-3 sm:p-4 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {folderId ? "Folder Knowledge Graph" : "Knowledge Graph"}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowOrphaned(!showOrphaned)}
              className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer"
              style={{
                backgroundColor: showOrphaned ? "var(--primary)" : "var(--surface-hover)",
                color: showOrphaned ? "#000" : "var(--text-primary)",
              }}
            >
              <Filter size={14} />
              <span className="hidden sm:inline">{showOrphaned ? "Hide Orphaned" : "Show Orphaned"}</span>
              <span className="sm:hidden">{showOrphaned ? "Hide" : "Show"}</span>
            </button>
            <button onClick={fetchGraphData} className="p-2 rounded transition-colors hover:bg-gray-100 cursor-pointer" style={{ color: "var(--text-secondary)" }} title="Refresh">
              <RefreshCw size={18} />
            </button>
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 rounded transition-colors hover:bg-gray-100 cursor-pointer" style={{ color: "var(--text-secondary)" }} title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <div className="text-center p-2 sm:p-3 rounded" style={{ backgroundColor: "var(--background)" }}>
            <div className="text-xl sm:text-2xl font-bold" style={{ color: "var(--primary)" }}>
              {graphData.statistics.nodeCount}
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              Total Notes
            </div>
          </div>
          <div className="text-center p-2 sm:p-3 rounded" style={{ backgroundColor: "var(--background)" }}>
            <div className="text-xl sm:text-2xl font-bold" style={{ color: "var(--secondary)" }}>
              {graphData.statistics.linkCount}
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              Total Links
            </div>
          </div>
          <div className="text-center p-2 sm:p-3 rounded" style={{ backgroundColor: "var(--background)" }}>
            <div className="text-xl sm:text-2xl font-bold" style={{ color: "var(--quaternary)" }}>
              {graphData.statistics.orphanedCount}
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              Orphaned
            </div>
          </div>
          <div className="text-center p-2 sm:p-3 rounded" style={{ backgroundColor: "var(--background)" }}>
            <div className="text-xl sm:text-2xl font-bold" style={{ color: "var(--tertiary)" }}>
              {graphData.statistics.averageConnections.toFixed(1)}
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              Avg. Links
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Instructions */}
      <div className="md:hidden px-3 py-2 text-xs text-center" style={{ backgroundColor: "var(--surface)", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
        💡 Tip: Pinch to zoom, drag to pan, tap nodes to open
      </div>

      {/* Graph Visualization */}
      <div className="relative" style={{ backgroundColor: "var(--background)" }}>
        <ForceGraph2D
          graphData={{ nodes: graphNodes, links: graphLinks }}
          width={dimensions.width}
          height={dimensions.height}
          nodeLabel="name"
          nodeColor="color"
          nodeRelSize={6}
          nodeVal="val"
          linkColor={() => "rgba(128, 128, 128, 0.3)"}
          linkWidth={2}
          onNodeClick={handleNodeClick}
          nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            const nodeSize = Math.sqrt(node.val || 1) * 6;

            // Draw node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color;
            ctx.fill();
            ctx.strokeStyle = textColor;
            ctx.lineWidth = 2 / globalScale;
            ctx.stroke();

            // Draw label
            if (globalScale > 1.5) {
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = textColor;
              ctx.fillText(label, node.x, node.y + nodeSize + fontSize);
            }
          }}
          cooldownTime={3000}
          d3VelocityDecay={0.3}
        />
      </div>

      {/* Most Connected Notes */}
      {graphData.mostConnected.length > 0 && (
        <div className="p-3 sm:p-4 border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
          <h3 className="font-semibold mb-3 text-sm sm:text-base" style={{ color: "var(--text-primary)" }}>
            Most Connected Notes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {graphData.mostConnected.slice(0, 6).map((note) => (
              <div
                key={note.id}
                onClick={() => router.push(`/notes/all/edit/${note.id}`)}
                className="px-3 py-2 rounded cursor-pointer transition-colors text-xs sm:text-sm flex items-center justify-between touch-manipulation"
                style={{ backgroundColor: "var(--background)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--background)")}
              >
                <span className="truncate flex-1" style={{ color: "var(--text-primary)" }}>
                  {note.title}
                </span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0" style={{ backgroundColor: "var(--primary)", color: "#000" }}>
                  {note.connections}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

