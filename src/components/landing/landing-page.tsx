// Sections live in this folder. Add content/styles per section file.
// The app shell (LayoutSidebar + MainSidebar) remains available for future /app routes.
import { Cta } from './cta';
import { Features } from './features';
import { Footer } from './footer';
import { Header } from './header';
import { Hero } from './hero';

export function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <Hero />
      <Features />
      <Cta />
      <Footer />
    </div>
  );
}
