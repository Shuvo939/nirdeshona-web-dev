export type Post = {
  id: string;
  author_id: string | null;
  category_id: string | null;

  slug: string;
  title: string;
  excerpt: string | null;
  content: string;

  cover_image_url: string | null;

  status: "draft" | "published" | "archived";

  seo_title: string | null;
  seo_description: string | null;

  published_at: string | null;
  created_at: string;
  updated_at: string;

  views_count: number;

  author_name: string | null;
  author_avatar: string | null;

  category_name: string | null;
  category_slug: string | null;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type Comment = {
  id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  user_id: string;

  full_name: string | null;
  avatar_url: string | null;
};

export type ReactionCount = {
  reaction_type: "like" | "love" | "helpful";
  count: number;
};

export type CurrentUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
} | null;