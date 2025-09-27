import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Download, Play, Pause, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MeetingRecorderProps {
  onTranscriptionUpdate: (text: string) => void;
  onVoiceAnalysis: (analysis: VoiceAnalysis) => void;
}

interface VoiceAnalysis {
  pitch: 'low' | 'medium' | 'high';
  tone: 'confident' | 'nervous' | 'monotone' | 'energetic';
  speed: 'slow' | 'normal' | 'fast';
  clarity: 'excellent' | 'good' | 'needs-work';
}

export const MeetingRecorder = ({ onTranscriptionUpdate, onVoiceAnalysis }: MeetingRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Simulate real-time voice analysis and transcription
      simulateRealTimeAnalysis();

      toast({
        title: "Recording Started",
        description: "Meeting recording is now active",
      });
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      toast({
        title: "Recording Stopped",
        description: `Meeting recorded for ${formatTime(recordingTime)}`,
      });
    }
  };

  const simulateRealTimeAnalysis = () => {
    // Simulate real-time transcription updates
    const transcriptions = [
      "Hello everyone, thank you for joining today's meeting.",
      "I'd like to discuss our project progress and next steps.",
      "Let's review the quarterly goals we set last month.",
      "How do you feel about the current timeline?",
      "I think we should consider adjusting our approach.",
    ];

    const voiceAnalyses: VoiceAnalysis[] = [
      { pitch: 'medium', tone: 'confident', speed: 'normal', clarity: 'excellent' },
      { pitch: 'low', tone: 'nervous', speed: 'fast', clarity: 'good' },
      { pitch: 'high', tone: 'energetic', speed: 'normal', clarity: 'excellent' },
      { pitch: 'medium', tone: 'monotone', speed: 'slow', clarity: 'needs-work' },
      { pitch: 'medium', tone: 'confident', speed: 'normal', clarity: 'good' },
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (!isRecording || index >= transcriptions.length) {
        clearInterval(interval);
        return;
      }

      onTranscriptionUpdate(transcriptions[index]);
      onVoiceAnalysis(voiceAnalyses[index]);
      index++;
    }, 3000);
  };

  const downloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-recording-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="meeting-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Meeting Recorder</h2>
        <Badge variant={isRecording ? "destructive" : "secondary"}>
          {isRecording ? "LIVE" : "STOPPED"}
        </Badge>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          {isRecording ? (
            <Button 
              onClick={stopRecording}
              variant="destructive"
              size="lg"
              className="gap-2"
            >
              <Square className="w-4 h-4" />
              Stop Recording
            </Button>
          ) : (
            <Button 
              onClick={startRecording}
              variant="default"
              size="lg"
              className="gap-2"
            >
              <Mic className="w-4 h-4" />
              Start Recording
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className={`voice-indicator ${isRecording ? 'recording-pulse bg-red-500' : 'bg-gray-400'}`} />
          Recording Time: {formatTime(recordingTime)}
        </div>
      </div>

      {audioBlob && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2">
            <Button onClick={downloadAudio} variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Download Audio
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};