import React, { useState } from 'react'
import { Product, ProductCreate } from '../types'
import { inventoryService } from '../services/api'

interface ProductFormProps {
  onSuccess: () => void
  onCancel: () => void
  initialData?: Product
}

const ProductForm: React.FC<ProductFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const [formData, setFormData] = useState<ProductCreate>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    purchase_price: initialData?.purchase_price || 0,
    sale_price: initialData?.sale_price || 0,
    stock: initialData?.stock || 0,
    category: initialData?.category || 'Medicine',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await inventoryService.update(initialData.id, formData);
      } else {
        await inventoryService.create(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="form-group">
        <label>Nombre del Producto</label>
        <input
          type="text"
          placeholder="Ej: Amoxicilina 500mg"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label>Descripción</label>
        <textarea
          placeholder="Descripción del producto..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Precio Compra</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.purchase_price}
            onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) })}
            required
          />
        </div>
        <div className="form-group">
          <label>Precio Venta</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.sale_price}
            onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) })}
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Stock Inicial</label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
            required
          />
        </div>
        <div className="form-group">
          <label>Categoría</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="Medicine">Medicamento</option>
            <option value="Food">Alimento</option>
            <option value="Supply">Suministro</option>
            <option value="Accessory">Accesorio</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <button
          type="button"
          onClick={onCancel}
          className="btn"
          style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn"
          style={{ flex: 1, background: 'var(--primary)', color: 'white' }}
        >
          {loading ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Crear Producto'}
        </button>
      </div>
    </form>
  )
}

export default ProductForm
