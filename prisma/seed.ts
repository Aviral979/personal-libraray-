import { PrismaClient, UserRole } from "@prisma/client";
import { db as prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@knowledgearchive.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      hashedPassword,
      role: UserRole.SUPER_ADMIN,
    },
  });

  console.log(`✅ Admin user created: ${admin.email}`);

  // Create default categories
  const categories = [
    {
      name: "Instagram",
      slug: "instagram",
      description: "Content saved from Instagram posts, reels, and stories",
      icon: "Camera",
      order: 1,
    },
    {
      name: "YouTube",
      slug: "youtube",
      description: "Videos, tutorials, and content from YouTube",
      icon: "Youtube",
      order: 2,
    },
    {
      name: "Websites & Blogs",
      slug: "websites-blogs",
      description: "Articles and content from websites and blogs",
      icon: "Globe",
      order: 3,
    },
    {
      name: "Twitter / X",
      slug: "twitter-x",
      description: "Tweets and threads from Twitter/X",
      icon: "MessageSquare",
      order: 4,
    },
    {
      name: "Reddit",
      slug: "reddit",
      description: "Posts and discussions from Reddit",
      icon: "MessageCircle",
      order: 5,
    },
    {
      name: "LinkedIn",
      slug: "linkedin",
      description: "Professional content from LinkedIn",
      icon: "Briefcase",
      order: 6,
    },
    {
      name: "GitHub",
      slug: "github",
      description: "Code repositories and technical content from GitHub",
      icon: "Github",
      order: 7,
    },
    {
      name: "PDFs & Documents",
      slug: "pdfs-documents",
      description: "Uploaded PDFs and documents",
      icon: "FileText",
      order: 8,
    },
    {
      name: "Personal Notes",
      slug: "personal-notes",
      description: "Your personal notes and thoughts",
      icon: "PenTool",
      order: 9,
    },
    {
      name: "Research",
      slug: "research",
      description: "Research papers, findings, and academic content",
      icon: "Microscope",
      order: 10,
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log(`✅ ${categories.length} default categories created`);

  // Create default settings
  const defaultSettings = [
    { key: "site_name", value: JSON.stringify("Knowledge Archive"), group: "general" },
    { key: "site_description", value: JSON.stringify("Personal Knowledge Management System"), group: "general" },
    { key: "items_per_page", value: JSON.stringify(12), group: "general" },
    { key: "max_upload_size_mb", value: JSON.stringify(50), group: "storage" },
    { key: "allowed_file_types", value: JSON.stringify(["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "video/mp4"]), group: "storage" },
    { key: "storage_provider", value: JSON.stringify("local"), group: "storage" },
  ];

  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log(`✅ Default settings created`);

  // Create default SEO configs
  const seoConfigs = [
    {
      pagePath: "/",
      title: "Knowledge Archive — Personal Knowledge Management System",
      description: "A permanent, centralized archive for saving and organizing your digital knowledge from any source.",
    },
    {
      pagePath: "/categories",
      title: "Categories — Knowledge Archive",
      description: "Browse knowledge organized by category.",
    },
    {
      pagePath: "/search",
      title: "Search — Knowledge Archive",
      description: "Search across all knowledge items, categories, tags, and OCR text.",
    },
  ];

  for (const seo of seoConfigs) {
    await prisma.seoConfig.upsert({
      where: { pagePath: seo.pagePath },
      update: {},
      create: seo,
    });
  }

  console.log(`✅ Default SEO configs created`);

  // Create default editable pages
  const pages = [
    {
      title: "Privacy Policy",
      slug: "privacy-policy",
      content: JSON.stringify({ blocks: [{ type: "paragraph", content: "Privacy policy content goes here. Edit this page from the admin panel." }] }),
      published: true,
    },
    {
      title: "Terms of Service",
      slug: "terms",
      content: JSON.stringify({ blocks: [{ type: "paragraph", content: "Terms of service content goes here. Edit this page from the admin panel." }] }),
      published: true,
    },
    {
      title: "Disclaimer",
      slug: "disclaimer",
      content: JSON.stringify({ blocks: [{ type: "paragraph", content: "Disclaimer content goes here. Edit this page from the admin panel." }] }),
      published: true,
    },
    {
      title: "Cookie Policy",
      slug: "cookie-policy",
      content: JSON.stringify({ blocks: [{ type: "paragraph", content: "Cookie policy content goes here. Edit this page from the admin panel." }] }),
      published: true,
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  console.log(`✅ Default pages created`);

  console.log("\n🎉 Seeding complete!");
  console.log(`\n📧 Admin email: ${adminEmail}`);
  console.log(`🔑 Admin password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
