import React from 'react';
import { Button } from '@material-ui/core';

const WelcomeButton = () => {
  return (
    <Button variant="contained" color="primary" href="/welcome">
      Welcome Page
    </Button>
  );
};

export default WelcomeButton;
