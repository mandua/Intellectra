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
    <div className="px-4 py-3 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="text-sm font-medium mb-1">{data.label}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{data.description}</div>
      {data.onClick && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-2 w-full text-xs"
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
};

export default function ConceptMap({ topic, onNodeClick }: ConceptMapProps) {
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

  useEffect(() => {
    async function generateConceptMap() {
      setIsLoading(true);
      try {
        // Example structure - in a real application, this would come from the API
        const conceptMapData = await fetchConceptMapData(topic);
        
        // Transform the data for ReactFlow
        const flowNodes: Node[] = conceptMapData.nodes.map((node: { 
          id: string; 
          label: string; 
          description: string; 
          x?: number; 
          y?: number;
          [key: string]: any;
        }, index: number) => ({
          id: node.id,
          type: 'concept',
          position: { x: node.x || index * 200, y: node.y || 100 + (index % 3) * 100 },
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
  }, [topic, setNodes, setEdges, handleNodeClick, toast]);

  // Fetch concept map data from the API
  async function fetchConceptMapData(topicName: string) {
    const response = await fetch(`/api/concept-map?topic=${encodeURIComponent(topicName)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch concept map');
    }
    
    return response.json();
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