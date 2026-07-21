import { useEffect, useState } from 'react';

export default function PwaInstallButton() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setShow(false);
      return undefined;
    }

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 0 && window.innerWidth < 900);
    if (!isMobile) {
      setShow(false);
      return undefined;
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      const wasDismissed = window.localStorage.getItem('pwa-install-dismissed') === '1';
      if (wasDismissed) {
        setShow(false);
        return;
      }
      setDeferredPrompt(event);
      setShow(true);
    };

    const handleAppInstalled = () => {
      setShow(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!show) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    window.localStorage.setItem('pwa-install-dismissed', '1');
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <button className="pwa-install-btn" onClick={handleInstall} type="button">
      <span aria-hidden="true">⬇</span>
      <span>تنزيل التطبيق</span>
    </button>
  );
}
