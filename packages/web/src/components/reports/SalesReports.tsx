import React, { useState } from 'react';

const SalesReports = () => {
  const [selectedBranch, setSelectedBranch] = useState('executive');

  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '30px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '30px',
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    },
    tabButton: {
      background: 'rgba(255,255,255,0.2)',
      border: '2px solid rgba(255,255,255,0.3)',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '25px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontWeight: '600',
      backdropFilter: 'blur(10px)'
    },
    activeTab: {
      background: 'white',
      color: '#667eea',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
    },
    card: {
      background: 'white',
      padding: '25px',
      borderRadius: '15px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.08)'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={{fontSize: '2.5rem', margin: '0 0 10px 0', fontWeight: '700'}}>
            📊 Dashboard Doanh Số Tổng Hợp
          </h1>
          <p style={{fontSize: '1.1rem', opacity: 0.9, margin: '0 0 25px 0'}}>
            BP Bán Lẻ - Cập nhật: 09/06/2025 | Dữ liệu thực tế 5 tháng đầu năm 2024
          </p>
          <div style={{display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap'}}>
            <button
              style={{...styles.tabButton, ...(selectedBranch === 'executive' ? styles.activeTab : {})}}
              onClick={() => setSelectedBranch('executive')}
            >
              📋 Executive Summary
            </button>
            <button
              style={{...styles.tabButton, ...(selectedBranch === 'hanoi' ? styles.activeTab : {})}}
              onClick={() => setSelectedBranch('hanoi')}
            >
              🏢 BP. Bán lẻ Hà Nội
            </button>
            <button
              style={{...styles.tabButton, ...(selectedBranch === 'hcm' ? styles.activeTab : {})}}
              onClick={() => setSelectedBranch('hcm')}
            >
              🏬 BP. Bán lẻ HCM
            </button>
            <button
              style={{...styles.tabButton, ...(selectedBranch === 'compare' ? styles.activeTab : {})}}
              onClick={() => setSelectedBranch('compare')}
            >
              📈 So sánh
            </button>
          </div>
        </div>

        {selectedBranch === 'executive' && (
          <div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px'}}>
              <div style={styles.card}>
                <div style={{fontSize: '2.2rem', fontWeight: '700', color: '#2c3e50', marginBottom: '8px'}}>
                  📋 Executive Summary
                </div>
                <div style={{fontSize: '1rem', color: '#7f8c8d', marginBottom: '12px'}}>
                  Tổng quan hệ thống 11 nhân viên
                </div>
                <div style={{fontSize: '0.9rem', fontWeight: '600', color: '#27ae60'}}>
                  Dashboard ra quyết định executive
                </div>
              </div>
              <div style={styles.card}>
                <div style={{fontSize: '2.2rem', fontWeight: '700', color: '#2c3e50', marginBottom: '8px'}}>
                  9,65 tỷ
                </div>
                <div style={{fontSize: '1rem', color: '#7f8c8d', marginBottom: '12px'}}>
                  Tổng doanh số 2 phòng
                </div>
                <div style={{fontSize: '0.9rem', fontWeight: '600', color: '#27ae60'}}>
                  HN: 50.2% | HCM: 49.8% - Cân bằng hoàn hảo
                </div>
              </div>
              <div style={styles.card}>
                <div style={{fontSize: '2.2rem', fontWeight: '700', color: '#2c3e50', marginBottom: '8px'}}>
                  🎯 Top 3 Performers
                </div>
                <div style={{fontSize: '1rem', color: '#7f8c8d', marginBottom: '12px'}}>
                  Nga (44.49%) - Vân (35.93%) - Hương (21.81%)
                </div>
                <div style={{fontSize: '0.9rem', fontWeight: '600', color: '#27ae60'}}>
                  Metrics chính xác từ dữ liệu thật
                </div>
              </div>
              <div style={styles.card}>
                <div style={{fontSize: '2.2rem', fontWeight: '700', color: '#2c3e50', marginBottom: '8px'}}>
                  ⚠️ 2 Trường hợp
                </div>
                <div style={{fontSize: '1rem', color: '#7f8c8d', marginBottom: '12px'}}>
                  Cần can thiệp ngay lập tức
                </div>
                <div style={{fontSize: '0.9rem', fontWeight: '600', color: '#e74c3c'}}>
                  Quân (0%) - Tuyền (1.90%)
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedBranch === 'hanoi' && (
          <div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px'}}>
              <div style={styles.card}>
                <div style={{fontSize: '2.2rem', fontWeight: '700', color: '#2c3e50', marginBottom: '8px'}}>
                  4,84 tỷ
                </div>
                <div style={{fontSize: '1rem', color: '#7f8c8d', marginBottom: '12px'}}>
                  Tổng doanh số thực tế
                </div>
                <div style={{fontSize: '0.9rem', fontWeight: '600', color: '#e74c3c'}}>
                  13,27% KH năm (36,5 tỷ)
                </div>
              </div>
              <div style={styles.card}>
                <div style={{fontSize: '2.2rem', fontWeight: '700', color: '#2c3e50', marginBottom: '8px'}}>
                  2,09 tỷ
                </div>
                <div style={{fontSize: '1rem', color: '#7f8c8d', marginBottom: '12px'}}>
                  Doanh số tháng 5
                </div>
                <div style={{fontSize: '0.9rem', fontWeight: '600', color: '#27ae60'}}>
                  73,25% KH tháng - Cao nhất!
                </div>
              </div>
              <div style={styles.card}>
                <div style={{fontSize: '2.2rem', fontWeight: '700', color: '#2c3e50', marginBottom: '8px'}}>
                  📈 Tăng trưởng
                </div>
                <div style={{fontSize: '1rem', color: '#7f8c8d', marginBottom: '12px'}}>
                  Xu hướng tích cực
                </div>
                <div style={{fontSize: '0.9rem', fontWeight: '600', color: '#27ae60'}}>
                  T1: -1% → T5: 73%
                </div>
              </div>
              <div style={styles.card}>
                <div style={{fontSize: '2.2rem', fontWeight: '700', color: '#2c3e50', marginBottom: '8px'}}>
                  92:8
                </div>
                <div style={{fontSize: '1rem', color: '#7f8c8d', marginBottom: '12px'}}>
                  Tỷ lệ Mành rèm : Nội thất
                </div>
                <div style={{fontSize: '0.9rem', fontWeight: '600', color: '#e74c3c'}}>
                  Cần cân bằng sản phẩm
                </div>
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px'}}>
              <div style={styles.card}>
                <h3 style={{color: '#2c3e50', marginBottom: '20px', fontSize: '1.2rem', fontWeight: '600'}}>🎯 Theo Tỷ lệ đạt KH</h3>
                {[
                  { name: 'Phạm Thị Hương', rate: 21.81, sales: 1.31, note: 'Xuất sắc - Dẫn đầu 2 tháng', badge: 'excellent' },
                  { name: 'Lương Việt Anh', rate: 17.68, sales: 1.15, note: 'Tốt - Ổn định', badge: 'good' },
                  { name: 'Nguyễn Thị Thảo', rate: 16.74, sales: 1.09, note: 'Tốt - Bùng nổ T5', badge: 'good' },
                  { name: 'Lê Khánh Duy', rate: 13.65, sales: 0.48, note: 'Trung bình - Cần cải thiện', badge: 'average' },
                  { name: 'Trịnh Thị Bốn', rate: 12.32, sales: 0.62, note: 'Trung bình - Không ổn định', badge: 'average' },
                  { name: 'Nguyễn Mạnh Linh', rate: 6.80, sales: 0.20, note: 'Kém - Cần hỗ trợ', badge: 'poor' },
                  { name: 'Lê Tiến Quân', rate: 0, sales: 0, note: 'Rất kém - Chưa có doanh số', badge: 'very-poor' }
                ].map((person, index) => (
                  <div key={index} style={{display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: index < 6 ? '1px solid #f0f0f0' : 'none'}}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', color: 'white', marginRight: '15px', fontSize: '0.9rem',
                      background: index === 0 ? 'linear-gradient(45deg, #ffd700, #ffed4e)' :
                                 index === 1 ? 'linear-gradient(45deg, #c0c0c0, #e5e7eb)' :
                                 index === 2 ? 'linear-gradient(45deg, #cd7f32, #d97706)' :
                                 'linear-gradient(45deg, #6b7280, #9ca3af)'
                    }}>{index + 1}</div>
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: '600', color: '#333', marginBottom: '2px'}}>
                        {person.name} <span style={{
                          padding: '4px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '600', marginLeft: '8px',
                          background: person.badge === 'excellent' ? 'linear-gradient(45deg, #10b981, #34d399)' :
                                     person.badge === 'good' ? 'linear-gradient(45deg, #3b82f6, #60a5fa)' :
                                     person.badge === 'average' ? 'linear-gradient(45deg, #f59e0b, #fbbf24)' :
                                     person.badge === 'poor' ? 'linear-gradient(45deg, #ef4444, #f87171)' :
                                     'linear-gradient(45deg, #7c2d12, #dc2626)',
                          color: 'white'
                        }}>{person.badge === 'excellent' ? 'Xuất sắc' : person.badge === 'good' ? 'Tốt' : person.badge === 'average' ? 'Trung bình' : person.badge === 'poor' ? 'Kém' : 'Rất kém'}</span>
                      </div>
                      <div style={{fontSize: '0.8rem', color: '#666'}}>{person.rate}% • {person.sales} tỷ • {person.note}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.card}>
                <h3 style={{color: '#2c3e50', marginBottom: '20px', fontSize: '1.2rem', fontWeight: '600'}}>💰 Theo Doanh số tuyệt đối</h3>
                {[
                  { name: 'Phạm Thị Hương', sales: 1.31, contribution: 27.01 },
                  { name: 'Lương Việt Anh', sales: 1.15, contribution: 23.73 },
                  { name: 'Nguyễn Thị Thảo', sales: 1.09, contribution: 22.47 },
                  { name: 'Trịnh Thị Bốn', sales: 0.62, contribution: 12.72 },
                  { name: 'Lê Khánh Duy', sales: 0.48, contribution: 9.86 },
                  { name: 'Nguyễn Mạnh Linh', sales: 0.20, contribution: 4.21 },
                  { name: 'Lê Tiến Quân', sales: 0, contribution: 0 }
                ].map((person, index) => (
                  <div key={index} style={{display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: index < 6 ? '1px solid #f0f0f0' : 'none'}}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', color: 'white', marginRight: '15px', fontSize: '0.9rem',
                      background: index === 0 ? 'linear-gradient(45deg, #ffd700, #ffed4e)' :
                                 index === 1 ? 'linear-gradient(45deg, #c0c0c0, #e5e7eb)' :
                                 index === 2 ? 'linear-gradient(45deg, #cd7f32, #d97706)' :
                                 'linear-gradient(45deg, #6b7280, #9ca3af)'
                    }}>{index + 1}</div>
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: '600', color: '#333', marginBottom: '2px'}}>{person.name}</div>
                      <div style={{fontSize: '0.8rem', color: '#666'}}>{person.sales} tỷ • {person.contribution}% đóng góp phòng</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={{color: '#2c3e50', marginBottom: '20px', fontSize: '1.2rem', fontWeight: '600'}}>📊 Phân Tích Chi Tiết Cá Nhân - Hà Nội</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
                {[
                  { name: 'Lương Việt Anh', badge: 'Tốt', sales: '1.15B', rate: '17.7%', plan: '6.5B', trend: '📈 Rất ổn định',
                    monthly: ['T1: -4.6tr', 'T2: +406.8tr', 'T3: +250.3tr', 'T4: +229.5tr', 'T5: +267.1tr'],
                    notes: ['👍 Hiệu suất tốt', '📉 1 tháng âm', '📈 Xu hướng tăng'] },
                  { name: 'Lê Khánh Duy', badge: 'Trung bình', sales: '0.48B', rate: '13.7%', plan: '3.5B', trend: '📊 Ổn định',
                    monthly: ['T1: -3.4tr', 'T2: +12.6tr', 'T3: 0tr', 'T4: +425.3tr', 'T5: +43.2tr'],
                    notes: ['📉 1 tháng âm', '📉 Xu hướng giảm'] },
                  { name: 'Nguyễn Thị Thảo', badge: 'Tốt', sales: '1.09B', rate: '16.7%', plan: '6.5B', trend: '📈 Rất ổn định',
                    monthly: ['T1: +24.4tr', 'T2: -2.5tr', 'T3: +234.2tr', 'T4: +194.9tr', 'T5: +637.2tr'],
                    notes: ['👍 Hiệu suất tốt', '🚀 Đỉnh cao T5: 637.2tr', '📉 1 tháng âm', '📈 Xu hướng tăng'] },
                  { name: 'Nguyễn Mạnh Linh', badge: 'Kém', sales: '0.20B', rate: '6.8%', plan: '3.0B', trend: '📈 Rất ổn định',
                    monthly: ['T1: +4.7tr', 'T2: 0tr', 'T3: +6.2tr', 'T4: +193.1tr', 'T5: 0tr'],
                    notes: [] },
                  { name: 'Trịnh Thị Bốn', badge: 'Trung bình', sales: '0.62B', rate: '12.3%', plan: '5.0B', trend: '📈 Rất ổn định',
                    monthly: ['T1: -43.9tr', 'T2: +26.3tr', 'T3: +212.1tr', 'T4: +10.5tr', 'T5: +410.8tr'],
                    notes: ['📉 1 tháng âm', '📈 Xu hướng tăng'] },
                  { name: 'Lê Tiến Quân', badge: 'Rất kém', sales: '0.00B', rate: '0.0%', plan: '3.5B', trend: 'Chưa có dữ liệu',
                    monthly: ['T1: 0tr', 'T2: 0tr', 'T3: 0tr', 'T4: 0tr', 'T5: 0tr'],
                    notes: ['⚠️ Cần can thiệp ngay'] },
                  { name: 'Phạm Thị Hương', badge: 'Tốt', sales: '1.31B', rate: '21.8%', plan: '6.0B', trend: '📈 Rất ổn định',
                    monthly: ['T1: +0.9tr', 'T2: 0tr', 'T3: +74tr', 'T4: +504.1tr', 'T5: +729.4tr'],
                    notes: ['👍 Hiệu suất tốt', '🚀 Đỉnh cao T5: 729.4tr', '📈 Xu hướng tăng'] }
                ].map((person, index) => (
                  <div key={index} style={{
                    background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
                    borderLeft: '5px solid #667eea', transition: 'all 0.3s ease'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                      <div style={{fontWeight: 'bold', fontSize: '1.1rem', color: '#333'}}>{person.name}</div>
                      <span style={{
                        padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600',
                        background: person.badge === 'Tốt' ? 'linear-gradient(45deg, #3b82f6, #60a5fa)' :
                                   person.badge === 'Trung bình' ? 'linear-gradient(45deg, #f59e0b, #fbbf24)' :
                                   person.badge === 'Kém' ? 'linear-gradient(45deg, #ef4444, #f87171)' :
                                   'linear-gradient(45deg, #7c2d12, #dc2626)',
                        color: 'white'
                      }}>{person.badge}</span>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px'}}>
                      <div style={{textAlign: 'center'}}>
                        <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#667eea'}}>{person.sales}</div>
                        <div style={{fontSize: '0.8rem', color: '#666'}}>Doanh số (tỷ)</div>
                      </div>
                      <div style={{textAlign: 'center'}}>
                        <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#667eea'}}>{person.rate}</div>
                        <div style={{fontSize: '0.8rem', color: '#666'}}>Tỷ lệ đạt KH</div>
                      </div>
                      <div style={{textAlign: 'center'}}>
                        <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#667eea'}}>{person.plan}</div>
                        <div style={{fontSize: '0.8rem', color: '#666'}}>Kế hoạch năm</div>
                      </div>
                      <div style={{textAlign: 'center'}}>
                        <div style={{fontSize: '0.9rem', fontWeight: '600', color: '#333'}}>{person.trend}</div>
                        <div style={{fontSize: '0.8rem', color: '#666'}}>Xu hướng</div>
                      </div>
                    </div>
                    <div style={{marginBottom: '15px'}}>
                      <div style={{fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: '#333'}}>📊 Doanh số 5 tháng đầu năm (triệu)</div>
                      {person.monthly.map((month, i) => (
                        <div key={i} style={{fontSize: '0.8rem', color: month.includes('-') ? '#ef4444' : month.includes('0tr') ? '#666' : '#10b981', marginBottom: '2px'}}>
                          {month}
                        </div>
                      ))}
                    </div>
                    {person.notes.length > 0 && (
                      <div>
                        <div style={{fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: '#333'}}>💡 Nhận xét:</div>
                        {person.notes.map((note, i) => (
                          <div key={i} style={{fontSize: '0.8rem', color: '#666', marginBottom: '2px'}}>{note}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={{color: '#2c3e50', marginBottom: '20px', fontSize: '1.2rem', fontWeight: '600'}}>📋 Chi tiết doanh số theo nhân viên - Hà Nội</h3>
              <div style={{overflowX: 'auto', borderRadius: '15px', maxHeight: '500px', overflowY: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '15px', overflow: 'hidden'}}>
                  <thead>
                    <tr style={{background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white'}}>
                      <th style={{padding: '12px 15px', textAlign: 'left', fontWeight: '600', position: 'sticky', top: 0, zIndex: 11}}>Nhân viên</th>
                      <th style={{padding: '12px 15px', textAlign: 'right', fontWeight: '600', position: 'sticky', top: 0, zIndex: 11}}>KH năm (tỷ)</th>
                      <th style={{padding: '12px 15px', textAlign: 'right', fontWeight: '600', position: 'sticky', top: 0, zIndex: 11}}>Thực tế (tỷ)</th>
                      <th style={{padding: '12px 15px', textAlign: 'right', fontWeight: '600', position: 'sticky', top: 0, zIndex: 11}}>Tỷ lệ đạt (%)</th>
                      <th style={{padding: '12px 15px', textAlign: 'right', fontWeight: '600', position: 'sticky', top: 0, zIndex: 11}}>T1</th>
                      <th style={{padding: '12px 15px', textAlign: 'right', fontWeight: '600', position: 'sticky', top: 0, zIndex: 11}}>T2</th>
                      <th style={{padding: '12px 15px', textAlign: 'right', fontWeight: '600', position: 'sticky', top: 0, zIndex: 11}}>T3</th>
                      <th style={{padding: '12px 15px', textAlign: 'right', fontWeight: '600', position: 'sticky', top: 0, zIndex: 11}}>T4</th>
                      <th style={{padding: '12px 15px', textAlign: 'right', fontWeight: '600', position: 'sticky', top: 0, zIndex: 11}}>T5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Lương Việt Anh', plan: '6,50', actual: '1,15', rate: '17,68%', t1: '-4,6tr', t2: '406,8tr', t3: '250,3tr', t4: '229,5tr', t5: '267,1tr' },
                      { name: 'Lê Khánh Duy', plan: '3,50', actual: '0,48', rate: '13,65%', t1: '-3,4tr', t2: '12,6tr', t3: '0', t4: '425,3tr', t5: '43,2tr' },
                      { name: 'Nguyễn Thị Thảo', plan: '6,50', actual: '1,09', rate: '16,74%', t1: '24,4tr', t2: '-2,5tr', t3: '234,2tr', t4: '194,9tr', t5: '637,2tr' },
                      { name: 'Nguyễn Mạnh Linh', plan: '3,00', actual: '0,20', rate: '6,80%', t1: '4,7tr', t2: '0', t3: '6,2tr', t4: '193,1tr', t5: '0' },
                      { name: 'Trịnh Thị Bốn', plan: '5,00', actual: '0,62', rate: '12,32%', t1: '-43,9tr', t2: '26,3tr', t3: '212,1tr', t4: '10,5tr', t5: '410,8tr' },
                      { name: 'Lê Tiến Quân', plan: '3,50', actual: '0', rate: '0,00%', t1: '0', t2: '0', t3: '0', t4: '0', t5: '0' },
                      { name: 'Phạm Thị Hương', plan: '6,00', actual: '1,31', rate: '21,81%', t1: '0,9tr', t2: '0', t3: '74,0tr', t4: '504,1tr', t5: '729,4tr' }
                    ].map((row, index) => (
                      <tr key={index} style={{borderBottom: '1px solid #f0f0f0'}}>
                        <td style={{padding: '12px 15px', textAlign: 'left', fontWeight: 'bold', position: 'sticky', left: 0, background: 'white', zIndex: 10}}>{row.name}</td>
                        <td style={{padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem'}}>{row.plan}</td>
                        <td style={{padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem'}}>{row.actual}</td>
                        <td style={{padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem', color: parseFloat(row.rate) > 15 ? '#10b981' : parseFloat(row.rate) === 0 ? '#ef4444' : '#333'}}>{row.rate}</td>
                        <td style={{padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem', color: row.t1.includes('-') ? '#ef4444' : row.t1 === '0' ? '#666' : '#10b981'}}>{row.t1}</td>
                        <td style={{padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem', color: row.t2.includes('-') ? '#ef4444' : row.t2 === '0' ? '#666' : '#10b981'}}>{row.t2}</td>
                        <td style={{padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem', color: row.t3.includes('-') ? '#ef4444' : row.t3 === '0' ? '#666' : '#10b981'}}>{row.t3}</td>
                        <td style={{padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem', color: row.t4.includes('-') ? '#ef4444' : row.t4 === '0' ? '#666' : '#10b981'}}>{row.t4}</td>
                        <td style={{padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem', color: row.t5.includes('-') ? '#ef4444' : row.t5 === '0' ? '#666' : '#10b981'}}>{row.t5}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedBranch === 'hcm' && (
          <div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px'}}>
              <div style={styles.card}>
                <div style={{fontSize: '2.2rem', fontWeight: '700', color: '#2c3e50', marginBottom: '8px'}}>
                  4,81 tỷ
                </div>
                <div style={{fontSize: '1rem', color: '#7f8c8d', marginBottom: '12px'}}>
                  Tổng doanh số thực tế
                </div>
                <div style={{fontSize: '0.9rem', fontWeight: '600', color: '#e74c3c'}}>
                  26,71% KH năm (18 tỷ)
                </div>
              </div>
              <div style={styles.card}>
                <div style={{fontSize: '2.2rem', fontWeight: '700', color: '#2c3e50', marginBottom: '8px'}}>
                  1,46 tỷ
                </div>
                <div style={{fontSize: '1rem', color: '#7f8c8d', marginBottom: '12px'}}>
                  Doanh số tháng 1
                </div>
                <div style={{fontSize: '0.9rem', fontWeight: '600', color: '#27ae60'}}>
                  244,05% KH - Đỉnh cao!
                </div>
              </div>
              <div style={styles.card}>
                <div style={{fontSize: '2.2rem', fontWeight: '700', color: '#2c3e50', marginBottom: '8px'}}>
                  📉 Giảm dần
                </div>
                <div style={{fontSize: '1rem', color: '#7f8c8d', marginBottom: '12px'}}>
                  Xu hướng Q2
                </div>
                <div style={{fontSize: '0.9rem', fontWeight: '600', color: '#e74c3c'}}>
                  T1: 244% → T5: 38%
                </div>
              </div>
              <div style={styles.card}>
                <div style={{fontSize: '2.2rem', fontWeight: '700', color: '#2c3e50', marginBottom: '8px'}}>
                  100:0
                </div>
                <div style={{fontSize: '1rem', color: '#7f8c8d', marginBottom: '12px'}}>
                  Tỷ lệ Mành rèm : Nội thất
                </div>
                <div style={{fontSize: '0.9rem', fontWeight: '600', color: '#e74c3c'}}>
                  Thiếu đa dạng sản phẩm
                </div>
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px'}}>
              <div style={styles.card}>
                <h3 style={{color: '#2c3e50', marginBottom: '20px', fontSize: '1.2rem', fontWeight: '600'}}>🎯 Theo Tỷ lệ đạt KH</h3>
                {[
                  { name: 'Nguyễn Thị Nga', rate: 44.49, sales: 2.58, note: 'Siêu sao - Ace tuyệt đối', badge: 'superstar' },
                  { name: 'Phùng Thị Thuỳ Vân', rate: 35.93, sales: 1.08, note: 'Xuất sắc - Ổn định cao', badge: 'excellent' },
                  { name: 'Nguyễn Ngọc Việt Khanh', rate: 20.21, sales: 1.11, note: 'Tốt - Khởi sắc T2', badge: 'good' },
                  { name: 'Hà Nguyễn Thanh Tuyền', rate: 1.90, sales: 0.04, note: 'Rất kém - Cần can thiệp', badge: 'very-poor' }
                ].map((person, index) => (
                  <div key={index} style={{display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: index < 3 ? '1px solid #f0f0f0' : 'none'}}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', color: 'white', marginRight: '15px', fontSize: '0.9rem',
                      background: index === 0 ? 'linear-gradient(45deg, #ffd700, #ffed4e)' :
                                 index === 1 ? 'linear-gradient(45deg, #c0c0c0, #e5e7eb)' :
                                 index === 2 ? 'linear-gradient(45deg, #cd7f32, #d97706)' :
                                 '#e74c3c'
                    }}>{index < 3 ? index + 1 : '⚠️'}</div>
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: '600', color: '#333', marginBottom: '2px'}}>
                        {person.name} <span style={{
                          padding: '4px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '600', marginLeft: '8px',
                          background: person.badge === 'superstar' ? 'linear-gradient(45deg, #8b5cf6, #a855f7)' :
                                     person.badge === 'excellent' ? 'linear-gradient(45deg, #10b981, #34d399)' :
                                     person.badge === 'good' ? 'linear-gradient(45deg, #3b82f6, #60a5fa)' :
                                     'linear-gradient(45deg, #7c2d12, #dc2626)',
                          color: 'white'
                        }}>{person.badge === 'superstar' ? 'Siêu sao' : person.badge === 'excellent' ? 'Xuất sắc' : person.badge === 'good' ? 'Tốt' : 'Rất kém'}</span>
                      </div>
                      <div style={{fontSize: '0.8rem', color: index === 3 ? '#e74c3c' : '#666'}}>{person.rate}% • {person.sales} tỷ • {person.note}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.card}>
                <h3 style={{color: '#2c3e50', marginBottom: '20px', fontSize: '1.2rem', fontWeight: '600'}}>💰 Theo Doanh số tuyệt đối</h3>
                {[
                  { name: 'Nguyễn Thị Nga', sales: 2.58, contribution: 53.67 },
                  { name: 'Nguyễn Ngọc Việt Khanh', sales: 1.11, contribution: 23.12 },
                  { name: 'Phùng Thị Thuỳ Vân', sales: 1.08, contribution: 22.42 },
                  { name: 'Hà Nguyễn Thanh Tuyền', sales: 0.04, contribution: 0.79 }
                ].map((person, index) => (
                  <div key={index} style={{display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: index < 3 ? '1px solid #f0f0f0' : 'none'}}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', color: 'white', marginRight: '15px', fontSize: '0.9rem',
                      background: index === 0 ? 'linear-gradient(45deg, #ffd700, #ffed4e)' :
                                 index === 1 ? 'linear-gradient(45deg, #c0c0c0, #e5e7eb)' :
                                 index === 2 ? 'linear-gradient(45deg, #cd7f32, #d97706)' :
                                 '#e74c3c'
                    }}>{index < 3 ? index + 1 : '⚠️'}</div>
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: '600', color: '#333', marginBottom: '2px'}}>{person.name}</div>
                      <div style={{fontSize: '0.8rem', color: index === 3 ? '#e74c3c' : '#666'}}>{person.sales} tỷ • {person.contribution}% đóng góp phòng</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={{color: '#2c3e50', marginBottom: '20px', fontSize: '1.2rem', fontWeight: '600'}}>📋 Chi tiết doanh số theo nhân viên - HCM</h3>
              <div style={{overflowX: 'auto', borderRadius: '15px', maxHeight: '500px', overflowY: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '15px', overflow: 'hidden'}}>
                  <thead>
                    <tr style={{background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white'}}>
                      <th style={{padding: '12px 15px', textAlign: 'left', fontWeight: '600', position: 'sticky', top: 0, zIndex: 11}}>Nhân viên</th>
                      <th style={{padding: '12px 15px', textAlign: 'right', fontWeight: '600', position: 'sticky', top: 0, zIndex: 11}}>KH năm (tỷ)</th>
                      <th style={{padding: '12px 15px', textAlign: 'right', fontWeight: '600', position: 'sticky', top: 0, zIndex: 11}}>Thực tế (tỷ)</th>
                      <th style={{padding: '12px 15px', textAlign: 'right', fontWeight: '600', position: 'sticky', top: 0, zIndex: 11}}>Tỷ lệ đạt (%)</th>
                      <th style={{padding: '12px 15px', textAlign: 'right', fontWeight: '600', position: 'sticky', top: 0, zIndex: 11}}>T1</th>
                      <th style={{padding: '12px 15px', textAlign: 'right', fontWeight: '600', position: 'sticky', top: 0, zIndex: 11}}>T2</th>
                      <th style={{padding: '12px 15px', textAlign: 'right', fontWeight: '600', position: 'sticky', top: 0, zIndex: 11}}>T3</th>
                      <th style={{padding: '12px 15px', textAlign: 'right', fontWeight: '600', position: 'sticky', top: 0, zIndex: 11}}>T4</th>
                      <th style={{padding: '12px 15px', textAlign: 'right', fontWeight: '600', position: 'sticky', top: 0, zIndex: 11}}>T5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Nguyễn Thị Nga', plan: '5,80', actual: '2,58', rate: '44,49%', t1: '1.092,5tr', t2: '167,6tr', t3: '716,7tr', t4: '-9,7tr', t5: '613,5tr' },
                      { name: 'Hà Nguyễn Thanh Tuyền', plan: '2,00', actual: '0,04', rate: '1,90%', t1: '0,1tr', t2: '0', t3: '37,8tr', t4: '0', t5: '0' },
                      { name: 'Nguyễn Ngọc Việt Khanh', plan: '5,50', actual: '1,11', rate: '20,21%', t1: '368,1tr', t2: '746,9tr', t3: '292,5tr', t4: '451,2tr', t5: '0,4tr' },
                      { name: 'Phùng Thị Thuỳ Vân', plan: '3,00', actual: '1,08', rate: '35,93%', t1: '3,5tr', t2: '0', t3: '144,3tr', t4: '193,7tr', t5: '-10,5tr' }
                    ].map((row, index) => (
                      <tr key={index} style={{borderBottom: '1px solid #f0f0f0'}}>
                        <td style={{padding: '12px 15px', textAlign: 'left', fontWeight: 'bold', position: 'sticky', left: 0, background: 'white', zIndex: 10}}>{row.name}</td>
                        <td style={{padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem'}}>{row.plan}</td>
                        <td style={{padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem'}}>{row.actual}</td>
                        <td style={{padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem', color: parseFloat(row.rate) > 30 ? '#10b981' : parseFloat(row.rate) < 5 ? '#ef4444' : '#333'}}>{row.rate}</td>
                        <td style={{padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem', color: row.t1.includes('-') ? '#ef4444' : row.t1 === '0' ? '#666' : '#10b981'}}>{row.t1}</td>
                        <td style={{padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem', color: row.t2.includes('-') ? '#ef4444' : row.t2 === '0' ? '#666' : '#10b981'}}>{row.t2}</td>
                        <td style={{padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem', color: row.t3.includes('-') ? '#ef4444' : row.t3 === '0' ? '#666' : '#10b981'}}>{row.t3}</td>
                        <td style={{padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem', color: row.t4.includes('-') ? '#ef4444' : row.t4 === '0' ? '#666' : '#10b981'}}>{row.t4}</td>
                        <td style={{padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem', color: row.t5.includes('-') ? '#ef4444' : row.t5 === '0' ? '#666' : '#10b981'}}>{row.t5}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedBranch === 'compare' && (
          <div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px'}}>
              <div style={styles.card}>
                <div style={{fontSize: '2.2rem', fontWeight: '700', color: '#2c3e50', marginBottom: '8px'}}>
                  9,65 tỷ
                </div>
                <div style={{fontSize: '1rem', color: '#7f8c8d', marginBottom: '12px'}}>
                  Tổng doanh số 2 chi nhánh
                </div>
                <div style={{fontSize: '0.9rem', fontWeight: '600', color: '#e74c3c'}}>
                  17,70% KH năm (54,5 tỷ)
                </div>
              </div>
              <div style={styles.card}>
                <div style={{fontSize: '2.2rem', fontWeight: '700', color: '#2c3e50', marginBottom: '8px'}}>
                  HN: ↗ HCM: ↘
                </div>
                <div style={{fontSize: '1rem', color: '#7f8c8d', marginBottom: '12px'}}>
                  Xu hướng đối lập
                </div>
                <div style={{fontSize: '0.9rem', fontWeight: '600', color: '#e74c3c'}}>
                  HN tăng dần, HCM giảm dần
                </div>
              </div>
              <div style={styles.card}>
                <div style={{fontSize: '2.2rem', fontWeight: '700', color: '#2c3e50', marginBottom: '8px'}}>
                  50,2:49,8
                </div>
                <div style={{fontSize: '1rem', color: '#7f8c8d', marginBottom: '12px'}}>
                  Tỷ lệ đóng góp HN:HCM
                </div>
                <div style={{fontSize: '0.9rem', fontWeight: '600', color: '#27ae60'}}>
                  Cân bằng hoàn hảo
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReports;
