import { useState } from 'react';

/**
 * Premium StatCard Component with Hover Effects
 * Features elevated cards, soft shadows, hover lift, and modern styling
 */
const StatCard = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color = '#2d5be3',
  bgColor = '#f0f4ff',
  size = 'medium',
  trend = null,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeStyles = {
    small: {
      padding: '16px',
      iconSize: '20px',
      titleSize: '12px',
      valueSize: '24px',
      subtitleSize: '10px'
    },
    medium: {
      padding: '20px',
      iconSize: '24px',
      titleSize: '14px',
      valueSize: '32px',
      subtitleSize: '12px'
    },
    large: {
      padding: '24px',
      iconSize: '28px',
      titleSize: '16px',
      valueSize: '40px',
      subtitleSize: '14px'
    }
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  return (
    <div
      className={`stat-card ${isHovered ? 'hovered' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
        borderRadius: '20px',
        padding: currentSize.padding,
        border: '1px solid rgba(229, 231, 235, 0.8)',
        boxShadow: isHovered 
          ? '0 20px 40px rgba(10, 15, 30, 0.12), 0 8px 16px rgba(10, 15, 30, 0.08), 0 0 0 1px rgba(45, 91, 227, 0.1)'
          : '0 8px 28px rgba(10, 15, 30, 0.09), 0 4px 12px rgba(10, 15, 30, 0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        minHeight: size === 'small' ? '100px' : size === 'medium' ? '120px' : '140px'
      }}
    >
      {/* Decorative gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${color} 0%, ${color}99 100%)`,
          opacity: isHovered ? 1 : 0.7,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Icon container */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          background: `linear-gradient(135deg, ${bgColor} 0%, ${color}15 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
          boxShadow: isHovered 
            ? `0 8px 16px ${color}25`
            : `0 4px 8px ${color}15`
        }}
      >
        <i
          className={icon}
          style={{
            fontSize: currentSize.iconSize,
            color: '#000000',
            transition: 'transform 0.3s ease'
          }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, zIndex: 1 }}>
        {/* Title */}
        <div
          style={{
            fontSize: currentSize.titleSize,
            fontWeight: '500',
            color: '#000000',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'color 0.3s ease'
          }}
        >
          {title}
        </div>

        {/* Value */}
        <div
          style={{
            fontSize: currentSize.valueSize,
            fontWeight: '700',
            color: '#000000',
            marginBottom: '2px',
            letterSpacing: '-0.5px',
            lineHeight: '1',
            transition: 'color 0.3s ease'
          }}
        >
          {value}
        </div>

        {/* Subtitle or Trend */}
        {(subtitle || trend) && (
          <div
            style={{
              fontSize: currentSize.subtitleSize,
              fontWeight: '400',
              color: '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px'
            }}
          >
            {trend && (
              <i
                className={`fas ${trend > 0 ? 'fa-arrow-up' : 'fa-arrow-down'}`}
                style={{
                  color: trend > 0 ? '#10b981' : '#ef4444',
                  fontSize: '10px'
                }}
              />
            )}
            {subtitle}
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${color}08 0%, transparent 100%)`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          borderRadius: '20px'
        }}
      />
    </div>
  );
};

export default StatCard;
