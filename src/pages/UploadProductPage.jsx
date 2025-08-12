// src/pages/UploadProductPage.jsx
import React, { useState } from 'react';
import { countries } from 'countries-list';
import { createProduct } from '../services/productService';
import '../styles/UploadProductPage.css';

const CATEGORY_OPTIONS = [
  'BIM Data',
  'Herramientas Pro',
  'Recursos Visuales',
  'Guías / Documentos',
  'Plugins / Scripts',
  'Otros'
];
const SPECIALTY_OPTIONS = [
  'Arquitectura',
  'Estructuras',
  'Geotecnia',
  'Pavimentos',
  'Hidrosanitaria',
  'Hidráulica',
  'Vialidad / Transporte',
  'Construcción y Obra',
  'BIM & Coordinación',
  'Instalaciones MEP',
  'Ingeniería Eléctrica',
  'Telecomunicaciones / ICT',
  'Ambiental / Sostenibilidad',
  'Topografía & GIS',
  'Otros'
];

const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_FILE_SIZE_MB = 200; // Límite de tamaño por archivo en MB
const MAX_PHOTO_SIZE_MB = 10;  // Límite de tamaño para la foto en MB

const blank = {
  nombre: '',
  descripcionProd: '',
  precioIndividual: '',
  pais: '',
  fotografiaProd: [],
  archivosAut: [],
};

