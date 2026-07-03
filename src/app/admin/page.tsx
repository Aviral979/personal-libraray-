"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  FolderOpen,
  Tags,
  Image as ImageIcon,
  ScanText,
  Eye,
  HardDrive,
  Activity,
  PlusCircle,
  Upload,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const stats = [
  {
    label: "Total Knowledge",
    value: "0",
    change: "Published: 0",
    icon: BookOpen,
    color: "text-brand-indigo",
    bg: "bg-brand-indigo-light dark:bg-brand-indigo/10",
  },
  {
    label: "Categories",
    value: "0",
    change: "Active",
    icon: FolderOpen,
    color: "text-brand-teal",
    bg: "bg-brand-teal-light dark:bg-brand-teal/10",
  },
  {
    label: "Tags",
    value: "0",
    change: "In use",
    icon: Tags,
    color: "text-brand-warning",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
  {
    label: "Media Files",
    value: "0",
    change: "0 MB used",
    icon: ImageIcon,
    color: "text-brand-success",
    bg: "bg-green-50 dark:bg-green-500/10",
  },
  {
    label: "OCR Records",
    value: "0",
    change: "Processed",
    icon: ScanText,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-500/10",
  },
  {
    label: "Total Views",
    value: "0",
    change: "All time",
    icon: Eye,
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-500/10",
  },
];

const quickActions = [
  {
    label: "Create Knowledge",
    icon: PlusCircle,
    href: "/admin/knowledge/create",
    description: "Start a new knowledge entry",
  },
  {
    label: "Upload Media",
    icon: Upload,
    href: "/admin/media",
    description: "Add images, videos, or files",
  },
  {
    label: "OCR Workspace",
    icon: ScanText,
    href: "/admin/ocr",
    description: "Extract text from images",
  },
  {
    label: "New Category",
    icon: FolderOpen,
    href: "/admin/categories",
    description: "Organize your archive",
  },
];

export default function AdminDashboard() {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
            >
              <Link href={action.href}>
                <Card className="group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shrink-0">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-0.5">
                        {action.label}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
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
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted mx-auto mb-4">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              No recent activity
            </p>
            <p className="text-xs text-muted-foreground">
              Activity will appear here as you create and manage content.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Storage Info */}
      <div>
        <h2 className="font-heading text-xl font-semibold mb-4">
          Storage
        </h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-indigo-light dark:bg-brand-indigo/10 text-brand-indigo">
                <HardDrive className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Local Storage</p>
                  <p className="text-sm text-muted-foreground">0 MB / Unlimited</p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                    style={{ width: "0%" }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
