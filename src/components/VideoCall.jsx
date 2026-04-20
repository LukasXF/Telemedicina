import { useEffect, useRef } from 'react';
import DailyIframe from '@daily-co/daily-js';

export default function VideoCall({ url }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const callFrame = DailyIframe.createFrame(videoRef.current, {
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '16px',
      },
      showLeaveButton: true,
    });

    callFrame.join({ url: url });

    return () => {
      callFrame.leave();
      callFrame.destroy();
    };
  }, [url]);

  return (
    <div 
      ref={videoRef} 
      className="w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-[#2a6b52]" 
    />
  );
}