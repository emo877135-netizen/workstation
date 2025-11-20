/**
 * Workstation Chrome Extension - Background Service Worker
 * Handles JWT authentication and API communication with Workstation backend
 * Enhanced with Playwright execution capabilities
 */

// Import Playwright execution engine
import { PlaywrightExecution } from './playwright/execution.js';
import { PlaywrightRetryManager } from './playwright/retry.js';

let workstationToken = '';
let backendUrl = 'http://localhost:3000';
let settings = {
  backendUrl: 'http://localhost:3000',
  pollInterval: 2000,
  autoRetry: true
};

// Initialize Playwright execution engine
const playwrightExecution = new PlaywrightExecution();
const retryManager = new PlaywrightRetryManager();

console.log('🚀 Workstation extension with Playwright capabilities initialized');

// Initialize on extension install
chrome.runtime.onInstalled.addListener(async () => {
  try {
    console.log('🚀 Workstation extension installed, fetching JWT token...');
    // Load settings
    const stored = await chrome.storage.local.get(['settings']);
    if (stored.settings) {
      settings = { ...settings, ...stored.settings };
      backendUrl = settings.backendUrl;
    }
    
    const response = await fetch(`${backendUrl}/auth/demo-token`);
    const data = await response.json();
    workstationToken = data.token;
    await chrome.storage.local.set({ workstationToken });
    console.log('✅ Workstation token stored successfully');
  } catch (error) {
    console.error('❌ Failed to get token:', error);
  }
});

// Message handler for popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'executeWorkflow') {
    // Use Playwright execution engine for local execution
    if (request.useLocal) {
      const tabId = sender.tab?.id || request.tabId;
      if (tabId) {
        playwrightExecution.executeWorkflow(request.workflow, tabId, sendResponse);
      } else {
        sendResponse({ success: false, error: 'No tab ID provided' });
      }
    } else {
      // Use backend API for server-side execution
      executeWorkflow(request.workflow).then(sendResponse);
    }
    return true; // Required for async response
  }
  
  if (request.action === 'recordAction') {
    recordAction(request.actionData).then(sendResponse);
    return true;
  }
  
  if (request.action === 'getRecordedActions') {
    getRecordedActions().then(sendResponse);
    return true;
  }
  
  if (request.action === 'clearRecordedActions') {
    clearRecordedActions().then(sendResponse);
    return true;
  }
  
  if (request.action === 'getExecutionStatus') {
    getExecutionStatus(request.executionId).then(sendResponse);
    return true;
  }
  
  if (request.action === 'cancelExecution') {
    const cancelled = playwrightExecution.cancelExecution(request.executionId);
    sendResponse({ success: cancelled });
    return true;
  }
  
  if (request.action === 'updateSettings') {
    updateSettings(request.settings).then(sendResponse);
    return true;
  }
});

/**
 * Execute a workflow by sending it to the Workstation backend
 * @param {Object} workflow - Workflow configuration
 * @returns {Promise<Object>} Execution result
 */
async function executeWorkflow(workflow) {
  const { workstationToken } = await chrome.storage.local.get('workstationToken');
  
  try {
    const response = await fetch(`${backendUrl}/api/v2/execute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${workstationToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflow)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Workflow execution failed:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to execute workflow'
    };
  }
}

/**
 * Get execution status from backend or local execution
 * @param {string} executionId - Execution ID
 * @returns {Promise<Object>} Status object
 */
async function getExecutionStatus(executionId) {
  // First check local Playwright execution
  const localStatus = playwrightExecution.getExecutionStatus(executionId);
  if (localStatus) {
    return { success: true, ...localStatus };
  }
  
  // Otherwise query backend
  const { workstationToken } = await chrome.storage.local.get('workstationToken');
  
  try {
    const response = await fetch(`${backendUrl}/api/v2/executions/${executionId}`, {
      headers: {
        'Authorization': `Bearer ${workstationToken}`,
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, ...data };
  } catch (error) {
    console.error('❌ Failed to get execution status:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to get status'
    };
  }
}

/**
 * Update settings
 * @param {Object} newSettings - New settings
 * @returns {Promise<Object>} Success status
 */
async function updateSettings(newSettings) {
  settings = { ...settings, ...newSettings };
  backendUrl = settings.backendUrl;
  await chrome.storage.local.set({ settings });
  return { success: true };
}

/**
 * Record a user action for workflow building
 * @param {Object} actionData - Action details (type, selector, value)
 * @returns {Promise<Object>} Success status
 */
async function recordAction(actionData) {
  const result = await chrome.storage.local.get('recordedActions');
  const recorded = result.recordedActions || [];
  recorded.push(actionData);
  await chrome.storage.local.set({ recordedActions: recorded });
  return { success: true, count: recorded.length };
}

/**
 * Get all recorded actions
 * @returns {Promise<Array>} Recorded actions
 */
async function getRecordedActions() {
  const result = await chrome.storage.local.get('recordedActions');
  return result.recordedActions || [];
}

/**
 * Clear all recorded actions
 * @returns {Promise<Object>} Success status
 */
async function clearRecordedActions() {
  await chrome.storage.local.set({ recordedActions: [] });
  return { success: true };
}
