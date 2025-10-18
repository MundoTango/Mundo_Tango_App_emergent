/**
 * Base Agent Interface
 * Mundo Tango ESA LIFE CEO - Agent Contract
 */

export interface IAgent {
  id: string;
  name: string;
  category: string;
  purpose: string;
  status: 'operational' | 'inactive' | 'development';
  
  execute(input: any): Promise<{
    success: boolean;
    message: string;
    [key: string]: any;
  }>;
  
  getStatus(): Promise<{
    status: string;
    health: string;
    [key: string]: any;
  }>;
}
