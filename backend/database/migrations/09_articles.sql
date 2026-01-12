-- =============================================
-- 09_articles.sql
-- Knowledge Hub / Learning content
-- Educational articles with gating support
-- =============================================

CREATE TABLE IF NOT EXISTS public.articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Content
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT, -- Rich text / Markdown
    video_url TEXT, -- YouTube/Vimeo embed
    
    -- Classification
    level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    category_id UUID REFERENCES public.categories(id),
    tags TEXT[] DEFAULT '{}',
    
    -- Lead Generation
    is_gated BOOLEAN DEFAULT false, -- Require login to view full content
    
    -- Product linking for cross-sell
    linked_product_ids UUID[] DEFAULT '{}',
    
    -- Author (optional)
    author_id UUID REFERENCES public.profiles(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_level ON public.articles(level);
CREATE INDEX IF NOT EXISTS idx_articles_gated ON public.articles(is_gated);

-- RLS: Articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- All articles are viewable (gating handled in application)
CREATE POLICY "Articles are viewable by everyone" 
    ON public.articles FOR SELECT 
    USING (true);

-- Admins can manage articles
CREATE POLICY "Admins can manage articles" 
    ON public.articles FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));
