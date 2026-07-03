import { notFound } from "next/navigation";
import { Folder } from "lucide-react";
import { KnowledgeCard } from "@/components/shared/knowledge-card";

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { slug } = await params;

  // In a real implementation, we would fetch the category and its items from the database:
  // const category = await db.category.findUnique({ where: { slug } });
  // if (!category) return notFound();
  
  // For now, we will render a functional-looking UI for Phase 2.
  const category = {
    name: slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    description: `All knowledge items categorized under ${slug}.`,
  };

  const dummyItems: any[] = []; // No items for now to show the empty state, or we could add dummies

  return (
    <div className="content-width py-12">
      {/* Header */}
      <div className="mb-10 flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
          <Folder className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground mt-1">{category.description}</p>
          )}
        </div>
      </div>

      {/* Grid */}
      {dummyItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyItems.map((item: any) => (
            <KnowledgeCard key={item.id} {...item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-border/50">
          <Folder className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="font-heading text-xl font-semibold mb-2">No items found</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            There are no knowledge items in this category yet.
          </p>
        </div>
      )}
    </div>
  );
}
