import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb, Target, MessageSquare, CheckCircle } from 'lucide-react';

interface InterviewTip {
  id: string;
  category: 'behavioral' | 'technical' | 'communication' | 'confidence';
  question: string;
  suggestedAnswer: string;
  keyPoints: string[];
}

interface InterviewCoachPanelProps {
  currentTranscription: string;
}

export const InterviewCoachPanel = ({ currentTranscription }: InterviewCoachPanelProps) => {
  const [activeTips, setActiveTips] = useState<InterviewTip[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);

  const interviewTips: InterviewTip[] = [
    {
      id: '1',
      category: 'behavioral',
      question: "Tell me about yourself",
      suggestedAnswer: "Focus on your professional journey, key achievements, and what drives you in your career.",
      keyPoints: [
        "Start with current role/situation",
        "Highlight relevant experience",
        "Connect to the role you're applying for",
        "Keep it under 2 minutes"
      ]
    },
    {
      id: '2',
      category: 'behavioral',
      question: "What are your strengths?",
      suggestedAnswer: "Choose 2-3 strengths that are relevant to the role and provide specific examples.",
      keyPoints: [
        "Pick job-relevant strengths",
        "Use specific examples",
        "Show impact/results",
        "Be authentic"
      ]
    },
    {
      id: '3',
      category: 'communication',
      question: "How do you handle conflict?",
      suggestedAnswer: "Describe your approach to resolving conflicts professionally and constructively.",
      keyPoints: [
        "Listen actively to all parties",
        "Focus on finding solutions",
        "Stay professional and calm",
        "Learn from the experience"
      ]
    },
    {
      id: '4',
      category: 'confidence',
      question: "Why should we hire you?",
      suggestedAnswer: "Summarize your unique value proposition based on skills, experience, and cultural fit.",
      keyPoints: [
        "Highlight unique qualifications",
        "Show enthusiasm for the role",
        "Demonstrate cultural fit",
        "Quantify achievements when possible"
      ]
    }
  ];

  useEffect(() => {
    // Analyze transcription for potential interview questions
    if (currentTranscription) {
      detectInterviewQuestions(currentTranscription);
    }
  }, [currentTranscription]);

  const detectInterviewQuestions = (text: string) => {
    const questionKeywords = [
      'tell me about',
      'what are your',
      'why should',
      'how do you',
      'describe a time',
      'give me an example',
      'what would you do',
      'where do you see yourself'
    ];

    const detectedKeywords = questionKeywords.filter(keyword =>
      text.toLowerCase().includes(keyword)
    );

    if (detectedKeywords.length > 0) {
      // Find relevant tips based on detected keywords
      const relevantTips = interviewTips.filter(tip =>
        detectedKeywords.some(keyword =>
          tip.question.toLowerCase().includes(keyword)
        )
      );

      setActiveTips(relevantTips);
      
      if (relevantTips.length > 0) {
        setCurrentQuestion(relevantTips[0].question);
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'behavioral': return <MessageSquare className="w-4 h-4" />;
      case 'technical': return <Target className="w-4 h-4" />;
      case 'communication': return <MessageSquare className="w-4 h-4" />;
      case 'confidence': return <CheckCircle className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'behavioral': return 'bg-blue-500';
      case 'technical': return 'bg-green-500';
      case 'communication': return 'bg-purple-500';
      case 'confidence': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="meeting-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Interview Coach</h2>
        <Badge variant="outline">
          {activeTips.length} active tips
        </Badge>
      </div>

      {currentQuestion && (
        <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <span className="font-medium text-primary">Detected Question</span>
          </div>
          <p className="text-sm">{currentQuestion}</p>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {activeTips.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Listening for interview questions...</p>
              <p className="text-xs mt-1">Tips will appear when questions are detected</p>
            </div>
          ) : (
            activeTips.map((tip) => (
              <div key={tip.id} className="fade-in">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(tip.category)}
                    <Badge variant="secondary" className="capitalize">
                      {tip.category}
                    </Badge>
                  </div>
                  
                  <h3 className="font-medium text-sm">{tip.question}</h3>
                  
                  <div className="text-sm text-muted-foreground">
                    <strong>Suggested approach:</strong> {tip.suggestedAnswer}
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Key points to include:</div>
                    <ul className="space-y-1">
                      {tip.keyPoints.map((point, index) => (
                        <li key={index} className="text-xs flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* General Interview Tips */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">General Tips</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Maintain good eye contact and confident posture</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Use the STAR method for behavioral questions</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Ask thoughtful questions about the role and company</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Show enthusiasm and genuine interest</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};