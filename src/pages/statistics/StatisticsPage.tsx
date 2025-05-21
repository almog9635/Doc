import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Select } from 'antd';
import { UserOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './statistics.module.css';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../../entity/decodedToken';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { format, startOfWeek, startOfMonth } from 'date-fns';
import { Debrief } from '../../entity/debrief/debrief'
import { User } from '../../entity/user'
import { RoleData } from '../../entity/role/roleData';

interface ChartData {
  date: string;
  count: number;
}

interface UserDistribution {
  role: string;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const StatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDebriefs: 0,
    activeGroups: 0
  });
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [debriefsOverTime, setDebriefsOverTime] = useState<ChartData[]>([]);
  const [userDistribution, setUserDistribution] = useState<UserDistribution[]>([]);
  const [timeUnit, setTimeUnit] = useState<'day' | 'week' | 'month' | 'halfyear'>('day');
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const clusters = [
    'all',
    'Logistics & Maintenance Efficiency',
    'Traffic & Weather Monitoring',
    'Emergency & Environmental Issues',
  ];
  const [lessonsData, setLessonsData] = useState<{ lesson: string; count: number }[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (!decoded.roles || (!decoded.roles.includes('admin') && !decoded.roles.includes('leader'))) {
        navigate('/unauthorized');
        return;
      }
      setIsAuthorized(true);
    } catch (error) {
      console.error('Error decoding token:', error);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (isAuthorized) {
      const fetchStats = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const [response, debriefsResponse] = await Promise.all([
            axios.get('http://localhost:4000/users/groups', {
              headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get('http://localhost:4000/debriefs', {
              headers: { Authorization: `Bearer ${token}` }
            })
          ]);
          setStats({
            totalUsers: response.data.getAllUsers?.length || 0,
            totalDebriefs: debriefsResponse.data.getAllDebriefs?.length || 0,
            activeGroups: response.data.getAllGroups?.length || 0
          });

          // Group debriefs by selected time unit
          const debriefs = debriefsResponse.data.getAllDebriefs || [];
          const debriefsByUnit = debriefs.reduce((acc: { [key: string]: number }, debrief: Debrief) => {
            const dateObj = new Date(debrief.date);
            let key = '';
            if (timeUnit === 'day') {
              key = format(dateObj, 'yyyy-MM-dd');
            } else if (timeUnit === 'week') {
              key = format(startOfWeek(dateObj, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            } else if (timeUnit === 'month') {
              key = format(startOfMonth(dateObj), 'yyyy-MM');
            } else if (timeUnit === 'halfyear') {
              const year = dateObj.getFullYear();
              const month = dateObj.getMonth();
              key = month < 6 ? `${year}-H1` : `${year}-H2`;
            }
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {});

          const debriefsData: ChartData[] = Object.entries(debriefsByUnit).map(([date, count]) => ({
            date,
            count: count as number
          })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          setDebriefsOverTime(debriefsData);

          // Lessons analysis
          let allLessons: Array<{ content: string; cluster: string }> = [];
          debriefs.forEach((debrief: Debrief) => {
            // Filter by time unit
            const dateObj = new Date(debrief.date);
            let match = true;
            if (timeUnit === 'day') {
              match = format(dateObj, 'yyyy-MM-dd') === debriefsData[debriefsData.length-1]?.date;
            } else if (timeUnit === 'week') {
              match = format(startOfWeek(dateObj, { weekStartsOn: 1 }), 'yyyy-MM-dd') === debriefsData[debriefsData.length-1]?.date;
            } else if (timeUnit === 'month') {
              match = format(startOfMonth(dateObj), 'yyyy-MM') === debriefsData[debriefsData.length-1]?.date;
            }
            if (match) {
              allLessons = allLessons.concat(debrief.lessons.map(lesson => ({ content: lesson.content, cluster: lesson.cluster })));
            }
          });

          let chartData = [];
          // Always show only the cluster name and its total lesson count
          const clusterCounts: { [key: string]: number } = {};
          if (selectedCluster === 'all') {
            allLessons.forEach(l => {
              if (l.cluster && typeof l.cluster === 'string' && l.cluster.trim() !== '') {
                clusterCounts[l.cluster] = (clusterCounts[l.cluster] || 0) + 1;
              }
            });
            chartData = clusters.filter(c => c !== 'all').map(cluster => ({
              lesson: cluster,
              count: clusterCounts[cluster] || 0
            }));
          } else {
            allLessons.forEach(l => {
              if (l.cluster === selectedCluster && typeof l.cluster === 'string' && l.cluster.trim() !== '') {
                clusterCounts[l.cluster] = (clusterCounts[l.cluster] || 0) + 1;
              }
            });
            chartData = clusterCounts[selectedCluster]
              ? [{ lesson: selectedCluster, count: clusterCounts[selectedCluster] }]
              : [{ lesson: selectedCluster, count: 0 }];
          }
          chartData.sort((a, b) => b.count - a.count);
          setLessonsData(chartData);

          // Process user distribution
          const users = response.data.getAllUsers || [];
          const roleCounts = users.reduce((acc: { [key: string]: number }, user: User) => {
            user.roles.forEach((role: RoleData) => {
              acc[role.role?.name] = (acc[role.role?.name] || 0) + 1;
            });
            return acc;
          }, {});

          const userDistData: UserDistribution[] = Object.entries(roleCounts).map(([role, count]) => ({
            role,
            count: count as number
          }));

          setUserDistribution(userDistData);
        } catch (error) {
          console.error('Error fetching statistics:', error);
        }
      };

      fetchStats();
    }
  }, [isAuthorized, timeUnit, selectedCluster]);

  if (!isAuthorized) {
    return null;
  }

  const THRESHOLD = 5;
  const repeatingClusters = lessonsData.filter(item => item.count > THRESHOLD);

  return (
    <div className={styles.statisticsContainer}>
      <h1 className={styles.title}>Statistics Dashboard</h1>
      
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col span={8}>
          <Card className={styles.statCard}>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className={styles.statCard}>
            <Statistic
              title="Total Debriefs"
              value={stats.totalDebriefs}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className={styles.statCard}>
            <Statistic
              title="Active Groups"
              value={stats.activeGroups}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Debriefs Over Time" className={styles.chartContainer}>
            <Select value={timeUnit} onChange={setTimeUnit} style={{ width: 120, marginBottom: 16 }}>
              <Select.Option value="day">Day</Select.Option>
              <Select.Option value="week">Week</Select.Option>
              <Select.Option value="month">Month</Select.Option>
              <Select.Option value="halfyear">Half Year</Select.Option>
            </Select>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={debriefsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" name="Number of Debriefs" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="User Distribution by Role" className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userDistribution}
                  dataKey="count"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Repeated Lessons Learned Chart */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Repeated Lessons Learned Analysis" className={styles.chartContainer}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <Select value={selectedCluster} onChange={setSelectedCluster} style={{ width: 200 }}>
                {clusters.map(cluster => (
                  <Select.Option key={cluster} value={cluster}>{cluster}</Select.Option>
                ))}
              </Select>
              <Select value={timeUnit} onChange={setTimeUnit} style={{ width: 120 }}>
                <Select.Option value="day">Day</Select.Option>
                <Select.Option value="week">Week</Select.Option>
                <Select.Option value="month">Month</Select.Option>
                <Select.Option value="halfyear">Half Year</Select.Option>
              </Select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lessonsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="lesson" type="category" width={300} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Occurrences" />
              </BarChart>
            </ResponsiveContainer>
            {selectedCluster === 'all' && repeatingClusters.length > 0 && (
              <div>
                {repeatingClusters.map(item => (
                  <div key={item.lesson} style={{ color: 'red', marginTop: 8 }}>
                    Cluster "{item.lesson}" is repeating over time and needs to be taken care of.
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatisticsPage; 