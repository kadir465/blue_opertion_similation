import React, { useState, useEffect } from 'react';

const DashboardView = () => {
  // Gelen verileri tutacağımız React hafızası
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sayfa açıldığı anda backend'e istek atan bölüm
  useEffect(() => {
    fetch('http://localhost:5000/api/customers')
      .then(response => response.json())
      .then(data => {
        setCustomers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Veri çekme hatası:', error);
        setLoading(false);
      });
  }, []);

  // Veri gelene kadar ekranda görünecek yazı
  if (loading) {
    return <div>Sistem verileri yükleniyor...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Müşteri Listesi (Canlı Veri)</h2>
      
      <div className="customer-list">
        {customers.map((customer) => (
          <div key={customer._id} className="customer-card" style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
            <h3>{customer.companyName}</h3>
            <p><strong>E-Posta:</strong> {customer.contactEmail}</p>
            <p><strong>Kayıt Tarihi:</strong> {new Date(customer.createdAt).toLocaleDateString('tr-TR')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardView;
