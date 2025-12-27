import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { equipmentAPI, departmentsAPI, teamsAPI, usersAPI } from '../services/api';
import { Equipment, Department, Team, User } from '../types';

interface EquipmentFormProps {
  open: boolean;
  onClose: () => void;
  equipment?: Equipment | null;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({ open, onClose, equipment }) => {
  const [formData, setFormData] = useState({
    name: '',
    serial_number: '',
    category: '',
    purchase_date: null as Date | null,
    warranty_expiry: null as Date | null,
    location: '',
    department_id: '',
    assigned_to_user_id: '',
    maintenance_team_id: '',
    default_technician_id: '',
    notes: '',
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOptions();
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        serial_number: equipment.serial_number || '',
        category: equipment.category || '',
        purchase_date: equipment.purchase_date ? new Date(equipment.purchase_date) : null,
        warranty_expiry: equipment.warranty_expiry ? new Date(equipment.warranty_expiry) : null,
        location: equipment.location || '',
        department_id: equipment.department_id?.toString() || '',
        assigned_to_user_id: equipment.assigned_to_user_id?.toString() || '',
        maintenance_team_id: equipment.maintenance_team_id?.toString() || '',
        default_technician_id: equipment.default_technician_id?.toString() || '',
        notes: equipment.notes || '',
      });
    } else {
      setFormData({
        name: '',
        serial_number: '',
        category: '',
        purchase_date: null,
        warranty_expiry: null,
        location: '',
        department_id: '',
        assigned_to_user_id: '',
        maintenance_team_id: '',
        default_technician_id: '',
        notes: '',
      });
    }
  }, [equipment, open]);

  const fetchOptions = async () => {
    try {
      const [deptRes, teamsRes, usersRes] = await Promise.all([
        departmentsAPI.getAll(),
        teamsAPI.getAll(),
        usersAPI.getAll(),
      ]);
      setDepartments(deptRes.data);
      setTeams(teamsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.maintenance_team_id) {
      alert('Name and Maintenance Team are required');
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        purchase_date: formData.purchase_date?.toISOString().split('T')[0] || null,
        warranty_expiry: formData.warranty_expiry?.toISOString().split('T')[0] || null,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        assigned_to_user_id: formData.assigned_to_user_id ? parseInt(formData.assigned_to_user_id) : null,
        maintenance_team_id: parseInt(formData.maintenance_team_id),
        default_technician_id: formData.default_technician_id ? parseInt(formData.default_technician_id) : null,
      };

      if (equipment) {
        await equipmentAPI.update(equipment.id, data);
      } else {
        await equipmentAPI.create(data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving equipment:', error);
      alert('Failed to save equipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{equipment ? 'Edit Equipment' : 'Add Equipment'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Equipment Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Serial Number"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Purchase Date"
                value={formData.purchase_date}
                onChange={(date) => setFormData({ ...formData, purchase_date: date })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Warranty Expiry"
                value={formData.warranty_expiry}
                onChange={(date) => setFormData({ ...formData, warranty_expiry: date })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Department"
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Assigned To"
                value={formData.assigned_to_user_id}
                onChange={(e) => setFormData({ ...formData, assigned_to_user_id: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Maintenance Team *"
                value={formData.maintenance_team_id}
                onChange={(e) => setFormData({ ...formData, maintenance_team_id: e.target.value })}
                required
              >
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Default Technician"
                value={formData.default_technician_id}
                onChange={(e) => setFormData({ ...formData, default_technician_id: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                {users.filter(u => u.role === 'technician').map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {equipment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default EquipmentForm;

