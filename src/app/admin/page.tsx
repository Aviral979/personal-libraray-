"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  FolderOpen,
  Eye,
  Activity,
  PlusCircle,
  ArrowUpRight,
  Link as LinkIcon,
  FileEdit,
  Trash2,
  BarChart3,
  Settings,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const quickActions = [
  {
    label: "Create Knowledge",
    icon: PlusCircle,
    href: "/admin/knowledge/create",
    description: "Start a new knowledge entry",
  },
  {
    label: "New Category",
    icon: FolderOpen,
    href: "/admin/categories",
    description: "Organize your archive",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
    description: "View detailed statistics",
  },
  {
    label: "Manage Trash",
    icon: Trash2,
    href: "/admin/trash",
    description: "Restore or delete items",
  },
  {
    label: "Global Settings",
    icon: Settings,
    href: "/admin/settings",
    description: "Configure your archive",
  },
];

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState({
    totalKnowledge: 0,
    published: 0,
    categories: 0,
    totalViews: 0,
    externalLinks: 0,
    drafts: 0,
    trash: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentItems, setRecentItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "knowledgeItems"));
        let total = 0;
        let published = 0;
        let drafts = 0;
        let trash = 0;
        let views = 0;
        let links = 0;
        const catSet = new Set<string>();
        const allItems: any[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.deletedAt) {
            trash++;
          } else {
            total++;
            if (data.status === 'PUBLISHED') published++;
            if (data.status === 'DRAFT') drafts++;
            views += (data.views || 0);
            links += (data.externalLinks?.length || 0);
            if (data.category) catSet.add(data.category);
            
            allItems.push({ id: doc.id, ...data });
          }
        });

        // Sort for recent activity
        const sorted = allItems
          .filter(item => item.createdAt)
          .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
          .slice(0, 3);

        setRecentItems(sorted);
        setStatsData({
          totalKnowledge: total,
          published,
          categories: catSet.size,
          totalViews: views,
          externalLinks: links,
          drafts,
          trash
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    {
      label: "Total Knowledge",
      value: statsData.totalKnowledge.toString(),
      change: `Published: ${statsData.published}`,
      icon: BookOpen,
      color: "text-brand-indigo",
      bg: "bg-brand-indigo-light dark:bg-brand-indigo/10",
    },
    {
      label: "Categories",
      value: statsData.categories.toString(),
      change: "Active",
      icon: FolderOpen,
      color: "text-brand-teal",
      bg: "bg-brand-teal-light dark:bg-brand-teal/10",
    },
    {
      label: "Total Views",
      value: statsData.totalViews.toString(),
      change: "All time",
      icon: Eye,
      color: "text-pink-500",
      bg: "bg-pink-50 dark:bg-pink-500/10",
    },
    {
      label: "External Links",
      value: statsData.externalLinks.toString(),
      change: "Resources linked",
      icon: LinkIcon,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      label: "Draft Items",
      value: statsData.drafts.toString(),
      change: "Work in progress",
      icon: FileEdit,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-500/10",
    },
    {
      label: "Trash Items",
      value: statsData.trash.toString(),
      change: "Pending deletion",
      icon: Trash2,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back. Here&apos;s your archive overview.
          </p>
        </div>
        <Link href="/admin/knowledge/create">
          <Button className="gap-2 cursor-pointer" id="dashboard-create-btn">
            <PlusCircle className="h-4 w-4" />
            Create Knowledge
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-card-hover transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground font-medium">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold font-heading">
                          {stat.value}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stat.change}
                        </p>
                      </div>
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-xl ${stat.bg} ${stat.color}`}
                      >
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="font-heading text-xl font-semibold mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                >
                  <Link href={action.href}>
                    <Card className="group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full">
                      <CardContent className="p-5 flex items-start gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shrink-0">
                          <action.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm mb-0.5">
                            {action.label}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {action.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-semibold">
                Recent Activity
              </h2>
              <Badge variant="secondary" className="gap-1">
                <Activity className="h-3 w-3" />
                Live
              </Badge>
            </div>
            <Card>
              <CardContent className="p-0">
                {recentItems.length > 0 ? (
                  <div className="divide-y">
                    {recentItems.map((item) => (
                      <div key={item.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-brand-indigo/10 flex items-center justify-center text-brand-indigo shrink-0">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">Category: {item.category}</p>
                          </div>
                        </div>
                        <Link href={`/admin/knowledge/create?edit=${item.id}`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted mx-auto mb-4">
                      <Activity className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      No recent activity
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Activity will appear here as you create and manage content.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
