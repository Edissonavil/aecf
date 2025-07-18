// src/pages/TermsAndConditionsPage.jsx
import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/TermsAndConditionsPage.css';

export default function TermsAndConditionsPage() {
  return (
    <Container className="terms-page-container my-5 p-4 bg-white rounded shadow-sm">
      <Link to="/solicitud-creador" className="btn btn-outline-secondary mb-4">
        &larr; Volver a la Solicitud
      </Link>
      <h1 className="text-center mb-4 terms-title">TÉRMINOS Y CONDICIONES PARA CREADORES EN <span className="text-fuchsia-electric">AEC sdh</span></h1>
      <p className="text-end text-muted">Última actualización: 9 de julio de 2025</p>
      
      <h2 className="terms-subtitle">1. Aceptación de los Términos</h2>
      <p>Al registrarse como Especialista en la Plataforma AEC sdh, usted (“el Usuario”) acepta de forma expresa e íntegra estos Términos y Condiciones de Uso, los cuales regulan su participación como proveedor de productos digitales en el e-commerce de AEC sdh.</p>

      <h2 className="terms-subtitle">2. Registro como Especialista</h2>
      <p>a. Para ofrecer productos digitales en la Plataforma, el Usuario deberá completar el proceso de registro como Especialista, proporcionando información veraz y actualizada.</p>
      <p>b. El proceso de aceptación incluye la verificación de identidad, revisión de portafolio y/o experiencia previa, quedando AEC sdh facultada para aceptar o rechazar el registro a su entera discreción.</p>

      <h2 className="terms-subtitle">3. Responsabilidad sobre los Contenidos</h2>
      <p>a. El Especialista declara bajo juramento que todos los productos digitales subidos a la Plataforma son de su exclusiva autoría o que cuenta con los derechos suficientes para su comercialización.</p>
      <p>b. En caso de infracción a derechos de autor u otros derechos de terceros, AEC sdh no será responsable por las consecuencias legales, contractuales o económicas derivadas de la publicación del producto.</p>
      <p>c. El Especialista se obliga a mantener indemne a AEC sdh frente a cualquier reclamo de terceros que se derive de los productos cargados por su cuenta.</p>

      <h2 className="terms-subtitle">4. Evaluación y Curaduría de Productos</h2>
      <p>a. Todo producto digital deberá pasar por una evaluación interna antes de su publicación. Esta revisión validará la calidad técnica, originalidad, viabilidad comercial y cumplimiento de los lineamientos de la Plataforma.</p>
      <p>b. No se permite la autopublicación. Todo producto debe ser aprobado previamente por AEC sdh.</p>
      <p>c. AEC sdh podrá sugerir ajustes y solicitar material complementario (fichas técnicas, imágenes, documentación de uso) previo a la publicación.</p>

      <h2 className="terms-subtitle">5. Licencia de Uso y Promoción</h2>
      <p>a. El Especialista conserva los derechos de autor sobre su producto.</p>
      <p>b. Sin embargo, al subir su producto, otorga a AEC sdh una licencia no exclusiva, mundial y limitada, no transferible, para exhibir, promocionar y comercializar el producto en sus canales digitales.</p>

      <h2 className="terms-subtitle">6. Distribución de Ingresos</h2>
      <p>a. El Especialista recibirá el 50% de las ventas netas de sus productos. El 50% restante será retenido por AEC sdh en concepto de curaduría, operación y marketing.</p>
      <p>b. Estos porcentajes podrán ser modificados en función de acuerdos específicos, especialmente si AEC sdh participa activamente en la mejora, documentación o rediseño del producto.</p>
      <p>c. Los pagos al Especialista se realizarán de forma mensual, previa consolidación de ventas y verificación de transacciones exitosas.</p>

      <h2 className="terms-subtitle">7. Duración y Disponibilidad de los Productos</h2>
      <p>a. Cada producto tendrá una vigencia de hasta 3 años desde su publicación inicial.</p>
      <p>b. AEC sdh podrá solicitar actualizaciones o despublicar productos obsoletos o que no cumplan con los estándares vigentes.</p>

      <h2 className="terms-subtitle">8. Causales de Suspensión o Terminación</h2>
      <p>AEC sdh podrá suspender o cancelar la cuenta del Especialista en caso de:</p>
      <ul>
        <li>Falsedad en la identidad o información registrada.</li>
        <li>Intento de autopublicación sin aprobación.</li>
        <li>Reiteradas infracciones a los lineamientos técnicos.</li>
        <li>Carga de contenido ilegal, inapropiado o que infrinja derechos de terceros.</li>
      </ul>

      <h2 className="terms-subtitle">9. Confidencialidad</h2>
      <p>Ambas partes se comprometen a guardar confidencialidad sobre la información técnica, comercial o estratégica intercambiada, que no sea de dominio público.</p>

      <h2 className="terms-subtitle">10. Limitación de Responsabilidad</h2>
      <p>La Plataforma no garantiza ventas mínimas, ingresos recurrentes ni posicionamiento específico de los productos.</p>

      <h2 className="terms-subtitle">11. Ley Aplicable y Resolución de Conflictos</h2>
      <p>Este acuerdo se regirá por las leyes de la República del Ecuador.</p>
      <p>En caso de controversia derivada de la interpretación, cumplimiento o ejecución de los presentes Términos y Condiciones, las partes se comprometen en primer lugar a intentar una solución amigable mediante negociación directa.</p>
      <p>Si no se llegara a un acuerdo, las partes acuerdan someter la controversia a la jurisdicción de los jueces competentes del cantón Cuenca, provincia del Azuay, con sujeción a la normativa procesal vigente en el Ecuador.</p>

      <h2 className="terms-subtitle">12. Aceptación Electrónica</h2>
      <p>Al hacer clic en 'Acepto los Términos y Condiciones' durante el registro, el Usuario declara haber leído, comprendido y aceptado este acuerdo, el cual tiene plena validez legal.</p>

      <h2 className="terms-subtitle">13. Modificaciones a los Términos</h2>
      <p>AEC sdh se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento, cuando lo considere necesario para reflejar cambios en sus operaciones, en la legislación aplicable, en las funcionalidades de la Plataforma o por cualquier otra razón justificada.</p>
      <p>Cualquier modificación será notificada a los Especialistas a través de los medios habituales de comunicación (correo electrónico registrado o notificación en el perfil del Especialista). Las modificaciones entrarán en vigencia a partir de la fecha indicada en la notificación, y el uso continuado de la Plataforma por parte del Especialista implicará la aceptación de los nuevos términos.</p>
      <p>Si el Especialista no estuviese de acuerdo con las modificaciones, podrá solicitar la baja de su cuenta antes de la fecha de entrada en vigencia. La baja no afectará los derechos ya adquiridos por las partes hasta esa fecha.</p>
    </Container>
  );
}