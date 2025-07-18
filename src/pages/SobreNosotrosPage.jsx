import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap'; // Importa componentes de React-Bootstrap si los usas para estilos

const AboutUsPage = () => {
  return (
    <Container className="my-5"> {/* 'my-5' añade margen superior e inferior */}
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="p-4 shadow-sm">
            <Card.Body>
              <h1 className="text-center mb-4">SOBRE NOSOTROS</h1>
              <p className="lead text-center mb-5">
                Transformamos herramientas cotidianas en soluciones digitales de alto impacto.
              </p>

              <p>
                AECBlock es una plataforma creada por y para profesionales de la Arquitectura, Ingeniería y Construcción. Aquí reunimos herramientas desarrolladas por especialistas del sector: scripts, modelos 3D, plantillas de cálculo, automatizaciones y recursos que nacieron del trabajo diario y ahora están disponibles para potenciar tu productividad.
              </p>
              <p>
                No vendemos productos genéricos: curamos, revisamos y validamos cada archivo para asegurar su utilidad técnica. Nuestro compromiso es democratizar el acceso a soluciones inteligentes, creadas por profesionales que conocen de primera mano los retos del entorno AEC.
              </p>
              <p>
                Impulsamos una comunidad técnica global que comparte conocimiento aplicado, eleva estándares de calidad y acelera la transformación digital en cada etapa del proyecto constructivo.
              </p>
              <p className="text-center mt-4 lead fw-bold">
                🎯 Profesional. Confiable. Hecho por expertos, para expertos.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutUsPage;