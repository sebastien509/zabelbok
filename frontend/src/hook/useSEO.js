import { useEffect } from 'react';

export function useSEO({ 
  title = '', 
  description = '', 
  canonical = '', 
  image = '/images/og-image.jpg',
  type = 'website',
  publishedTime = '',
  author = '',
  tags = []
} = {}) {
  
  useEffect(() => {
    const siteTitle = 'Magazine Platform';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const siteUrl = 'https://yourdomain.com';
    const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl;

    // Update title
    document.title = fullTitle;

    // Update meta tags
    updateMetaTag('name', 'description', description);
    updateMetaTag('property', 'og:title', fullTitle);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:type', type);
    updateMetaTag('property', 'og:url', fullCanonical);
    updateMetaTag('property', 'og:image', image);
    updateMetaTag('name', 'twitter:title', fullTitle);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', image);

    // Update canonical link
    updateCanonicalLink(fullCanonical);

    // Add structured data for articles
    if (type === 'article') {
      addStructuredData({
        title: fullTitle,
        description,
        url: fullCanonical,
        publishedTime,
        author,
        tags
      });
    }

    // Cleanup function
    return () => {
      // Reset to defaults if needed
      document.title = 'Magazine Platform - Insights & Innovation';
    };
  }, [title, description, canonical, image, type, publishedTime, author, tags]);
}

function updateMetaTag(attribute, name, content) {
  if (!content) return;

  let tag = document.querySelector(`meta[${attribute}="${name}"]`);
  if (tag) {
    tag.setAttribute('content', content);
  } else {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, name);
    tag.setAttribute('content', content);
    document.head.appendChild(tag);
  }
}

function updateCanonicalLink(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (link) {
    link.setAttribute('href', url);
  } else {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    document.head.appendChild(link);
  }
}

function addStructuredData(data) {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    url: data.url,
    datePublished: data.publishedTime,
    dateModified: data.publishedTime,
    author: {
      '@type': 'Person',
      name: data.author
    },
    keywords: data.tags?.join(', ')
  });

  document.head.appendChild(script);
}