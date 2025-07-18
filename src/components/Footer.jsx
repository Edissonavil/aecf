import React from 'react';
import '../styles/Layout.css';


const Footer = () => (
  <footer className="footer">
    <div className="layout-container footer__inner">
      <div className="footer__section">
        <h3 className="footer__title">AEC<span className="highlight">Block</span></h3>
        <p className="footer__text">Transformando la construcción con tecnología.</p>
      </div>
      <div className="footer__section">
        <h4 className="footer__subtitle">Explorar</h4>
        <ul className="footer__list">
          <li><a href="/catalog" className="footer__link">Catálogo</a></li>
          <li><a href="/catalog" className="footer__link">Nuevos Lanzamientos</a></li>
          <li><a href="/catalog" className="footer__link">Más Populares</a></li>
        </ul>
      </div>
      <div className="footer__section">
        <h4 className="footer__subtitle">Compañía</h4>
        <ul className="footer__list">
          <li><a href="/nosotros" className="footer__link">Sobre Nosotros</a></li>
          <li><a href="/contact" className="footer__link">Contacto</a></li>
        </ul>
      </div>
      <div className="footer__section">
        <h4 className="footer__subtitle">Legal</h4>
        <ul className="footer__list">
          <li><a href="/terminos" className="footer__link">Términos y Condiciones</a></li>
          <li><a href="/privacy-policy" className="footer__link">Política de Privacidad</a></li>
        </ul>
      </div>
    </div>
    <div className="footer__bottom">
      <p>&copy; {new Date().getFullYear()} AECBlock Todos los derechos reservados.</p>
    </div>
  </footer>
);

export default Footer;
