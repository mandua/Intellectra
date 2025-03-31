import { useState, useEffect, useCallback, useRef } from 'react';
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
  NodeTypes,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  OnConnectStart,
  OnConnectEnd,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Link2, 
  Trash2, 
  Save, 
  Undo2, 
  ZoomIn, 
  ZoomOut, 
  Edit, 
  Move,
  ArrowRight,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Custom node types
const ConceptNode = ({ data, isConnectable }: { data: any, isConnectable?: boolean }) => {
  return (
    <div className="relative px-4 py-3 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 max-w-[250px] cursor-move">
      {/* Always show grab handle for better UX */}
      <div className="absolute -right-3 -top-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-grab" 
          onMouseDown={(e) => e.stopPropagation()}>
        <Move className="h-3 w-3 text-white" />
      </div>
      
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
      
      {data.isEditMode ? (
        <div className="flex gap-1 mt-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={data.onAddConnection}
          >
            <Link2 className="h-3 w-3 mr-1" />
            Connect
          </Button>
        </div>
      ) : (
        data.onClick && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-1 w-full text-xs"
            onClick={data.onClick}
          >
            View Details
          </Button>
        )
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
  onUpdateMap?: (updatedMapData: any) => void; // Callback to update parent component
};

// Wrap the component with ReactFlowProvider
function ConceptMapComponent({ 
  topic, 
  onNodeClick, 
  conceptMapData: initialConceptMapData,
  notes,
  onUpdateMap
}: ConceptMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const reactFlowInstance = useReactFlow();
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const { toast } = useToast();

  // Add connection between nodes
  const onConnect = useCallback(
    (params: Connection | Edge) => {
      // Create a unique ID for the edge
      const edgeId = `e-${params.source}-${params.target}`;
      
      // Check if this connection already exists
      const edgeExists = edges.some(edge => 
        edge.source === params.source && edge.target === params.target
      );
      
      if (!edgeExists) {
        setEdges((eds) => addEdge({
          ...params,
          id: edgeId,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#9CA3AF' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
        }, eds));
        
        if (isEditMode && onUpdateMap) {
          // Wait for the next tick to ensure edges are updated
          setTimeout(() => {
            const updatedMapData = getCurrentMapData();
            onUpdateMap(updatedMapData);
          }, 0);
        }
      }
    }, 
    [edges, setEdges, isEditMode, onUpdateMap]
  );

  // Handle the start of creating a connection
  const onConnectStart: OnConnectStart = useCallback(
    (_, { nodeId }) => {
      setConnectingNodeId(nodeId);
    },
    []
  );

  // Handle the end of creating a connection
  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      const targetElement = event.target as Element;
      const targetNodeId = targetElement?.closest('.react-flow__node')?.getAttribute('data-id');
      
      if (connectingNodeId && targetNodeId && connectingNodeId !== targetNodeId) {
        const newEdge = {
          id: `e-${connectingNodeId}-${targetNodeId}`,
          source: connectingNodeId,
          target: targetNodeId,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#9CA3AF' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
        };
        
        // Check if this connection already exists
        const edgeExists = edges.some(edge => 
          edge.source === connectingNodeId && edge.target === targetNodeId
        );
        
        if (!edgeExists) {
          setEdges((eds) => [...eds, newEdge]);
          
          if (isEditMode && onUpdateMap) {
            // Wait for the next tick to ensure edges are updated
            setTimeout(() => {
              const updatedMapData = getCurrentMapData();
              onUpdateMap(updatedMapData);
            }, 0);
          }
        }
      }
      
      setConnectingNodeId(null);
    },
    [connectingNodeId, edges, setEdges, isEditMode, onUpdateMap]
  );

  // Start creating connection from specific node
  const handleAddConnection = useCallback((nodeId: string) => {
    setConnectingNodeId(nodeId);
    toast({
      title: 'Creating connection',
      description: 'Click on another node to create a connection',
    });
  }, [toast]);

  // Function to handle node click
  const handleNodeClick = useCallback((nodeId: string, nodeData: any) => {
    if (connectingNodeId && nodeId !== connectingNodeId) {
      // Complete the connection
      const newEdge = {
        id: `e-${connectingNodeId}-${nodeId}`,
        source: connectingNodeId,
        target: nodeId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#9CA3AF' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
      };
      
      // Check if this connection already exists
      const edgeExists = edges.some(edge => 
        edge.source === connectingNodeId && edge.target === nodeId
      );
      
      if (!edgeExists) {
        setEdges((eds) => [...eds, newEdge]);
        
        toast({
          title: 'Connection created',
          description: `Connected ${connectingNodeId} to ${nodeId}`,
        });
        
        if (isEditMode && onUpdateMap) {
          // Wait for the next tick to ensure edges are updated
          setTimeout(() => {
            const updatedMapData = getCurrentMapData();
            onUpdateMap(updatedMapData);
          }, 0);
        }
      }
      
      setConnectingNodeId(null);
    } else if (!isEditMode && onNodeClick) {
      onNodeClick(nodeId, nodeData);
    }
  }, [connectingNodeId, edges, setEdges, isEditMode, onNodeClick, onUpdateMap, toast]);

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

  // Get current map data for saving
  const getCurrentMapData = useCallback(() => {
    // Extract node data (position, content, etc.)
    const nodeData = nodes.map(node => ({
      id: node.id,
      label: node.data.label,
      description: node.data.description,
      bulletPoints: node.data.bulletPoints || [],
      x: node.position.x,
      y: node.position.y,
    }));
    
    // Extract edge connections
    const edgeData = edges.map(edge => ({
      source: edge.source,
      target: edge.target
    }));
    
    return {
      nodes: nodeData,
      edges: edgeData
    };
  }, [nodes, edges]);
  
  // Function to handle edge removal
  const handleEdgeRemove = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    setSelectedEdge(null);
    
    if (isEditMode && onUpdateMap) {
      // Wait for the next tick to ensure edges are updated
      setTimeout(() => {
        const updatedMapData = getCurrentMapData();
        onUpdateMap(updatedMapData);
      }, 0);
    }
  }, [setEdges, isEditMode, onUpdateMap, getCurrentMapData]);
  
  // Handle edge click to select it
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    if (isEditMode) {
      setSelectedEdge(edge.id);
    }
  }, [isEditMode]);
  
  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    // Store current state before toggling
    if (!isEditMode) {
      // Entering edit mode - save the current state for potential reset
      nodesRef.current = [...nodes];
      edgesRef.current = [...edges];
    } else if (onUpdateMap) {
      // Exiting edit mode - save changes
      const updatedMapData = getCurrentMapData();
      onUpdateMap(updatedMapData);
    }
    
    setIsEditMode(!isEditMode);
    setSelectedEdge(null);
    setConnectingNodeId(null);
    
    // Update node data to include edit mode status
    setNodes(nodes => nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isEditMode: !isEditMode,
        onAddConnection: !isEditMode ? () => handleAddConnection(node.id) : undefined,
      }
    })));
  }, [isEditMode, nodes, edges, setNodes, onUpdateMap, getCurrentMapData, handleAddConnection]);
  
  // Save current changes
  const saveChanges = useCallback(() => {
    if (!onUpdateMap) return;
    
    const updatedMapData = getCurrentMapData();
    onUpdateMap(updatedMapData);
    
    toast({
      title: 'Changes saved',
      description: 'Your concept map changes have been saved.',
    });
  }, [getCurrentMapData, onUpdateMap, toast]);
  
  // Reset to original state
  const resetChanges = useCallback(() => {
    if (nodesRef.current.length > 0) {
      setNodes(nodesRef.current);
      setEdges(edgesRef.current);
      
      toast({
        title: 'Changes discarded',
        description: 'Your concept map has been reset to its original state.',
      });
    }
  }, [setNodes, setEdges, toast]);

  useEffect(() => {
    async function generateConceptMap() {
      setIsLoading(true);
      try {
        // Check if we already have data
        if (initialConceptMapData) {
          // Use provided data
          const conceptMapData = initialConceptMapData;
          
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
              isEditMode: isEditMode,
              onClick: () => handleNodeClick(node.id, node),
              onAddConnection: isEditMode ? () => handleAddConnection(node.id) : undefined,
            }
          }));
          
          const flowEdges: Edge[] = conceptMapData.edges.map((edge: { source: string; target: string }) => ({
            id: `e-${edge.source}-${edge.target}`,
            source: edge.source,
            target: edge.target,
            animated: false,
            type: 'smoothstep',
            style: { stroke: '#9CA3AF' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
            }
          }));
          
          // Save the initial state for potential reset
          nodesRef.current = [...flowNodes];
          edgesRef.current = [...flowEdges];
          
          setNodes(flowNodes);
          setEdges(flowEdges);
        } else {
          // Fetch from API if no data provided
          const conceptMapData = await fetchConceptMapData(topic, notes);
          
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
              isEditMode: isEditMode,
              onClick: () => handleNodeClick(node.id, node),
              onAddConnection: isEditMode ? () => handleAddConnection(node.id) : undefined,
            }
          }));
          
          const flowEdges: Edge[] = conceptMapData.edges.map((edge: { source: string; target: string }) => ({
            id: `e-${edge.source}-${edge.target}`,
            source: edge.source,
            target: edge.target,
            animated: false,
            type: 'smoothstep',
            style: { stroke: '#9CA3AF' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
            }
          }));
          
          // Save the initial state for potential reset
          nodesRef.current = [...flowNodes];
          edgesRef.current = [...flowEdges];
          
          setNodes(flowNodes);
          setEdges(flowEdges);
        }
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
  }, [topic, initialConceptMapData, notes, setNodes, setEdges, handleNodeClick, toast, organizeNodes, isEditMode, handleAddConnection]);

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
          <div className="flex items-center gap-2">
            {!isLoading && (
              <div className="flex items-center gap-2">
                <Switch
                  id="edit-mode"
                  checked={isEditMode}
                  onCheckedChange={toggleEditMode}
                />
                <Label htmlFor="edit-mode" className="text-sm">
                  Edit Mode
                </Label>
              </div>
            )}
            {isLoading && <Spinner size="sm" />}
          </div>
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
            onConnectStart={isEditMode ? onConnectStart : undefined}
            onConnectEnd={isEditMode ? onConnectEnd : undefined}
            onEdgeClick={isEditMode ? onEdgeClick : undefined}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
            deleteKeyCode="Delete"
            selectionKeyCode="Shift"
            multiSelectionKeyCode="Control"
            // Always allow node dragging, even in non-edit mode
            nodesDraggable={true}
            // Always show connections
            nodesConnectable={isEditMode}
            // connectionMode is not needed
            snapToGrid={isEditMode}
            snapGrid={[20, 20]}
          >
            <Controls />
            <MiniMap />
            <Background color="#aaa" gap={16} />
            
            {/* Edit mode tools */}
            {isEditMode && (
              <>
                {/* Top toolbar */}
                <Panel position="top-center" className="bg-white dark:bg-gray-900 p-2 rounded-md shadow-md border border-gray-200 dark:border-gray-700 flex gap-2">
                  <Button variant="outline" size="sm" onClick={saveChanges}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetChanges}>
                    <Undo2 className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </Panel>
                
                {/* Selected edge controls */}
                {selectedEdge && (
                  <Panel position="top-right" className="bg-white dark:bg-gray-900 p-2 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleEdgeRemove(selectedEdge)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove Connection
                    </Button>
                  </Panel>
                )}
                
                {/* Connection status */}
                {connectingNodeId && (
                  <Panel position="top-left" className="bg-white dark:bg-gray-900 p-2 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-sm">
                      <ArrowRight className="h-4 w-4 mr-1 text-primary" />
                      Click on another node to connect
                    </div>
                  </Panel>
                )}
              </>
            )}
          </ReactFlow>
        )}
      </CardContent>
    </Card>
  );
}

// Export the wrapped component with ReactFlowProvider
export default function ConceptMap(props: ConceptMapProps) {
  return (
    <ReactFlowProvider>
      <ConceptMapComponent {...props} />
    </ReactFlowProvider>
  );
}