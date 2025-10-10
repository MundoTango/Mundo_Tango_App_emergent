#!/usr/bin/env python3
"""
ESA LIFE CEO 61×21 Framework - Functional Agent Base System
Real AI agents that perform actual work using Emergent LLM integration
"""

import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional
from abc import ABC, abstractmethod
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage  # type: ignore
    print("✅ Emergent integrations loaded successfully")
except ImportError as e:
    print(f"❌ Failed to import emergent integrations: {e}")
    print("Please run: pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/")
    exit(1)

class AgentTask:
    """Represents a task for an agent to perform"""
    def __init__(self, task_type: str, description: str, context: Dict[str, Any], expected_output: str = ""):
        self.id = str(uuid.uuid4())
        self.task_type = task_type
        self.description = description
        self.context = context
        self.expected_output = expected_output
        self.created_at = datetime.now()

class WorkResult:
    """Result of agent work execution"""
    def __init__(self, success: bool, result: Any, confidence: float, agent_id: str, duration_ms: int):
        self.success = success
        self.result = result
        self.confidence = confidence
        self.agent_id = agent_id
        self.duration_ms = duration_ms
        self.completed_at = datetime.now()

class Decision:
    """Agent decision with reasoning"""
    def __init__(self, decision: Any, reasoning: str, confidence: float, alternatives: List[Any]):
        self.decision = decision
        self.reasoning = reasoning
        self.confidence = confidence
        self.alternatives = alternatives
        self.made_at = datetime.now()

