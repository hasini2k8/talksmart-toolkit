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
  const analysisCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log('Microphone access granted, creating MediaRecorder...');
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('Audio data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, creating audio blob...');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        console.log('Audio blob created:', audioBlob.size, 'bytes');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      console.log('MediaRecorder started');
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Simulate real-time voice analysis and transcription
      analysisCleanupRef.current = simulateRealTimeAnalysis();

      toast({
        title: "Recording Started",
        description: "Meeting recording is now active",
      });
    } catch (error) {
      console.error('Recording error:', error);
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

      // Stop the analysis simulation
      if (analysisCleanupRef.current) {
        analysisCleanupRef.current();
        analysisCleanupRef.current = null;
      }

      toast({
        title: "Recording Stopped",
        description: `Meeting recorded for ${formatTime(recordingTime)}`,
      });
    }
  };

  const simulateRealTimeAnalysis = () => {
    console.log('Starting real-time analysis simulation...');
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
    let shouldContinue = true;
    
    const interval = setInterval(() => {
      console.log('Analysis interval tick - Index:', index, 'Should continue:', shouldContinue);
      if (!shouldContinue || index >= transcriptions.length) {
        console.log('Stopping analysis simulation');
        clearInterval(interval);
        return;
      }

      console.log('Sending transcription update:', transcriptions[index]);
      onTranscriptionUpdate(transcriptions[index]);
      onVoiceAnalysis(voiceAnalyses[index]);
      index++;
    }, 3000);

    // Store the interval reference to clear it when recording stops
    return () => {
      shouldContinue = false;
      clearInterval(interval);
    };
  };

  const downloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Audio Downloaded",
        description: "Meeting recording has been saved to your device",
      });
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
              Download Recording
            </Button>
            <div className="text-xs text-muted-foreground">
              Audio file ready • {formatTime(recordingTime)}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};