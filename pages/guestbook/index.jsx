"use client"; // if using App Router

export default function EmbeddedPage() {
  return (
    <div className="w-full h-screen">
      <iframe
        src="https://the-website.atabook.org"
        className="w-full h-full border-0"
        title="Atabook Website"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}
