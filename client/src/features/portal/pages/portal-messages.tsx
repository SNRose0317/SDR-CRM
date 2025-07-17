import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { MessageCircle, Send, Plus, User } from 'lucide-react';
import { usePatientMessages, useSendPatientMessage } from "../hooks/usePortalApi";
import { usePatientProfile } from "../hooks/usePortalApi";
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner";
import { ErrorMessage } from "@/shared/components/ui/error-message";
import { useToast } from "@/hooks/use-toast";

export default function PortalMessages() {
  const [isComposing, setIsComposing] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const { data: messages, isLoading, error } = usePatientMessages();
  const { data: profile } = usePatientProfile();
  const sendMessage = useSendPatientMessage();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both subject and message",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.healthCoach?.id) {
      toast({
        title: "Error",
        description: "No health coach assigned to send messages to",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendMessage.mutateAsync({
        subject,
        message,
        healthCoachId: profile.healthCoach.id,
      });

      toast({
        title: "Success",
        description: "Message sent successfully",
      });

      setSubject('');
      setMessage('');
      setIsComposing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load messages" />;

  return (
    <div className="space-y-6">
      {/* Compose Message */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Messages
            </CardTitle>
            <Button
              onClick={() => setIsComposing(!isComposing)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Message
            </Button>
          </div>
        </CardHeader>
        
        {isComposing && (
          <CardContent>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To: {profile?.healthCoach 
                    ? `${profile.healthCoach.firstName} ${profile.healthCoach.lastName}`
                    : 'No health coach assigned'
                  }
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  type="submit" 
                  disabled={sendMessage.isPending}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {sendMessage.isPending ? 'Sending...' : 'Send Message'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsComposing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
        </CardHeader>
        <CardContent>
          {!messages || messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Start a conversation with your health coach</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg: any) => (
                <div key={msg.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-200 p-2 rounded-full">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {msg.sentByPatient ? 'You' : 
                            msg.healthCoach 
                              ? `${msg.healthCoach.firstName} ${msg.healthCoach.lastName}`
                              : 'Health Coach'
                          }
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(msg.createdAt).toLocaleDateString()} at{' '}
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!msg.isRead && !msg.sentByPatient && (
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          New
                        </Badge>
                      )}
                      {msg.sentByPatient && (
                        <Badge variant="secondary">
                          Sent
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-2">{msg.subject}</h3>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}