export default function UploadProductPage() {
  const [form, setForm] = useState(blank);
  const [selectedCategories, setCats] = useState([]);
  const [selectedSpecialties, setSpecs] = useState([]);
  const [previewSrc, setPreview] = useState([]);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggle = (arr, v) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  const text = e => {
    const { name, value } = e.target;
    // Limitar la descripción al máximo de caracteres
    const newValue = name === 'descripcionProd' ? value.slice(0, MAX_DESCRIPTION_LENGTH) : value;
    setForm(f => ({ ...f, [name]: newValue }));
    setErrors(e => ({ ...e, [name]: undefined }));
  };

  const file = field => e => {
    // Implementación de limitación de tamaño de archivo
    if (field === 'archivosAut') {
      const nuevos = Array.from(e.target.files);
      const archivosValidos = nuevos.filter(f => {
        if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          alert(`El archivo ${f.name} supera el tamaño máximo de ${MAX_FILE_SIZE_MB} MB.`);
          return false;
        }
        return true;
      });
      setForm(p => ({
        ...p,
        archivosAut: [...p.archivosAut, ...archivosValidos]
      }));
      setErrors(p => ({ ...p, archivosAut: undefined }));
      return;
    }
    // Múltiples (fotos)
    const incoming = Array.from(e.target.files || []);
    const validas = [];
    for (const img of incoming) {
      if (img.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
        alert(`La imagen ${img.name} supera el tamaño máximo de ${MAX_PHOTO_SIZE_MB} MB.`);
      } else {
        validas.push(img);
      }
    }

    // acumular en fotografiaProd (permite seleccionar en varias tandas)
    setForm(p => ({
      ...p,
      fotografiaProd: [...(p.fotografiaProd || []), ...validas],
    }));

    // limpiar errores del campo
    setErrors(p => ({ ...p, fotografiaProd: undefined }));

    // generar previews para cada nueva imagen
    validas.forEach(v => {
      const reader = new FileReader();
      reader.onload = ev => {
        setPreview(prev => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(v);
    });
  };



  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Ingresa el nombre de tu recurso';
    if (!form.descripcionProd.trim()) e.descripcionProd = 'Ingresa una descripción';
    if (!form.precioIndividual || parseFloat(form.precioIndividual) <= 0 || parseFloat(form.precioIndividual) > 99) {
      e.precioIndividual = 'El precio debe estar entre $1 y $99';
    }
    if (selectedCategories.length === 0) e.categorias = 'Selecciona al menos 1 categoría';
    if (selectedSpecialties.length === 0) e.especialidades = 'Selecciona al menos 1 especialidad';
    if (!form.pais) e.pais = 'Selecciona un país';
    if (form.fotografiaProd.length === 0) e.fotografiaProd = 'Sube al menos 1 imagen';
    if (form.archivosAut.length === 0) e.archivosAut = 'Sube al menos 1 archivo';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      nombre: form.nombre,
      descripcionProd: form.descripcionProd,
      precioIndividual: parseFloat(form.precioIndividual),
      pais: form.pais,
      categorias: selectedCategories,
      especialidades: selectedSpecialties,
    };

    const fd = new FormData();
    fd.append('dto', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    if (form.fotografiaProd[0]) {
      fd.append('foto', form.fotografiaProd[0]);
    }

    form.fotografiaProd.forEach(f => fd.append('fotos', f));

    form.archivosAut.forEach(f => fd.append('archivosAut', f));

    try {
      setLoading(true);
      await createProduct(fd);
      setMsg({ ok: true, txt: '¡Tu recurso fue enviado! Nuestro equipo lo revisará y te notificará pronto por correo electrónico.' });
      setForm(blank);
      setCats([]);
      setSpecs([]);
      setPreview([]);
    } catch (error) {
      console.error("Error al subir recurso:", error);
      setMsg({ ok: false, txt: 'Error al subir el recurso. Por favor, inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const Error = k => errors[k] && <div className="text-danger small mt-1">{errors[k]}</div>;

  return (
    <div className="container my-5">
      <div className="card shadow-sm border-0">
        <div className="card-body p-5">
          <h2 className="text-center fw-bold mb-2">
            PUBLICA TU RECURSO
          </h2>
          <p className="text-center mb-4 text-muted">
            Completa este formulario y pon tu recurso AEC a disposición de la comunidad en minutos.
          </p>
          {msg && (
            <div className={`alert ${msg.ok ? 'alert-success' : 'alert-danger'}`}>
              {msg.txt}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* Nombre y precio */}
              <div className="col-md-6">
                <label className="form-label">Nombre del Recurso</label>
                <input
                  name="nombre"
                  className="form-control"
                  value={form.nombre}
                  onChange={text}
                  placeholder="Ej: Plantilla de Revit para diseño estructural"
                />
                {Error('nombre')}
              </div>
              <div className="col-md-6">
                <label className="form-label">Precio ($)</label>
                <input
                  name="precioIndividual"
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={form.precioIndividual}
                  onChange={text}
                  placeholder="Establece un precio. Puedes actualizarlo luego."
                />
                {Error('precioIndividual')}
              </div>
            </div>

            <hr className="my-4" /> {/* Divisor visual */}

            {/* Categorías */}
            <div className="col-12 category-checkbox">
              <label className="form-label">Categorías</label>
              <div className="d-flex flex-wrap gap-3">
                {CATEGORY_OPTIONS.map(cat => (
                  <div className="form-check" key={cat}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`cat-${cat}`}
                      checked={selectedCategories.includes(cat)}
                      onChange={() => setCats(c => toggle(c, cat))}
                    />
                    <label htmlFor={`cat-${cat}`} className="form-check-label">{cat}</label>
                  </div>
                ))}
              </div>
              {Error('categorias')}
            </div>

            {/* Especialidades */}
            <div className="col-12 specialty-checkbox">
              <label className="form-label">Especialidades</label>
              <div className="d-flex flex-wrap gap-3">
                {SPECIALTY_OPTIONS.map(sp => (
                  <div className="form-check" key={sp}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`sp-${sp}`}
                      checked={selectedSpecialties.includes(sp)}
                      onChange={() => setSpecs(s => toggle(s, sp))}
                    />
                    <label htmlFor={`sp-${sp}`} className="form-check-label">{sp}</label>
                  </div>
                ))}
              </div>
              {Error('especialidades')}
            </div>

            <hr className="my-4" /> {/* Divisor visual */}

            {/* Descripción */}
            <div className="col-12">
              <label className="form-label">Descripción</label>
              <textarea
                name="descripcionProd"
                rows="4"
                className="form-control"
                value={form.descripcionProd}
                onChange={text}
                maxLength={MAX_DESCRIPTION_LENGTH}
                placeholder="Explica qué resuelve tu recurso, para quién está pensado y cómo se usa. Máximo 2000 caracteres."
              />
              <div className="text-end text-muted small mt-1">
                {form.descripcionProd.length}/{MAX_DESCRIPTION_LENGTH}
              </div>
              {Error('descripcionProd')}
            </div>

            <hr className="my-4" /> {/* Divisor visual */}

            <div className="row g-4">
              {/* País */}
              <div className="col-md-6">
                <label className="form-label">País</label>
                <select name="pais" className="form-select" value={form.pais} onChange={text}>
                  <option value="">Selecciona tu país</option>
                  {Object.keys(countries).map(c => (
                    <option key={c} value={countries[c].name}>{countries[c].name}</option>
                  ))}
                </select>
                {Error('pais')}
              </div>

              {/* Imágenes */}
              <div className="col-md-6">
                <label className="form-label">Imágenes de Portada. </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="form-control"
                  onChange={file('fotografiaProd')}
                />
                <small className="form-text text-muted">
                  Tamaño máximo por imagen: {MAX_PHOTO_SIZE_MB} MB.
                </small>
                {Error('fotografiaProd')}

                {previewSrc.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {previewSrc.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`Vista previa ${i + 1}`}
                        className="rounded"
                        style={{ maxHeight: 120 }}
                      />
                    ))}
                  </div>
                )}

                {/* Lista de imágenes seleccionadas con botón para quitar */}
                {form.fotografiaProd.length > 0 && (
                  <ul className="list-group mt-2">
                    {form.fotografiaProd.map((f, idx) => (
                      <li
                        key={idx}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <i className="bi bi-image me-2" />
                          {f.name}
                        </div>
                        <span className="badge bg-secondary">
                          {(f.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            // quitar imagen y su preview en el mismo índice
                            setForm(prev => ({
                              ...prev,
                              fotografiaProd: prev.fotografiaProd.filter((_, j) => j !== idx)
                            }));
                            setPreview(prev => prev.filter((_, j) => j !== idx));
                          }}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>


              {/* Archivos */}
              <div className="col-12">
                <label className="form-label">Archivo(s) del Producto *</label>
                <input
                  type="file"
                  multiple
                  className="form-control"
                  onChange={file('archivosAut')}
                />
                <small className="form-text text-muted">
                  Tamaño máximo por archivo: {MAX_FILE_SIZE_MB} MB.
                </small>
                <small className="form-text text-muted">
                  Si subes fotos de tu recurso, súbelas en el campo de imágenes o si es para venta, en el campo de archivos en formato pdf.
                </small>
                {Error('archivosAut')}
                <ul className="list-group mt-2">
                  {form.archivosAut.map((f, idx) => (
                    <li
                      key={idx}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <i className="bi bi-file-earmark-fill me-2" />
                        {f.name}
                      </div>
                      <span className="badge bg-secondary">
                        {(f.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          setForm(prev => ({
                            ...prev,
                            archivosAut: prev.archivosAut.filter((_, j) => j !== idx)
                          }))
                        }
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <hr className="my-4" /> {/* Divisor visual */}

            <div className="text-center mt-4">
              <button type="submit" className="btn btn-primary px-5 py-2" disabled={loading}>
                {loading ? 'Publicando…' : 'Publicar Recurso'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
