
import React, { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TripProvider, useTripContext } from './context/TripContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './components/auth/LoginPage';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { PlannerDashboard } from './components/planner/PlannerDashboard';
import { TripSelectionPage } from './components/planner/TripSelectionPage';
import { GOOGLE_CLIENT_ID } from './config';

const AppContent = () => {
  const { isAuthenticated, isOnboardingComplete, user } = useAuth();
  const { activeTrip, selectTrip, addParticipantToTrip } = useTripContext();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tripId = urlParams.get('tripId');
    if (tripId && user && isAuthenticated && !activeTrip) {
      // Logic to handle joining a trip from an invite link
      addParticipantToTrip(tripId, user);
      selectTrip(tripId);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isAuthenticated, user, selectTrip, addParticipantToTrip, activeTrip]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (!isOnboardingComplete) {
    // Show a blurred background while onboarding
    return (
      <>
        <div className="blur-sm"><TripSelectionPage /></div>
        <OnboardingModal />
      </>
    );
  }

  if (!activeTrip) {
    return <TripSelectionPage />;
  }

  return <PlannerDashboard />;
};

export const App = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <TripProvider>
            <AppContent />
          </TripProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};
