import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { requestsAPI } from '../services/api';
import { PivotReport } from '../types';
import { useRole } from '../hooks/useRole';
import { Navigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Reports: React.FC = () => {
  const { canViewReports } = useRole();
  const [tabValue, setTabValue] = useState(0);
  const [teamReport, setTeamReport] = useState<PivotReport[]>([]);
  const [categoryReport, setCategoryReport] = useState<PivotReport[]>([]);
  const [loading, setLoading] = useState(true);

  if (!canViewReports) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [teamRes, categoryRes] = await Promise.all([
        requestsAPI.getPivotReport('team'),
        requestsAPI.getPivotReport('equipment_category'),
      ]);
      setTeamReport(teamRes.data);
      setCategoryReport(categoryRes.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const chartData = tabValue === 0 ? teamReport : categoryReport;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Maintenance Reports
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="By Team" />
          <Tab label="By Equipment Category" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Request Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="new_count" fill="#1976d2" name="New" />
                <Bar dataKey="in_progress_count" fill="#ed6c02" name="In Progress" />
                <Bar dataKey="repaired_count" fill="#2e7d32" name="Repaired" />
                <Bar dataKey="scrap_count" fill="#d32f2f" name="Scrap" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Groups
                  </Typography>
                  <Typography variant="h4">{chartData.length}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Requests
                  </Typography>
                  <Typography variant="h4">
                    {chartData.reduce((sum, item) => sum + item.total_requests, 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    {tabValue === 0 ? 'Team Name' : 'Category'}
                  </TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">New</TableCell>
                  <TableCell align="right">In Progress</TableCell>
                  <TableCell align="right">Repaired</TableCell>
                  <TableCell align="right">Scrap</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartData.map((row) => (
                  <TableRow key={row.group_name}>
                    <TableCell component="th" scope="row">
                      {row.group_name}
                    </TableCell>
                    <TableCell align="right">{row.total_requests}</TableCell>
                    <TableCell align="right">{row.new_count}</TableCell>
                    <TableCell align="right">{row.in_progress_count}</TableCell>
                    <TableCell align="right">{row.repaired_count}</TableCell>
                    <TableCell align="right">{row.scrap_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;

