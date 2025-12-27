import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { equipmentAPI, departmentsAPI } from '../services/api';
import { Equipment, Department } from '../types';
import EquipmentForm from '../components/EquipmentForm';
import { useRole } from '../hooks/useRole';

const EquipmentList: React.FC = () => {
  const navigate = useNavigate();
  const { canCreateEquipment, canEditEquipment, canDeleteEquipment } = useRole();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    department_id: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.department_id) params.department_id = filters.department_id;
      if (filters.search) params.search = filters.search;
      
      const response = await equipmentAPI.getAll(params);
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentsAPI.getAll();
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleEdit = (eq: Equipment) => {
    setEditingEquipment(eq);
    setOpenForm(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setEditingEquipment(null);
    fetchData();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Equipment Management
        </Typography>
        {canCreateEquipment && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenForm(true)}
          >
            Add Equipment
          </Button>
        )}
      </Box>

      <Box mb={3} display="flex" gap={2}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          sx={{ flexGrow: 1 }}
        />
        <TextField
          select
          label="Department"
          variant="outlined"
          size="small"
          value={filters.department_id}
          onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All Departments</MenuItem>
          {departments.map((dept) => (
            <MenuItem key={dept.id} value={dept.id}>
              {dept.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Serial Number</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Open Requests</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {equipment.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Box py={4}>
                    <BuildIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography color="text.secondary">No equipment found</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              equipment.map((eq) => (
                <TableRow key={eq.id} hover>
                  <TableCell>{eq.name}</TableCell>
                  <TableCell>{eq.serial_number || '-'}</TableCell>
                  <TableCell>{eq.category || '-'}</TableCell>
                  <TableCell>{eq.department_name || '-'}</TableCell>
                  <TableCell>{eq.location || '-'}</TableCell>
                  <TableCell>{eq.maintenance_team_name || '-'}</TableCell>
                  <TableCell>
                    {eq.open_requests_count ? (
                      <Chip
                        label={eq.open_requests_count}
                        color="warning"
                        size="small"
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={eq.status || 'active'}
                      color={eq.status === 'scrapped' ? 'error' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/equipment/${eq.id}`)}
                    >
                      <ViewIcon />
                    </IconButton>
                    {canEditEquipment && (
                      <IconButton size="small" onClick={() => handleEdit(eq)}>
                        <EditIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <EquipmentForm
        open={openForm}
        onClose={handleFormClose}
        equipment={editingEquipment}
      />
    </Box>
  );
};

export default EquipmentList;

