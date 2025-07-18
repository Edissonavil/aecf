// src/pages/PrivacyPolicyPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/PrivacyPolicyPage.css'; // Asegúrate de vincular este CSS

const PrivacyPolicyPage = () => (
  <div className="privacy-wrapper font-inter">
    <div className="privacy-container">
      <h1>Política de Privacidad</h1>

      <section className="privacy-section">
        <p className="privacy-paragraph">
          En AECBlock valoramos y respetamos tu privacidad. Al registrarte en nuestra plataforma, aceptas que recopilemos y utilicemos tu información personal exclusivamente para los fines relacionados con la operación del sitio, la gestión de tu cuenta, la entrega de productos digitales adquiridos, el soporte técnico y la mejora de nuestros servicios.
        </p>
      </section>

      <section className="privacy-section">
        <h2 className="privacy-heading">Información que Recopilamos</h2>
        <p className="privacy-paragraph">
          La información que recopilamos incluye, pero no se limita a, tu nombre, dirección de correo electrónico, historial de compras y datos de navegación en el sitio. Nos comprometemos a no vender, alquilar ni divulgar tu información personal a terceros sin tu consentimiento, salvo que sea requerido por ley o por orden judicial.
        </p>
      </section>

      <section className="privacy-section">
        <h2 className="privacy-heading">Protección de Datos</h2>
        <p className="privacy-paragraph">
          Adoptamos medidas de seguridad administrativas, técnicas y físicas razonables para proteger tus datos contra pérdida, acceso no autorizado, alteración o divulgación. Tienes derecho a acceder, modificar o eliminar tus datos personales en cualquier momento, solicitándolo a través de nuestros canales de contacto.
        </p>
      </section>

      <section className="privacy-section">
        <p className="privacy-paragraph">
          Al continuar utilizando nuestros servicios, confirmas que comprendes y aceptas esta política de privacidad como parte integral de los presentes Términos y Condiciones.
        </p>
      </section>
            
      <div className="privacy-footer">
        <p>Última actualización: 3 de julio de 2025</p>
        <Link to="/register" className="btn-back">Volver al Registro</Link>
      </div>
    </div>
  </div>
);

export default PrivacyPolicyPage;