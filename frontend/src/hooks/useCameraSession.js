import { useEffect, useState } from 'react';

export function useCameraSession() {
  const [active, setActive] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(900);
  const [quality, setQuality] = useState('720p');
  const [errorMsg, setErrorMsg] = useState('');

  const hour = new Date().getHours();
  const isSchoolHours = hour >= 7 && hour < 17;

  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          setActive(false);
          setErrorMsg('Sesión finalizada automáticamente al cumplir 15 minutos.');
          return 900;
        }
        return previous - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  const startCamera = () => {
    if (!isSchoolHours && !demoMode) {
      setActive(false);
      setErrorMsg('Transmisión bloqueada fuera de horario escolar (7:00 AM - 5:00 PM).');
      return;
    }
    setErrorMsg('');
    setSecondsLeft(900);
    setActive(true);
  };

  const stopCamera = () => {
    setActive(false);
    setSecondsLeft(900);
  };

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  return {
    active,
    demoMode,
    setDemoMode,
    formattedTime: `${mins}:${secs}`,
    quality,
    setQuality,
    errorMsg,
    startCamera,
    stopCamera,
  };
}
