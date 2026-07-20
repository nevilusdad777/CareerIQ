import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to prevent useEffect double execution in React StrictMode
 * @param {Function} effect - Effect function
 * @param {Array} deps - Dependency array
 */
export const useEffectOnce = (effect, deps) => {
  const hasRun = useRef(false);
  
  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
      return effect();
    }
  }, deps);
};

/**
 * Custom hook for API calls with loading and error states
 * @param {Function} apiCall - API function to call
 * @param {Array} deps - Dependency array
 * @param {any} initialValue - Initial value for data
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useApiCall = (apiCall, deps = [], initialValue = null) => {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const fetchData = async () => {
    if (!mountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      
      if (mountedRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'An error occurred');
        setData(initialValue);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
    
    return () => {
      mountedRef.current = false;
    };
  }, deps);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Custom hook for preventing duplicate API calls
 * @param {Function} apiCall - API function to call
 * @param {Array} deps - Dependency array
 * @param {any} initialValue - Initial value for data
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useSingleApiCall = (apiCall, deps = [], initialValue = null) => {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastCallRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchData = async () => {
    // Prevent duplicate calls
    const callKey = JSON.stringify(deps);
    if (lastCallRef.current === callKey) {
      return;
    }
    
    lastCallRef.current = callKey;
    
    if (!mountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      
      if (mountedRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'An error occurred');
        setData(initialValue);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
    
    return () => {
      mountedRef.current = false;
    };
  }, deps);

  return { data, loading, error, refetch: fetchData };
};
