import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const TERMINAL_COMMAND_TOOLS = [
  {
    name: 'run_command',
    description: 'Execute a shell command',
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Command to execute' },
        cwd: { type: 'string', description: 'Working directory', default: '.' }
      },
      required: ['command']
    }
  },
  {
    name: 'install_package',
    description: 'Install npm package',
    parameters: {
      type: 'object',
      properties: {
        package: { type: 'string', description: 'Package name' },
        dev: { type: 'boolean', description: 'Install as dev dependency', default: false }
      },
      required: ['package']
    }
  },
  {
    name: 'run_tests',
    description: 'Run test suite',
    parameters: {
      type: 'object',
      properties: {
        pattern: { type: 'string', description: 'Test file pattern', default: '' }
      }
    }
  },
  {
    name: 'build_project',
    description: 'Build the project',
    parameters: {
      type: 'object',
      properties: {
        mode: { type: 'string', description: 'Build mode', enum: ['development', 'production'], default: 'production' }
      }
    }
  },
  {
    name: 'start_server',
    description: 'Start development server',
    parameters: {
      type: 'object',
      properties: {
        port: { type: 'number', description: 'Port number', default: 5000 }
      }
    }
  }
];

export async function executeTerminalCommand(name: string, args: any): Promise<any> {
  const cwd = args.cwd || process.cwd();

  switch (name) {
    case 'run_command':
      const result = await execAsync(args.command, { cwd });
      return { stdout: result.stdout, stderr: result.stderr };
    
    case 'install_package':
      const installCmd = `npm install ${args.dev ? '--save-dev' : '--save'} ${args.package}`;
      const installResult = await execAsync(installCmd, { cwd });
      return { success: true, output: installResult.stdout };
    
    case 'run_tests':
      const testCmd = `npm test ${args.pattern || ''}`;
      const testResult = await execAsync(testCmd, { cwd });
      return { success: true, output: testResult.stdout };
    
    case 'build_project':
      const buildCmd = `npm run build`;
      const buildResult = await execAsync(buildCmd, { cwd });
      return { success: true, output: buildResult.stdout };
    
    case 'start_server':
      return { message: 'Server start requested - use workflow instead for persistent servers' };
    
    default:
      throw new Error(`Unknown terminal command: ${name}`);
  }
}
