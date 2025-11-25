/**
 * Workflow WebSocket Service
 * 
 * Provides real-time updates for workflow execution progress.
 * Integrates with StateManager to broadcast execution state changes.
 * 
 * @module services/workflow-websocket
 * @version 2.0.0
 */

import { Server as WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { logger } from '../utils/logger';
import { StateManager } from '../automation/workflow/state-manager';

export interface WorkflowMessage {
  type: 'execution.started' | 'execution.progress' | 'execution.completed' | 'execution.failed';
  executionId: string;
  data: any;
  timestamp: string;
}

export class WorkflowWebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<WebSocket>> = new Map();
  private stateManager: StateManager;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  /**
   * Initialize WebSocket server
   */
  public initialize(server: Server): void {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/workflows'
    });

    this.wss.on('connection', (ws: WebSocket, req) => {
      logger.info('WebSocket client connected', { 
        path: req.url,
        origin: req.headers.origin 
      });

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleClientMessage(ws, data);
        } catch (error) {
          logger.error('Invalid WebSocket message', { error: (error as Error).message });
          ws.send(JSON.stringify({ 
            type: 'error', 
            error: 'Invalid message format' 
          }));
        }
      });

      ws.on('close', () => {
        this.removeClient(ws);
        logger.info('WebSocket client disconnected');
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error', { error: error.message });
      });

      // Send initial connection success message
      ws.send(JSON.stringify({ 
        type: 'connected', 
        message: 'Workflow WebSocket connected',
        timestamp: new Date().toISOString()
      }));
    });

    // Start heartbeat to keep connections alive
    this.startHeartbeat();

    logger.info('Workflow WebSocket server initialized');
  }

  /**
   * Handle incoming client messages
   */
  private handleClientMessage(ws: WebSocket, data: any): void {
    const { type, executionId } = data;

    switch (type) {
      case 'subscribe':
        this.subscribe(ws, executionId);
        break;
      case 'unsubscribe':
        this.unsubscribe(ws, executionId);
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        break;
      default:
        logger.warn('Unknown WebSocket message type', { type });
    }
  }

  /**
   * Subscribe client to execution updates
   */
  private subscribe(ws: WebSocket, executionId: string): void {
    if (!this.clients.has(executionId)) {
      this.clients.set(executionId, new Set());
    }
    this.clients.get(executionId)!.add(ws);

    // Send current state immediately
    const state = this.stateManager.getState(executionId);
    if (state) {
      ws.send(JSON.stringify({
        type: 'execution.status',
        executionId,
        data: {
          status: state.status,
          progress: state.progress,
          currentStep: state.currentStep,
          totalSteps: state.totalSteps,
        },
        timestamp: new Date().toISOString(),
      }));
    }

    logger.info('Client subscribed to execution', { executionId });
  }

  /**
   * Unsubscribe client from execution updates
   */
  private unsubscribe(ws: WebSocket, executionId: string): void {
    const clients = this.clients.get(executionId);
    if (clients) {
      clients.delete(ws);
      if (clients.size === 0) {
        this.clients.delete(executionId);
      }
    }
    logger.info('Client unsubscribed from execution', { executionId });
  }

  /**
   * Remove client from all subscriptions
   */
  private removeClient(ws: WebSocket): void {
    this.clients.forEach((clients, executionId) => {
      clients.delete(ws);
      if (clients.size === 0) {
        this.clients.delete(executionId);
      }
    });
  }

  /**
   * Broadcast execution update to subscribers
   */
  public broadcast(executionId: string, message: WorkflowMessage): void {
    const clients = this.clients.get(executionId);
    if (!clients || clients.size === 0) {
      return;
    }

    const messageStr = JSON.stringify(message);
    let successCount = 0;
    let errorCount = 0;

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageStr);
          successCount++;
        } catch (error) {
          logger.error('Failed to send WebSocket message', { 
            error: (error as Error).message 
          });
          errorCount++;
        }
      }
    });

    logger.debug('Broadcast execution update', { 
      executionId, 
      type: message.type,
      successCount,
      errorCount 
    });
  }

  /**
   * Broadcast execution started event
   */
  public broadcastExecutionStarted(executionId: string, workflowId: string): void {
    this.broadcast(executionId, {
      type: 'execution.started',
      executionId,
      data: { workflowId },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast execution progress event
   */
  public broadcastExecutionProgress(executionId: string, progress: any): void {
    this.broadcast(executionId, {
      type: 'execution.progress',
      executionId,
      data: progress,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast execution completed event
   */
  public broadcastExecutionCompleted(executionId: string, result: any): void {
    this.broadcast(executionId, {
      type: 'execution.completed',
      executionId,
      data: result,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast execution failed event
   */
  public broadcastExecutionFailed(executionId: string, error: string): void {
    this.broadcast(executionId, {
      type: 'execution.failed',
      executionId,
      data: { error },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Start heartbeat to keep connections alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (!this.wss) return;

      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.ping();
        }
      });
    }, 30000); // 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Shutdown WebSocket server
   */
  public shutdown(): void {
    this.stopHeartbeat();
    
    if (this.wss) {
      this.wss.clients.forEach((client) => {
        client.close(1000, 'Server shutdown');
      });
      this.wss.close();
      this.wss = null;
    }

    this.clients.clear();
    logger.info('Workflow WebSocket server shutdown');
  }

  /**
   * Get connection statistics
   */
  public getStats(): { totalClients: number; subscriptions: number } {
    let totalClients = 0;
    this.clients.forEach((clients) => {
      totalClients += clients.size;
    });

    return {
      totalClients,
      subscriptions: this.clients.size,
    };
  }
}

// Export singleton instance
let workflowWebSocketService: WorkflowWebSocketService | null = null;

export function initializeWorkflowWebSocket(server: Server, stateManager: StateManager): WorkflowWebSocketService {
  if (!workflowWebSocketService) {
    workflowWebSocketService = new WorkflowWebSocketService(stateManager);
    workflowWebSocketService.initialize(server);
  }
  return workflowWebSocketService;
}

export function getWorkflowWebSocketService(): WorkflowWebSocketService | null {
  return workflowWebSocketService;
}
