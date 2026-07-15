import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description }) => {
  useEffect(() => {
    const currentHash = window.location.hash || '#home';
    const isPrivatePage = currentHash === '#admin';
    
    // 1. Dynamic Page Title
    document.title = `${title} | Naveed Signature Stich - Bespoke Tailoring & Eastern Couture`;

    // 2. Manage Description Meta Tag
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // 3. Dynamic Robots Tag (Noindex private admin console, index & follow public sections)
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    if (isPrivatePage) {
      metaRobots.setAttribute('content', 'noindex, nofollow');
    } else {
      metaRobots.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // 4. Dynamic Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    const cleanOrigin = 'https://naveedsignaturestich.com';
    const canonicalUrl = `${cleanOrigin}/${currentHash === '#home' ? '' : currentHash}`;
    linkCanonical.setAttribute('href', canonicalUrl);

    // 5. OpenGraph Tags with dynamic URL and images
    const ogTags = [
      { property: 'og:title', content: `${title} | Naveed Signature Stich` },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
      { 
        property: 'og:image', 
        content: currentHash === '#gallery' 
          ? 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=1200' // master tailor cutting
          : window.location.origin + '/images/black_lehenga_1784082334514.jpg' // luxury embroidery
      },
      { property: 'og:site_name', content: 'Naveed Signature Stich' },
      { property: 'og:locale', content: 'en_PK' }
    ];

    ogTags.forEach(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // 6. Dynamic JSON-LD Schema Markup Injection
    const schemaId = 'naveed-signature-schema';
    let scriptTag = document.getElementById(schemaId) as HTMLScriptElement | null;
    
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    // Base Schema: Local Business Details (NAP - Name, Address, Phone aligned for Lahore, PK)
    const baseBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      'name': 'Naveed Signature Stich',
      'alternateName': 'Naveed Signature Stitch',
      'image': window.location.origin + '/images/black_lehenga_1784082334514.jpg',
      'logo': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=200',
      'description': 'Premium custom tailoring, bespoke bridal wear, festive sherwanis, and haute couture dress design services in Lahore.',
      'url': 'https://naveedsignaturestich.com',
      'telephone': '+923064200710',
      'priceRange': '$$$',
      'currenciesAccepted': 'PKR, USD',
      'paymentAccepted': 'Cash, Bank Transfer, Credit Card',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Butt Chowk, Township',
        'addressLocality': 'Lahore',
        'addressRegion': 'Punjab',
        'postalCode': '54770',
        'addressCountry': 'PK'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': '31.4552',
        'longitude': '74.3074'
      },
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          'opens': '10:00',
          'closes': '20:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': 'Sunday',
          'opens': '12:00',
          'closes': '18:00'
        }
      ],
      'sameAs': [
        'https://www.facebook.com/naveedsignaturestich',
        'https://www.instagram.com/naveedsignaturestich'
      ],
      'areaServed': [
        {
          '@type': 'AdministrativeArea',
          'name': 'Lahore'
        },
        {
          '@type': 'AdministrativeArea',
          'name': 'Punjab'
        },
        {
          '@type': 'Country',
          'name': 'Pakistan'
        }
      ]
    };

    // Determine auxiliary schemas to form an @graph array for maximum search visibility
    const schemas: any[] = [baseBusinessSchema];

    // FAQPage schema matching Home FAQ section
    if (currentHash === '#home' || currentHash === '') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is the standard turnaround time for custom tailoring?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Our turnaround time is carefully structured to uphold our quality standards. Casual dresses require 7–10 days, formal wear and heavy luxury party suits take 2–3 weeks, while magnificent custom bridal couture takes 8–12 weeks of meticulous handcraft.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Can I bring my own fabric, or do you supply materials?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'We offer absolute flexibility. You are welcome to supply your own prized fabrics, or collaborate directly with our designers to choose from our premium in-house library of raw silks, banarsi jamawar, pure chiffon, velvets, and luxury lawn cotton.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Do you offer fitting corrections and sizing adjustments?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes, we provide a Perfect Silhouette Guarantee. If your tailored dress requires any minor sizing adjustments within 30 days of delivery, our master tailors will perform them complimentary in our flagship Lahore studio.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does the custom design recreating service work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Simply upload or paste the URL of any inspiration image (from Pinterest, Instagram, or runway shows) on our Book Now form. Master Naveed will study the silhouette, design custom paper patterns, and sew a premium recreation of the outfit.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Can I request a virtual video consultation if I live abroad?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Absolutely. We cater to global patrons. Our team offers dedicated WhatsApp video calls to guide you step-by-step through taking your own sizing measurements with perfect professional accuracy.'
            }
          }
        ]
      });
    }

    // AboutPage schema
    if (currentHash === '#about') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        'mainEntity': {
          '@type': 'Organization',
          'name': 'Naveed Signature Stich',
          'foundingDate': '2011',
          'founder': {
            '@type': 'Person',
            'name': 'Naveed Ahmad'
          },
          'description': 'A private luxury design atelier located in Lahore, Pakistan, specializing in bespoke master drafting, heritage pattern cutting, and opulent eastern bridal couture.'
        }
      });
    }

    // Service/Offer catalog for the Gallery or Testimonials
    if (currentHash === '#gallery' || currentHash === '#testimonials') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'OfferCatalog',
        'name': 'Atelier Service List',
        'itemListElement': [
          {
            '@type': 'Offer',
            'itemOffered': {
              '@type': 'Service',
              'name': 'Custom Bridal Wear Stitching',
              'description': 'Extravagant personalized bridal lehengas, heavy ghararas, and traditional heavy-work wedding attire.'
            }
          },
          {
            '@type': 'Offer',
            'itemOffered': {
              '@type': 'Service',
              'name': 'Party & Festive Wear Designing',
              'description': 'Unique, hand-worked festive ghararas, silk sarees, designer dholki outfits, and elegant boutique wear.'
            }
          },
          {
            '@type': 'Offer',
            'itemOffered': {
              '@type': 'Service',
              'name': 'Formal & Bespoke Sherwani Tailoring',
              'description': 'Sharply detailed bespoke men\'s sherwanis, luxury waistcoats, and premium formal salwar suits.'
            }
          }
        ]
      });

      // Aggregate reviews rating on testimonials
      if (currentHash === '#testimonials') {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          'name': 'Naveed Signature Stich',
          'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': '4.9',
            'reviewCount': '128',
            'bestRating': '5',
            'worstRating': '1'
          }
        });
      }
    }

    // Standard BreadcrumbList schema for navigation context
    const cleanPathName = currentHash.replace('#', '');
    const breadcrumbItems = [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': `${cleanOrigin}/`
      }
    ];

    if (cleanPathName && cleanPathName !== 'home') {
      breadcrumbItems.push({
        '@type': 'ListItem',
        'position': 2,
        'name': cleanPathName.charAt(0).toUpperCase() + cleanPathName.slice(1),
        'item': `${cleanOrigin}/#${cleanPathName}`
      });
    }

    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbItems
    });

    scriptTag.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': schemas
    });
  }, [title, description]);

  return null;
};

