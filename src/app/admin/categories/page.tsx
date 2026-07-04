"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Search, ExternalLink, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CategoriesAdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<{name: string, slug: string, items: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "knowledgeItems"));
        const catMap = new Map<string, number>();
        
        querySnapshot.forEach((doc) => {
          const cat = doc.data().category;
          if (cat) {
            catMap.set(cat, (catMap.get(cat) || 0) + 1);
          }
        });

        const formattedCats = Array.from(catMap.entries()).map(([name, count]) => ({
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          items: count
        })).sort((a, b) => a.name.localeCompare(b.name));
        
        setCategories(formattedCats);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Manage the categories used to organize your knowledge.
          </p>
        </div>
        <Link href="/admin/knowledge/create">
          <Button className="gap-2 cursor-pointer">
            <PlusCircle className="h-4 w-4" />
            New Item with New Category
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <TableRow key={category.slug} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/admin/categories/${category.slug}?name=${encodeURIComponent(category.name)}`)}>
                  <TableCell className="font-medium text-brand-indigo">{category.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {category.slug}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{category.items}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="gap-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); router.push(`/admin/categories/${category.slug}?name=${encodeURIComponent(category.name)}`); }}>
                      View <ExternalLink className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
