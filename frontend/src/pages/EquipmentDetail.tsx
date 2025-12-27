import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { equipmentAPI } from '../services/api';
import { Equipment, MaintenanceRequest } from '../types';
import { useRole } from '../hooks/useRole';

const EquipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canCreateRequest } = useRole();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEquipment = async () => {
    if (!id) return;
    try {
      const response = await equipmentAPI.getById(Number(id));
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    if (!id) return;
    try {
      const response = await equipmentAPI.getRequests(Number(id));
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEquipment();
      fetchRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCreateRequest = () => {
    navigate('/requests', { state: { equipmentId: id } });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!equipment) {
    return (
      <Box>
        <Typography variant="h5">Equipment not found</Typography>
      </Box>
    );
  }

  const openRequests = requests.filter(
    (r) => r.stage !== 'Repaired' && r.stage !== 'Scrap'
  );

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/equipment')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          {equipment.name}
        </Typography>
        {canCreateRequest && (
          <Button
            variant="contained"
            startIcon={<AssignmentIcon />}
            onClick={handleCreateRequest}
          >
            Create Request
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Equipment Details
              </Typography>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Serial Number
                  </Typography>
                  <Typography variant="body1">{equipment.serial_number || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">{equipment.category || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body1">{equipment.department_name || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1">{equipment.location || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Maintenance Team
                  </Typography>
                  <Typography variant="body1">{equipment.maintenance_team_name || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Default Technician
                  </Typography>
                  <Typography variant="body1">
                    {equipment.default_technician_name || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Purchase Date
                  </Typography>
                  <Typography variant="body1">
                    {equipment.purchase_date
                      ? new Date(equipment.purchase_date).toLocaleDateString()
                      : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Warranty Expiry
                  </Typography>
                  <Typography variant="body1">
                    {equipment.warranty_expiry
                      ? new Date(equipment.warranty_expiry).toLocaleDateString()
                      : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={equipment.status || 'active'}
                    color={equipment.status === 'scrapped' ? 'error' : 'success'}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                {equipment.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body1">{equipment.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Maintenance</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<BuildIcon />}
                  onClick={() => navigate('/requests', { state: { equipmentId: id } })}
                >
                  View All
                </Button>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {openRequests.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Open Requests
                </Typography>
              </Box>
              <Chip
                label={`${requests.length} Total Requests`}
                size="small"
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Maintenance History
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Stage</TableCell>
                      <TableCell>Technician</TableCell>
                      <TableCell>Scheduled Date</TableCell>
                      <TableCell>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No maintenance requests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      requests.map((request) => (
                        <TableRow key={request.id} hover>
                          <TableCell>{request.subject}</TableCell>
                          <TableCell>
                            <Chip
                              label={request.request_type}
                              size="small"
                              color={request.request_type === 'Preventive' ? 'primary' : 'warning'}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={request.stage}
                              size="small"
                              color={
                                request.stage === 'Repaired'
                                  ? 'success'
                                  : request.stage === 'Scrap'
                                  ? 'error'
                                  : request.stage === 'In Progress'
                                  ? 'info'
                                  : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>{request.technician_name || '-'}</TableCell>
                          <TableCell>
                            {request.scheduled_date
                              ? new Date(request.scheduled_date).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {request.created_at
                              ? new Date(request.created_at).toLocaleDateString()
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EquipmentDetail;

