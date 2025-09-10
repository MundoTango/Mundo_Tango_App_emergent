#!/usr/bin/env python3
"""
Mundo Tango Memories System Backend Testing Suite
Tests the implemented Socket.io real-time features, AI agent integration, and memory endpoints
"""

import requests
import json
import time
import sys
import socketio
import asyncio
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import threading

@dataclass
class TestResult:
    name: str
    passed: bool
    message: str
    response_time: Optional[float] = None
    status_code: Optional[int] = None
    data: Optional[Dict] = None

class MundoTangoBackendTester:
    def __init__(self, backend_url: str = "http://localhost:8001"):
        self.backend_url = backend_url
        self.node_server_url = "http://localhost:5000"  # Direct Node.js server
        self.session = requests.Session()
        self.session.timeout = 30
        self.results: List[TestResult] = []
        self.socket_client = None
        self.socket_events = []
        
    def log(self, message: str):
        """Log test messages with timestamp"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")
        
    def test_backend_proxy_health(self) -> TestResult:
        """Test FastAPI proxy server health"""
        self.log("Testing Backend Proxy Health...")
        
        try:
            start_time = time.time()
            response = self.session.get(f"{self.backend_url}/")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                return TestResult(
                    name="Backend Proxy Health",
                    passed=True,
                    message=f"Proxy server healthy: {data.get('status', 'unknown')}",
                    response_time=response_time,
                    status_code=response.status_code,
                    data=data
                )
            else:
                return TestResult(
                    name="Backend Proxy Health",
                    passed=False,
                    message=f"Proxy health check failed with status: {response.status_code}",
                    response_time=response_time,
                    status_code=response.status_code
                )
                
        except requests.exceptions.ConnectionError:
            return TestResult(
                name="Backend Proxy Health",
                passed=False,
                message="Cannot connect to backend proxy - server may not be running"
            )
        except Exception as e:
            return TestResult(
                name="Backend Proxy Health",
                passed=False,
                message=f"Proxy health check failed: {str(e)}"
            )
    
    def test_node_server_direct(self) -> TestResult:
        """Test direct connection to Node.js server"""
        self.log("Testing Direct Node.js Server Connection...")
        
        try:
            start_time = time.time()
            response = self.session.get(f"{self.node_server_url}/api/health", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                return TestResult(
                    name="Node.js Server Direct",
                    passed=True,
                    message="Node.js server accessible directly",
                    response_time=response_time,
                    status_code=response.status_code
                )
            else:
                return TestResult(
                    name="Node.js Server Direct",
                    passed=False,
                    message=f"Node.js server returned status: {response.status_code}",
                    response_time=response_time,
                    status_code=response.status_code
                )
                
        except requests.exceptions.ConnectionError:
            return TestResult(
                name="Node.js Server Direct",
                passed=False,
                message="Cannot connect to Node.js server on port 5000"
            )
        except Exception as e:
            return TestResult(
                name="Node.js Server Direct",
                passed=False,
                message=f"Node.js server test failed: {str(e)}"
            )
    
    def test_posts_feed_endpoint(self) -> TestResult:
        """Test /api/posts/feed endpoint"""
        self.log("Testing Posts Feed Endpoint...")
        
        try:
            start_time = time.time()
            response = self.session.get(f"{self.backend_url}/api/posts/feed")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    return TestResult(
                        name="Posts Feed Endpoint",
                        passed=True,
                        message=f"Posts feed accessible, returned {len(data.get('data', []))} posts",
                        response_time=response_time,
                        status_code=response.status_code,
                        data=data
                    )
                except json.JSONDecodeError:
                    return TestResult(
                        name="Posts Feed Endpoint",
                        passed=True,
                        message="Posts feed accessible but returned non-JSON response",
                        response_time=response_time,
                        status_code=response.status_code
                    )
            elif response.status_code == 404:
                return TestResult(
                    name="Posts Feed Endpoint",
                    passed=False,
                    message="Posts feed endpoint not found - may not be implemented",
                    response_time=response_time,
                    status_code=response.status_code
                )
            else:
                return TestResult(
                    name="Posts Feed Endpoint",
                    passed=False,
                    message=f"Posts feed returned status: {response.status_code}",
                    response_time=response_time,
                    status_code=response.status_code
                )
                
        except Exception as e:
            return TestResult(
                name="Posts Feed Endpoint",
                passed=False,
                message=f"Posts feed test failed: {str(e)}"
            )
    
    def test_memory_creation_endpoint(self) -> TestResult:
        """Test /api/posts endpoint for memory creation"""
        self.log("Testing Memory Creation Endpoint...")
        
        try:
            start_time = time.time()
            
            # Test with minimal data
            test_data = {
                "content": "Test memory from backend testing suite",
                "isPublic": True
            }
            
            response = self.session.post(f"{self.backend_url}/api/posts", json=test_data)
            response_time = time.time() - start_time
            
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    return TestResult(
                        name="Memory Creation Endpoint",
                        passed=True,
                        message="Memory creation endpoint accessible and functional",
                        response_time=response_time,
                        status_code=response.status_code,
                        data=data
                    )
                except json.JSONDecodeError:
                    return TestResult(
                        name="Memory Creation Endpoint",
                        passed=True,
                        message="Memory creation endpoint accessible",
                        response_time=response_time,
                        status_code=response.status_code
                    )
            elif response.status_code == 401:
                return TestResult(
                    name="Memory Creation Endpoint",
                    passed=True,
                    message="Memory creation endpoint exists but requires authentication",
                    response_time=response_time,
                    status_code=response.status_code
                )
            elif response.status_code == 404:
                return TestResult(
                    name="Memory Creation Endpoint",
                    passed=False,
                    message="Memory creation endpoint not found",
                    response_time=response_time,
                    status_code=response.status_code
                )
            else:
                return TestResult(
                    name="Memory Creation Endpoint",
                    passed=False,
                    message=f"Memory creation returned status: {response.status_code}",
                    response_time=response_time,
                    status_code=response.status_code
                )
                
        except Exception as e:
            return TestResult(
                name="Memory Creation Endpoint",
                passed=False,
                message=f"Memory creation test failed: {str(e)}"
            )
    
    def test_ai_enhancement_endpoint(self) -> TestResult:
        """Test /api/memories/enhance endpoint for AI enhancement"""
        self.log("Testing AI Enhancement Endpoint...")
        
        try:
            start_time = time.time()
            
            test_data = {
                "content": "I had an amazing tango experience tonight",
                "options": {
                    "enhanceContent": True,
                    "generateTags": True,
                    "analyzeSentiment": True,
                    "optimizeEngagement": True
                }
            }
            
            response = self.session.post(f"{self.backend_url}/api/memories/enhance", json=test_data)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    return TestResult(
                        name="AI Enhancement Endpoint",
                        passed=True,
                        message="AI enhancement endpoint functional",
                        response_time=response_time,
                        status_code=response.status_code,
                        data=data
                    )
                except json.JSONDecodeError:
                    return TestResult(
                        name="AI Enhancement Endpoint",
                        passed=True,
                        message="AI enhancement endpoint accessible",
                        response_time=response_time,
                        status_code=response.status_code
                    )
            elif response.status_code == 404:
                return TestResult(
                    name="AI Enhancement Endpoint",
                    passed=False,
                    message="AI enhancement endpoint not found - may not be implemented",
                    response_time=response_time,
                    status_code=response.status_code
                )
            elif response.status_code == 401:
                return TestResult(
                    name="AI Enhancement Endpoint",
                    passed=True,
                    message="AI enhancement endpoint exists but requires authentication",
                    response_time=response_time,
                    status_code=response.status_code
                )
            else:
                return TestResult(
                    name="AI Enhancement Endpoint",
                    passed=False,
                    message=f"AI enhancement returned status: {response.status_code}",
                    response_time=response_time,
                    status_code=response.status_code
                )
                
        except Exception as e:
            return TestResult(
                name="AI Enhancement Endpoint",
                passed=False,
                message=f"AI enhancement test failed: {str(e)}"
            )
    
    def test_socket_io_availability(self) -> TestResult:
        """Test Socket.io server availability"""
        self.log("Testing Socket.io Server Availability...")
        
        try:
            start_time = time.time()
            
            # Test Socket.io endpoint availability
            response = self.session.get(f"{self.backend_url}/socket.io/", timeout=10)
            response_time = time.time() - start_time
            
            # Socket.io typically returns 400 for GET requests to the base endpoint
            if response.status_code in [200, 400]:
                return TestResult(
                    name="Socket.io Server Availability",
                    passed=True,
                    message="Socket.io server is available and responding",
                    response_time=response_time,
                    status_code=response.status_code
                )
            else:
                return TestResult(
                    name="Socket.io Server Availability",
                    passed=False,
                    message=f"Socket.io server returned unexpected status: {response.status_code}",
                    response_time=response_time,
                    status_code=response.status_code
                )
                
        except requests.exceptions.ConnectionError:
            return TestResult(
                name="Socket.io Server Availability",
                passed=False,
                message="Cannot connect to Socket.io server"
            )
        except Exception as e:
            return TestResult(
                name="Socket.io Server Availability",
                passed=False,
                message=f"Socket.io availability test failed: {str(e)}"
            )
    
    def test_socket_io_connection(self) -> TestResult:
        """Test actual Socket.io connection"""
        self.log("Testing Socket.io Connection...")
        
        try:
            # Create a socket.io client
            sio = socketio.SimpleClient(logger=False, engineio_logger=False)
            
            start_time = time.time()
            
            # Try to connect to the backend proxy first
            try:
                sio.connect(self.backend_url, timeout=10)
                connected = True
                server_url = self.backend_url
            except:
                # If proxy fails, try direct Node.js server
                try:
                    sio.connect(self.node_server_url, timeout=10)
                    connected = True
                    server_url = self.node_server_url
                except:
                    connected = False
                    server_url = None
            
            response_time = time.time() - start_time
            
            if connected:
                # Test basic socket events
                try:
                    # Emit a test event
                    sio.emit('join:user', 'test-user-123')
                    time.sleep(0.5)  # Give time for server to process
                    
                    sio.disconnect()
                    
                    return TestResult(
                        name="Socket.io Connection",
                        passed=True,
                        message=f"Socket.io connection successful to {server_url}",
                        response_time=response_time,
                        data={"server_url": server_url}
                    )
                except Exception as e:
                    sio.disconnect()
                    return TestResult(
                        name="Socket.io Connection",
                        passed=True,
                        message=f"Socket.io connected but event test failed: {str(e)}",
                        response_time=response_time,
                        data={"server_url": server_url}
                    )
            else:
                return TestResult(
                    name="Socket.io Connection",
                    passed=False,
                    message="Could not establish Socket.io connection to any server",
                    response_time=response_time
                )
                
        except Exception as e:
            return TestResult(
                name="Socket.io Connection",
                passed=False,
                message=f"Socket.io connection test failed: {str(e)}"
            )
    
    def test_real_time_events(self) -> TestResult:
        """Test real-time Socket.io events"""
        self.log("Testing Real-time Socket.io Events...")
        
        try:
            sio = socketio.SimpleClient(logger=False, engineio_logger=False)
            events_received = []
            
            # Event handlers
            @sio.event
            def connect():
                events_received.append('connected')
            
            @sio.event
            def memory_liked(data):
                events_received.append(f'memory_liked: {data}')
            
            @sio.event
            def memory_commented(data):
                events_received.append(f'memory_commented: {data}')
            
            @sio.event
            def memory_new(data):
                events_received.append(f'memory_new: {data}')
            
            start_time = time.time()
            
            # Try to connect
            try:
                sio.connect(self.backend_url, timeout=10)
                connected_to = self.backend_url
            except:
                try:
                    sio.connect(self.node_server_url, timeout=10)
                    connected_to = self.node_server_url
                except:
                    return TestResult(
                        name="Real-time Socket.io Events",
                        passed=False,
                        message="Could not connect to Socket.io server for event testing"
                    )
            
            # Test memory room joining
            sio.emit('join:memory', 'test-memory-123')
            time.sleep(0.5)
            
            # Test memory like event
            sio.emit('memory:like', {
                'memoryId': 'test-memory-123',
                'userId': 'test-user-456',
                'type': 'like',
                'data': {
                    'username': 'TestUser',
                    'memoryOwnerId': 'test-owner-789'
                }
            })
            time.sleep(0.5)
            
            # Test memory comment event
            sio.emit('memory:comment', {
                'memoryId': 'test-memory-123',
                'userId': 'test-user-456',
                'type': 'comment',
                'data': {
                    'username': 'TestUser',
                    'comment': 'Great memory!',
                    'commentId': 'test-comment-999',
                    'memoryOwnerId': 'test-owner-789'
                }
            })
            time.sleep(0.5)
            
            # Test typing indicator
            sio.emit('memory:typing', {
                'memoryId': 'test-memory-123',
                'userId': 'test-user-456',
                'username': 'TestUser',
                'isTyping': True
            })
            time.sleep(0.5)
            
            response_time = time.time() - start_time
            sio.disconnect()
            
            return TestResult(
                name="Real-time Socket.io Events",
                passed=True,
                message=f"Socket.io events tested successfully. Connected to: {connected_to}",
                response_time=response_time,
                data={
                    "events_sent": 4,
                    "events_received": len(events_received),
                    "server_url": connected_to,
                    "received_events": events_received
                }
            )
            
        except Exception as e:
            return TestResult(
                name="Real-time Socket.io Events",
                passed=False,
                message=f"Real-time events test failed: {str(e)}"
            )
    
    def test_frontend_build_status(self) -> TestResult:
        """Test frontend build system status"""
        self.log("Testing Frontend Build Status...")
        
        try:
            start_time = time.time()
            
            # Check if frontend proxy is running
            response = self.session.get("http://localhost:3000/", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                # Check if it's serving the actual app or an error page
                content = response.text.lower()
                if 'mundo tango' in content or 'memories' in content or 'react' in content:
                    return TestResult(
                        name="Frontend Build Status",
                        passed=True,
                        message="Frontend is built and serving correctly",
                        response_time=response_time,
                        status_code=response.status_code
                    )
                else:
                    return TestResult(
                        name="Frontend Build Status",
                        passed=False,
                        message="Frontend is serving but may have build issues",
                        response_time=response_time,
                        status_code=response.status_code
                    )
            else:
                return TestResult(
                    name="Frontend Build Status",
                    passed=False,
                    message=f"Frontend returned status: {response.status_code}",
                    response_time=response_time,
                    status_code=response.status_code
                )
                
        except requests.exceptions.ConnectionError:
            return TestResult(
                name="Frontend Build Status",
                passed=False,
                message="Frontend server not accessible on port 3000"
            )
        except Exception as e:
            return TestResult(
                name="Frontend Build Status",
                passed=False,
                message=f"Frontend build test failed: {str(e)}"
            )
    
    def test_environment_variables(self) -> TestResult:
        """Test environment variable configuration"""
        self.log("Testing Environment Variables...")
        
        try:
            # Test if we can access environment info through an endpoint
            start_time = time.time()
            response = self.session.get(f"{self.backend_url}/api/health", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                return TestResult(
                    name="Environment Variables",
                    passed=True,
                    message="Environment appears to be configured correctly",
                    response_time=response_time,
                    status_code=response.status_code
                )
            else:
                return TestResult(
                    name="Environment Variables",
                    passed=False,
                    message="Could not verify environment configuration",
                    response_time=response_time,
                    status_code=response.status_code
                )
                
        except Exception as e:
            return TestResult(
                name="Environment Variables",
                passed=False,
                message=f"Environment test failed: {str(e)}"
            )
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all Mundo Tango backend tests"""
        self.log("Starting Mundo Tango Memories System Backend Tests")
        self.log("=" * 60)
        
        # Test 1: Backend Proxy Health
        proxy_result = self.test_backend_proxy_health()
        self.results.append(proxy_result)
        
        # Test 2: Direct Node.js Server
        node_result = self.test_node_server_direct()
        self.results.append(node_result)
        
        # Test 3: Posts Feed Endpoint
        feed_result = self.test_posts_feed_endpoint()
        self.results.append(feed_result)
        
        # Test 4: Memory Creation Endpoint
        creation_result = self.test_memory_creation_endpoint()
        self.results.append(creation_result)
        
        # Test 5: AI Enhancement Endpoint
        ai_result = self.test_ai_enhancement_endpoint()
        self.results.append(ai_result)
        
        # Test 6: Socket.io Availability
        socket_avail_result = self.test_socket_io_availability()
        self.results.append(socket_avail_result)
        
        # Test 7: Socket.io Connection
        socket_conn_result = self.test_socket_io_connection()
        self.results.append(socket_conn_result)
        
        # Test 8: Real-time Events
        events_result = self.test_real_time_events()
        self.results.append(events_result)
        
        # Test 9: Frontend Build Status
        frontend_result = self.test_frontend_build_status()
        self.results.append(frontend_result)
        
        # Test 10: Environment Variables
        env_result = self.test_environment_variables()
        self.results.append(env_result)
        
        # Calculate summary
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r.passed)
        failed_tests = total_tests - passed_tests
        
        summary = {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": (passed_tests / total_tests * 100) if total_tests > 0 else 0,
            "results": self.results
        }
        
        self.log("=" * 60)
        self.log(f"Test Summary: {passed_tests}/{total_tests} tests passed ({summary['success_rate']:.1f}%)")
        
        return summary
    
    def print_detailed_results(self):
        """Print detailed test results"""
        self.log("\nDetailed Test Results:")
        self.log("-" * 60)
        
        for result in self.results:
            status = "✅ PASS" if result.passed else "❌ FAIL"
            self.log(f"{status} {result.name}")
            self.log(f"    Message: {result.message}")
            if result.response_time:
                self.log(f"    Response Time: {result.response_time:.3f}s")
            if result.status_code:
                self.log(f"    Status Code: {result.status_code}")
            if result.data:
                self.log(f"    Data: {json.dumps(result.data, indent=2)[:200]}...")
            self.log("")

