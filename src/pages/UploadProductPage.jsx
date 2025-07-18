// src/pages/UploadProductPage.jsx
import React, { useState } from 'react';
import { countries } from 'countries-list';
import { createProduct } from '../services/productService'; // Asegúrate de que esta importación sea correcta
import '../styles/UploadProductPage.css';

const CATEGORY_OPTIONS = [
  'BIM Data',
  'Herramientas Pro',
  'Recursos Visuales',
  'Guías / Documentos',
  'Plugins / Scripts',
];
const SPECIALTY_OPTIONS = [
  'Arquitectura',
  'Estructuras',
  'Geotecnia',
  'Pavimentos',
  'MEP',
  'Construcción General',
];

const blank = {
  nombre: '',
  descripcionProd: '',
  precioIndividual: '',
  pais: '',
  fotografiaProd: null,
  archivosAut: [],      // varios archivos
};

export default function UploadProductPage() {
  const [form, setForm]                 = useState(blank);
  const [selectedCategories, setCats]   = useState([]);
  const [selectedSpecialties, setSpecs] = useState([]);
  const [previewSrc, setPreview]        = useState('');
  const [errors, setErrors]             = useState({});
  const [msg, setMsg]                   = useState(null);
  const [loading, setLoading]           = useState(false);

  const toggle = (arr, v) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  const text = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(e => ({ ...e, [name]: undefined }));
  };

  const file = field => e => {
    if (field === 'archivosAut') {
      // concatenar nuevos archivos sobre los ya seleccionados
      const nuevos = Array.from(e.target.files);
      setForm(p => ({
        ...p,
        archivosAut: [...p.archivosAut, ...nuevos]
      }));
      setErrors(p => ({ ...p, archivosAut: undefined }));
      return;
    }
    // único (foto)
    const single = e.target.files[0];
    setForm(p => ({ ...p, [field]: single }));
    setErrors(p => ({ ...e, [field]: undefined })); // Corregido: antes era setErrors(p => ({ ...p, [field]: undefined }));
    if (field === 'fotografiaProd' && single) {
      const reader = new FileReader();
      reader.onload = ev => setPreview(ev.target.result);
      reader.readAsDataURL(single);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim())                 e.nombre = 'Ingrese nombre';
    if (!form.descripcionProd.trim())        e.descripcionProd = 'Ingrese descripción';
    if (!form.precioIndividual || +form.precioIndividual <= 0)
                                             e.precioIndividual = 'Precio > 0';
    if (selectedCategories.length === 0)     e.categorias = 'Seleccione al menos 1 categoría';
    if (selectedSpecialties.length === 0)    e.especialidades = 'Seleccione al menos 1 especialidad';
    if (!form.pais)                          e.pais = 'Seleccione país';
    if (!form.fotografiaProd)                e.fotografiaProd = 'Suba una foto';
    if (form.archivosAut.length === 0)       e.archivosAut = 'Suba al menos 1 archivo';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      nombre:           form.nombre,
      descripcionProd:  form.descripcionProd,
      precioIndividual: parseFloat(form.precioIndividual),
      pais:             form.pais,
      categorias:       selectedCategories,
      especialidades:   selectedSpecialties,
    };

    const fd = new FormData();
    // AHORA: El nombre de la parte del DTO coincide con lo que el backend espera ("dto")
    fd.append('dto', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    
    // El nombre de la parte de la foto coincide ("foto")
    fd.append('foto', form.fotografiaProd);
    
    // AHORA: El nombre de la parte de los archivos autorizados coincide ("archivosAut")
    form.archivosAut.forEach(f => fd.append('archivosAut', f));

    try {
      setLoading(true);
      // YA NO se pasa el token directamente a createProduct
      await createProduct(fd); 
      setMsg({ ok: true, txt: 'Producto enviado para revisión.' });
      // Restablece el formulario a su estado inicial
      setForm(blank);
      setCats([]); 
      setSpecs([]); 
      setPreview('');
    } catch (error) {
      console.error("Error al subir producto:", error);
      // Puedes refinar el mensaje de error aquí si el backend envía detalles útiles
      setMsg({ ok: false, txt: 'Error al subir producto. Verifique la consola para más detalles.' });
    } finally { 
      setLoading(false); 
    }
  };

  const Error = k => errors[k] && <div className="text-danger small mt-1">{errors[k]}</div>;

  return (
    <div className="container my-5">
      <div className="card shadow-sm border-0">
        <div className="card-body p-5">
          <h2 className="text-center fw-bold mb-4">
            SUBIR <span style={{ color:'#FF00FF' }}>PRODUCTO</span>
          </h2>
          {msg && (
            <div className={`alert ${msg.ok ? 'alert-success' : 'alert-danger'}`}>
              {msg.txt}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* Nombre y precio */}
              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input name="nombre" className="form-control" value={form.nombre} onChange={text} />
                {Error('nombre')}
              </div>
              <div className="col-md-6">
                <label className="form-label">Precio ($)</label>
                <input name="precioIndividual" type="number" step="0.01"
                  className="form-control" value={form.precioIndividual} onChange={text} />
                {Error('precioIndividual')}
              </div>

              {/* Categorías */}
              <div className="col-12">
                <label className="form-label">Categorías</label>
                <div className="d-flex flex-wrap gap-3">
                  {CATEGORY_OPTIONS.map(cat => (
                    <div className="form-check" key={cat}>
                      <input type="checkbox" className="form-check-input"
                        id={`cat-${cat}`} checked={selectedCategories.includes(cat)}
                        onChange={() => setCats(c => toggle(c, cat))}/>
                      <label htmlFor={`cat-${cat}`} className="form-check-label">{cat}</label>
                    </div>
                  ))}
                </div>
                {Error('categorias')}
              </div>

              {/* Especialidades */}
              <div className="col-12">
                <label className="form-label">Especialidades</label>
                <div className="d-flex flex-wrap gap-3">
                  {SPECIALTY_OPTIONS.map(sp => (
                    <div className="form-check" key={sp}>
                      <input type="checkbox" className="form-check-input"
                        id={`sp-${sp}`} checked={selectedSpecialties.includes(sp)}
                        onChange={() => setSpecs(s => toggle(s, sp))}/>
                      <label htmlFor={`sp-${sp}`} className="form-check-label">{sp}</label>
                    </div>
                  ))}
                </div>
                {Error('especialidades')}
              </div>

              {/* País */}
              <div className="col-md-6">
                <label className="form-label">País</label>
                <select name="pais" className="form-select" value={form.pais} onChange={text}>
                  <option value="">Seleccione país</option>
                  {Object.keys(countries).map(c => (
                    <option key={c} value={countries[c].name}>{countries[c].name}</option>
                  ))}
                </select>
                {Error('pais')}
              </div>

              {/* Descripción */}
              <div className="col-12">
                <label className="form-label">Descripción</label>
                <textarea name="descripcionProd" rows="4"
                          className="form-control"
                          value={form.descripcionProd} onChange={text}/>
                {Error('descripcionProd')}
              </div>

              {/* Foto */}
              <div className="col-md-6">
                <label className="form-label">Fotografía *</label>
                <input type="file" accept="image/*"
                       className="form-control" onChange={file('fotografiaProd')} />
                {Error('fotografiaProd')}
                {previewSrc && 
                <img
                  src={previewSrc}
                  alt="Vista previa del producto"
                  className="img-fluid mt-2 rounded"
                  style={{ maxHeight: 200 }}
                />}
              </div>

              {/* Archivos */}
              <div className="col-md-6">
                <label className="form-label">Archivo(s) del Producto *</label>
                <input
                  type="file"
                  multiple
                  className="form-control"
                  onChange={file('archivosAut')}
                />
                {Error('archivosAut')}
                {form.archivosAut.map((f, idx) => (
                  <li
                    key={idx}
                    className="list-group-item d-flex justify-content-between align-items-center py-2"
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

              </div>
            </div>

            <div className="text-center mt-4">
              <button type="submit" className="btn btn-primary px-5 py-2" disabled={loading}>
                {loading ? 'Subiendo…' : 'Enviar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}