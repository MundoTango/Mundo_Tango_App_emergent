#!/usr/bin/env python3
"""
ESA LIFE CEO 61×21 Framework - Functional Agent API Server
FastAPI server providing REST endpoints for all 61 functional agents
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import asyncio
import sys
import os

# Add the server directory to Python path
sys.path.append('/app/server')
sys.path.append('/app/server/agents')

try:
    from functional_agent_base import FunctionalAgent, AgentTask, agent_registry
    from real_layer35_ai_agent_management import master_orchestrator
    from real_layer01_database_architecture import database_agent
    from real_layer49_security_hardening import security_agent
    from real_layer50_devops_automation import devops_agent
    from real_layer44_knowledge_graph import knowledge_agent
    from real_layer45_reasoning_engine import reasoning_agent
    print("✅ All functional agents imported successfully")
except ImportError as e:
    print(f"❌ Failed to import agents: {e}")
    exit(1)

# Initialize FastAPI app
app = FastAPI(
    title="ESA LIFE CEO 61×21 Functional Agent API",
    description="REST API for calling functional AI agents across all projects",
    version="1.0.0"
)

# Pydantic models for API requests
class AgentTaskRequest(BaseModel):
    task_type: str
    description: str
    context: Dict[str, Any]
    expected_output: Optional[str] = ""

class DecisionRequest(BaseModel):
    context: Dict[str, Any]
    options: Optional[List[Any]] = None

class WorkflowRequest(BaseModel):
    goal: str
    complexity: str = "medium"
    urgency: str = "normal"
    context: Dict[str, Any] = {}
    required_agents: Optional[List[int]] = None

class LearningRequest(BaseModel):
    experience: Dict[str, Any]

# Register all priority agents
def register_priority_agents():
    """Register all functional agents in the system"""
    agent_registry.register_agent(master_orchestrator)  # Layer 35
    agent_registry.register_agent(database_agent)       # Layer 1
    agent_registry.register_agent(security_agent)       # Layer 49
    agent_registry.register_agent(devops_agent)         # Layer 50
    agent_registry.register_agent(knowledge_agent)      # Layer 44
    agent_registry.register_agent(reasoning_agent)      # Layer 45

# API Routes
@app.get("/")
async def root():
    """API health check and information"""
    return {
        "framework": "ESA LIFE CEO 61×21 Functional Agents",
        "version": "1.0.0", 
        "status": "operational",
        "registered_agents": len(agent_registry.agents),
        "available_endpoints": [
            "/agents/framework-status",
            "/agents/{layer_id}/execute-work",
            "/agents/{layer_id}/make-decision", 
            "/agents/{layer_id}/learn",
            "/agents/orchestrate-workflow",
            "/docs"
        ]
    }

@app.get("/agents/framework-status")
async def get_framework_status():
    """Get overall framework status and agent registry"""
    agents = agent_registry.get_all_agents()
    
    return {
        "framework": {
            "name": "ESA LIFE CEO 61×21 Functional Agents",
            "total_layers": 61,
            "implemented_agents": len(agents),
            "completion_percentage": round((len(agents) / 61) * 100, 2)
        },
        "agents": [
            {
                "layer_id": agent.layer_id,
                "name": agent.layer_name,
                "specialization": agent.specialization,
                "status": agent.get_status()
            }
            for agent in agents
        ],
        "orchestrator_available": agent_registry.orchestrator is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/agents/{layer_id}/execute-work")
async def execute_agent_work(layer_id: int, request: AgentTaskRequest):
    """Execute work task using specified agent"""
    agent = agent_registry.get_agent(layer_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent Layer {layer_id} not found or not implemented")
    
    task = AgentTask(
        task_type=request.task_type,
        description=request.description,
        context=request.context,
        expected_output=request.expected_output
    )
    
    result = await agent.execute_work(task)
    
    return {
        "success": result.success,
        "result": result.result,
        "confidence": result.confidence,
        "agent": f"Layer {layer_id}",
        "duration_ms": result.duration_ms,
        "timestamp": result.completed_at.isoformat()
    }

@app.post("/agents/{layer_id}/make-decision")
async def make_agent_decision(layer_id: int, request: DecisionRequest):
    """Get intelligent decision from specified agent"""
    agent = agent_registry.get_agent(layer_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent Layer {layer_id} not found or not implemented")
    
    decision = await agent.make_decision(request.context, request.options)
    
    return {
        "decision": decision.decision,
        "reasoning": decision.reasoning,
        "confidence": decision.confidence,
        "alternatives": decision.alternatives,
        "agent": f"Layer {layer_id}",
        "timestamp": decision.made_at.isoformat()
    }

@app.post("/agents/{layer_id}/learn")
async def agent_learning(layer_id: int, request: LearningRequest):
    """Help agent learn from experience"""
    agent = agent_registry.get_agent(layer_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent Layer {layer_id} not found or not implemented")
    
    learning_result = await agent.learn_from_experience(request.experience)
    
    return learning_result

@app.get("/agents/{layer_id}/status")
async def get_agent_status(layer_id: int):
    """Get status and performance metrics for specified agent"""
    agent = agent_registry.get_agent(layer_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent Layer {layer_id} not found or not implemented")
    
    return agent.get_status()

@app.post("/agents/orchestrate-workflow")
async def orchestrate_multi_agent_workflow(request: WorkflowRequest):
    """Orchestrate complex workflow using multiple agents"""
    if not agent_registry.orchestrator:
        raise HTTPException(status_code=503, detail="Master Orchestrator (Layer 35) not available")
    
    workflow = {
        "goal": request.goal,
        "complexity": request.complexity,
        "urgency": request.urgency,
        "context": request.context,
        "required_agents": request.required_agents
    }
    
    result = await agent_registry.orchestrate_workflow(workflow)
    return result

@app.get("/agents/available")
async def get_available_agents():
    """Get list of all available agents with their capabilities"""
    agents = agent_registry.get_all_agents()
    
    return {
        "total_agents": len(agents),
        "agents": [
            {
                "layer_id": agent.layer_id,
                "name": agent.layer_name,
                "specialization": agent.specialization,
                "capabilities": [
                    "execute_work",
                    "make_decision", 
                    "learn_from_experience",
                    "collaborate_with_others"
                ],
                "status": "active"
            }
            for agent in agents
        ]
    }

@app.get("/agents/performance-report")
async def get_agent_performance_report():
    """Get comprehensive performance report for all agents"""
    agents = agent_registry.get_all_agents()
    
    performance_data = []
    for agent in agents:
        status = agent.get_status()
        performance_data.append({
            "layer_id": agent.layer_id,
            "name": agent.layer_name,
            "performance": status.get("performance", {}),
            "last_activity": status.get("last_activity")
        })
    
    return {
        "report_generated": datetime.now().isoformat(),
        "total_agents": len(agents),
        "performance_data": performance_data,
        "overall_metrics": {
            "avg_success_rate": sum(p["performance"].get("success_rate", 0) for p in performance_data) / len(performance_data) if performance_data else 0,
            "total_tasks_completed": sum(p["performance"].get("successful_tasks", 0) for p in performance_data),
            "total_learnings": sum(p["performance"].get("total_learnings", 0) for p in performance_data)
        }
    }

# Register agents on startup
@app.on_event("startup")
async def startup_event():
    """Register all agents when API starts"""
    print("🚀 Starting ESA LIFE CEO 61×21 Functional Agent API")
    register_priority_agents()
    print(f"✅ API ready with {len(agent_registry.agents)} functional agents")

if __name__ == "__main__":
    import uvicorn
    print("🚀 ESA LIFE CEO 61×21 Functional Agent API Server")
    print("📡 Starting API server for cross-project agent usage...")
    
    # Register agents
    register_priority_agents()
    
    uvicorn.run(app, host="0.0.0.0", port=8002, log_level="info")