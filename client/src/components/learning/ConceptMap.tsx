import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';

// Custom node types
const ConceptNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-3 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 max-w-[250px]">
      <div className="text-sm font-medium mb-1 text-primary">{data.label}</div>
      <div className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{data.description}</div>
      
      {data.bulletPoints && data.bulletPoints.length > 0 && (
        <div className="mb-2">
          <ul className="text-xs text-gray-500 dark:text-gray-400 list-disc pl-4 space-y-1">
            {data.bulletPoints.slice(0, 2).map((point: string, index: number) => (
              <li key={index} className="line-clamp-1">{point}</li>
            ))}
          </ul>
        </div>
      )}
      
      {data.onClick && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-1 w-full text-xs"
          onClick={data.onClick}
        >
          View Details
        </Button>
      )}
    </div>
  );
};

const nodeTypes: NodeTypes = {
  concept: ConceptNode,
};

type ConceptMapProps = {
  topic: string;
  onNodeClick?: (nodeId: string, nodeData: any) => void;
  conceptMapData?: any; // Optional pre-fetched data
  notes?: string; // Optional notes for generating with notes
};

export default function ConceptMap({ 
  topic, 
  onNodeClick, 
  conceptMapData: initialConceptMapData,
  notes
}: ConceptMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), 
    [setEdges]
  );

  // Function to handle node click
  const handleNodeClick = useCallback((nodeId: string, nodeData: any) => {
    if (onNodeClick) {
      onNodeClick(nodeId, nodeData);
    }
  }, [onNodeClick]);

  // Function to organize nodes in a hierarchical layout
  const organizeNodes = useCallback((nodes: any[], edges: any[]) => {
    // Find the root node (usually has id '1' or most incoming edges)
    const nodeConnections: Record<string, {incoming: number, outgoing: number}> = {};
    
    // Initialize connection counts
    nodes.forEach(node => {
      nodeConnections[node.id] = { incoming: 0, outgoing: 0 };
    });
    
    // Count connections
    edges.forEach(edge => {
      if (nodeConnections[edge.source]) nodeConnections[edge.source].outgoing++;
      if (nodeConnections[edge.target]) nodeConnections[edge.target].incoming++;
    });
    
    // Find the root node (highest outgoing/incoming ratio)
    const rootId = Object.entries(nodeConnections)
      .sort(([, a], [, b]) => 
        (b.outgoing / (b.incoming || 1)) - (a.outgoing / (a.incoming || 1))
      )[0][0];
    
    // Map of nodes by id for quick lookup
    const nodesById: Record<string, any> = {};
    nodes.forEach(node => {
      nodesById[node.id] = node;
    });
    
    // Build node hierarchy
    const hierarchy: Record<string, string[]> = {};
    Object.keys(nodesById).forEach(id => {
      hierarchy[id] = [];
    });
    
    edges.forEach(edge => {
      if (hierarchy[edge.source]) {
        hierarchy[edge.source].push(edge.target);
      }
    });
    
    // Arrange nodes in a hierarchical layout
    const arrangedNodes = [...nodes];
    const visited = new Set<string>();
    const levelWidth = 250;
    const nodeSpacing = 150;
    
    // Position nodes recursively
    function positionNode(nodeId: string, level: number, indexInLevel: number, totalInLevel: number) {
      if (visited.has(nodeId) || !nodesById[nodeId]) return;
      visited.add(nodeId);
      
      const node = nodesById[nodeId];
      const levelOffset = level * levelWidth;
      const horizontalSpacing = (indexInLevel + 1) * (800 / (totalInLevel + 1)) - 400;
      
      // Update node position
      node.x = horizontalSpacing;
      node.y = 100 + levelOffset;
      
      // Process children
      const children = hierarchy[nodeId] || [];
      children.forEach((childId, idx) => {
        positionNode(childId, level + 1, idx, children.length);
      });
    }
    
    // Start with the root node
    positionNode(rootId, 0, 0, 1);
    
    // Position any nodes that weren't included in the hierarchy
    let unpositionedCount = 0;
    arrangedNodes.forEach(node => {
      if (!visited.has(node.id)) {
        node.x = -300 + (unpositionedCount * 150);
        node.y = 500;
        unpositionedCount++;
      }
    });
    
    return arrangedNodes;
  }, []);

  useEffect(() => {
    async function generateConceptMap() {
      setIsLoading(true);
      try {
        // Use provided data or fetch from API
        const conceptMapData = initialConceptMapData || await fetchConceptMapData(topic, notes);
        
        // Organize nodes in a hierarchical layout
        const organizedNodes = organizeNodes(conceptMapData.nodes, conceptMapData.edges);
        
        // Transform the data for ReactFlow
        const flowNodes: Node[] = organizedNodes.map((node: { 
          id: string; 
          label: string; 
          description: string; 
          x?: number; 
          y?: number;
          bulletPoints?: string[];
          [key: string]: any;
        }, index: number) => ({
          id: node.id,
          type: 'concept',
          position: { 
            x: node.x !== undefined ? node.x : 100 + (index % 3) * 200, 
            y: node.y !== undefined ? node.y : 100 + Math.floor(index / 3) * 200 
          },
          data: { 
            ...node, 
            onClick: () => handleNodeClick(node.id, node) 
          }
        }));
        
        const flowEdges: Edge[] = conceptMapData.edges.map((edge: { source: string; target: string }) => ({
          id: `e-${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          animated: false,
          type: 'smoothstep',
          style: { stroke: '#9CA3AF' }
        }));
        
        setNodes(flowNodes);
        setEdges(flowEdges);
      } catch (error) {
        console.error('Error generating concept map:', error);
        toast({
          title: 'Error',
          description: 'Failed to generate concept map. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    generateConceptMap();
  }, [topic, initialConceptMapData, notes, setNodes, setEdges, handleNodeClick, toast, organizeNodes]);

  // Fetch concept map data from the API
  async function fetchConceptMapData(topicName: string, notes?: string) {
    if (notes) {
      // Use POST for sending notes (larger payload)
      const response = await fetch('/api/concept-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: topicName,
          notes
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch concept map');
      }
      
      return response.json();
    } else {
      // Use GET for simple topic query
      const response = await fetch(`/api/concept-map?topic=${encodeURIComponent(topicName)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch concept map');
      }
      
      return response.json();
    }
  }

  return (
    <Card className="w-full h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Concept Map: {topic}</span>
          {isLoading && <Spinner size="sm" />}
        </CardTitle>
        <CardDescription>
          Interactive visualization of key concepts and their relationships
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[500px] p-0">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner size="lg" />
            <span className="ml-2">Generating concept map...</span>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Controls />
            <MiniMap />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        )}
      </CardContent>
    </Card>
  );
}