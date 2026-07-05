"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, Search, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, query, orderBy, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function KnowledgeAdminPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [knowledgeItems, setKnowledgeItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const q = query(collection(db, "knowledgeItems"));
        const querySnapshot = await getDocs(q);
        const fetchedItems = querySnapshot.docs
          .filter(doc => !doc.data().deletedAt)
          .map(doc => {
            const data = doc.data();
            let dateStr = new Date().toLocaleDateString();
            if (data.date) {
              try {
                dateStr = new Date(data.date).toLocaleDateString();
              } catch (e) {}
            }
            return {
              id: doc.id,
              ...data,
              date: dateStr
            };
          });
        setKnowledgeItems(fetchedItems);
      } catch (error) {
        console.error("Error fetching from Firebase:", error);
      }
    };
    fetchKnowledge();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`This content is being removed from the website, but will remain in the Trash page for 2 days. Are you sure you want to delete "${title}"?`)) {
      try {
        await updateDoc(doc(db, "knowledgeItems", id), {
          deletedAt: Timestamp.now()
        });
        setKnowledgeItems(prev => prev.filter(item => item.id !== id));
        toast.success("Item moved to trash");
      } catch (error) {
        console.error("Error moving to trash:", error);
        toast.error("Failed to delete item");
      }
    }
  };

  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || item.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Knowledge Library</h1>
          <p className="text-muted-foreground mt-1">
            Manage your archived knowledge items.
          </p>
        </div>
        <Link href="/admin/knowledge/create">
          <Button className="gap-2 cursor-pointer">
            <PlusCircle className="h-4 w-4" />
            Create Knowledge
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search knowledge..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          <Badge onClick={() => setStatusFilter("All")} variant={statusFilter === "All" ? "default" : "secondary"} className="cursor-pointer hover:bg-secondary/80">All</Badge>
          <Badge onClick={() => setStatusFilter("Published")} variant={statusFilter === "Published" ? "default" : "outline"} className="cursor-pointer hover:bg-muted">Published</Badge>
          <Badge onClick={() => setStatusFilter("Draft")} variant={statusFilter === "Draft" ? "default" : "outline"} className="cursor-pointer hover:bg-muted">Drafts</Badge>
          <Badge onClick={() => setStatusFilter("Archived")} variant={statusFilter === "Archived" ? "default" : "outline"} className="cursor-pointer hover:bg-muted">Archived</Badge>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length > 0 ? filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium max-w-[200px] sm:max-w-[300px] truncate">
                  {item.title}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.category}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      item.status === "PUBLISHED" ? "default" : 
                      item.status === "DRAFT" ? "secondary" : "outline"
                    }
                    className={item.status === "PUBLISHED" ? "bg-brand-success hover:bg-brand-success/90" : ""}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{item.views}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {item.date}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 cursor-pointer">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => window.open(`/knowledge/${item.slug}`, "_blank")}>
                          <Eye className="mr-2 h-4 w-4" /> View Live
                        </DropdownMenuItem>
                        
                        {(item.authorId === session?.user?.id || session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") && (
                          <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/admin/knowledge/create?edit=${item.id}`)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuGroup>
                      
                      {(item.authorId === session?.user?.id || session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => handleDelete(item.id, item.title)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