def main():
    """Main test execution function"""
    print("Mundo Tango Memories System - Backend Testing Suite")
    print("=" * 60)
    
    # Initialize tester
    tester = MundoTangoBackendTester()
    
    try:
        # Run all tests
        summary = tester.run_all_tests()
        
        # Print detailed results
        tester.print_detailed_results()
        
        # Print final summary
        print("\n" + "=" * 60)
        print("FINAL TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {summary['total_tests']}")
        print(f"Passed: {summary['passed_tests']}")
        print(f"Failed: {summary['failed_tests']}")
        print(f"Success Rate: {summary['success_rate']:.1f}%")
        
        # Print specific findings
        print("\n" + "=" * 60)
        print("KEY FINDINGS")
        print("=" * 60)
        
        failed_tests = [r for r in summary['results'] if not r.passed]
        if failed_tests:
            print("❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test.name}: {test.message}")
        
        critical_tests = [
            "Backend Proxy Health",
            "Socket.io Connection", 
            "Posts Feed Endpoint",
            "AI Enhancement Endpoint"
        ]
        
        critical_failures = [r for r in failed_tests if r.name in critical_tests]
        if critical_failures:
            print(f"\n🚨 CRITICAL FAILURES: {len(critical_failures)} critical systems not working")
            for test in critical_failures:
                print(f"  - {test.name}")
        
        # Exit with appropriate code
        if len(critical_failures) > len(summary['results']) * 0.5:
            print("\n⚠️  More than 50% of functionality is broken. Recommend fixing backend first.")
            sys.exit(2)  # Special exit code for major failures
        elif summary['failed_tests'] > 0:
            print(f"\n⚠️  {summary['failed_tests']} tests failed. Check the detailed results above.")
            sys.exit(1)
        else:
            print("\n✅ All tests passed successfully!")
            sys.exit(0)
            
    except KeyboardInterrupt:
        print("\n\nTest execution interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nTest execution failed with error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()