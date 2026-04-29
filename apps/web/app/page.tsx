import type { Metadata } from 'next';
import { Navbar }             from '../components/landing/Navbar';
import { HeroSection }        from '../components/landing/HeroSection';
import { HowItWorksSection }  from '../components/landing/HowItWorksSection';
import { PricingSection }     from '../components/landing/PricingSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { FAQSection }          from '../components/landing/FAQSection';
import { CTASection }          from '../components/landing/CTASection';
import { Footer }              from '../components/landing/Footer';

export const metadata: Metadata = {
  title: 'Yacita — Citas de última hora con descuento',
  description:
    'Marketplace de última hora para el sector salud en España. Clínicas de fisioterapia, masajes y quiropráctica publican huecos con descuento y los pacientes reservan en segundos.',
  openGraph: {
    title: 'Yacita — Convierte huecos en citas',
    description: 'Flash sales de bienestar. Reserva una cita de fisio, masaje o quiro hoy mismo con hasta un 40% de descuento.',
    type: 'website',
    locale: 'es_ES',
  },
};

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
