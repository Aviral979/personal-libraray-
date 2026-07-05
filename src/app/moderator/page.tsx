"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, query, where, writeBatch, addDoc } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserX, Loader2, Info, Send, BookOpen, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function ModeratorUsers() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal States
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userItems, setUserItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const [messageRecipient, setMessageRecipient] = useState<any | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(items);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUserItems = async (userId: string) => {
    setLoadingItems(true);
    try {
      const q = query(collection(db, "knowledgeItems"), where("authorId", "==", userId));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserItems(items);
    } catch (error) {
      console.error("Error fetching user items:", error);
      toast.error("Failed to load user content");
    } finally {
      setLoadingItems(false);
    }
  };

  const handleOpenInfo = (user: any) => {
    setSelectedUser(user);
    fetchUserItems(user.id);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);
    try {
      await addDoc(collection(db, "messages"), {
        recipientId: messageRecipient.id,
        senderId: session?.user?.id || "moderator",
        senderName: session?.user?.name || "Moderator",
        message: messageText.trim(),
        createdAt: new Date().toISOString(),
        read: false
      });
      toast.success("Message sent successfully!");
      setMessageText("");
      setMessageRecipient(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (!confirm(`Are you absolutely sure? This will permanently delete ${user.email} and all their uploaded content.`)) return;
    
    setIsDeleting(true);
    try {
      const batch = writeBatch(db);
      
      // Delete their content
      const q = query(collection(db, "knowledgeItems"), where("authorId", "==", user.id));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((document) => {
        batch.delete(document.ref);
      });
      
      // Delete user
      batch.delete(doc(db, "users", user.id));
      
      await batch.commit();
      
      toast.success(`User ${user.name || user.email} and all their content deleted`);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage platform users, view their information, and send messages.</p>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{(user.name || user.email || "U").substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{user.name || "N/A"}</span>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "MODERATOR" || user.role === "SUPER_ADMIN" ? "default" : "secondary"}>
                      {user.role || "USER"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenInfo(user)}
                        className="gap-1 cursor-pointer"
                      >
                        <Info className="h-3.5 w-3.5" />
                        Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setMessageRecipient(user)}
                        className="gap-1 cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Message
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        className="gap-1 cursor-pointer"
                        disabled={user.role === "MODERATOR" || user.role === "SUPER_ADMIN" || isDeleting}
                      >
                        <UserX className="h-3.5 w-3.5" />
                        Wipe
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── USER DETAILS MODAL ───────────────────────── */}
      <Dialog open={selectedUser !== null} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Information & Activity</DialogTitle>
            <DialogDescription>Full details of the platform member.</DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6 pt-4">
              {/* Header profile info */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                <Avatar className="h-16 w-16 border">
                  <AvatarImage src={selectedUser.avatarUrl} />
                  <AvatarFallback className="text-xl">{(selectedUser.name || selectedUser.email).substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-heading text-lg font-bold">{selectedUser.name || "N/A"}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge>{selectedUser.role || "USER"}</Badge>
                    {selectedUser.bio && <span className="text-xs text-muted-foreground flex items-center">Bio available</span>}
                  </div>
                </div>
              </div>

              {/* Bio description */}
              {selectedUser.bio && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Biography</h4>
                  <p className="text-sm text-foreground/80 bg-muted/10 p-3 rounded-lg border border-border/20 whitespace-pre-wrap">{selectedUser.bio}</p>
                </div>
              )}

              {/* User content items */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  Uploaded Content ({userItems.length})
                </h4>
                
                <div className="max-h-48 overflow-y-auto border rounded-lg bg-card divide-y">
                  {loadingItems ? (
                    <div className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading content list...
                    </div>
                  ) : userItems.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      This user hasn't uploaded any content items yet.
                    </div>
                  ) : (
                    userItems.map((item) => (
                      <div key={item.id} className="p-3 flex items-center justify-between text-sm">
                        <div className="font-medium truncate max-w-[70%]">{item.title}</div>
                        <div className="flex gap-2 items-center">
                          <Badge variant={item.status === "PUBLISHED" ? "default" : "secondary"}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── SEND MESSAGE MODAL ───────────────────────── */}
      <Dialog open={messageRecipient !== null} onOpenChange={(open) => !open && setMessageRecipient(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Send Message
            </DialogTitle>
            <DialogDescription>
              Directly contact {messageRecipient?.name || messageRecipient?.email}.
            </DialogDescription>
          </DialogHeader>

          {messageRecipient && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={messageRecipient.avatarUrl} />
                  <AvatarFallback>{(messageRecipient.name || messageRecipient.email).substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground">To:</div>
                  <div className="text-sm font-medium">{messageRecipient.name || "N/A"} ({messageRecipient.email})</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Your Message</label>
                <Textarea 
                  placeholder="Type your message for this user here..." 
                  className="min-h-32 text-sm"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setMessageRecipient(null)}>Cancel</Button>
                <Button size="sm" className="gap-1 cursor-pointer" onClick={handleSendMessage} disabled={isSending}>
                  {isSending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
