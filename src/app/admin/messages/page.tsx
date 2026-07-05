"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, query, where, deleteDoc, updateDoc } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, MailOpen, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function UserMessages() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!session?.user?.id) return;
    try {
      const q = query(
        collection(db, "messages"),
        where("recipientId", "==", session.user.id)
      );
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort client-side by date desc to avoid needing composite firestore indexes for user + orderBy
      items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMessages(items);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchMessages();
    }
  }, [session]);

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, "messages", messageId), {
        read: true
      });
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, read: true } : m));
      toast.success("Marked as read");
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Failed to update message");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteDoc(doc(db, "messages", messageId));
      setMessages(prev => prev.filter(m => m.id !== messageId));
      toast.success("Message deleted");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
        <p className="text-muted-foreground">Messages and alerts sent to you by the platform moderators.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border/50">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">Checking your inbox...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-border/50">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <MailOpen className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Your Inbox is Empty</h3>
          <p className="text-sm text-muted-foreground max-w-sm">You haven't received any messages from moderators yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <Card key={msg.id} className={`border transition-all ${!msg.read ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border/50"}`}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={msg.read ? "secondary" : "default"} className="gap-1">
                      {!msg.read ? <Mail className="h-3 w-3" /> : <MailOpen className="h-3 w-3" />}
                      {msg.read ? "Read" : "New Message"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2 mt-1">
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                    From: {msg.senderName || "Moderator"}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  {!msg.read && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleMarkAsRead(msg.id)}
                      className="cursor-pointer"
                    >
                      Mark Read
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 cursor-pointer"
                    title="Delete message"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap pl-6 border-l-2 border-border/80 mt-2">
                  {msg.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
