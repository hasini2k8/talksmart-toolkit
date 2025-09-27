import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Copy, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface TranscriptionEntry {
  id: string;
  timestamp: string;
  speaker: string;
  text: string;
}

interface TranscriptionPanelProps {
  transcription: string;
}

export const TranscriptionPanel = ({ transcription }: TranscriptionPanelProps) => {
  const [entries, setEntries] = useState<TranscriptionEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (transcription) {
      const newEntry: TranscriptionEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        speaker: 'Speaker', // In real implementation, this would be detected
        text: transcription
      };
      
      setEntries(prev => [...prev, newEntry]);
    }
  }, [transcription]);

  useEffect(() => {
    // Auto-scroll to bottom when new entries are added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const exportToPDF = () => {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.height;
    let yPosition = 20;

    // Add title
    pdf.setFontSize(16);
    pdf.text('Meeting Transcription', 20, yPosition);
    yPosition += 20;

    // Add meeting info
    pdf.setFontSize(12);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Duration: ${entries.length} entries`, 20, yPosition);
    yPosition += 20;

    // Add transcription entries
    pdf.setFontSize(10);
    entries.forEach((entry) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.text(`[${entry.timestamp}] ${entry.speaker}:`, 20, yPosition);
      yPosition += 8;
      
      const splitText = pdf.splitTextToSize(entry.text, 170);
      pdf.text(splitText, 20, yPosition);
      yPosition += splitText.length * 6 + 10;
    });

    pdf.save(`meeting-transcript-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`);
    
    toast({
      title: "PDF Downloaded",
      description: "Meeting notes have been exported successfully",
    });
  };

  const copyToClipboard = () => {
    const fullTranscription = entries
      .map(entry => `[${entry.timestamp}] ${entry.speaker}: ${entry.text}`)
      .join('\n');
    
    navigator.clipboard.writeText(fullTranscription);
    toast({
      title: "Copied to Clipboard",
      description: "Full transcription copied successfully",
    });
  };

  const downloadTranscriptText = () => {
    const fullTranscription = entries
      .map(entry => `[${entry.timestamp}] ${entry.speaker}: ${entry.text}`)
      .join('\n');
    
    const blob = new Blob([fullTranscription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-transcript-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Transcript Downloaded",
      description: "Text transcript has been saved to your device",
    });
  };

  const filteredEntries = entries.filter(entry =>
    entry.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="meeting-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Live Transcription</h2>
        <Badge variant="outline">{entries.length} entries</Badge>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Button onClick={exportToPDF} variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          PDF
        </Button>
        <Button onClick={downloadTranscriptText} variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Text
        </Button>
        <Button onClick={copyToClipboard} variant="outline" size="sm" className="gap-2">
          <Copy className="w-4 h-4" />
          Copy
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search transcription..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm"
        />
      </div>

      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {entries.length === 0 
                ? "Start recording to see transcription..." 
                : "No matching entries found"
              }
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    {entry.timestamp}
                  </Badge>
                  <span className="text-sm font-medium text-primary">
                    {entry.speaker}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed pl-2 border-l-2 border-border">
                  {entry.text}
                </p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};