'use client';

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, Play, Pause, Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VoiceRecording {
  id: string;
  text: string;
  timestamp: Date;
  duration: number;
  audioUrl: string;
  audioBlob: Blob;
}

interface VoiceRecorderProps {
  onRecordingsChange: (recordings: VoiceRecording[]) => void;
  onTranscriptChange?: (fullTranscript: string) => void;
  maxRecordings?: number;
  className?: string;
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function VoiceRecorder({
  onRecordingsChange,
  onTranscriptChange,
  maxRecordings = 10,
  className,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const isClient = useIsClient();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const onRecordingsChangeRef = useRef(onRecordingsChange);
  const onTranscriptChangeRef = useRef(onTranscriptChange);
  
  useEffect(() => {
    onRecordingsChangeRef.current = onRecordingsChange;
    onTranscriptChangeRef.current = onTranscriptChange;
  });

  const isMediaSupported = isClient && typeof navigator !== 'undefined' && 'mediaDevices' in navigator;
  
  const hasSpeechRecognition = isClient && typeof window !== 'undefined' && (
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  );

  useEffect(() => {
    onRecordingsChangeRef.current(recordings);
    if (onTranscriptChangeRef.current) {
      const fullTranscript = recordings.map(r => r.text).join(' ');
      onTranscriptChangeRef.current(fullTranscript);
    }
  }, [recordings]);

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    if (!isMediaSupported) {
      toast.error('Audio recording is not supported in your browser');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      const startTime = Date.now();
      let transcript = '';
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const duration = Math.round((Date.now() - startTime) / 1000);
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const newRecording: VoiceRecording = {
          id: Date.now().toString(),
          text: transcript || '(Voice recording)',
          timestamp: new Date(),
          duration,
          audioUrl,
          audioBlob,
        };
        
        setRecordings(prev => [...prev, newRecording].slice(-maxRecordings));
        setCurrentTranscript('');
        setRecordingDuration(0);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      mediaRecorder.start(100);
      setIsRecording(true);
      
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      if (hasSpeechRecognition) {
        try {
          const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognitionAPI();
          recognitionRef.current = recognition;
          recognition.continuous = true;
          recognition.interimResults = true;
          
          recognition.onresult = (event) => {
            let fullTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
              fullTranscript += event.results[i][0].transcript;
            }
            transcript = fullTranscript;
            setCurrentTranscript(fullTranscript);
          };
          
          recognition.start();
        } catch (e) {
          console.log('Speech recognition not available:', e);
        }
      }
      
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  }, [isMediaSupported, hasSpeechRecognition, maxRecordings]);

  const stopRecording = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Error stopping recognition:', e);
      }
      recognitionRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    toast.success('Recording saved');
  }, []);

  const deleteRecording = useCallback((id: string) => {
    setRecordings(prev => {
      const recording = prev.find(r => r.id === id);
      if (recording?.audioUrl) {
        URL.revokeObjectURL(recording.audioUrl);
      }
      return prev.filter(r => r.id !== id);
    });
    toast.success('Recording deleted');
  }, []);

  const clearAllRecordings = useCallback(() => {
    recordings.forEach(r => {
      if (r.audioUrl) {
        URL.revokeObjectURL(r.audioUrl);
      }
    });
    setRecordings([]);
    toast.success('All recordings cleared');
  }, [recordings]);

  if (!isClient || !isMediaSupported) {
    return (
      <div className={cn("text-sm text-slate-500", className)}>
        Voice recording not supported in this browser
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={isRecording ? 'destructive' : 'outline'}
          size="sm"
          onClick={isRecording ? stopRecording : startRecording}
          className="flex items-center gap-2"
        >
          {isRecording ? (
            <>
              <Square className="h-4 w-4" />
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Stop ({recordingDuration}s)
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Record Voice Note
            </>
          )}
        </Button>

        {recordings.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAllRecordings}
            className="text-slate-400 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {isRecording && (
        <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1 h-6 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
              <span className="w-1 h-5 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '450ms' }}></span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-red-300 font-medium">Recording... {recordingDuration}s</p>
              {currentTranscript && (
                <p className="text-xs text-red-400 mt-1 italic">{currentTranscript}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {recordings.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400 uppercase tracking-wide">
            Voice Notes ({recordings.length})
          </p>
          {recordings.map((recording, index) => (
            <RecordingItem
              key={recording.id}
              recording={recording}
              index={index + 1}
              onDelete={() => deleteRecording(recording.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface RecordingItemProps {
  recording: VoiceRecording;
  index: number;
  onDelete: () => void;
}

function RecordingItem({ recording, index, onDelete }: RecordingItemProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(recording.audioUrl);
    audioRef.current = audio;
    
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    audio.ontimeupdate = () => {
      setCurrentTime(Math.floor(audio.currentTime));
    };
    
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [recording.audioUrl]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const restart = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins + ':' + secs.toString().padStart(2, '0');
  };

  const truncatedText = recording.text.length > 80 
    ? recording.text.slice(0, 80) + '...' 
    : recording.text;

  const showFullText = recording.text !== '(Voice recording)';

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
            {index}
          </div>
          
          <div className="flex-1 min-w-0">
            {showFullText && (
              <div className="mb-2">
                <p 
                  className={cn(
                    "text-sm text-slate-200",
                    !isExpanded && recording.text.length > 80 && "line-clamp-2 cursor-pointer"
                  )}
                  onClick={() => recording.text.length > 80 && setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? recording.text : truncatedText}
                </p>
                {recording.text.length > 80 && (
                  <button
                    type="button"
                    className="text-xs text-blue-400 hover:text-blue-300 mt-1"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
                onClick={togglePlayPause}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                onClick={restart}
                title="Restart"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-200"
                    style={{ 
                      width: recording.duration > 0 
                        ? ((currentTime / recording.duration) * 100) + '%' 
                        : '0%' 
                    }}
                  />
                </div>
                <span className="text-xs text-slate-400 tabular-nums">
                  {formatTime(currentTime)} / {formatTime(recording.duration)}
                </span>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 mt-1">
              {recording.timestamp.toLocaleTimeString()}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 h-8 w-8 p-0 text-slate-400 hover:text-red-400"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface SimpleVoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceInput({ onTranscript, disabled = false, className }: SimpleVoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const isClient = useIsClient();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isInitializedRef = useRef(false);

  const isSupported = isClient && typeof window !== 'undefined' && (
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  );

  useEffect(() => {
    if (!isClient || !isSupported || isInitializedRef.current) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
      toast.error('Voice input error. Please try again.');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    isInitializedRef.current = true;
  }, [isClient, isSupported, onTranscript]);

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error('Voice input is not supported in your browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        toast.info('Listening... Speak now');
      } catch (error) {
        console.error('Speech recognition error:', error);
        toast.error('Could not start voice input');
      }
    }
  }, [isRecording]);

  if (!isClient || !isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      variant={isRecording ? 'destructive' : 'outline'}
      size="sm"
      onClick={toggleRecording}
      disabled={disabled}
      className={className}
    >
      {isRecording ? (
        <>
          <Square className="h-4 w-4 mr-1" />
          Stop
        </>
      ) : (
        <>
          <Mic className="h-4 w-4 mr-1" />
          Voice
        </>
      )}
    </Button>
  );
}
