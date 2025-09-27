import { useState } from 'react';
import { MeetingRecorder } from '@/components/MeetingRecorder';
import { TranscriptionPanel } from '@/components/TranscriptionPanel';
import { VoiceAnalysisPanel } from '@/components/VoiceAnalysisPanel';
import { InterviewCoachPanel } from '@/components/InterviewCoachPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, HelpCircle } from 'lucide-react';

interface VoiceAnalysis {
  pitch: 'low' | 'medium' | 'high';
  tone: 'confident' | 'nervous' | 'monotone' | 'energetic';
  speed: 'slow' | 'normal' | 'fast';
  clarity: 'excellent' | 'good' | 'needs-work';
}

const Index = () => {
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);

  const handleTranscriptionUpdate = (text: string) => {
    setCurrentTranscription(text);
  };

  const handleVoiceAnalysis = (analysis: VoiceAnalysis) => {
    setVoiceAnalysis(analysis);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Meeting Assistant
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered meeting recorder with voice analysis and interview coaching
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              🟢 Ready
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        {/* Left Column - Recording & Voice Analysis */}
        <div className="col-span-4 space-y-6">
          <MeetingRecorder 
            onTranscriptionUpdate={handleTranscriptionUpdate}
            onVoiceAnalysis={handleVoiceAnalysis}
          />
          <VoiceAnalysisPanel analysis={voiceAnalysis} />
        </div>

        {/* Center Column - Transcription */}
        <div className="col-span-5">
          <TranscriptionPanel transcription={currentTranscription} />
        </div>

        {/* Right Column - Interview Coach */}
        <div className="col-span-3">
          <InterviewCoachPanel currentTranscription={currentTranscription} />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          🎯 For best results, ensure good microphone quality and minimize background noise
        </p>
      </footer>
    </div>
  );
};

export default Index;
