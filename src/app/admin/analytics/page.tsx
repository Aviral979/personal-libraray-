"use client";

import { useEffect, useState } from "react";
import { LineChart, BarChart3, Eye, FileText, Loader2, FolderOpen, MousePointerClick, TrendingUp, BookOpen, Clock } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsAdminPage() {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalItems: 0,
    totalCategories: 0,
    totalLinks: 0,
    publishedCount: 0,
    draftCount: 0,
    avgViews: 0,
  });
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "knowledgeItems"));
        let views = 0;
        let itemsCount = 0;
        let linksCount = 0;
        let published = 0;
        let drafts = 0;
        const categoryMap = new Map<string, { count: number, views: number }>();
        const allItems: any[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.deletedAt) {
            itemsCount++;
            const itemViews = data.views || 0;
            views += itemViews;
            
            if (data.status === 'PUBLISHED') published++;
            else drafts++;

            if (data.category) {
              const catStat = categoryMap.get(data.category) || { count: 0, views: 0 };
              categoryMap.set(data.category, {
                count: catStat.count + 1,
                views: catStat.views + itemViews
              });
            }
            
            linksCount += (data.externalLinks?.length || 0);
            allItems.push({ id: doc.id, ...data });
          }
        });

        // Top 5 popular items
        const sortedItems = [...allItems].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
        setPopularItems(sortedItems);

        // Category stats array
        const catArray = Array.from(categoryMap.entries()).map(([name, data]) => ({
          name,
          count: data.count,
          views: data.views
        })).sort((a, b) => b.count - a.count);

        setCategoryStats(catArray);

        setStats({
          totalViews: views,
          totalItems: itemsCount,
          totalCategories: categoryMap.size,
          totalLinks: linksCount,
          publishedCount: published,
          draftCount: drafts,
          avgViews: itemsCount > 0 ? Math.round(views / itemsCount) : 0
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-indigo" />
          <p className="text-muted-foreground font-medium">Crunching your data...</p>
        </div>
      </div>
    );
  }

  const publishedPercentage = stats.totalItems > 0 ? Math.round((stats.publishedCount / stats.totalItems) * 100) : 0;
  const draftPercentage = stats.totalItems > 0 ? Math.round((stats.draftCount / stats.totalItems) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Analytics & Insights</h1>
        <p className="text-muted-foreground mt-1">
          Deep dive into how your knowledge base is performing.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-card-hover transition-all duration-300 border-l-4 border-l-brand-indigo">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <div className="h-8 w-8 rounded-full bg-brand-indigo/10 flex items-center justify-center">
              <Eye className="h-4 w-4 text-brand-indigo" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-brand-success" /> Lifetime traffic
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-card-hover transition-all duration-300 border-l-4 border-l-brand-teal">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Views per Item</CardTitle>
            <div className="h-8 w-8 rounded-full bg-brand-teal/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-brand-teal" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Average engagement</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-card-hover transition-all duration-300 border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <FolderOpen className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCategories.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Active content topics</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-card-hover transition-all duration-300 border-l-4 border-l-pink-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">External Links</CardTitle>
            <div className="h-8 w-8 rounded-full bg-pink-500/10 flex items-center justify-center">
              <MousePointerClick className="h-4 w-4 text-pink-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalLinks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total external resources</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Most Popular Content Table */}
        <Card className="col-span-full lg:col-span-4 hover:shadow-card-hover transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-indigo" /> Top Performing Content
            </CardTitle>
            <CardDescription>The most viewed knowledge items in your archive.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {popularItems.length > 0 ? (
                    popularItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          {item.title}
                          {item.status === 'DRAFT' && <Badge variant="secondary" className="ml-2 text-[10px]">Draft</Badge>}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.category}</TableCell>
                        <TableCell className="text-right font-bold text-brand-indigo">{item.views || 0}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        No content available yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown Panel */}
        <div className="col-span-full lg:col-span-3 space-y-6">
          
          {/* Status Breakdown */}
          <Card className="hover:shadow-card-hover transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-brand-teal" /> Content Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-success"></div>Published ({stats.publishedCount})</span>
                  <span className="text-muted-foreground">{publishedPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-brand-success rounded-full" style={{ width: `${publishedPercentage}%` }}></div>
                </div>

                <div className="flex items-center justify-between text-sm mt-4">
                  <span className="font-medium flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div>Drafts ({stats.draftCount})</span>
                  <span className="text-muted-foreground">{draftPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${draftPercentage}%` }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="hover:shadow-card-hover transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FolderOpen className="h-5 w-5 text-brand-warning" /> Category Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted">
                {categoryStats.length > 0 ? categoryStats.map((cat, idx) => {
                  const percent = Math.round((cat.count / stats.totalItems) * 100);
                  // Pick colors for the top categories
                  const colors = ["bg-brand-indigo", "bg-brand-teal", "bg-pink-500", "bg-amber-500", "bg-purple-500"];
                  const barColor = colors[idx % colors.length];

                  return (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium truncate max-w-[150px]">{cat.name}</span>
                        <span className="text-muted-foreground">{cat.count} items ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-center text-sm text-muted-foreground">No categories found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
