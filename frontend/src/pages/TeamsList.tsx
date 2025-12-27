import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { teamsAPI, usersAPI } from '../services/api';
import { Team, User } from '../types';
import { useRole } from '../hooks/useRole';

const TeamsList: React.FC = () => {
  const { canCreateTeam, canEditTeam } = useRole();
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openMemberDialog, setOpenMemberDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await teamsAPI.getAll();
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll({ role: 'technician' });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.name) {
      alert('Team name is required');
      return;
    }

    try {
      await teamsAPI.create(formData);
      setOpenForm(false);
      setFormData({ name: '', description: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team');
    }
  };

  const handleAddMember = async (teamId: number, userId: number) => {
    try {
      await teamsAPI.addMember(teamId, userId);
      fetchData();
      setOpenMemberDialog(false);
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member');
    }
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
          Maintenance Teams
        </Typography>
        {canCreateTeam && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenForm(true)}
          >
            Add Team
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {teams.map((team) => (
          <Grid item xs={12} md={6} lg={4} key={team.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {team.name}
                  </Typography>
                  {canEditTeam && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedTeam(team);
                        setOpenMemberDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </Box>
                {team.description && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {team.description}
                  </Typography>
                )}
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Team Members ({team.members?.length || 0})
                  </Typography>
                  {team.members && team.members.length > 0 ? (
                    <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                      {team.members.map((member) => (
                        <Chip
                          key={member.id}
                          label={member.name}
                          size="small"
                          icon={<PersonIcon />}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No members assigned
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>Create Team</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Team Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openMemberDialog}
        onClose={() => setOpenMemberDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Manage Members - {selectedTeam?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
            Add Member
          </Typography>
          <List>
            {users
              .filter(
                (user) =>
                  !selectedTeam?.members?.some((m) => m.id === user.id)
              )
              .map((user) => (
                <ListItem
                  key={user.id}
                  secondaryAction={
                    <Button
                      size="small"
                      onClick={() => handleAddMember(selectedTeam!.id, user.id)}
                    >
                      Add
                    </Button>
                  }
                >
                  <ListItemText primary={user.name} secondary={user.email} />
                </ListItem>
              ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMemberDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamsList;

