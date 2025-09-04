#!/usr/bin/env python3
"""
ESA Life CEO 61x21 Framework - Direct Backend Implementation
This Python FastAPI server provides direct API endpoints for the Mundo Tango application
"""

from fastapi import FastAPI, Request, HTTPException, Form
from fastapi.responses import Response
import httpx
import uvicorn
import os
import psycopg2
import json
from datetime import datetime
from typing import Optional

app = FastAPI(title="Mundo Tango Direct Backend API")

# Database connection
DATABASE_URL = "postgresql://mundotango:mundotango@localhost:5432/mundotango"

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def init_database_tables():
    """Initialize required database tables"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Create reactions table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS reactions (
            id SERIAL PRIMARY KEY,
            post_id INTEGER REFERENCES posts(id),
            user_id INTEGER REFERENCES users(id),
            reaction_type VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(post_id, user_id)
        );
    """)
    
    # Create comments table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            post_id INTEGER REFERENCES posts(id),
            user_id INTEGER REFERENCES users(id),
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # Create shares table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS shares (
            id SERIAL PRIMARY KEY,
            post_id INTEGER REFERENCES posts(id),
            user_id INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    conn.commit()
    cur.close()
    conn.close()

# Initialize tables on startup
init_database_tables()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
        return {"status": "healthy", "database": "connected", "framework": "ESA 61x21"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.get("/api/auth/user")
async def get_current_user():
    """Get current authenticated user"""
    # Return admin user for now since auth system needs to be set up
    return {
        "success": True,
        "data": {
            "id": 1,
            "email": "admin@mundotango.life",
            "name": "Admin User",
            "profileImage": None,
            "tangoRoles": ["admin", "dancer"]
        }
    }

@app.post("/api/auth/logout")
async def logout_user():
    """Logout current user"""
    return {"success": True, "message": "Logged out successfully"}

@app.get("/api/posts/feed")
async def get_posts_feed():
    """Get posts feed"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT p.id, p.content, p.image_url, p.is_public, p.created_at,
                   u.id as user_id, u.name as user_name, u.email as user_email
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC
        """)
        
        posts = []
        for row in cur.fetchall():
            posts.append({
                "id": row[0],
                "content": row[1],
                "imageUrl": row[2],
                "isPublic": row[3],
                "createdAt": row[4].isoformat(),
                "user": {
                    "id": row[5],
                    "name": row[6],
                    "email": row[7]
                },
                "likesCount": 0,
                "commentsCount": 0,
                "sharesCount": 0,
                "hashtags": []
            })
        
        cur.close()
        conn.close()
        return {"success": True, "data": posts}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/api/posts")
async def create_post(request: Request):
    """Create a new post - handle both JSON and FormData"""
    try:
        content_type = request.headers.get("content-type", "")
        
        if "application/json" in content_type:
            # Handle JSON request
            data = await request.json()
            content = data.get("content", "")
            is_public = data.get("visibility", "public") == "public"
            location = data.get("location", "")
            tags = data.get("tags", [])
            
        else:
            # Handle FormData request
            form = await request.form()
            content = form.get("content", "")
            is_public = form.get("isPublic", "true").lower() == "true"
            location = form.get("location", "")
            tags = []
        
        if not content.strip():
            raise HTTPException(status_code=422, detail="Content is required")
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Insert new post (using admin user ID 1)
        cur.execute("""
            INSERT INTO posts (user_id, content, is_public, created_at)
            VALUES (1, %s, %s, NOW())
            RETURNING id, created_at
        """, (content, is_public))
        
        result = cur.fetchone()
        post_id, created_at = result
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            "success": True, 
            "data": {
                "id": post_id,
                "content": content,
                "isPublic": is_public,
                "createdAt": created_at.isoformat(),
                "user": {"id": 1, "name": "Admin User", "email": "admin@mundotango.life"},
                "likesCount": 0,
                "commentsCount": 0,
                "sharesCount": 0,
                "hashtags": tags
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create post: {str(e)}")

@app.post("/api/posts/direct")
async def create_post_with_media(request: Request):
    """Create post with media URLs"""
    try:
        data = await request.json()
        content = data.get("content", "")
        is_public = data.get("visibility", "public") == "public"
        media_urls = data.get("mediaUrls", [])
        
        if not content.strip() and not media_urls:
            raise HTTPException(status_code=422, detail="Content or media is required")
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Insert new post with media
        cur.execute("""
            INSERT INTO posts (user_id, content, is_public, image_url, created_at)
            VALUES (1, %s, %s, %s, NOW())
            RETURNING id, created_at
        """, (content, is_public, media_urls[0] if media_urls else None))
        
        result = cur.fetchone()
        post_id, created_at = result
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            "success": True,
            "data": {
                "id": post_id,
                "content": content,
                "isPublic": is_public,
                "imageUrl": media_urls[0] if media_urls else None,
                "createdAt": created_at.isoformat(),
                "user": {"id": 1, "name": "Admin User", "email": "admin@mundotango.life"}
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create post: {str(e)}")

# Fallback proxy for other endpoints
@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_fallback(request: Request, path: str):
    """Fallback proxy for unhandled endpoints"""
    return {"error": f"Endpoint /{path} not implemented", "method": request.method}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)