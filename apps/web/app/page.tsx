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
  'Marketplace de última hora para profesionales de la salud y el deporte en España. Fisioterapeutas, masajistas, osteópatas, psicólogos, nutricionistas, podólogos, quiroprácticos y entrenadores personales publican huecos con descuento y los pacientes reservan en segundos.',
openGraph: {
description: 'Flash sales de bienestar. Reserva una cita de fisio, masaje, osteopatía, psicología, nutrición, podología o entrenamiento personal hoy mismo con hasta un 40% de descuento.',,
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
