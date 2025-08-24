import { useState } from "react";
import { X, ChevronDown, ChevronUp, ExternalLink, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTranslation } from "@/hooks/useTranslation";
import type { InboxMessage } from "@/hooks/useInboxMessages";

interface MessageDetailsDrawerProps {
  message: InboxMessage | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MessageDetailsDrawer({ message, isOpen, onClose }: MessageDetailsDrawerProps) {
  const [isRawExpanded, setIsRawExpanded] = useState(false);
  const { t } = useTranslation();

  if (!isOpen || !message) {
    return null;
  }

  const hasMedia = message.media && message.media.length > 0 && message.media.some(url => url && url.trim() !== "");
  const validMedia = hasMedia ? message.media.filter(url => url && url.trim() !== "") : [];

  const isImageUrl = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-96 bg-background border-l border-border transform transition-transform duration-300 ease-in-out z-50 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{t("messageDetails.title")}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Contact Info */}
          <Card className="p-4">
            <h3 className="font-medium mb-2">{t("messageDetails.contact")}</h3>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">{t("messageDetails.name")}: </span>
                <span>{message.profile_name || "Unknown"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t("messageDetails.from")}: </span>
                <span>{message.from_msisdn}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t("messageDetails.to")}: </span>
                <span>{message.to_msisdn}</span>
              </div>
              {message.twilio_sid && (
                <div>
                  <span className="text-muted-foreground">Twilio SID: </span>
                  <span className="font-mono text-xs">{message.twilio_sid}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Message Content */}
          <Card className="p-4">
            <h3 className="font-medium mb-2">{t("messageDetails.message")}</h3>
            <div className="text-sm whitespace-pre-wrap">
              {message.body || <span className="text-muted-foreground italic">{t("messageDetails.noTextContent")}</span>}
            </div>
          </Card>

          {/* Media */}
          {hasMedia && (
            <Card className="p-4">
              <h3 className="font-medium mb-2">{t("messageDetails.media")} ({validMedia.length})</h3>
              <div className="space-y-2">
                {validMedia.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    {isImageUrl(url) ? (
                      <>
                        <Image className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <img 
                            src={url} 
                            alt={`Media ${index + 1}`}
                            className="max-w-full h-20 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1 text-xs truncate">{url}</span>
                      </>
                    )}
                    <Button size="sm" variant="ghost" asChild>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Raw Data */}
          <Collapsible open={isRawExpanded} onOpenChange={setIsRawExpanded}>
            <Card className="p-4">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <h3 className="font-medium">{t("messageDetails.rawWebhookData")}</h3>
                  {isRawExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(message.raw, null, 2)}
                </pre>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}