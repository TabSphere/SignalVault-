import { useState } from "react";
import { Phone, PhoneOff, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface VoiceCallWidgetProps {
  signalId: string;
  userId: string;
  signalData?: {
    asset_name: string;
    direction: string;
    entry_price: number;
  };
}

export function VoiceCallWidget({ signalId, userId, signalData }: VoiceCallWidgetProps) {
  const [isCalling, setIsCalling] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTTS = async () => {
    setIsPlaying(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-voice-call", {
        body: { signalId, userId, action: "tts" },
      });

      if (error) throw error;

      setAudioUrl(data.audioUrl);
      toast({
        title: "Voice Alert Ready",
        description: `Audio generated for ${signalData?.asset_name || "signal"}.`,
      });

      // Auto-play the audio
      const audio = new Audio(data.audioUrl);
      audio.play();
      audio.onended = () => setIsPlaying(false);
    } catch (err: any) {
      toast({
        title: "Voice Error",
        description: err.message || "Failed to generate voice alert.",
        variant: "destructive",
      });
      setIsPlaying(false);
    }
  };

  const handleRealCall = async () => {
    setIsCalling(true);
    try {
      const { data, error } = await supabase.functions.invoke("voice-call-trigger", {
        body: { signalId, userId },
      });

      if (error) throw error;

      toast({
        title: "Call Initiated",
        description: data.message || "Calling your phone now...",
      });
    } catch (err: any) {
      toast({
        title: "Call Failed",
        description: err.message || "Could not place the call. Check your phone number in profile settings.",
        variant: "destructive",
      });
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Volume2 className="h-4 w-4 text-primary" />
          Voice Alert
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {signalData
            ? `${signalData.asset_name} — ${signalData.direction.toUpperCase()} at ${signalData.entry_price}`
            : "Get voice alerts for this signal"}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleTTS}
            disabled={isPlaying}
          >
            {isPlaying ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Volume2 className="h-4 w-4 mr-2" />
            )}
            Play Alert
          </Button>

          <Button
            size="sm"
            className="flex-1"
            onClick={handleRealCall}
            disabled={isCalling}
          >
            {isCalling ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Phone className="h-4 w-4 mr-2" />
            )}
            Call Me
          </Button>
        </div>

        {audioUrl && (
          <audio controls className="w-full mt-2" src={audioUrl}>
            Your browser does not support the audio element.
          </audio>
        )}

        <p className="text-xs text-muted-foreground">
          "Call Me" requires a phone number in your profile and Twilio setup.
        </p>
      </CardContent>
    </Card>
  );
}
