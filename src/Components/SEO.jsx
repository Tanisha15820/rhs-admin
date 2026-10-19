import { useEffect } from "react";

/**
 * Simple, beginner-friendly SEO component for Admin Portal.
 * Sets the browser page title and basic meta tags.
 */
export default function SEO({
  title = "Admin Content Portal",
  description = "Administrative dashboard for Reinforce Healthcare Services website management.",
}) {
  const fullTitle = `${title} | Reinforce Healthcare Admin`;

  // Update browser tab title
  useEffect(() => {
    document.title = fullTitle;
  }, [fullTitle]);

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="noindex, nofollow" />
    </>
  );
}
