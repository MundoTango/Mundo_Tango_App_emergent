/**
 * Grafana Dashboards for MB.MD Compliance Monitoring
 * MB.MD Priority 5: Observability and Metrics
 * 
 * Dashboards:
 * 1. MB.MD Compliance Overview - High-level metrics
 * 2. Session Timeline - Detailed session flow
 * 3. Evidence Collection - Upload tracking
 * 4. Quality Gates - Architect review stats
 * 
 * Created: October 28, 2025
 */

export interface GrafanaDashboard {
  title: string;
  uid: string;
  panels: GrafanaPanel[];
  tags: string[];
}

export interface GrafanaPanel {
  title: string;
  type: 'graph' | 'stat' | 'table' | 'heatmap';
  targets: Array<{
    query: string;
    legendFormat?: string;
  }>;
  gridPos: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

/**
 * Dashboard 1: MB.MD Compliance Overview
 */
export const MBMD_COMPLIANCE_DASHBOARD: GrafanaDashboard = {
  title: 'MB.MD Compliance Overview',
  uid: 'mbmd-compliance',
  tags: ['mbmd', 'compliance', 'quality'],
  panels: [
    {
      title: 'Session Completion Rate',
      type: 'stat',
      targets: [
        {
          query: `
            SELECT 
              COUNT(CASE WHEN status = 'complete' THEN 1 END) * 100.0 / COUNT(*) as completion_rate
            FROM mbmd_sessions
            WHERE created_at > NOW() - INTERVAL '24 hours'
          `,
          legendFormat: 'Completion %'
        }
      ],
      gridPos: { x: 0, y: 0, w: 6, h: 4 }
    },
    {
      title: 'Average Phase Duration',
      type: 'graph',
      targets: [
        {
          query: `
            SELECT 
              phase,
              AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration
            FROM mbmd_evidence
            WHERE timestamp > NOW() - INTERVAL '7 days'
            GROUP BY phase
            ORDER BY phase
          `,
          legendFormat: '{{phase}}'
        }
      ],
      gridPos: { x: 6, y: 0, w: 12, h: 4 }
    },
    {
      title: 'Architect Approval Rate',
      type: 'stat',
      targets: [
        {
          query: `
            SELECT 
              COUNT(CASE WHEN approved = true THEN 1 END) * 100.0 / COUNT(*) as approval_rate
            FROM mbmd_reviews
            WHERE reviewer = 'architect' AND reviewed_at > NOW() - INTERVAL '24 hours'
          `,
          legendFormat: 'Approval %'
        }
      ],
      gridPos: { x: 18, y: 0, w: 6, h: 4 }
    },
    {
      title: 'Test Pass Rate',
      type: 'stat',
      targets: [
        {
          query: `
            SELECT 
              COUNT(CASE WHEN evidence_data->>'testsPassed' = 'true' THEN 1 END) * 100.0 / COUNT(*) as pass_rate
            FROM mbmd_evidence
            WHERE evidence_type = 'test_results' AND timestamp > NOW() - INTERVAL '24 hours'
          `,
          legendFormat: 'Pass %'
        }
      ],
      gridPos: { x: 0, y: 4, w: 6, h: 4 }
    },
    {
      title: 'Screenshot Capture Success Rate',
      type: 'stat',
      targets: [
        {
          query: `
            SELECT 
              COUNT(CASE WHEN evidence_path IS NOT NULL THEN 1 END) * 100.0 / COUNT(*) as capture_rate
            FROM mbmd_evidence
            WHERE evidence_type = 'screenshot' AND timestamp > NOW() - INTERVAL '24 hours'
          `,
          legendFormat: 'Capture %'
        }
      ],
      gridPos: { x: 6, y: 4, w: 6, h: 4 }
    },
    {
      title: 'Sessions by Status',
      type: 'graph',
      targets: [
        {
          query: `
            SELECT 
              time_bucket('1 hour', created_at) as time,
              status,
              COUNT(*) as count
            FROM mbmd_sessions
            WHERE created_at > NOW() - INTERVAL '24 hours'
            GROUP BY time, status
            ORDER BY time
          `,
          legendFormat: '{{status}}'
        }
      ],
      gridPos: { x: 12, y: 4, w: 12, h: 4 }
    },
    {
      title: 'Evidence Upload Volume',
      type: 'graph',
      targets: [
        {
          query: `
            SELECT 
              time_bucket('1 hour', timestamp) as time,
              phase,
              COUNT(*) as count
            FROM mbmd_evidence
            WHERE timestamp > NOW() - INTERVAL '24 hours'
            GROUP BY time, phase
            ORDER BY time
          `,
          legendFormat: '{{phase}}'
        }
      ],
      gridPos: { x: 0, y: 8, w: 12, h: 4 }
    },
    {
      title: 'Execution Mode Distribution',
      type: 'graph',
      targets: [
        {
          query: `
            SELECT 
              execution_mode,
              COUNT(*) as count
            FROM mbmd_sessions
            WHERE created_at > NOW() - INTERVAL '7 days'
            GROUP BY execution_mode
          `,
          legendFormat: '{{execution_mode}}'
        }
      ],
      gridPos: { x: 12, y: 8, w: 12, h: 4 }
    }
  ]
};

/**
 * Dashboard 2: Session Timeline
 */
export const MBMD_SESSION_TIMELINE_DASHBOARD: GrafanaDashboard = {
  title: 'MB.MD Session Timeline',
  uid: 'mbmd-session-timeline',
  tags: ['mbmd', 'sessions', 'timeline'],
  panels: [
    {
      title: 'Session Flow Waterfall',
      type: 'heatmap',
      targets: [
        {
          query: `
            SELECT 
              s.id as session_id,
              e.phase,
              EXTRACT(EPOCH FROM (e.timestamp - s.created_at)) as time_offset
            FROM mbmd_sessions s
            JOIN mbmd_evidence e ON e.session_id = s.id
            WHERE s.created_at > NOW() - INTERVAL '24 hours'
            ORDER BY s.id, e.timestamp
          `
        }
      ],
      gridPos: { x: 0, y: 0, w: 24, h: 8 }
    },
    {
      title: 'Recent Sessions Table',
      type: 'table',
      targets: [
        {
          query: `
            SELECT 
              id,
              feature,
              status,
              execution_mode,
              created_at,
              completed_at,
              EXTRACT(EPOCH FROM (completed_at - created_at)) as duration_seconds
            FROM mbmd_sessions
            WHERE created_at > NOW() - INTERVAL '24 hours'
            ORDER BY created_at DESC
            LIMIT 100
          `
        }
      ],
      gridPos: { x: 0, y: 8, w: 24, h: 8 }
    }
  ]
};

/**
 * Dashboard 3: Evidence Collection
 */
export const MBMD_EVIDENCE_DASHBOARD: GrafanaDashboard = {
  title: 'MB.MD Evidence Collection',
  uid: 'mbmd-evidence',
  tags: ['mbmd', 'evidence', 'uploads'],
  panels: [
    {
      title: 'Evidence by Type',
      type: 'graph',
      targets: [
        {
          query: `
            SELECT 
              time_bucket('1 hour', timestamp) as time,
              evidence_type,
              COUNT(*) as count
            FROM mbmd_evidence
            WHERE timestamp > NOW() - INTERVAL '24 hours'
            GROUP BY time, evidence_type
            ORDER BY time
          `,
          legendFormat: '{{evidence_type}}'
        }
      ],
      gridPos: { x: 0, y: 0, w: 12, h: 6 }
    },
    {
      title: 'Upload Success Rate',
      type: 'stat',
      targets: [
        {
          query: `
            SELECT 
              COUNT(CASE WHEN evidence_path IS NOT NULL THEN 1 END) * 100.0 / COUNT(*) as success_rate
            FROM mbmd_evidence
            WHERE timestamp > NOW() - INTERVAL '24 hours'
          `,
          legendFormat: 'Success %'
        }
      ],
      gridPos: { x: 12, y: 0, w: 6, h: 6 }
    },
    {
      title: 'Storage Usage',
      type: 'stat',
      targets: [
        {
          query: `
            SELECT 
              COALESCE(SUM((metadata->>'fileSize')::bigint), 0) / (1024*1024) as storage_mb
            FROM mbmd_evidence
            WHERE evidence_path IS NOT NULL
          `,
          legendFormat: 'Storage MB'
        }
      ],
      gridPos: { x: 18, y: 0, w: 6, h: 6 }
    },
    {
      title: 'Recent Evidence Uploads',
      type: 'table',
      targets: [
        {
          query: `
            SELECT 
              session_id,
              phase,
              evidence_type,
              evidence_path,
              timestamp,
              metadata->>'fileSize' as file_size
            FROM mbmd_evidence
            WHERE timestamp > NOW() - INTERVAL '6 hours'
            ORDER BY timestamp DESC
            LIMIT 50
          `
        }
      ],
      gridPos: { x: 0, y: 6, w: 24, h: 8 }
    }
  ]
};

/**
 * Dashboard 4: Quality Gates
 */
export const MBMD_QUALITY_GATES_DASHBOARD: GrafanaDashboard = {
  title: 'MB.MD Quality Gates',
  uid: 'mbmd-quality-gates',
  tags: ['mbmd', 'quality', 'architect', 'qa'],
  panels: [
    {
      title: 'Architect Reviews Over Time',
      type: 'graph',
      targets: [
        {
          query: `
            SELECT 
              time_bucket('1 hour', reviewed_at) as time,
              CASE WHEN approved THEN 'Approved' ELSE 'Rejected' END as status,
              COUNT(*) as count
            FROM mbmd_reviews
            WHERE reviewer = 'architect' AND reviewed_at > NOW() - INTERVAL '24 hours'
            GROUP BY time, status
            ORDER BY time
          `,
          legendFormat: '{{status}}'
        }
      ],
      gridPos: { x: 0, y: 0, w: 12, h: 6 }
    },
    {
      title: 'QA Review Stats',
      type: 'graph',
      targets: [
        {
          query: `
            SELECT 
              time_bucket('1 hour', reviewed_at) as time,
              CASE WHEN approved THEN 'Passed' ELSE 'Failed' END as status,
              COUNT(*) as count
            FROM mbmd_reviews
            WHERE reviewer = 'qa' AND reviewed_at > NOW() - INTERVAL '24 hours'
            GROUP BY time, status
            ORDER BY time
          `,
          legendFormat: '{{status}}'
        }
      ],
      gridPos: { x: 12, y: 0, w: 12, h: 6 }
    },
    {
      title: 'Common Rejection Reasons',
      type: 'table',
      targets: [
        {
          query: `
            SELECT 
              feedback,
              COUNT(*) as occurrences
            FROM mbmd_reviews
            WHERE approved = false AND reviewed_at > NOW() - INTERVAL '7 days'
            GROUP BY feedback
            ORDER BY occurrences DESC
            LIMIT 10
          `
        }
      ],
      gridPos: { x: 0, y: 6, w: 12, h: 8 }
    },
    {
      title: 'Review Response Time',
      type: 'graph',
      targets: [
        {
          query: `
            SELECT 
              time_bucket('1 hour', r.reviewed_at) as time,
              AVG(EXTRACT(EPOCH FROM (r.reviewed_at - s.created_at))) as avg_response_time
            FROM mbmd_reviews r
            JOIN mbmd_sessions s ON r.session_id = s.id
            WHERE r.reviewed_at > NOW() - INTERVAL '24 hours'
            GROUP BY time
            ORDER BY time
          `,
          legendFormat: 'Avg Response Time (seconds)'
        }
      ],
      gridPos: { x: 12, y: 6, w: 12, h: 8 }
    }
  ]
};

/**
 * Export all dashboards as JSON for Grafana import
 */
export function exportGrafanaDashboards(): string[] {
  return [
    JSON.stringify(MBMD_COMPLIANCE_DASHBOARD, null, 2),
    JSON.stringify(MBMD_SESSION_TIMELINE_DASHBOARD, null, 2),
    JSON.stringify(MBMD_EVIDENCE_DASHBOARD, null, 2),
    JSON.stringify(MBMD_QUALITY_GATES_DASHBOARD, null, 2)
  ];
}
