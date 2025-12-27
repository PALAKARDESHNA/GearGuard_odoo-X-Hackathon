import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  Build as BuildIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { equipmentAPI, teamsAPI, requestsAPI } from '../services/api';
import { useRole } from '../hooks/useRole';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    equipment: 0,
    teams: 0,
    openRequests: 0,
    completedRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [equipmentRes, teamsRes, requestsRes] = await Promise.all([
          equipmentAPI.getAll(),
          teamsAPI.getAll(),
          requestsAPI.getAll(),
        ]);

        const requests = requestsRes.data;
        const openRequests = requests.filter(
          (r: any) => r.stage !== 'Repaired' && r.stage !== 'Scrap'
        ).length;
        const completedRequests = requests.filter(
          (r: any) => r.stage === 'Repaired'
        ).length;

        setStats({
          equipment: equipmentRes.data.length,
          teams: teamsRes.data.length,
          openRequests,
          completedRequests,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Total Equipment',
      value: stats.equipment,
      icon: <BuildIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Maintenance Teams',
      value: stats.teams,
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Open Requests',
      value: stats.openRequests,
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
    {
      title: 'Completed',
      value: stats.completedRequests,
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      {card.title}
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;

