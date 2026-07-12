export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold font-heading text-[#1B4332] mb-2">Términos y Condiciones de Uso</h1>
        <p className="text-sm text-gray-400 mb-10">Yacita · Última actualización: julio de 2025</p>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">1. Objeto y aceptación</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Los presentes Términos y Condiciones regulan el acceso y uso de la plataforma Yacita (yacita.health), marketplace de citas de última hora para profesionales de la salud y el deporte. Al registrarse o utilizar la plataforma, el usuario acepta íntegramente estos términos.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">2. Descripción del servicio</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Yacita es una plataforma intermediaria que conecta profesionales de la salud y el deporte — fisioterapeutas, masajistas, osteópatas, psicólogos deportivos, nutricionistas, podólogos, quiroprácticos y entrenadores personales — con pacientes que buscan citas de última hora con descuento. Yacita no presta servicios sanitarios directamente y actúa exclusivamente como intermediario tecnológico.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">3. Registro de clínicas y profesionales</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">Para registrarse debe:</p>
          <ul className="list-disc list-inside text-gray-600 text-sm leading-relaxed space-y-1">
            <li>Proporcionar información veraz y actualizada.</li>
            <li>Disponer de las titulaciones y habilitaciones legales requeridas para ejercer su actividad profesional.</li>
            <li>Aceptar la Política de Privacidad y estos Términos y Condiciones.</li>
          </ul>
          <p className="text-gray-600 text-sm leading-relaxed mt-2">Yacita se reserva el derecho de suspender o eliminar cuentas que incumplan estas condiciones.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">4. Publicación de huecos</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Los profesionales pueden publicar huecos disponibles indicando servicio, fecha, hora, duración, precio estándar y precio con descuento. El profesional es responsable de la veracidad de la información publicada y de cumplir con las reservas confirmadas.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">5. Reservas de pacientes</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Los pacientes pueden reservar huecos sin registro previo, proporcionando únicamente su nombre y teléfono. La reserva es gratuita. El pago se realiza directamente en las instalaciones del profesional el día de la cita. Yacita no interviene en la transacción económica ni garantiza la calidad del servicio prestado.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">6. Cancelaciones</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Las cancelaciones deben realizarse con el mayor tiempo de antelación posible. Una vez confirmada la reserva, cualquier cancelación debe comunicarse directamente entre paciente y profesional.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">7. Precios y suscripción</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">El acceso para profesionales está sujeto a una suscripción:</p>
          <ul className="list-disc list-inside text-gray-600 text-sm leading-relaxed space-y-1">
            <li>Plan Básico: 5,99€/mes — hasta 10 huecos al mes.</li>
            <li>Plan Pro: 14,99€/mes — huecos ilimitados.</li>
          </ul>
          <p className="text-gray-600 text-sm leading-relaxed mt-2">Los precios incluyen IVA. El cobro se realiza mensualmente a través de Stripe. El primer mes puede ser gratuito según la promoción vigente.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">8. Propiedad intelectual</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Todo el contenido de la plataforma Yacita (diseño, código, marca, textos, imágenes) es propiedad de Yacita o de sus licenciantes y está protegido por la legislación de propiedad intelectual. Queda prohibida su reproducción sin autorización expresa.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">9. Limitación de responsabilidad</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Yacita no se hace responsable de la calidad o resultado de los servicios prestados por los profesionales, daños derivados del uso de la plataforma, información incorrecta publicada por los profesionales, ni de incumplimientos entre pacientes y profesionales.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">10. Modificaciones</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Yacita puede modificar estos términos en cualquier momento. Los cambios serán comunicados con al menos 15 días de antelación. El uso continuado implica la aceptación de los nuevos términos.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">11. Legislación aplicable y jurisdicción</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Estos términos se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de Barcelona.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">12. Contacto</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Para cualquier consulta, contáctenos en: <a href="mailto:hola@yacita.es" className="text-[#1B4332] underline">hola@yacita.es</a></p>
        </section>

        <div className="mt-12 pt-6 border-t border-gray-100">
          <a href="/" className="text-sm text-[#1B4332] font-semibold hover:underline">← Volver al inicio</a>
        </div>
      </div>
    </div>
  );
}
