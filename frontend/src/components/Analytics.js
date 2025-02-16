import React, { useEffect } from 'react';
import ReactGA from 'react-ga4';

const Analytics = ({ children }) => {
  useEffect(() => {
    // Initialize Google Analytics
    const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;
    if (measurementId) {
      ReactGA.initialize(measurementId);
      
      // Track page views
      ReactGA.send({
        hitType: "pageview",
        page: window.location.pathname + window.location.search
      });
    }
  }, []);

  // Track custom events
  const trackEvent = (category, action, label) => {
    ReactGA.event({
      category,
      action,
      label,
    });
  };

  // Add tracking to all child components
  const addTracking = (child) => {
    return React.cloneElement(child, {
      onClick: (e) => {
        // Call the original onClick if it exists
        if (child.props.onClick) {
          child.props.onClick(e);
        }
        
        // Track the click event
        trackEvent(
          'User Interaction',
          'Click',
          child.props.eventLabel || child.type.displayName || child.type.name
        );
      },
    });
  };

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return addTracking(child);
        }
        return child;
      })}
    </>
  );
};

export default Analytics; 