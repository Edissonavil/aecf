import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/TermsPage.css'; // Asegúrate de que este archivo CSS existe y está vinculado correctamente

const TermsPage = () => (
  <div className="terms-wrapper font-inter">
    <div className="terms-container">
      <h1>Términos y Condiciones de Uso de AECBlock</h1>

      <section className="terms-section">
        <h2 className="terms-heading">1. Introducción</h2>
        <p className="terms-paragraph">Bienvenido a AECBlock, una plataforma digital ecuatoriana dedicada a la comercialización de productos digitales para arquitectura, ingeniería y construcción. Al acceder o utilizar este sitio web, aceptas cumplir con estos Términos y Condiciones. Si no estás de acuerdo, te recomendamos no utilizar nuestros servicios.</p>
      </section>

      <section className="terms-section">
        <h2 className="terms-heading">2. Registro y uso de la cuenta</h2>
        <p className="terms-paragraph">Para adquirir productos en nuestra plataforma, debes crear una cuenta proporcionando información veraz y actualizada.</p>
        <ul className="terms-list">
          <li>Debes ser mayor de 18 años.</li>
          <li>Eres responsable de mantener la confidencialidad de tu cuenta.</li>
          <li>No está permitido compartir tu cuenta con terceros.</li>
          <li>Nos reservamos el derecho de suspender o eliminar cuentas que infrinjan estos Términos.</li>
        </ul>
      </section>

      <section className="terms-section">
        <h2 className="terms-heading">3. Proceso de compra y entrega de productos</h2>
        <p className="terms-paragraph">Las compras se realizan mediante pasarelas de pago seguras. El acceso al producto será inmediato o según se indique en la descripción del producto.</p>
      </section>

      <section className="terms-section">
        <h2 className="terms-heading">4. Licencia de uso de los productos</h2>
        <p className="terms-paragraph">La compra otorga al usuario una licencia de uso no exclusiva, intransferible y limitada, salvo disposición contraria en el detalle del producto. Queda prohibida su reventa, redistribución o modificación sin autorización previa por escrito.</p>
      </section>

      <section className="terms-section">
        <h2 className="terms-heading">5. Política de devoluciones y reembolsos</h2>
        <p className="terms-paragraph">No se realizan devoluciones ni reembolsos, salvo error técnico demostrable en el producto digital adquirido.</p>
      </section>

      <section className="terms-section">
        <h2 className="terms-heading">6. Obligaciones del usuario</h2>
        <p className="terms-paragraph">El usuario se compromete a utilizar los productos adquiridos solo para los fines permitidos y a no realizar actos que puedan dañar, inutilizar o sobrecargar el sitio web.</p>
      </section>

      <section className="terms-section">
        <h2 className="terms-heading">7. Propiedad intelectual</h2>
        <p className="terms-paragraph">Todos los productos, marcas y contenidos del sitio están protegidos por derechos de propiedad intelectual. El usuario reconoce que los derechos no se transfieren con la compra, solo se concede una licencia limitada de uso.</p>
      </section>

      <section className="terms-section">
        <h2 className="terms-heading">8. Contenido del usuario (comentarios y reseñas)</h2>
        <p className="terms-paragraph">Los comentarios publicados deben ser respetuosos y verídicos. AECBlock podrá usar dichos contenidos para fines promocionales.</p>
      </section>

      <section className="terms-section">
        <h2 className="terms-heading">9. Política de privacidad</h2>
        <p className="terms-paragraph">Tu privacidad es importante para nosotros. Nuestra política de privacidad, que describe cómo recopilamos, usamos y protegemos tu información personal, está incorporada a estos términos por referencia. Por favor, revísala.</p>
      </section>

      <section className="terms-section">
        <h2 className="terms-heading">10. Limitación de responsabilidad</h2>
        <p className="terms-paragraph">AECBlock no garantiza que el sitio estará siempre disponible o libre de errores. No somos responsables por daños derivados del uso o imposibilidad de uso del sitio o de los productos adquiridos.</p>
      </section>

      <section className="terms-section">
        <h2 className="terms-heading">11. Modificaciones del sitio o los Términos</h2>
        <p className="terms-paragraph">AECBlock se reserva el derecho de actualizar estos términos en cualquier momento. Las modificaciones serán efectivas tras su publicación en el sitio web. El uso continuado del sitio implica la aceptación de los cambios.</p>
      </section>

      <section className="terms-section">
        <h2 className="terms-heading">12. Legislación aplicable y jurisdicción</h2>
        <p className="terms-paragraph">Estos Términos se rigen por la legislación ecuatoriana. Cualquier controversia será sometida a los jueces competentes de la ciudad de Cuenca, Ecuador.</p>
      </section>
            
      <div className="terms-footer">
        <p>Última actualización: 09 de julio de 2025</p>
        {/* Cambia el enlace a '/register' si es donde está tu formulario de registro */}
        <Link to="/register" className="btn-back">Volver al Registro</Link>
      </div>
    </div>
  </div>
);

export default TermsPage;