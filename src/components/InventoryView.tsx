import React, { useEffect, useState } from 'react'
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { inventoryService } from '../services/api'
import { Product } from '../types'
import Modal from './Modal'
import ProductForm from './ProductForm'

const InventoryView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

  const fetchProducts = async () => {
    try {
      const data = await inventoryService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateSuccess = () => {
    setIsModalOpen(false);
    setSelectedProduct(undefined);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await inventoryService.delete(id);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="dashboard-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ overflowY: 'auto' }}>
      <div className="header-row">
        <div className="greetings">
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Inventario</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Gestiona tus medicamentos y suministros</p>
        </div>
        <div className="search-bar">
          <Search size={18} color="#7c7c7c" />
          <input 
            type="text" 
            placeholder="Buscar producto o categoría..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          className="btn" 
          onClick={() => { setSelectedProduct(undefined); setIsModalOpen(true); }}
          style={{ 
            background: 'var(--primary)', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            border: 'none', 
            borderRadius: '12px', 
            padding: '10px 20px', 
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          <Plus size={18} />
          Nuevo Producto
        </button>
      </div>

      <div className="stats-cards-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card-main">
          <p style={{ fontSize: '14px', color: '#a0a0a0' }}>Productos Totales</p>
          <h4 style={{ fontSize: '28px', margin: '10px 0' }}>{products.length}</h4>
          <div className="card-footer">
            <TrendingUp size={14} color="#4caf50" />
            <p style={{ fontSize: '12px', color: '#a0a0a0', marginLeft: '5px' }}>Stock activo</p>
          </div>
        </div>
        <div className="stat-card-main light">
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Bajo Stock</p>
          <h4 style={{ fontSize: '28px', margin: '10px 0', color: 'var(--error)' }}>
            {products.filter(p => p.stock < 5).length}
          </h4>
          <div className="card-footer">
            <AlertTriangle size={14} color="var(--error)" />
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '5px' }}>Requieren atención</p>
          </div>
        </div>
      </div>

      <div className="section-card" style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>
              <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Producto</th>
              <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Categoría</th>
              <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Stock</th>
              <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Precio Venta</th>
              <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id} style={{ borderBottom: '1px solid #f8f8f8' }}>
                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 600 }}>{product.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{product.description}</div>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    background: '#f0f4ff', 
                    color: 'var(--primary)',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {product.category}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    fontWeight: 700,
                    color: product.stock < 5 ? 'var(--error)' : 'inherit'
                  }}>
                    {product.stock}
                  </span>
                </td>
                <td style={{ padding: '12px', fontWeight: 600 }}>
                  ${product.sale_price.toFixed(2)}
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => { setSelectedProduct(product); setIsModalOpen(true); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <ProductForm 
          onSuccess={handleCreateSuccess} 
          onCancel={() => setIsModalOpen(false)} 
          initialData={selectedProduct}
        />
      </Modal>
    </div>
  )
}

export default InventoryView
