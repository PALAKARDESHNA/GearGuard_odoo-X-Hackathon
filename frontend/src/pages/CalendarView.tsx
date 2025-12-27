import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Paper,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { requestsAPI, equipmentAPI } from '../services/api';
import { MaintenanceRequest, Equipment } from '../types';
import RequestForm from '../components/RequestForm';
import { useRole } from '../hooks/useRole';

const localizer = momentLocalizer(moment);

const CalendarView: React.FC = () => {
  const { canCreateRequest } = useRole();
  const [events, setEvents] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MaintenanceRequest | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const startDate = moment().startOf('month').format('YYYY-MM-DD');
      const endDate = moment().endOf('month').add(1, 'month').format('YYYY-MM-DD');
      
      const response = await requestsAPI.getCalendar({ start_date: startDate, end_date: endDate });
      const data = response.data;

      // Convert to calendar events
      const calendarEvents = data.map((req: MaintenanceRequest) => ({
        id: req.id,
        title: `${req.equipment_name} - ${req.subject}`,
        start: new Date(req.scheduled_date!),
        end: new Date(req.scheduled_date!),
        resource: req,
      }));
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await equipmentAPI.getAll();
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchEquipment();
  }, []);

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedSlot(start);
    setOpenForm(true);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
    setOpenDetail(true);
  };

  const eventStyleGetter = (event: any) => {
    const request = event.resource as MaintenanceRequest;
    let backgroundColor = '#3174ad';
    
    if (request.stage === 'Repaired') {
      backgroundColor = '#2e7d32';
    } else if (request.stage === 'Scrap') {
      backgroundColor = '#d32f2f';
    } else if (request.is_overdue) {
      backgroundColor = '#d32f2f';
    } else if (request.stage === 'In Progress') {
      backgroundColor = '#ed6c02';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
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
          Preventive Maintenance Calendar
        </Typography>
        {canCreateRequest && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenForm(true)}
          >
            Schedule Maintenance
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2, height: '70vh' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          eventPropGetter={eventStyleGetter}
          defaultView="month"
          views={['month', 'week', 'day']}
          popup
        />
      </Paper>

      <RequestForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelectedSlot(null);
          fetchData();
        }}
        equipment={equipment}
        initialScheduledDate={selectedSlot ? selectedSlot.toISOString().split('T')[0] : undefined}
        initialRequestType="Preventive"
      />

      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
        {selectedEvent && (
          <>
            <DialogTitle>{selectedEvent.subject}</DialogTitle>
            <DialogContent>
              <Box display="flex" flexDirection="column" gap={2} mt={1}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Equipment
                  </Typography>
                  <Typography variant="body1">{selectedEvent.equipment_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Scheduled Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedEvent.scheduled_date!).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Stage
                  </Typography>
                  <Chip
                    label={selectedEvent.stage}
                    size="small"
                    color={
                      selectedEvent.stage === 'Repaired'
                        ? 'success'
                        : selectedEvent.stage === 'Scrap'
                        ? 'error'
                        : selectedEvent.stage === 'In Progress'
                        ? 'info'
                        : 'default'
                    }
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Team
                  </Typography>
                  <Typography variant="body1">{selectedEvent.team_name}</Typography>
                </Box>
                {selectedEvent.technician_name && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Technician
                    </Typography>
                    <Typography variant="body1">{selectedEvent.technician_name}</Typography>
                  </Box>
                )}
                {selectedEvent.description && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">{selectedEvent.description}</Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDetail(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CalendarView;

