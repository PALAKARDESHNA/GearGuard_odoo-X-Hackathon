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
import { requestsAPI } from '../services/api';
import { Equipment } from '../types';
import { useAuth } from '../context/AuthContext';

interface RequestFormProps {
  open: boolean;
  onClose: () => void;
  equipment: Equipment[];
  initialEquipmentId?: string;
  initialScheduledDate?: string;
  initialRequestType?: 'Corrective' | 'Preventive';
}

const RequestForm: React.FC<RequestFormProps> = ({
  open,
  onClose,
  equipment,
  initialEquipmentId,
  initialScheduledDate,
  initialRequestType,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    request_type: (initialRequestType || 'Corrective') as 'Corrective' | 'Preventive',
    equipment_id: initialEquipmentId || '',
    scheduled_date: initialScheduledDate ? new Date(initialScheduledDate) : null as Date | null,
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialEquipmentId) {
      setFormData((prev) => ({ ...prev, equipment_id: initialEquipmentId }));
    }
    if (initialScheduledDate) {
      setFormData((prev) => ({ ...prev, scheduled_date: new Date(initialScheduledDate) }));
    }
    if (initialRequestType) {
      setFormData((prev) => ({ ...prev, request_type: initialRequestType }));
    }
  }, [initialEquipmentId, initialScheduledDate, initialRequestType]);

  const handleSubmit = async () => {
    if (!formData.subject || !formData.equipment_id) {
      alert('Subject and Equipment are required');
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        scheduled_date: formData.scheduled_date?.toISOString().split('T')[0] || null,
        equipment_id: parseInt(formData.equipment_id),
        created_by_user_id: user?.id || null,
      };

      await requestsAPI.create(data);
      onClose();
      // Reset form
      setFormData({
        subject: '',
        description: '',
        request_type: 'Corrective',
        equipment_id: '',
        scheduled_date: null,
        priority: 'Medium',
      });
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Create Maintenance Request</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject *"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Request Type *"
                value={formData.request_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    request_type: e.target.value as 'Corrective' | 'Preventive',
                  })
                }
                required
              >
                <MenuItem value="Corrective">Corrective (Breakdown)</MenuItem>
                <MenuItem value="Preventive">Preventive (Routine)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as 'Low' | 'Medium' | 'High' | 'Urgent',
                  })
                }
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Equipment *"
                value={formData.equipment_id}
                onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
                required
              >
                {equipment.map((eq) => (
                  <MenuItem key={eq.id} value={eq.id}>
                    {eq.name} {eq.serial_number ? `(${eq.serial_number})` : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Scheduled Date"
                value={formData.scheduled_date}
                onChange={(date) => setFormData({ ...formData, scheduled_date: date })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            Create Request
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default RequestForm;

