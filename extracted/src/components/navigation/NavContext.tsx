import React, { createContext, useContext } from 'react';
export type ScreenId =
'splash' |
'login' |
'signup' |
'forgot' |
'role' |
'doctor-speech' |
'patient-profile' |
'patient-registration' |
'e-signature' |
'calendar' |
'booking' |
'e-signature-appointment' |
'odontogram' |
'soap' |
'prescription' |
'voice' |
'gallery' |
'comparison' |
'patient-dashboard' |
'sos' |
'admin';
interface NavContextValue {
  navigate: (id: ScreenId) => void;
}
const NavContext = createContext<NavContextValue>({
  navigate: () => {}
});
export const NavProvider = NavContext.Provider;
export const useNav = () => useContext(NavContext);
// Helper to stop click bubbling AND navigate
export const navHandler =
(navigate: (id: ScreenId) => void, target: ScreenId) =>
(e: React.MouseEvent) => {
  e.stopPropagation();
  navigate(target);
};
