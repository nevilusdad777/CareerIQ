import { useEffect, useRef, useState } from 'react';

/**
 * Modern ProgressRing Component with Conic-Gradient Animation
 * Features smooth animations, premium styling, and dynamic progress values
 */
const ProgressRing = ({ 
  progress = 0, 
  size = 140, 
  strokeWidth = 8,
  primaryColor = '#2d5be3',
  secondaryColor = '#6c47ff',
  backgroundColor = '#e5e7eb',
  showPercentage = true,
  animated = true,
  className = ''
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Animate progress on mount and when progress changes
  useEffect(() => {
    if (!animated) {
      setAnimatedProgress(progress);
      return;
    }

    setIsAnimating(true);
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const easeProgress = currentStep / steps;
      // Easing function for smooth animation
      const easedValue = 1 - Math.pow(1 - easeProgress, 3);
      
      setAnimatedProgress(Math.round(progress * easedValue));
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedProgress(progress);
        setIsAnimating(false);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [progress, animated]);

  // Calculate stroke dash values
  const strokeDashoffset = circumference - (circumference * animatedProgress) / 100;

  return (
    <div 
      className={`progress-ring-container ${className}`}
      style={{ 
        width: size, 
        height: size,
        position: 'relative'
      }}
    >
      {/* Background circle */}
      <svg
        width={size}
        height={size}
        className="progress-ring-svg"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
          className="progress-ring-background"
        />
        
        {/* Progress circle with gradient */}
        <defs>
          <linearGradient id={`progress-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>
        
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={`url(#progress-gradient-${size})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`progress-ring-progress ${isAnimating ? 'animating' : ''}`}
          style={{
            transition: animated ? 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            filter: 'drop-shadow(0 0 6px rgba(45, 91, 227, 0.3)'
          }}
        />
      </svg>

      {/* Center content */}
      {showPercentage && (
        <div 
          className="progress-ring-content"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            fontSize: size < 120 ? '18px' : '24px',
            fontWeight: '600',
            color: '#0a0f1e',
            letterSpacing: '-0.5px'
          }}
        >
          <div className="progress-percentage">{animatedProgress}%</div>
          <div className="progress-label" style={{ 
            fontSize: size < 120 ? '10px' : '12px',
            fontWeight: '400',
            color: '#6b7280',
            marginTop: '2px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Complete
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressRing;
