// src/components/TeamMembers.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import CodeIcon from '@mui/icons-material/Code';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import HostIcon from '@mui/icons-material/Security';

/**
 * Displays team members with hacker (team lead) and agents
 */
const TeamMembers = ({ participants, team, textColor }) => {
  const hacker = participants?.find(p => p.team === team && p.is_team_lead);
  const agents = participants?.filter(p => p.team === team && !p.is_team_lead) || [];
  
  return (
    <Box sx={{ mt: 1, width: '100%', textAlign: 'left' }}>
      {hacker && (
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: textColor, display: 'flex', alignItems: 'center' }}>
          <CodeIcon fontSize="small" sx={{ mr: 0.5, color: textColor }} />
          Hacker: {hacker.display_name}
          {hacker.is_host && (
            <HostIcon 
              fontSize="small" 
              sx={{ ml: 0.5, color: textColor }}
            />
          )}
        </Typography>
      )}
      
      {agents.length > 0 && (
        <Box sx={{ mt: 0.5 }}>
          <Typography variant="body2" component="div" sx={{ color: textColor, display: 'flex', alignItems: 'flex-start' }}>
            <SmartToyIcon fontSize="small" sx={{ mr: 0.5, mt: 0.2, color: textColor }} />
            <Box component="span">
              Agents: 
              <Box component="span" sx={{ display: 'inline-flex', flexWrap: 'wrap', gap: '3px', ml: 0.5 }}>
                {agents.map((agent, idx) => (
                  <Box component="span" key={agent.id}>
                    {agent.display_name}
                    {agent.is_host && (
                      <HostIcon 
                        fontSize="small" 
                        sx={{ ml: 0.3, mr: 0.3, width: '0.7em', height: '0.7em', color: textColor }}
                      />
                    )}
                    {idx < agents.length - 1 ? ',' : ''}
                  </Box>
                ))}
              </Box>
            </Box>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

TeamMembers.propTypes = {
  participants: PropTypes.array,
  team: PropTypes.string.isRequired,
  textColor: PropTypes.string
};

export default TeamMembers;