export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold font-heading text-[#1B4332] mb-2">Política de Privacidad</h1>
        <p className="text-sm text-gray-400 mb-10">Yacita · Última actualización: julio de 2025</p>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">1. Responsable del tratamiento</h2>
          <p className="text-gray-600 text-sm leading-relaxed">El responsable del tratamiento de sus datos personales es Yacita, con domicilio a efectos de comunicaciones en <a href="mailto:hola@yacita.es" className="text-[#1B4332] underline">hola@yacita.es</a>.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">2. Datos que recopilamos</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">Recopilamos los siguientes datos personales:</p>
          <ul className="list-disc list-inside text-gray-600 text-sm leading-relaxed space-y-1">
            <li>De las clínicas y profesionales: nombre, correo electrónico, contraseña (cifrada), nombre del centro, dirección, descripción y servicios ofrecidos.</li>
            <li>De los pacientes: nombre y teléfono de contacto, facilitados voluntariamente al realizar una reserva.</li>
            <li>Datos de uso: información sobre cómo interactúa con la plataforma.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">3. Finalidad del tratamiento</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Sus datos se utilizan para gestionar el registro y acceso de clínicas y profesionales, facilitar la reserva de citas entre pacientes y profesionales, enviar comunicaciones relacionadas con el servicio y mejorar la plataforma.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">4. Base jurídica</h2>
          <p className="text-gray-600 text-sm leading-relaxed">El tratamiento se basa en la ejecución del contrato de prestación de servicios aceptado al registrarse, el consentimiento expreso otorgado al aceptar esta política, y el interés legítimo de Yacita en mejorar sus servicios.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">5. Conservación de los datos</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Conservamos sus datos mientras mantenga una cuenta activa. Una vez eliminada la cuenta, los datos serán suprimidos en un plazo máximo de 30 días, salvo que la ley exija su conservación por un período mayor.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">6. Destinatarios</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">Sus datos no serán cedidos a terceros salvo obligación legal. Utilizamos los siguientes proveedores bajo garantías del RGPD:</p>
          <ul className="list-disc list-inside text-gray-600 text-sm leading-relaxed space-y-1">
            <li>Supabase Inc. (base de datos y autenticación) — Estados Unidos, bajo cláusulas contractuales tipo.</li>
            <li>Stripe Inc. (procesamiento de pagos) — Estados Unidos, bajo cláusulas contractuales tipo.</li>
            <li>Railway Technologies Inc. (alojamiento de la API) — Estados Unidos, bajo cláusulas contractuales tipo.</li>
            <li>Netlify Inc. (alojamiento de la web) — Estados Unidos, bajo cláusulas contractuales tipo.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">7. Derechos del interesado</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">Puede ejercer los siguientes derechos enviando un correo a <a href="mailto:hola@yacita.es" className="text-[#1B4332] underline">hola@yacita.es</a>:</p>
          <ul className="list-disc list-inside text-gray-600 text-sm leading-relaxed space-y-1">
            <li>Acceso: conocer qué datos tenemos sobre usted.</li>
            <li>Rectificación: corregir datos inexactos.</li>
            <li>Supresión: solicitar la eliminación de sus datos.</li>
            <li>Oposición y limitación: oponerse al tratamiento o limitarlo.</li>
            <li>Portabilidad: recibir sus datos en formato estructurado.</li>
          </ul>
          <p className="text-gray-600 text-sm leading-relaxed mt-2">Tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" className="text-[#1B4332] underline">www.aepd.es</a>).</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">8. Seguridad</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Aplicamos medidas técnicas y organizativas para proteger sus datos: cifrado en tránsito (HTTPS/TLS), contraseñas almacenadas con hash, acceso restringido a la base de datos y auditorías periódicas.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">9. Cambios en esta política</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Podemos actualizar esta política. Le informaremos de cambios significativos por correo electrónico o mediante un aviso en la plataforma.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1B4332] mb-3">10. Contacto</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Para cualquier consulta relacionada con la privacidad, contáctenos en: <a href="mailto:hola@yacita.es" className="text-[#1B4332] underline">hola@yacita.es</a></p>
        </section>

        <div className="mt-12 pt-6 border-t border-gray-100">
          <a href="/" className="text-sm text-[#1B4332] font-semibold hover:underline">← Volver al inicio</a>
        </div>
      </div>
    </div>
  );
}
