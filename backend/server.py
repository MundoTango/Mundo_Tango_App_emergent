#!/usr/bin/env python3
"""
ESA Life CEO 61x21 Framework - Backend Proxy
This Python FastAPI server acts as a proxy to the Node.js application
"""

from fastapi import FastAPI, Request
from fastapi.responses import Response
import httpx
import uvicorn
import os

app = FastAPI(title="Life CEO Backend Proxy")

NODE_SERVER_URL = os.environ.get('NODE_SERVER_URL', 'http://localhost:5000')

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_all(request: Request, path: str):
    """Proxy all requests to the Node.js server except health checks"""
    
    # Handle health and readiness checks directly
    if path in ["health", "ready"]:
        if path == "health":
            return {"status": "healthy", "framework": "ESA 61x21", "proxy": "operational"}
        elif path == "ready":
            return {"status": "ready", "framework": "ESA 61x21", "proxy": "operational", "database": "bypassed"}
    
    async with httpx.AsyncClient() as client:
        try:
            # Forward the request to Node.js server
            url = f"{NODE_SERVER_URL}/{path}"
            
            # Get query parameters
            query_params = str(request.url.query)
            if query_params:
                url += f"?{query_params}"
            
            # Get request body if any
            body = await request.body()
            
            # Forward headers (exclude host to avoid conflicts)
            headers = dict(request.headers)
            headers.pop('host', None)
            
            response = await client.request(
                method=request.method,
                url=url,
                content=body,
                headers=headers,
                timeout=30.0
            )
            
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers)
            )
            
        except Exception as e:
            return {"error": f"Backend proxy error: {str(e)}", "node_server": NODE_SERVER_URL}

@app.get("/")
async def root_health_check():
    """Root health check endpoint"""
    return {"status": "Life CEO Backend Proxy Running", "framework": "ESA 61x21"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "framework": "ESA 61x21", "proxy": "operational"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)