class FunctionalAgent(ABC):
    """Base class for all functional AI agents"""
    
    def __init__(self, layer_id: int, layer_name: str, specialization: str):
        self.layer_id = layer_id
        self.layer_name = layer_name
        self.specialization = specialization
        self.work_history: List[Dict[str, Any]] = []
        self.learnings: List[Dict[str, Any]] = []
        self.collaboration_history: List[Dict[str, Any]] = []
        
        # Initialize Emergent LLM Chat
        self.llm_chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY", "sk-emergent-b629d189d80B9D02dA"),
            session_id=f"layer-{layer_id}-{layer_name.lower().replace(' ', '-').replace('&', 'and')}",
            system_message=self.get_system_prompt()
        ).with_model("openai", "gpt-4o-mini")  # Cost-effective model for production
        
        print(f"🤖 Functional Agent {layer_id} ({layer_name}) initialized")
        print(f"   📋 Specialization: {specialization}")
    
    @abstractmethod
    def get_system_prompt(self) -> str:
        """Get specialized system prompt for this agent"""
        pass
    
    async def execute_work(self, task: AgentTask) -> WorkResult:
        """Execute actual work using AI reasoning and domain expertise"""
        start_time = datetime.now()
        
        try:
            # Create specialized prompt for work execution
            work_prompt = f"""
AGENT SPECIALIZATION: {self.specialization}
LAYER {self.layer_id}: {self.layer_name}

TASK TO PERFORM:
Type: {task.task_type}
Description: {task.description}
Expected Output: {task.expected_output}

CONTEXT:
{json.dumps(task.context, indent=2)}

INSTRUCTIONS:
1. Analyze the task using your specialized expertise
2. Perform the requested work with domain-specific knowledge
3. Provide detailed, actionable results
4. Include specific recommendations and next steps
5. Format technical outputs as structured data when appropriate

Deliver professional-grade work that demonstrates your expertise in {self.specialization}.
"""
            
            user_message = UserMessage(text=work_prompt)
            response = await self.llm_chat.send_message(user_message)
            
            # Calculate execution metrics
            duration = (datetime.now() - start_time).total_seconds() * 1000  # milliseconds
            confidence = self.calculate_confidence(task, response)
            
            # Record work session
            work_session = {
                "task_id": task.id,
                "task_type": task.task_type,
                "description": task.description,
                "response": response,
                "confidence": confidence,
                "duration_ms": int(duration),
                "success": True,
                "timestamp": datetime.now().isoformat()
            }
            self.work_history.append(work_session)
            
            return WorkResult(
                success=True,
                result=response,
                confidence=confidence,
                agent_id=f"Layer{self.layer_id}",
                duration_ms=int(duration)
            )
            
        except Exception as e:
            duration = (datetime.now() - start_time).total_seconds() * 1000
            
            # Record failed session
            error_session = {
                "task_id": task.id,
                "task_type": task.task_type,
                "error": str(e),
                "duration_ms": int(duration),
                "success": False,
                "timestamp": datetime.now().isoformat()
            }
            self.work_history.append(error_session)
            
            return WorkResult(
                success=False,
                result=f"Agent execution failed: {str(e)}",
                confidence=0.0,
                agent_id=f"Layer{self.layer_id}",
                duration_ms=int(duration)
            )
    
    async def make_decision(self, context: Dict[str, Any], options: Optional[List[Any]] = None) -> Decision:
        """Make intelligent decisions based on context and expertise"""
        try:
            decision_prompt = f"""
AGENT EXPERTISE: {self.specialization} (Layer {self.layer_id}: {self.layer_name})

DECISION CONTEXT:
{json.dumps(context, indent=2)}

AVAILABLE OPTIONS:
{json.dumps(options, indent=2) if options else "Analyze context and determine best course of action"}

DECISION REQUIREMENTS:
1. Analyze the situation with your specialized expertise
2. Consider all available information and constraints
3. Evaluate risks and benefits of each option
4. Make the optimal decision based on your domain knowledge
5. Provide clear reasoning for your choice

RESPONSE FORMAT:
{{
  "decision": "your_specific_decision",
  "reasoning": "detailed_explanation_of_why",
  "confidence": 0.85,
  "alternatives": ["alternative_option_1", "alternative_option_2"],
  "risks": ["potential_risk_1", "potential_risk_2"],
  "benefits": ["expected_benefit_1", "expected_benefit_2"],
  "next_steps": ["recommended_action_1", "recommended_action_2"]
}}
"""
            
            user_message = UserMessage(text=decision_prompt)
            response = await self.llm_chat.send_message(user_message)
            
            # Parse decision response (simplified parsing)
            try:
                decision_data = json.loads(response) if response.strip().startswith('{') else {"decision": response}
            except:
                decision_data = {"decision": response}
            
            decision = Decision(
                decision=decision_data.get("decision", response),
                reasoning=decision_data.get("reasoning", "Decision based on agent expertise"),
                confidence=decision_data.get("confidence", 0.8),
                alternatives=decision_data.get("alternatives", [])
            )
            
            return decision
            
        except Exception as e:
            return Decision(
                decision=f"Decision failed: {str(e)}",
                reasoning="Agent encountered an error during decision making",
                confidence=0.0,
                alternatives=[]
            )
    
    async def learn_from_experience(self, experience: Dict[str, Any]) -> Dict[str, Any]:
        """Learn and adapt from experiences to improve future performance"""
        try:
            learning_prompt = f"""
AGENT LEARNING SESSION: Layer {self.layer_id} ({self.layer_name})
SPECIALIZATION: {self.specialization}

EXPERIENCE TO LEARN FROM:
{json.dumps(experience, indent=2)}

LEARNING OBJECTIVES:
1. Extract key insights from this experience
2. Identify what worked well and what could be improved
3. Develop new strategies or approaches for similar situations
4. Update internal knowledge and capabilities
5. Plan how to apply learnings to future tasks

LEARNING OUTPUT FORMAT:
{{
  "key_insights": ["insight_1", "insight_2"],
  "improvements_identified": ["improvement_1", "improvement_2"],
  "new_strategies": ["strategy_1", "strategy_2"],
  "knowledge_updates": ["knowledge_1", "knowledge_2"],
  "future_applications": ["application_1", "application_2"],
  "confidence_in_learning": 0.9
}}
"""
            
            user_message = UserMessage(text=learning_prompt)
            response = await self.llm_chat.send_message(user_message)
            
            # Store learning
            learning_record = {
                "experience": experience,
                "learning_response": response,
                "timestamp": datetime.now().isoformat(),
                "agent_id": self.layer_id
            }
            self.learnings.append(learning_record)
            
            return {
                "success": True,
                "learning": response,
                "total_learnings": len(self.learnings),
                "agent": f"Layer {self.layer_id}"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": f"Layer {self.layer_id}"
            }
    
    async def collaborate_with(self, other_agents: List['FunctionalAgent'], workflow: Dict[str, Any]) -> Dict[str, Any]:
        """Collaborate with other agents on complex workflows"""
        try:
            collaboration_prompt = f"""
MULTI-AGENT COLLABORATION: Layer {self.layer_id} ({self.layer_name})
YOUR ROLE: {self.specialization}

WORKFLOW CONTEXT:
{json.dumps(workflow, indent=2)}

COLLABORATING AGENTS:
{[f"Layer {agent.layer_id}: {agent.layer_name}" for agent in other_agents]}

COLLABORATION OBJECTIVES:
1. Understand your role in this multi-agent workflow
2. Identify how to best contribute your specialized expertise
3. Determine coordination points with other agents
4. Plan your specific deliverables and timing
5. Anticipate dependencies and handoff points

COLLABORATION OUTPUT:
{{
  "your_contribution": "specific_work_you_will_perform",
  "coordination_points": ["point_1", "point_2"],
  "dependencies": ["dependency_1", "dependency_2"],
  "deliverables": ["deliverable_1", "deliverable_2"],
  "timeline": "your_estimated_timeline",
  "success_criteria": ["criteria_1", "criteria_2"]
}}
"""
            
            user_message = UserMessage(text=collaboration_prompt)
            response = await self.llm_chat.send_message(user_message)
            
            # Record collaboration
            collaboration_record = {
                "workflow": workflow,
                "collaborating_agents": [agent.layer_id for agent in other_agents],
                "response": response,
                "timestamp": datetime.now().isoformat()
            }
            self.collaboration_history.append(collaboration_record)
            
            return {
                "success": True,
                "collaboration_plan": response,
                "agent": f"Layer {self.layer_id}"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": f"Layer {self.layer_id}"
            }
    
    def calculate_confidence(self, task: AgentTask, response: str) -> float:
        """Calculate confidence score for agent work"""
        # Simple confidence calculation based on response characteristics
        if not response or len(response) < 50:
            return 0.3
        
        # Higher confidence for longer, more detailed responses
        base_confidence = min(0.9, 0.5 + (len(response) / 2000))
        
        # Adjust based on task complexity
        if task.context and len(task.context) > 5:
            base_confidence += 0.1
            
        return min(0.95, base_confidence)
    
    def get_status(self) -> Dict[str, Any]:
        """Get current agent status and performance metrics"""
        total_tasks = len(self.work_history)
        successful_tasks = len([w for w in self.work_history if w.get("success", False)])
        
        return {
            "agent_id": self.layer_id,
            "agent_name": self.layer_name,
            "specialization": self.specialization,
            "status": "active",
            "performance": {
                "total_tasks": total_tasks,
                "successful_tasks": successful_tasks,
                "success_rate": (successful_tasks / total_tasks * 100) if total_tasks > 0 else 0,
                "total_learnings": len(self.learnings),
                "collaborations": len(self.collaboration_history)
            },
            "last_activity": self.work_history[-1]["timestamp"] if self.work_history else None
        }

