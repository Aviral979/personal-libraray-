"use client";

import { useEffect, useState } from "react";
import { Trash2, ShieldAlert, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, deleteDoc, deleteField } from "firebase/firestore";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export default function TrashAdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrashAndCleanup = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "knowledgeItems"));
        const trashItems: any[] = [];
        
        const now = Date.now();
        const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;

        for (const document of querySnapshot.docs) {
          const data = document.data();
          if (data.deletedAt) {
            const deletedAtMs = data.deletedAt.toMillis();
            // Check if older than 2 days
            if (now - deletedAtMs > twoDaysInMs) {
              // Auto-delete permanently
              await deleteDoc(doc(db, "knowledgeItems", document.id));
            } else {
              trashItems.push({ id: document.id, ...data });
            }
          }
        }
        
        trashItems.sort((a, b) => b.deletedAt.toMillis() - a.deletedAt.toMillis());
        setItems(trashItems);
      } catch (error) {
        console.error("Error fetching trash:", error);
        toast.error("Failed to load trash items");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrashAndCleanup();
  }, []);

  const handleRestore = async (id: string) => {
    try {
      await updateDoc(doc(db, "knowledgeItems", id), {
        deletedAt: deleteField()
      });
      setItems(items.filter(item => item.id !== id));
      toast.success("Item restored successfully");
    } catch (error) {
      console.error("Error restoring item:", error);
      toast.error("Failed to restore item");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this item? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "knowledgeItems", id));
        setItems(items.filter(item => item.id !== id));
        toast.success("Item permanently deleted");
      } catch (error) {
        console.error("Error deleting item:", error);
        toast.error("Failed to delete item");
      }
    }
  };

  const handleEmptyTrash = async () => {
    if (confirm("Are you sure you want to empty the trash? All items will be permanently deleted.")) {
      try {
        for (const item of items) {
          await deleteDoc(doc(db, "knowledgeItems", item.id));
        }
        setItems([]);
        toast.success("Trash emptied successfully");
      } catch (error) {
        console.error("Error emptying trash:", error);
        toast.error("Failed to empty trash completely");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Trash</h1>
          <p className="text-muted-foreground mt-1">
            Recover deleted items or permanently remove them. Items are auto-deleted after 2 days.
          </p>
        </div>
        {items.length > 0 && (
          <Button className="gap-2 cursor-pointer" variant="destructive" onClick={handleEmptyTrash}>
            <ShieldAlert className="h-4 w-4" />
            Empty Trash
          </Button>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length > 0 ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Deleted On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-[200px] sm:max-w-[300px] truncate">
                    {item.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.deletedAt ? format(item.deletedAt.toMillis(), 'MMM d, yyyy h:mm a') : 'Unknown'}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleRestore(item.id)} className="cursor-pointer">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handlePermanentDelete(item.id)} className="cursor-pointer">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Trash2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-xl font-bold mb-2">Trash is empty</h3>
          <p className="text-muted-foreground max-w-sm">
            Any items you delete will appear here for 2 days before being permanently removed.
          </p>
        </div>
      )}
    </div>
  );
}
