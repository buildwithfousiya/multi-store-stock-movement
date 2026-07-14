import { useEffect, useState } from 'react';
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

const handle401Error = (err) => {
  if (err.response && err.response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (
      !window.location.pathname.includes('/login') &&
      !window.location.pathname.includes('/register')
    ) {
      window.location.href = '/login';
    }
  }
};

const DashboardPage = ({ user }) => {
  const isAdmin = user?.role === 'admin';
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [stock, setStock] = useState([]);
  const [threshold, setThreshold] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('stock');

  const [newProduct, setNewProduct] = useState({ name: '', sku: '' });
  const [newStore, setNewStore] = useState('');
  const [adjust, setAdjust] = useState({ productId: '', storeId: '', quantity: '' });
  const [transfer, setTransfer] = useState({ productId: '', fromStoreId: '', toStoreId: '', quantity: '' });

  const fetchData = async () => {
    try {
      const headersConfig = getAuthHeaders();
      const [pRes, sRes, kRes] = await Promise.all([
        axios.get(`${apiBaseUrl}/api/products`, headersConfig),
        axios.get(`${apiBaseUrl}/api/stores`, headersConfig),
        axios.get(`${apiBaseUrl}/api/stock`, { ...headersConfig, params: threshold ? { threshold } : {} }),
      ]);
      setProducts(pRes.data.data.products);
      setStores(sRes.data.data.stores);
      setStock(kRes.data.data.stock);
    } catch (err) {
      setError('Failed to load data');
      handle401Error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [threshold]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const validateProduct = (name, sku) => {
    if (!name || !name.trim()) return 'Product Name is required.';
    if (!sku || !sku.trim()) return 'SKU is required.';
    return null;
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    clearMessages();

    const validationError = validateProduct(newProduct.name, newProduct.sku);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await axios.post(`${apiBaseUrl}/api/products`, newProduct, getAuthHeaders());
      setNewProduct({ name: '', sku: '' });
      setSuccess('Product created successfully');
      fetchData();
    } catch (err) {
      setError(err.toString() || 'Failed to create product');
      handle401Error(err);
    }
  };

  const validateStore = (name) => {
    if (!name || !name.trim()) return 'Store Name is required.';
    return null;
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    clearMessages();

    const validationError = validateStore(newStore);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await axios.post(`${apiBaseUrl}/api/stores`, { name: newStore }, getAuthHeaders());
      setNewStore('');
      setSuccess('Store created successfully');
      fetchData();
    } catch (err) {
      setError(err.toString() || 'Failed to create store');
      handle401Error(err);
    }
  };

  const validateAdjustment = (productId, storeId, quantity) => {
    if (!productId) return 'Please select a product.';
    if (!storeId) return 'Please select a store.';
    if (quantity === undefined || quantity === null || String(quantity).trim() === '') {
      return 'Please enter a quantity.';
    }
    const num = Number(quantity);
    if (isNaN(num)) {
      return 'Quantity must be a valid number.';
    }
    if (num === 0) {
      return 'Quantity must be a non-zero positive or negative number.';
    }
    return null;
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    clearMessages();

    const validationError = validateAdjustment(adjust.productId, adjust.storeId, adjust.quantity);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const res = await axios.post(
        `${apiBaseUrl}/api/stock/adjust`,
        { ...adjust, quantity: Number(adjust.quantity) },
        getAuthHeaders()
      );
      const entry = res.data.data.stock;
      setSuccess(`Stock adjusted: ${entry.product.name} at ${entry.store.name} by ${entry.quantity} units`);
      setAdjust({ productId: '', storeId: '', quantity: '' });
      fetchData();
    } catch (err) {
      setError(err.toString() || 'Adjustment failed');
      handle401Error(err);
    }
  };

  const validateTransfer = (productId, fromStoreId, toStoreId, quantity) => {
    if (!productId) return 'Please select a product.';
    if (!fromStoreId) return 'Please select the source store.';
    if (!toStoreId) return 'Please select the destination store.';
    if (fromStoreId === toStoreId) {
      return 'Source and destination store cannot be the same.';
    }
    if (quantity === undefined || quantity === null || String(quantity).trim() === '') {
      return 'Please enter a quantity.';
    }
    const num = Number(quantity);
    if (isNaN(num)) {
      return 'Quantity must be a valid number.';
    }
    if (num <= 0) {
      return 'Quantity must be a positive number greater than zero.';
    }
    return null;
  };

  const handleTransferStock = async (e) => {
    e.preventDefault();
    clearMessages();

    if (transfer.fromStoreId === transfer.toStoreId) {
      setError('Source and destination store cannot be the same');
    }
      const validationError = validateTransfer(
        transfer.productId,
        transfer.fromStoreId,
        transfer.toStoreId,
        transfer.quantity
      );
      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        const res = await axios.post(
          `${apiBaseUrl}/api/stock/transfer`,
          { ...transfer, quantity: Number(transfer.quantity) },
          getAuthHeaders()
        );
        const { from, to } = res.data.data;
        setSuccess(`Transferred ${transfer.quantity} units from ${from.store.name} (${from.quantity}) to ${to.store.name} (${to.quantity})`);
        setTransfer({ productId: '', fromStoreId: '', toStoreId: '', quantity: '' });
        fetchData();
      } catch (err) {
        setError(err.toString() || 'Transfer failed');
        handle401Error(err);
      }
    };

    const stockMatrix = stock.reduce((acc, entry) => {
      const pId = entry.product?._id;
      const sId = entry.store?._id;
      if (!acc[pId]) {
        acc[pId] = {};
      }
      acc[pId][sId] = entry.quantity;
      return acc;
    }, {});

    if (loading) return <div className="page-container"><div className="loading">Loading...</div></div>;

    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p className="page-subtitle">
            {isAdmin ? 'Manage products, stores, and stock levels' : 'Browse products and stock levels'}
          </p>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="tabs">
          <button className={`tab ${activeTab === 'stock' ? 'active' : ''}`} onClick={() => { setActiveTab('stock'); clearMessages(); }}>
            Stock Overview
          </button>
          {isAdmin && (
            <>
              <button className={`tab ${activeTab === 'adjust' ? 'active' : ''}`} onClick={() => { setActiveTab('adjust'); clearMessages(); }}>
                Adjust Stock
              </button>
              <button className={`tab ${activeTab === 'transfer' ? 'active' : ''}`} onClick={() => { setActiveTab('transfer'); clearMessages(); }}>
                Transfer Stock
              </button>
              <button className={`tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => { setActiveTab('products'); clearMessages(); }}>
                Create Product
              </button>
              <button className={`tab ${activeTab === 'stores' ? 'active' : ''}`} onClick={() => { setActiveTab('stores'); clearMessages(); }}>
                Create Store
              </button>
            </>
          )}
        </div>

        {activeTab === 'stock' && (
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h2>Stock Levels by Store</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label htmlFor="threshold-filter" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Low-stock Filter:</label>
                <input
                  id="threshold-filter"
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="Quantity"
                  style={{ width: '120px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                {threshold && <button onClick={() => setThreshold('')} className="btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>Clear</button>}
              </div>
            </div>

            {stores.length === 0 || products.length === 0 ? (
              <div className="empty-state">
                <p>No data yet. {isAdmin ? 'Create some products and stores to get started.' : 'Ask an admin to set up products and stores.'}</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="stock-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      {stores.map((s) => <th key={s._id}>{s.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id}>
                        <td className="product-name">{p.name}</td>
                        <td><span className="sku-badge">{p.sku}</span></td>
                        {stores.map((s) => (
                          <td key={s._id}>
                            <span className="qty-badge">{stockMatrix[p._id]?.[s._id] ?? 0}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'adjust' && isAdmin && (
          <div className="card">
            <h2>Make Adjustment</h2>
            <form onSubmit={handleAdjustStock}>
              <div className="form-group">
                <label htmlFor="adjustProduct">Product</label>
                <select id="adjustProduct" value={adjust.productId} onChange={(e) => setAdjust({ ...adjust, productId: e.target.value })} >
                  <option value="">Select a product</option>
                  {products.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="adjustStore">Store</label>
                <select id="adjustStore" value={adjust.storeId} onChange={(e) => setAdjust({ ...adjust, storeId: e.target.value })} >
                  <option value="">Select a store</option>
                  {stores.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="adjustQuantity">Quantity</label>
                <input id="adjustQuantity" type="number" value={adjust.quantity} onChange={(e) => setAdjust({ ...adjust, quantity: e.target.value })} placeholder="e.g. +50 or -50" />
              </div>
              <button type="submit" className="btn-full">Apply Adjustment</button>
            </form>
          </div>
        )}

        {activeTab === 'transfer' && isAdmin && (
          <div className="card">
            <h2>New Transfer</h2>
            <form onSubmit={handleTransferStock}>
              <div className="form-group">
                <label htmlFor="transferProduct">Product</label>
                <select id="transferProduct" value={transfer.productId} onChange={(e) => setTransfer({ ...transfer, productId: e.target.value })} >
                  <option value="">Select a product</option>
                  {products.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="fromStore">From Store</label>
                <select id="fromStore" value={transfer.fromStoreId} onChange={(e) => setTransfer({ ...transfer, fromStoreId: e.target.value })} >
                  <option value="">Select source store</option>
                  {stores.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="toStore">To Store</label>
                <select id="toStore" value={transfer.toStoreId} onChange={(e) => setTransfer({ ...transfer, toStoreId: e.target.value })} >
                  <option value="">Select destination store</option>
                  {stores.filter((s) => s._id !== transfer.fromStoreId).map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="transferQuantity">Quantity</label>
                <input id="transferQuantity" type="number" value={transfer.quantity} onChange={(e) => setTransfer({ ...transfer, quantity: e.target.value })} placeholder="e.g. 25" />
              </div>
              <button type="submit" className="btn-full">Execute Transfer</button>
            </form>
          </div>
        )}

        {activeTab === 'products' && isAdmin && (
          <div className="card">
            <h2>Create New Product</h2>
            <form onSubmit={handleCreateProduct} className="inline-form">
              <div className="form-group">
                <label htmlFor="productName">Product Name</label>
                <input id="productName" type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="e.g. Wireless Mouse" />
              </div>
              <div className="form-group">
                <label htmlFor="productSku">SKU</label>
                <input id="productSku" type="text" value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} placeholder="e.g. WM-001" />
              </div>
              <button type="submit" className="btn-primary">Create Product</button>
            </form>

            <h3 style={{ marginTop: '2rem' }}>Existing Products</h3>
            <div className="table-responsive">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td><code className="sku-badge">{p.sku}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'stores' && isAdmin && (
          <div className="card">
            <h2>Create New Store</h2>
            <form onSubmit={handleCreateStore} className="inline-form">
              <div className="form-group">
                <label htmlFor="storeName">Store Name</label>
                <input id="storeName" type="text" value={newStore} onChange={(e) => setNewStore(e.target.value)} placeholder="e.g. Downtown Store" />
              </div>
              <button type="submit" className="btn-primary">Create Store</button>
            </form>

            <h3 style={{ marginTop: '2rem' }}>Existing Stores</h3>
            <div className="table-responsive">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((s) => (
                    <tr key={s._id}>
                      <td>{s.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default DashboardPage;
