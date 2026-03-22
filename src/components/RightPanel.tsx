import React, { useEffect, useState } from 'react'
import { Dog, User as UserIcon, Loader2 } from 'lucide-react'
import { statsService } from '../services/api'

const RightPanel: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statsService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching right panel stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <aside className="right-stats-panel" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Loader2 className="animate-spin" />
      </aside>
    );
  }

  return (
    <aside className="right-stats-panel">
      <div className="section-header">
        <h3 style={{ fontSize: '18px' }}>Statistic ⓘ</h3>
        <select style={{ border: 'none', color: 'var(--text-secondary)', fontSize: '12px', outline: 'none' }}>
          <option>This week</option>
        </select>
      </div>

      <div className="donut-chart-container">
        <div style={{ 
          width: '160px', 
          height: '160px', 
          borderRadius: '50%', 
          border: '25px solid var(--primary)', 
          borderLeftColor: '#2d2d2d', 
          borderBottomColor: '#8ab4f880', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flexDirection: 'column' 
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Revenue</span>
          <span style={{ fontSize: '18px', fontWeight: 700 }}>${stats?.total_revenue || 0}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: 'var(--text-secondary)', justifyContent: 'center' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '2px' }}></div>
            Payment
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '10px', height: '10px', background: '#2d2d2d', borderRadius: '2px' }}></div>
            Cash
         </div>
      </div>

      <div className="transaction-list">
         <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Recent Activity</h4>
         {stats?.recent_activity?.map((activity: any) => (
           <div key={activity.id} className="transaction-item">
              <div className="item-icon">
                {activity.reason.toLowerCase().includes('surgery') ? <Dog size={20} /> : <UserIcon size={20} />}
              </div>
              <div className="item-details">
                 <p>{activity.reason}</p>
                 <p>{new Date(activity.date).toLocaleDateString()}</p>
              </div>
              <div className="amount-text">-${activity.cost}</div>
           </div>
         ))}
         {(!stats?.recent_activity || stats.recent_activity.length === 0) && (
           <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>No recent activity</p>
         )}
      </div>
    </aside>
  );
}

export default RightPanel;
