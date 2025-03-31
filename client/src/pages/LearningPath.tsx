import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, FileText, Plus, Minus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ConceptMap from '@/components/learning/ConceptMap';
import ConceptDetail from '@/components/learning/ConceptDetail';
import { useToast } from '@/hooks/use-toast';

export default function LearningPath() {
  // Set document title
  document.title = 'Learning Path | StudyAI';
  
  const { toast } = useToast();
  const [topic, setTopic] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [searchedTopic, setSearchedTopic] = useState<string>('');
  const [isNotesExpanded, setIsNotesExpanded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('search');
  const [conceptMapData, setConceptMapData] = useState<any>(null);
  const [savedMapData, setSavedMapData] = useState<any>(null); // For persisting edited maps
  const [selectedConcept, setSelectedConcept] = useState<{
    id: string;
    data: { label: string; description: string; bulletPoints?: string[]; [key: string]: any };
  } | null>(null);

  // Generate default concept map data for quick testing
  const createDefaultConceptMap = (topicName: string) => {
    return {
      nodes: [
        { 
          id: '1', 
          label: topicName, 
          description: `Main concept and foundational principles of ${topicName}.`, 
          bulletPoints: ['Core principles', 'Fundamental aspects', 'Basic definitions', 'Key terminology'],
          x: 250, 
          y: 50 
        },
        { 
          id: '2', 
          label: `Definition of ${topicName}`, 
          description: `Understanding what ${topicName} means and its core principles.`, 
          bulletPoints: ['Origin and history', 'Conceptual framework', 'Critical characteristics'],
          x: 100, 
          y: 200 
        },
        { 
          id: '3', 
          label: `Applications of ${topicName}`, 
          description: `How ${topicName} is applied in real-world scenarios.`, 
          bulletPoints: ['Practical implementations', 'Real-world examples', 'Case studies', 'Industry relevance'],
          x: 400, 
          y: 200 
        },
        { 
          id: '4', 
          label: `History of ${topicName}`, 
          description: `The development and evolution of ${topicName} over time.`, 
          bulletPoints: ['Key milestones', 'Historical context', 'Major contributors', 'Paradigm shifts'],
          x: 100, 
          y: 350 
        },
        { 
          id: '5', 
          label: `Future of ${topicName}`, 
          description: `Emerging trends and future directions in ${topicName}.`, 
          bulletPoints: ['Current research', 'Innovative approaches', 'Potential developments', 'Future challenges'],
          x: 400, 
          y: 350 
        }
      ],
      edges: [
        { source: '1', target: '2' },
        { source: '1', target: '3' },
        { source: '2', target: '4' },
        { source: '3', target: '5' }
      ]
    };
  };

  // Handle topic search submission
  const handleSearchTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      setSearchedTopic(topic);
      
      // Set default map data while waiting for API response
      setConceptMapData(createDefaultConceptMap(topic));
      setSavedMapData(createDefaultConceptMap(topic));
      
      // If in notes mode and notes are provided, generate from notes
      if (activeTab === 'notes' && notes.trim()) {
        generateFromNotes();
      } else {
        // Otherwise, fetch from API without notes
        fetchConceptMapFromAPI(topic);
      }
    }
  };
  
  // Fetch concept map from API
  const fetchConceptMapFromAPI = async (topicName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/concept-map?topic=${encodeURIComponent(topicName)}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate concept map');
      }
      
      const data = await response.json();
      setConceptMapData(data);
      setSavedMapData(data);
    } catch (error) {
      console.error('Error generating concept map:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate concept map. Using default layout.',
        variant: 'destructive'
      });
      // Keep using the default map data
    } finally {
      setIsLoading(false);
    }
  };

  // Generate concept map from notes
  const generateFromNotes = async () => {
    if (!topic.trim() || !notes.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide both a topic and your notes',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/concept-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic,
          notes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate concept map');
      }

      const data = await response.json();
      setConceptMapData(data);
      setSavedMapData(data); // Keep a copy for later reference
      setSearchedTopic(topic);
      setSelectedConcept(null);
    } catch (error) {
      console.error('Error generating concept map from notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate concept map from your notes. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Effect to load saved map data when switching between topics
  useEffect(() => {
    if (searchedTopic && savedMapData) {
      setConceptMapData(savedMapData);
    }
  }, [searchedTopic, savedMapData]);

  // Handle node click in the concept map
  const handleNodeClick = useCallback((nodeId: string, nodeData: any) => {
    setSelectedConcept({
      id: nodeId,
      data: nodeData
    });
  }, []);

  // Handle closing the concept detail view
  const handleCloseDetail = () => {
    setSelectedConcept(null);
  };

  // Handle updating a concept node
  const handleUpdateConcept = useCallback((conceptId: string, updatedData: any) => {
    if (!conceptMapData) return;

    // Create a deep copy of the concept map data
    const updatedMapData = {
      ...conceptMapData,
      nodes: conceptMapData.nodes.map((node: any) => {
        if (node.id === conceptId) {
          return { 
            ...node, 
            label: updatedData.label,
            description: updatedData.description,
            bulletPoints: updatedData.bulletPoints,
            flashcards: updatedData.flashcards // Include flashcards in the node data
          };
        }
        return node;
      })
    };

    // Update the concept map data
    setConceptMapData(updatedMapData);
    
    // Store in the saved map data to persist across re-renders
    setSavedMapData(updatedMapData);

    // Update the selected concept data
    if (selectedConcept && selectedConcept.id === conceptId) {
      setSelectedConcept({
        id: conceptId,
        data: {
          ...selectedConcept.data,
          label: updatedData.label,
          description: updatedData.description,
          bulletPoints: updatedData.bulletPoints,
          flashcards: updatedData.flashcards // Include flashcards in the selected concept
        }
      });
    }

    toast({
      title: 'Concept updated',
      description: 'Your changes have been saved successfully.',
    });
  }, [conceptMapData, selectedConcept, toast]);
  
  // Handle updating the entire concept map (e.g., when connections are changed)
  const handleUpdateMap = useCallback((updatedMapData: any) => {
    setConceptMapData(updatedMapData);
    setSavedMapData(updatedMapData);
    
    toast({
      title: 'Map updated',
      description: 'Your concept map changes have been saved.',
    });
  }, [toast]);

  // Suggested topics for quick selection
  const suggestedTopics = [
    'Photosynthesis',
    'Quantum Physics',
    'Neural Networks',
    'Climate Change',
    'Web Development',
  ];

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Learning Path Explorer</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-2 mb-4 w-[400px]">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>Search Topic</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Use Notes</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="search">
          <form onSubmit={handleSearchTopic} className="flex gap-2 mb-4">
            <Input
              placeholder="Enter a topic to explore (e.g., Photosynthesis, Quantum Physics)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="max-w-xl"
            />
            <Button type="submit" disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              Explore
            </Button>
          </form>
          
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2 pt-1">Try:</span>
            {suggestedTopics.map((t) => (
              <Button
                key={t}
                variant="outline"
                size="sm"
                onClick={() => {
                  setTopic(t);
                  setSearchedTopic(t);
                  
                  // Set default map data while waiting for API response
                  setConceptMapData(createDefaultConceptMap(t));
                  setSavedMapData(createDefaultConceptMap(t));
                  
                  // Fetch from API
                  fetchConceptMapFromAPI(t);
                }}
                className="flex items-center"
                disabled={isLoading}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {t}
              </Button>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="notes">
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic-input">Topic</Label>
              <Input
                id="topic-input"
                placeholder="Enter the main topic (e.g., Photosynthesis)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="notes-input">Your Notes</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                >
                  {isNotesExpanded ? (
                    <><Minus className="h-4 w-4 mr-1" /> Smaller</>
                  ) : (
                    <><Plus className="h-4 w-4 mr-1" /> Larger</>
                  )}
                </Button>
              </div>
              <Textarea
                id="notes-input"
                placeholder="Paste your lecture notes, textbook contents, or study materials here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 resize-none"
                rows={isNotesExpanded ? 15 : 6}
              />
              <p className="text-xs text-gray-500 mt-1">
                The AI will use your notes to create a more personalized and detailed concept map.
              </p>
            </div>
            
            <Button onClick={generateFromNotes} disabled={isLoading || !topic.trim() || !notes.trim()}>
              <FileText className="h-4 w-4 mr-2" />
              Generate From Notes
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      {searchedTopic ? (
        <div className="grid grid-cols-1 gap-6">
          {selectedConcept ? (
            <ConceptDetail
              conceptId={selectedConcept.id}
              conceptData={selectedConcept.data}
              onClose={handleCloseDetail}
              onUpdate={handleUpdateConcept}
            />
          ) : (
            <ConceptMap 
              topic={searchedTopic} 
              onNodeClick={handleNodeClick}
              conceptMapData={conceptMapData || savedMapData}
              notes={activeTab === 'notes' ? notes : undefined}
              onUpdateMap={handleUpdateMap}
            />
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Learning Path Explorer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Discover interconnected concepts and build a comprehensive understanding of any topic.
              You can either search for a topic or use your own notes to generate an interactive concept map.
            </p>
            
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="example">
                <AccordionTrigger>How does it work? View an example</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                    <h3 className="font-semibold">Example: Photosynthesis Concept Map</h3>
                    <p className="text-sm">A concept map for photosynthesis might include:</p>
                    <ul className="list-disc pl-5 text-sm space-y-2">
                      <li><strong>Main Node:</strong> Photosynthesis</li>
                      <li><strong>Key Branches:</strong> Light Reactions, Calvin Cycle, Plant Structures</li>
                      <li><strong>Sub-Concepts:</strong> Chlorophyll, ATP Production, CO₂ Fixation</li>
                    </ul>
                    <p className="text-sm">Click on any node to see detailed information, videos, and study materials.</p>
                    <p className="text-sm">You can also edit nodes to customize your learning experience!</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}