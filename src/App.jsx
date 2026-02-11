import React, { useState, useEffect } from 'react';
import { mockCompanies, mockProducts } from './data/mockData';
import { fetchSheetData, updateSheetData } from './api';
import {
  CheckCircle2, Zap, Box, Lock, ShieldCheck, Heart, Save
} from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [products, setProducts] = useState(mockProducts);
  const [editingData, setEditingData] = useState({});
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const initApp = async () => {
      const params = new URLSearchParams(window.location.search);
      const companyParam = params.get('company');

      setIsLoading(true);
      try {
        const realData = await fetchSheetData();
        if (realData && realData.length > 0) {
          setProducts(realData);
          setIsDataLoaded(true);
        }
      } catch (err) {
        console.warn("실시간 시트 데이터를 불러올 수 없습니다.");
      }
      setIsLoading(false);

      if (companyParam && mockCompanies.includes(companyParam)) {
        setSelectedCompany(companyParam);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    if (selectedCompany && products.length > 0) {
      const initialEditing = {};
      const companyProducts = products.filter(p => p.company === selectedCompany);

      companyProducts.forEach(p => {
        initialEditing[p.id] = { ...p };
        if (!initialEditing[p.id].commissioningDate) {
          initialEditing[p.id].commissioningDate = today;
        }
      });
      setEditingData(initialEditing);
    }
  }, [selectedCompany, products, today]);

  const handleInputChange = (id, field, value) => {
    setEditingData(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const formatWithUnit = (value, unit) => {
    if (!value) return "";
    const cleanValue = String(value).replace(/[^\d.]/g, '');
    return cleanValue ? `${cleanValue}${unit}` : "";
  };

  const handleSave = async (id) => {
    const data = editingData[id];
    if (!data.kw || !data.a || !data.hz) {
      alert('KW, A(전류치), Hz(주파수)는 필수 입력 사항입니다.');
      return;
    }

    setIsLoading(true);
    const formattedData = {
      ...data,
      rpm: formatWithUnit(data.rpm, " RPM"),
      kw: data.kw,
      hz: formatWithUnit(data.hz, " Hz"),
      a: formatWithUnit(data.a, " A"),
      db: formatWithUnit(data.db, " dB"),
      status: '완료',
      timestamp: new Date().toLocaleString()
    };

    try {
      const success = await updateSheetData(id, {
        status: '완료',
        commissioningDate: formattedData.commissioningDate,
        rpm: formattedData.rpm,
        kw: formattedData.kw,
        hz: formattedData.hz,
        a: formattedData.a,
        db: formattedData.db,
        timestamp: formattedData.timestamp
      });

      if (success || !isDataLoaded) {
        setProducts(prev => prev.map(p => p.id === id ? formattedData : p));
        alert('성공적으로 등록되었습니다. 협조 감사합니다!');
      }
    } catch (err) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.company === selectedCompany && (String(p.status).trim() !== '완료')
  );

  if (!isAuthorized && !selectedCompany) {
    return (
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '2rem', borderRadius: '2rem', marginBottom: '1.5rem' }}>
          <Lock size={64} color="#ef4444" />
        </div>
        <h1 style={{ background: 'linear-gradient(to right, #fff, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>접근 권한 없음</h1>
        <p style={{ color: 'var(--text-muted)' }}>업체별 전용 링크를 통해 접속해 주세요.</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', background: 'var(--bg-gradient)', padding: '1rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={24} color="var(--primary)" />
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{selectedCompany}</h2>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{isDataLoaded ? '데이터 연동됨' : '준비됨'}</p>
          </div>
        </div>
        <span className="badge badge-success">Live</span>
      </header>

      <div className="glass-card" style={{ marginBottom: '1.5rem', background: 'rgba(99, 102, 241, 0.05)' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Heart size={20} color="var(--primary)" />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
            바쁘신 와중에도 협조해 주셔서 감사합니다. 아시는 한에서 <span style={{ color: 'var(--accent)', fontWeight: '700' }}>최대한 기입</span> 부탁드립니다.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1.2rem' }}>
        {isLoading && !isDataLoaded ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>데이터 매칭 중...</div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} className="glass-card" style={{ borderTop: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="badge badge-warning">미입력 제품</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No. {product.no}</span>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <Box size={16} color="var(--accent)" style={{ marginBottom: '0.5rem' }} />
                <div className="grid-2">
                  <input className="form-input" placeholder="산업군" value={editingData[product.id]?.industry || ''} onChange={(e) => handleInputChange(product.id, 'industry', e.target.value)} />
                  <input className="form-input" placeholder="모델" value={editingData[product.id]?.model || ''} onChange={(e) => handleInputChange(product.id, 'model', e.target.value)} />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <Zap size={16} color="#fbbf24" style={{ marginBottom: '0.5rem' }} />
                <div className="grid-2">
                  <input className="form-input" placeholder="KW (필수)" style={{ borderColor: editingData[product.id]?.kw ? '' : 'rgba(239, 68, 68, 0.5)' }} value={editingData[product.id]?.kw || ''} onChange={(e) => handleInputChange(product.id, 'kw', e.target.value)} />
                  <input className="form-input" type="number" placeholder="A (필수)" style={{ borderColor: editingData[product.id]?.a ? '' : 'rgba(239, 68, 68, 0.5)' }} value={String(editingData[product.id]?.a || '').replace(/[^\d.]/g, '')} onChange={(e) => handleInputChange(product.id, 'a', e.target.value)} />
                </div>
                <div className="grid-2" style={{ marginTop: '0.5rem' }}>
                  <input className="form-input" type="number" placeholder="Hz (필수)" style={{ borderColor: editingData[product.id]?.hz ? '' : 'rgba(239, 68, 68, 0.5)' }} value={String(editingData[product.id]?.hz || '').replace(/[^\d.]/g, '')} onChange={(e) => handleInputChange(product.id, 'hz', e.target.value)} />
                  <input className="form-input" type="number" placeholder="RPM" value={String(editingData[product.id]?.rpm || '').replace(/[^\d.]/g, '')} onChange={(e) => handleInputChange(product.id, 'rpm', e.target.value)} />
                </div>
              </div>
              <div className="grid-2" style={{ alignItems: 'flex-end', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <input type="date" className="form-input" value={editingData[product.id]?.commissioningDate || ''} onChange={(e) => handleInputChange(product.id, 'commissioningDate', e.target.value)} />
                <button className="btn-primary" onClick={() => handleSave(product.id)} style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Save size={18} /> {isLoading ? '처리 중' : '정보 제출'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <CheckCircle2 size={40} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>모든 제품의 시운전 정보가 접수되었습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
