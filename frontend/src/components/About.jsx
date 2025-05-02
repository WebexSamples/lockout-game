// frontend/src/components/About.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Divider,
  Link,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import GitHubIcon from '@mui/icons-material/GitHub';

const About = ({ isModal = false }) => {
  // Adjust styling based on whether it's in a modal or standalone page
  const containerProps = isModal
    ? { disableGutters: true, sx: { py: 1 } }
    : { maxWidth: 'md', sx: { mt: 4, mb: 4 } };

  const paperProps = isModal
    ? { elevation: 0, sx: { p: 2 } }
    : { elevation: 3, sx: { p: 4 } };

  return (
    <Container {...containerProps}>
      <Paper {...paperProps}>
        <Box display="flex" alignItems="center" mb={3}>
          <LockIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            About Lockout Game
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="body1" paragraph>
          Lockout is a team-based competitive hacking simulation game designed
          for cybersecurity training and education. Players work together in
          teams to crack codes, solve puzzles, and outmaneuver their opponents
          in a fast-paced virtual hacking environment.
        </Typography>

        <Typography variant="body1" paragraph>
          The game is inspired by the popular board game{' '}
          <Link
            href="https://codenamesgame.com/"
            target="_blank"
            rel="noopener"
          >
            Code Names
          </Link>
          , reimagined with a cybersecurity theme and enhanced for digital play
          within Webex.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          How to Play
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">
                  Team Setup
                </Typography>
                <Typography variant="body2">
                  Players divide into two teams: Team 1 (Bluewave) and Team 2
                  (Redshift). Each team has a team lead who provides keywords to
                  guide their team.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">
                  Gameplay
                </Typography>
                <Typography variant="body2">
                  Team leads provide keywords that relate to specific targets.
                  Team members must identify the correct targets based on the
                  keywords while avoiding traps and neutralizing obstacles.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Development Team
        </Typography>
        <Typography variant="body1" paragraph>
          Lockout was developed by the Webex Developer Relations team as an
          example application for Webex Embedded Apps. It demonstrates how
          interactive, multiplayer games can be integrated directly into the
          Webex meeting experience.
        </Typography>

        <Typography variant="body1" paragraph>
          Learn more about building your own Embedded Apps for Webex at{' '}
          <Link
            href="https://developer.webex.com/docs/embedded-apps"
            target="_blank"
            rel="noopener"
          >
            developer.webex.com/docs/embedded-apps
          </Link>
        </Typography>

        <Box textAlign="center" mt={4}>
          <Button
            variant="outlined"
            startIcon={<GitHubIcon />}
            href="https://github.com/WebexSamples/lockout-game"
            target="_blank"
            rel="noopener"
            sx={{ mb: 2 }}
          >
            View on GitHub
          </Button>
          <Typography variant="subtitle2" color="textSecondary">
            &copy; {new Date().getFullYear()} Webex Developer Relations - All
            rights reserved
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

About.propTypes = {
  isModal: PropTypes.bool,
};

export default About;
