'use client';

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from '@/components/ui/icons';
import { toast } from 'sonner';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

// Custom hook to detect if we're on the client (avoids hydration mismatch)
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function VoiceInput({ onTranscript, disabled = false, className }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const isClient = useIsClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  // Check if speech recognition is supported (only on client)
  const isSupported = isClient && (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition
  );

  // Initialize speech recognition
  useEffect(() => {
    if (!isClient || !isSupported || isInitializedRef.current) return;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    recognitionRef.current = new SpeechRecognitionClass();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognitionRef.current.onresult = (event: any) => {
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

    recognitionRef.current.onerror = () => {
      setIsRecording(false);
      toast.error('Voice input error. Please try again.');
    };

    recognitionRef.current.onend = () => {
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

  // Don't render on server or if not supported
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
          <MicOff className="h-4 w-4 mr-1" />
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

// Hook version for more control
export function useVoiceInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const isClient = useIsClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  const isSupported = isClient && (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition
  );

  useEffect(() => {
    if (!isClient || !isSupported || isInitializedRef.current) return;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    recognitionRef.current = new SpeechRecognitionClass();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        setTranscript(prev => (prev + ' ' + finalTranscript.trim()).trim());
      }
    };

    recognitionRef.current.onerror = () => {
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    isInitializedRef.current = true;
  }, [isClient, isSupported]);

  const startRecording = useCallback(() => {
    if (recognitionRef.current && !isRecording) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Could not start recording:', error);
      }
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isRecording,
    isSupported,
    isClient,
    transcript,
    startRecording,
    stopRecording,
    clearTranscript,
  };
}
