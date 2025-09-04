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

@app.get("/api/user/profile")
async def get_user_profile():
    """Get user profile (for auth validation)"""
    return {
        "success": True,
        "data": {
            "user": {
                "id": 1,
                "email": "admin@mundotango.life",
                "name": "Admin User",
                "username": "admin",
                "profileImage": None,
                "tangoRoles": ["admin", "dancer"]
            }
        }
    }

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
    """Get posts feed with reaction and comment counts"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT p.id, p.content, p.image_url, p.is_public, p.created_at,
                   u.id as user_id, u.name as user_name, u.email as user_email,
                   COALESCE(like_counts.like_count, 0) as likes_count,
                   COALESCE(comment_counts.comment_count, 0) as comments_count,
                   COALESCE(share_counts.share_count, 0) as shares_count
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            LEFT JOIN (
                SELECT post_id, COUNT(*) as like_count 
                FROM reactions 
                WHERE reaction_type = 'like' 
                GROUP BY post_id
            ) like_counts ON p.id = like_counts.post_id
            LEFT JOIN (
                SELECT post_id, COUNT(*) as comment_count 
                FROM comments 
                GROUP BY post_id
            ) comment_counts ON p.id = comment_counts.post_id
            LEFT JOIN (
                SELECT post_id, COUNT(*) as share_count 
                FROM shares 
                GROUP BY post_id
            ) share_counts ON p.id = share_counts.post_id
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
                    "email": row[7],
                    "profileImage": None,
                    "tangoRoles": ["admin", "dancer"] if row[5] == 1 else ["dancer"]
                },
                "likesCount": row[8],
                "commentsCount": row[9],
                "sharesCount": row[10],
                "hashtags": [],
                "isLiked": False  # TODO: Check if current user liked this post
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

@app.post("/api/posts/{post_id}/like")
async def like_post(post_id: int):
    """Like/unlike a post"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if already liked
        cur.execute("SELECT id FROM reactions WHERE post_id = %s AND user_id = 1 AND reaction_type = 'like'", (post_id,))
        existing = cur.fetchone()
        
        if existing:
            # Unlike - remove reaction
            cur.execute("DELETE FROM reactions WHERE post_id = %s AND user_id = 1", (post_id,))
            liked = False
        else:
            # Like - add reaction
            cur.execute("INSERT INTO reactions (post_id, user_id, reaction_type) VALUES (%s, 1, 'like')", (post_id,))
            liked = True
        
        # Get updated count
        cur.execute("SELECT COUNT(*) FROM reactions WHERE post_id = %s AND reaction_type = 'like'", (post_id,))
        like_count = cur.fetchone()[0]
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {"success": True, "liked": liked, "likeCount": like_count}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to like post: {str(e)}")

@app.post("/api/posts/{post_id}/reactions")
async def add_reaction(post_id: int, request: Request):
    """Add reaction to post"""
    try:
        data = await request.json()
        reaction_type = data.get("type", "like")
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Insert or update reaction
        cur.execute("""
            INSERT INTO reactions (post_id, user_id, reaction_type) 
            VALUES (%s, 1, %s)
            ON CONFLICT (post_id, user_id) 
            DO UPDATE SET reaction_type = %s
        """, (post_id, reaction_type, reaction_type))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {"success": True, "reaction": reaction_type}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add reaction: {str(e)}")

@app.post("/api/posts/{post_id}/comments")
async def create_comment(post_id: int, request: Request):
    """Create comment on post"""
    try:
        data = await request.json()
        content = data.get("content", "")
        
        if not content.strip():
            raise HTTPException(status_code=422, detail="Comment content required")
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO comments (post_id, user_id, content, created_at)
            VALUES (%s, 1, %s, NOW())
            RETURNING id, created_at
        """, (post_id, content))
        
        result = cur.fetchone()
        comment_id, created_at = result
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            "success": True,
            "data": {
                "id": comment_id,
                "content": content,
                "createdAt": created_at.isoformat(),
                "user": {"id": 1, "name": "Admin User", "email": "admin@mundotango.life"}
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create comment: {str(e)}")

@app.get("/api/posts/{post_id}/comments")
async def get_comments(post_id: int):
    """Get comments for post"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT c.id, c.content, c.created_at, u.id, u.name, u.email
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = %s
            ORDER BY c.created_at ASC
        """, (post_id,))
        
        comments = []
        for row in cur.fetchall():
            comments.append({
                "id": row[0],
                "content": row[1],
                "createdAt": row[2].isoformat(),
                "user": {"id": row[3], "name": row[4], "email": row[5]}
            })
        
        cur.close()
        conn.close()
        return {"success": True, "data": comments}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get comments: {str(e)}")

@app.post("/api/posts/{post_id}/share")
async def share_post(post_id: int):
    """Share a post"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("INSERT INTO shares (post_id, user_id) VALUES (%s, 1)", (post_id,))
        
        # Get updated share count
        cur.execute("SELECT COUNT(*) FROM shares WHERE post_id = %s", (post_id,))
        share_count = cur.fetchone()[0]
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {"success": True, "shareCount": share_count}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to share post: {str(e)}")

# Fallback proxy for other endpoints
@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_fallback(request: Request, path: str):
    """Fallback proxy for unhandled endpoints"""
    return {"error": f"Endpoint /{path} not implemented", "method": request.method}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)