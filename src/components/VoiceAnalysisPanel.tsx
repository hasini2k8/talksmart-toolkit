import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Volume2, Timer } from 'lucide-react';

interface VoiceAnalysis {
  pitch: 'low' | 'medium' | 'high';
  tone: 'confident' | 'nervous' | 'monotone' | 'energetic';
  speed: 'slow' | 'normal' | 'fast';
  clarity: 'excellent' | 'good' | 'needs-work';
}

interface VoiceAnalysisPanelProps {
  analysis: VoiceAnalysis | null;
}

export const VoiceAnalysisPanel = ({ analysis }: VoiceAnalysisPanelProps) => {
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    if (analysis) {
      generateRecommendations(analysis);
    }
  }, [analysis]);

  const generateRecommendations = (analysis: VoiceAnalysis) => {
    const newRecommendations: string[] = [];

    if (analysis.pitch === 'high') {
      newRecommendations.push("Try lowering your pitch slightly for a more authoritative tone");
    } else if (analysis.pitch === 'low') {
      newRecommendations.push("Consider raising your pitch a bit for better engagement");
    }

    if (analysis.tone === 'nervous') {
      newRecommendations.push("Take deep breaths and speak more slowly to sound confident");
    } else if (analysis.tone === 'monotone') {
      newRecommendations.push("Add more vocal variety and emotion to engage your audience");
    }

    if (analysis.speed === 'fast') {
      newRecommendations.push("Slow down your speech for better comprehension");
    } else if (analysis.speed === 'slow') {
      newRecommendations.push("Increase your pace slightly to maintain engagement");
    }

    if (analysis.clarity === 'needs-work') {
      newRecommendations.push("Focus on articulation and speak more clearly");
    }

    setRecommendations(newRecommendations);
  };

  const getScoreColor = (metric: string, value: string) => {
    const scores = {
      pitch: { low: 70, medium: 90, high: 70 },
      tone: { confident: 95, nervous: 40, monotone: 50, energetic: 85 },
      speed: { slow: 60, normal: 90, fast: 65 },
      clarity: { excellent: 95, good: 80, 'needs-work': 45 }
    };
    
    return scores[metric as keyof typeof scores]?.[value as keyof any] || 50;
  };

  const getIndicatorClass = (score: number) => {
    if (score >= 80) return 'voice-excellent';
    if (score >= 60) return 'voice-good';
    return 'voice-needs-work';
  };

  if (!analysis) {
    return (
      <Card className="meeting-card">
        <h2 className="text-xl font-semibold mb-4">Voice Analysis</h2>
        <div className="text-center text-muted-foreground py-8">
          Start recording to see voice analysis...
        </div>
      </Card>
    );
  }

  return (
    <Card className="meeting-card">
      <h2 className="text-xl font-semibold mb-4">Voice Analysis</h2>
      
      <div className="space-y-6">
        {/* Pitch Analysis */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <span className="font-medium">Pitch</span>
            </div>
            <Badge variant="outline">{analysis.pitch}</Badge>
          </div>
          <Progress 
            value={getScoreColor('pitch', analysis.pitch)} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {/* Tone Analysis */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">Tone</span>
            </div>
            <Badge variant="outline">{analysis.tone}</Badge>
          </div>
          <Progress 
            value={getScoreColor('tone', analysis.tone)} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Needs Work</span>
            <span>Excellent</span>
          </div>
        </div>

        {/* Speed Analysis */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              <span className="font-medium">Speaking Speed</span>
            </div>
            <Badge variant="outline">{analysis.speed}</Badge>
          </div>
          <Progress 
            value={getScoreColor('speed', analysis.speed)} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Too Slow</span>
            <span>Too Fast</span>
          </div>
        </div>

        {/* Clarity Analysis */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              <span className="font-medium">Clarity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`voice-indicator ${getIndicatorClass(getScoreColor('clarity', analysis.clarity))}`} />
              <Badge variant="outline">{analysis.clarity}</Badge>
            </div>
          </div>
          <Progress 
            value={getScoreColor('clarity', analysis.clarity)} 
            className="h-2"
          />
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Real-time Recommendations</h3>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div key={index} className="text-sm p-3 bg-secondary rounded-md fade-in">
                  💡 {rec}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};