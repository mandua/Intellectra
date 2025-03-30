import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles } from 'lucide-react';
import ConceptMap from '@/components/learning/ConceptMap';
import ConceptDetail from '@/components/learning/ConceptDetail';

export default function LearningPath() {
  // Set document title
  document.title = 'Learning Path | StudyAI';
  
  const [topic, setTopic] = useState<string>('');
  const [searchedTopic, setSearchedTopic] = useState<string>('');
  const [selectedConcept, setSelectedConcept] = useState<{
    id: string;
    data: { label: string; description: string; [key: string]: any };
  } | null>(null);

  // Handle topic search submission
  const handleSearchTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      setSearchedTopic(topic);
    }
  };

  // Handle node click in the concept map
  const handleNodeClick = (nodeId: string, nodeData: any) => {
    setSelectedConcept({
      id: nodeId,
      data: nodeData
    });
  };

  // Handle closing the concept detail view
  const handleCloseDetail = () => {
    setSelectedConcept(null);
  };

  // Suggested topics for quick selection
  const suggestedTopics = [
    'Machine Learning',
    'Quantum Computing',
    'Neural Networks',
    'Data Structures',
    'Web Development',
  ];

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Learning Path Explorer</h1>
      
      <div className="mb-8">
        <form onSubmit={handleSearchTopic} className="flex gap-2 mb-4">
          <Input
            placeholder="Enter a topic to explore (e.g., Machine Learning, Quantum Physics)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="max-w-xl"
          />
          <Button type="submit">
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
              }}
              className="flex items-center"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {t}
            </Button>
          ))}
        </div>
      </div>
      
      {searchedTopic ? (
        <div className="grid grid-cols-1 gap-6">
          {selectedConcept ? (
            <ConceptDetail
              conceptId={selectedConcept.id}
              conceptData={selectedConcept.data}
              onClose={handleCloseDetail}
            />
          ) : (
            <ConceptMap topic={searchedTopic} onNodeClick={handleNodeClick} />
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
              Enter a subject above to generate an interactive concept map powered by AI.
            </p>
            <p>
              Click on any concept node to explore detailed explanations, related videos, 
              practice exercises, and flashcards.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}