/**
 * SEOHead — React 19 head metadata component
 *
 * React 19 supports rendering <title>, <meta>, <link> tags directly inside
 * components — the runtime hoists them to <head> automatically.
 * No react-helmet or other third-party libraries required.
 */

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface SEOHeadProps {
  title?: string;
  titleSuffix?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  /** Open Graph */
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product' | 'profile';
  ogUrl?: string;
  ogSiteName?: string;
  /** Twitter Card */
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  /** JSON-LD structured data (any schema.org type) */
  jsonLd?: object | object[];
  /** Extra meta tags */
  extra?: Array<{ name?: string; property?: string; content: string }>;
}

/* ─── SEOHead ─────────────────────────────────────────────────────────── */

export function SEOHead({
  title,
  titleSuffix,
  description,
  canonical,
  noindex = false,
  nofollow = false,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  ogUrl,
  ogSiteName,
  twitterCard = 'summary_large_image',
  twitterSite,
  twitterCreator,
  jsonLd,
  extra = [],
}: SEOHeadProps) {
  const fullTitle = titleSuffix && title ? `${title} | ${titleSuffix}` : title;
  const robots = [noindex ? 'noindex' : 'index', nofollow ? 'nofollow' : 'follow'].join(', ');

  const jsonLdItems = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <>
      {/* Title */}
      {fullTitle && <title>{fullTitle}</title>}

      {/* Basic */}
      {description && <meta name="description" content={description} />}
      <meta name="robots" content={robots} />

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      {(ogTitle ?? title) && <meta property="og:title" content={ogTitle ?? title} />}
      {(ogDescription ?? description) && <meta property="og:description" content={ogDescription ?? description} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:type" content={ogType} />
      {(ogUrl ?? canonical) && <meta property="og:url" content={ogUrl ?? canonical} />}
      {ogSiteName && <meta property="og:site_name" content={ogSiteName} />}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}
      {(ogTitle ?? title) && <meta name="twitter:title" content={ogTitle ?? title} />}
      {(ogDescription ?? description) && <meta name="twitter:description" content={ogDescription ?? description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Extra */}
      {extra.map((m, i) => (
        <meta
          key={i}
          {...(m.name ? { name: m.name } : {})}
          {...(m.property ? { property: m.property } : {})}
          content={m.content}
        />
      ))}

      {/* JSON-LD structured data */}
      {jsonLdItems.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
