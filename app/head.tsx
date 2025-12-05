const siteUrl = "https://ainsworth.dev";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      name: "Sam Ainsworth",
      url: siteUrl,
      jobTitle: "Senior Software Developer",
      description:
        "Senior Software Developer focusing on scalable web applications, cloud architecture, and modern engineering leadership.",
      email: "mailto:s@ainsworth.dev",
      sameAs: ["https://www.linkedin.com/in/samainsworth/"],
      image: `${siteUrl}/placeholder.jpg`,
      worksFor: {
        "@type": "Organization",
        name: "IBM",
        url: "https://www.ibm.com",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Manchester",
        addressRegion: "Greater Manchester",
        addressCountry: "GB",
      },
    },
    {
      "@type": "WebSite",
      name: "Sam Ainsworth",
      url: siteUrl,
      inLanguage: "en-GB",
      description:
        "Senior Software Developer sharing projects, blog posts, and practical insights on building reliable cloud-first software.",
      publisher: {
        "@type": "Person",
        name: "Sam Ainsworth",
      },
    },
  ],
};

export default function Head() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