# Agent Storage System
class AgentRegistry:
    """Registry for all functional agents"""
    def __init__(self):
        self.agents: Dict[int, FunctionalAgent] = {}
        self.orchestrator: Optional[FunctionalAgent] = None  # Layer 35 Master Orchestrator
    
    def register_agent(self, agent: FunctionalAgent):
        """Register an agent in the system"""
        self.agents[agent.layer_id] = agent
        print(f"📝 Registered {agent.layer_name} (Layer {agent.layer_id})")
        
        # Set orchestrator if it's Layer 35
        if agent.layer_id == 35:
            self.orchestrator = agent
            print("👑 Master Orchestrator (Layer 35) registered")
    
    def get_agent(self, layer_id: int) -> Optional[FunctionalAgent]:
        """Get agent by layer ID"""
        return self.agents.get(layer_id)
    
    def get_all_agents(self) -> List[FunctionalAgent]:
        """Get all registered agents"""
        return list(self.agents.values())
    
    async def orchestrate_workflow(self, workflow: Dict[str, Any]) -> Dict[str, Any]:
        """Orchestrate complex multi-agent workflows"""
        if not self.orchestrator:
            return {"success": False, "error": "Master Orchestrator (Layer 35) not available"}
        
        # Note: orchestrate_multi_agent_workflow should be implemented in MasterOrchestratorAgent subclass
        return await self.orchestrator.orchestrate_multi_agent_workflow(workflow, self.agents)  # type: ignore

# Global agent registry
agent_registry = AgentRegistry()

if __name__ == "__main__":
    print("🚀 ESA LIFE CEO 61×21 Functional Agent Base System")
    print("✅ Base classes ready for agent transformation")
    print("🔧 Use this foundation to create real functional agents")