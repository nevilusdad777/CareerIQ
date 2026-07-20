// Utility functions for safe API data handling

/**
 * Safely get array from API response
 * @param {any} data - API response data
 * @param {Array} fallback - Fallback array if data is invalid
 * @returns {Array} - Valid array
 */
export const safeArray = (data, fallback = []) => {
  if (Array.isArray(data)) {
    return data;
  }
  return fallback;
};

/**
 * Safely slice array with bounds checking
 * @param {Array} array - Array to slice
 * @param {number} start - Start index
 * @param {number} end - End index
 * @returns {Array} - Sliced array
 */
export const safeSlice = (array, start = 0, end) => {
  if (!Array.isArray(array)) {
    return [];
  }
  return array.slice(start, end);
};

/**
 * Safely get nested property from object
 * @param {Object} obj - Object to get property from
 * @param {string} path - Dot notation path (e.g., 'data.events')
 * @param {any} fallback - Fallback value
 * @returns {any} - Property value or fallback
 */
export const safeGet = (obj, path, fallback = null) => {
  try {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === null || result === undefined) {
        return fallback;
      }
      result = result[key];
    }
    
    return result !== undefined ? result : fallback;
  } catch (error) {
    return fallback;
  }
};

/**
 * Handle API response with consistent error handling
 * @param {Object} response - Axios response
 * @param {string} dataPath - Path to data in response (e.g., 'data.events')
 * @param {Array} fallback - Fallback data
 * @returns {Object} - { success: boolean, data: any, error: string }
 */
export const handleApiResponse = (response, dataPath = 'data', fallback = []) => {
  try {
    if (!response || !response.data) {
      return { success: false, data: fallback, error: 'Invalid response format' };
    }

    if (!response.data.success) {
      return { 
        success: false, 
        data: fallback, 
        error: response.data.message || 'API request failed' 
      };
    }

    const data = safeGet(response.data, dataPath, fallback);
    return { success: true, data, error: null };
  } catch (error) {
    return { success: false, data: fallback, error: error.message };
  }
};

/**
 * Create safe axios wrapper with error handling
 * @param {Function} axiosCall - Axios function call
 * @param {string} dataPath - Path to data in response
 * @param {Array} fallback - Fallback data
 * @returns {Promise} - Promise with handled response
 */
export const safeAxiosCall = async (axiosCall, dataPath = 'data', fallback = []) => {
  try {
    const response = await axiosCall;
    return handleApiResponse(response, dataPath, fallback);
  } catch (error) {
    console.error('API call error:', error);
    
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        data: fallback,
        error: error.response.data?.message || `Server error: ${error.response.status}`
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        success: false,
        data: fallback,
        error: 'Network error - please check your connection'
      };
    } else {
      // Something else happened
      return {
        success: false,
        data: fallback,
        error: error.message || 'Unknown error occurred'
      };
    }
  }
};
