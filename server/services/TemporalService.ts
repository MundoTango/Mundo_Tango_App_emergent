import { Connection, Client, WorkflowClient } from "@temporalio/client";
import { Worker, NativeConnection } from "@temporalio/worker";
import path from "path";

/**
 * Temporal Workflow Service (Phase 4)
 * ESA Layer 57 - Durable workflow orchestration
 * 
 * Features:
 * - Reliable, long-running workflows
 * - Automatic retries and error handling
 * - Workflow versioning
 * - Activity execution with timeouts
 */

export class TemporalService {
  private connection: Connection | null = null;
  private client: WorkflowClient | null = null;
  private worker: Worker | null = null;
  private initialized: boolean = false;
  private serverAddress: string;
  private namespace: string;

  constructor(
    serverAddress: string = "localhost:7233",
    namespace: string = "default"
  ) {
    this.serverAddress = serverAddress;
    this.namespace = namespace;
  }

  isEnabled(): boolean {
    return this.initialized;
  }

  async connect(): Promise<void> {
    try {
      this.connection = await Connection.connect({
        address: this.serverAddress,
      });

      this.client = new WorkflowClient({
        connection: this.connection,
        namespace: this.namespace,
      });

      console.log(`✅ Temporal connected to ${this.serverAddress}`);
      this.initialized = true;
    } catch (error) {
      console.log(`ℹ️  Temporal server not available at ${this.serverAddress}`);
      console.log("   Run 'temporal server start-dev' to start local Temporal server");
      this.initialized = false;
    }
  }

  async createWorker(options: {
    taskQueue: string;
    workflowsPath?: string;
    activities?: Record<string, Function>;
  }): Promise<Worker> {
    if (!this.connection) {
      throw new Error("Not connected to Temporal server");
    }

    const nativeConnection = await NativeConnection.connect({
      address: this.serverAddress,
    });

    this.worker = await Worker.create({
      connection: nativeConnection,
      namespace: this.namespace,
      taskQueue: options.taskQueue,
      workflowsPath: options.workflowsPath || path.join(__dirname, "../workflows"),
      activities: options.activities || {},
    });

    console.log(`✅ Temporal worker created for queue: ${options.taskQueue}`);
    return this.worker;
  }

  async runWorker(): Promise<void> {
    if (!this.worker) {
      throw new Error("Worker not created");
    }

    console.log("🔄 Starting Temporal worker...");
    await this.worker.run();
  }

  async startWorkflow<T>(
    workflowType: string,
    options: {
      taskQueue: string;
      workflowId: string;
      args: any[];
    }
  ): Promise<any> {
    if (!this.client) {
      throw new Error("Not connected to Temporal server");
    }

    const handle = await this.client.start(workflowType, {
      taskQueue: options.taskQueue,
      workflowId: options.workflowId,
      args: options.args,
    });

    console.log(`✅ Started workflow ${options.workflowId}`);
    return handle;
  }

  async getWorkflowResult<T>(workflowId: string): Promise<T> {
    if (!this.client) {
      throw new Error("Not connected to Temporal server");
    }

    const handle = this.client.getHandle(workflowId);
    return await handle.result();
  }

  async signalWorkflow(
    workflowId: string,
    signalName: string,
    args: any[]
  ): Promise<void> {
    if (!this.client) {
      throw new Error("Not connected to Temporal server");
    }

    const handle = this.client.getHandle(workflowId);
    await handle.signal(signalName, ...args);
  }

  async queryWorkflow<T>(
    workflowId: string,
    queryName: string,
    args: any[] = []
  ): Promise<T> {
    if (!this.client) {
      throw new Error("Not connected to Temporal server");
    }

    const handle = this.client.getHandle(workflowId);
    return await handle.query(queryName, ...args);
  }

  async disconnect(): Promise<void> {
    if (this.worker) {
      this.worker.shutdown();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.initialized = false;
    console.log("✅ Temporal disconnected");
  }
}

export const temporalService = new TemporalService();
