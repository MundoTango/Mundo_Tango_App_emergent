import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = Router();

/**
 * POST /api/mrblue/search-codebase
 * Search codebase using ripgrep (rg)
 */
router.post('/search-codebase', async (req, res) => {
  try {
    const { query, filePattern, ignoreCase = true, maxResults = 100 } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'query is required and must be a string'
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 [MR BLUE - CODEBASE SEARCH]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔎 Query:', query);
    console.log('📁 File Pattern:', filePattern || 'all files');
    console.log('🔤 Ignore Case:', ignoreCase);

    // Build ripgrep command
    const rgArgs: string[] = [
      'rg',
      '--json',  // JSON output for parsing
      ignoreCase ? '-i' : '',
      '-n',  // Show line numbers
      '-C 2',  // 2 lines of context
      filePattern ? `-g "${filePattern}"` : '',
      '--max-count', maxResults.toString(),
      `"${query.replace(/"/g, '\\"')}"`,  // Escape quotes in query
      '.'
    ].filter(Boolean);

    const command = rgArgs.join(' ');
    console.log('🛠️  Command:', command);

    try {
      const { stdout } = await execAsync(command, {
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024  // 10MB buffer
      });

      // Parse ripgrep JSON output
      const lines = stdout.trim().split('\n').filter(Boolean);
      const results = lines
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(item => item && item.type === 'match')
        .map((item: any) => ({
          file: item.data.path.text,
          line: item.data.line_number,
          match: item.data.lines.text.trim(),
          context: item.data.submatches?.[0]?.match?.text || ''
        }))
        .slice(0, maxResults);

      console.log('✅ Search complete');
      console.log('📊 Results:', results.length, 'matches found');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      res.json({
        success: true,
        data: {
          results,
          totalMatches: results.length,
          query,
          filePattern: filePattern || '*'
        }
      });

    } catch (execError: any) {
      // No matches found (rg exits with code 1)
      if (execError.code === 1) {
        console.log('ℹ️  No matches found');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        return res.json({
          success: true,
          data: {
            results: [],
            totalMatches: 0,
            query,
            filePattern: filePattern || '*'
          }
        });
      }

      throw execError;
    }

  } catch (error: any) {
    console.error('❌ [SEARCH ERROR]:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
