# Translation Fixes Required
Total Issues: 1397

## Steps to Fix:
1. Add `import { useTranslation } from "react-i18next";` to each file
2. Add `const { t } = useTranslation();` in component
3. Replace hardcoded text with `{t("key")}`

## Files Needing Fixes:

### /client/src/pages/AccountDelete.tsx
- Line 198: Hardcoded text in JSX
  Text: "Confirm Account Deletion"
- Line 272: Hardcoded text in JSX
  Text: "Type DELETE here"
- Line 280: Hardcoded text in JSX
  Text: "Enter your password to confirm"
- Line 286: Hardcoded text in JSX
  Text: "Your current password"

### /client/src/pages/AdminCenter.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Total Users, Active Users, Total Events"
- Line 559: Hardcoded text in JSX
  Text: "Total Users"
- Line 579: Hardcoded text in JSX
  Text: "Active Users"
- Line 599: Hardcoded text in JSX
  Text: "Total Events"
- Line 614: Hardcoded text in JSX
  Text: "Excellent"
- Line 128: Hardcoded text in JSX
  Text: "System Health"
- Line 627: Hardcoded text in JSX
  Text: "Quick Actions"
- Line 643: Hardcoded text in JSX
  Text: "Manage Users"
- Line 644: Hardcoded text in JSX
  Text: "View and manage user accounts"
- Line 656: Hardcoded text in JSX
  Text: "Compliance Center"
- Line 657: Hardcoded text in JSX
  Text: "Monitor GDPR and security"
- Line 670: Hardcoded text in JSX
  Text: "Check performance and logs"
- Line 682: Hardcoded text in JSX
  Text: "TTfiles Demo"
- Line 797: Hardcoded text in JSX
  Text: "Automated Monitoring Active"
- Line 813: Hardcoded text in JSX
  Text: "Recent Audit History"
- Line 844: Hardcoded text in JSX
  Text: "Overall Compliance Score"
- Line 866: Hardcoded text in JSX
  Text: "GDPR Compliance"
- Line 872: Hardcoded text in JSX
  Text: "SOC 2 Type II"
- Line 878: Hardcoded text in JSX
  Text: "Enterprise Data"
- Line 884: Hardcoded text in JSX
  Text: "Multi-tenant Security"
- Line 893: Hardcoded text in JSX
  Text: "Issues & Recommendations"
- Line 901: Hardcoded text in JSX
  Text: "Critical Issues"
- Line 910: Hardcoded text in JSX
  Text: "Warnings"
- Line 112: Hardcoded text in JSX
  Text: "Active"
- Line 210: Hardcoded text in JSX
  Text: "Monitoring"
- Line 76: Hardcoded text in JSX
  Text: "User Management"
- Line 971: Hardcoded text in JSX
  Text: "Search users..."
- Line 984: Hardcoded text in JSX
  Text: "All Users"
- Line 986: Hardcoded text in JSX
  Text: "Verified"
- Line 987: Hardcoded text in JSX
  Text: "Suspended"
- Line 988: Hardcoded text in JSX
  Text: "Pending"
- Line 1019: Hardcoded text in JSX
  Text: "Active Today"
- Line 1039: Hardcoded text in JSX
  Text: "Pending Approval"
- Line 1043: Hardcoded text in JSX
  Text: "User List"
- Line 1049: Hardcoded text in JSX
  Text: "No users found"
- Line 29: Hardcoded text in JSX
  Text: "User"
- Line 1056: Hardcoded text in JSX
  Text: "Email"
- Line 181: Hardcoded text in JSX
  Text: "Role"
- Line 210: Hardcoded text in JSX
  Text: "Status"
- Line 1059: Hardcoded text in JSX
  Text: "Joined"
- Line 627: Hardcoded text in JSX
  Text: "Actions"
- Line 1131: Hardcoded text in JSX
  Text: "User Details"
- Line 1147: Hardcoded text in JSX
  Text: "Username"
- Line 6: Hardcoded text in JSX
  Text: "Location"
- Line 1159: Hardcoded text in JSX
  Text: "Tango Role"
- Line 227: Hardcoded text in JSX
  Text: "Content Moderation"
- Line 1203: Hardcoded text in JSX
  Text: "Search content..."
- Line 1216: Hardcoded text in JSX
  Text: "All Content"
- Line 87: Hardcoded text in JSX
  Text: "Posts"
- Line 90: Hardcoded text in JSX
  Text: "Comments"
- Line 1219: Hardcoded text in JSX
  Text: "Flagged Only"
- Line 1220: Hardcoded text in JSX
  Text: "Reported"
- Line 1241: Hardcoded text in JSX
  Text: "Total Posts"
- Line 1251: Hardcoded text in JSX
  Text: "Flagged Content"
- Line 1271: Hardcoded text in JSX
  Text: "Appeals"
- Line 1278: Hardcoded text in JSX
  Text: "Content Review Queue"
- Line 1286: Hardcoded text in JSX
  Text: "No content to moderate"
- Line 1341: Hardcoded text in JSX
  Text: "View Details"
- Line 1348: Hardcoded text in JSX
  Text: "Approve"
- Line 95: Hardcoded text in JSX
  Text: "Remove"
- Line 1278: Hardcoded text in JSX
  Text: "Content Review"
- Line 65: Hardcoded text in JSX
  Text: "Content"
- Line 1407: Hardcoded text in JSX
  Text: "Author"
- Line 16: Hardcoded text in JSX
  Text: "Type"
- Line 1415: Hardcoded text in JSX
  Text: "Posted"
- Line 92: Hardcoded text in JSX
  Text: "Reports"
- Line 1318: Hardcoded text in JSX
  Text: "Report Reason"
- Line 1543: Hardcoded text in JSX
  Text: "Platform Analytics"
- Line 1582: Hardcoded text in JSX
  Text: "Daily Active Users"
- Line 1598: Hardcoded text in JSX
  Text: "Page Views"
- Line 1614: Hardcoded text in JSX
  Text: "Engagement Rate"
- Line 1623: Hardcoded text in JSX
  Text: "Top Locations"
- Line 1715: Hardcoded text in JSX
  Text: "Event Management"
- Line 1722: Hardcoded text in JSX
  Text: "All Events"
- Line 1723: Hardcoded text in JSX
  Text: "Upcoming"
- Line 1724: Hardcoded text in JSX
  Text: "Past"
- Line 1694: Hardcoded text in JSX
  Text: "Featured"
- Line 1771: Hardcoded text in JSX
  Text: "This Month"
- Line 1791: Hardcoded text in JSX
  Text: "Featured Events"
- Line 1795: Hardcoded text in JSX
  Text: "Event Categories"
- Line 1814: Hardcoded text in JSX
  Text: "Recent Events"
- Line 1894: Hardcoded text in JSX
  Text: "User Reports & Moderation"
- Line 1901: Hardcoded text in JSX
  Text: "Unresolved"
- Line 1902: Hardcoded text in JSX
  Text: "Resolved"
- Line 1903: Hardcoded text in JSX
  Text: "Investigating"
- Line 1904: Hardcoded text in JSX
  Text: "Dismissed"
- Line 1905: Hardcoded text in JSX
  Text: "All Reports"
- Line 1921: Hardcoded text in JSX
  Text: "Pending Reports"
- Line 1933: Hardcoded text in JSX
  Text: "Resolved Today"
- Line 1939: Hardcoded text in JSX
  Text: "Total Reports"
- Line 1894: Hardcoded text in JSX
  Text: "User Reports"
- Line 2113: Hardcoded text in JSX
  Text: "Render Time"
- Line 2119: Hardcoded text in JSX
  Text: "Bundle Size"
- Line 2125: Hardcoded text in JSX
  Text: "Cache Hit Rate"
- Line 2131: Hardcoded text in JSX
  Text: "API Response"
- Line 2132: Hardcoded text in JSX
  Text: "Average latency"
- Line 2147: Hardcoded text in JSX
  Text: "Build Memory"
- Line 2148: Hardcoded text in JSX
  Text: "Allocated for builds"
- Line 2153: Hardcoded text in JSX
  Text: "Storage Used"
- Line 2159: Hardcoded text in JSX
  Text: "Database Load"
- Line 2160: Hardcoded text in JSX
  Text: "Current utilization"
- Line 2165: Hardcoded text in JSX
  Text: "Memory Cleanup"
- Line 2182: Hardcoded text in JSX
  Text: "In Progress"
- Line 2190: Hardcoded text in JSX
  Text: "Enterprise Data Handling"
- Line 901: Hardcoded text in JSX
  Text: "Critical"
- Line 2199: Hardcoded text in JSX
  Text: "Security Monitoring"
- Line 2200: Hardcoded text in JSX
  Text: "Planned"
- Line 2218: Hardcoded text in JSX
  Text: "Server Uptime"
- Line 2229: Hardcoded text in JSX
  Text: "Performance Score"
- Line 2230: Hardcoded text in JSX
  Text: "Life CEO optimized"
- Line 2240: Hardcoded text in JSX
  Text: "DB Indexes"
- Line 2241: Hardcoded text in JSX
  Text: "Optimized queries"
- Line 2251: Hardcoded text in JSX
  Text: "RLS Tables"
- Line 2256: Hardcoded text in JSX
  Text: "Service Status"
- Line 2265: Hardcoded text in JSX
  Text: "Web Application"
- Line 2267: Hardcoded text in JSX
  Text: "Operational"
- Line 34: Hardcoded text in JSX
  Text: "Database"
- Line 2283: Hardcoded text in JSX
  Text: "WebSocket Services"
- Line 2314: Hardcoded text in JSX
  Text: "Reports Management"
- Line 1955: Hardcoded text in JSX
  Text: "No reports found"
- Line 1902: Hardcoded text in JSX
  Text: "Resolve"
- Line 1904: Hardcoded text in JSX
  Text: "Dismiss"
- Line 2524: Hardcoded text in JSX
  Text: "Blocked Users"
- Line 2528: Hardcoded text in JSX
  Text: "No blocked users"
- Line 2559: Hardcoded text in JSX
  Text: "Platform Settings"
- Line 2578: Hardcoded text in JSX
  Text: "General Settings"
- Line 2584: Hardcoded text in JSX
  Text: "Site Name"
- Line 2585: Hardcoded text in JSX
  Text: "The name of your platform"
- Line 2596: Hardcoded text in JSX
  Text: "Maintenance Mode"
- Line 2597: Hardcoded text in JSX
  Text: "Show maintenance page to users"
- Line 2612: Hardcoded text in JSX
  Text: "Registration Settings"
- Line 2618: Hardcoded text in JSX
  Text: "Registration Enabled"
- Line 2619: Hardcoded text in JSX
  Text: "Allow new users to register"
- Line 2634: Hardcoded text in JSX
  Text: "Feature Flags"
- Line 2745: Hardcoded text in JSX
  Text: "User ID"
- Line 2751: Hardcoded text in JSX
  Text: "Enter user ID"
- Line 2138: Hardcoded text in JSX
  Text: "Resource"
- Line 2761: Hardcoded text in JSX
  Text: "Select resource"
- Line 97: Hardcoded text in JSX
  Text: "Events"
- Line 29: Hardcoded text in JSX
  Text: "Users"
- Line 106: Hardcoded text in JSX
  Text: "Groups"
- Line 2766: Hardcoded text in JSX
  Text: "Admin Panel"
- Line 259: Hardcoded text in JSX
  Text: "Action"
- Line 2776: Hardcoded text in JSX
  Text: "Select action"
- Line 1737: Hardcoded text in JSX
  Text: "Create"
- Line 2181: Hardcoded text in JSX
  Text: "Read"
- Line 708: Hardcoded text in JSX
  Text: "Update"
- Line 2780: Hardcoded text in JSX
  Text: "Delete"
- Line 93: Hardcoded text in JSX
  Text: "Moderate"
- Line 71: Hardcoded text in JSX
  Text: "Test"
- Line 2838: Hardcoded text in JSX
  Text: "Average Evaluation Time"
- Line 2903: Hardcoded text in JSX
  Text: "Location-Based Assignment"
- Line 2907: Hardcoded text in JSX
  Text: "Experience-Based Roles"
- Line 2911: Hardcoded text in JSX
  Text: "Activity-Based Promotion"
- Line 198: Hardcoded text in JSX
  Text: "Admin Center"
- Line 2994: Hardcoded text in JSX
  Text: "Mundo Tango Platform"
- Line 1370: Hardcoded text in JSX
  Text: "Back"

### /client/src/pages/AdminMonitoring.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "System Monitoring, System Status, Operational"
- Line 108: Hardcoded text in JSX
  Text: "System Monitoring"
- Line 133: Hardcoded text in JSX
  Text: "System Status"
- Line 141: Hardcoded text in JSX
  Text: "Operational"
- Line 150: Hardcoded text in JSX
  Text: "Active Alerts"
- Line 165: Hardcoded text in JSX
  Text: "Request Rate"
- Line 180: Hardcoded text in JSX
  Text: "Active Users"
- Line 133: Hardcoded text in JSX
  Text: "Overview"
- Line 198: Hardcoded text in JSX
  Text: "Agents"
- Line 199: Hardcoded text in JSX
  Text: "Performance"
- Line 150: Hardcoded text in JSX
  Text: "Alerts"
- Line 91: Hardcoded text in JSX
  Text: "Web Vitals"
- Line 202: Hardcoded text in JSX
  Text: "Logs"
- Line 208: Hardcoded text in JSX
  Text: "Resource Usage"
- Line 212: Hardcoded text in JSX
  Text: "System resource utilization"
- Line 217: Hardcoded text in JSX
  Text: "CPU Usage"
- Line 224: Hardcoded text in JSX
  Text: "Memory Usage"
- Line 231: Hardcoded text in JSX
  Text: "Disk Usage"
- Line 239: Hardcoded text in JSX
  Text: "Response Time"
- Line 243: Hardcoded text in JSX
  Text: "API response time percentiles"
- Line 266: Hardcoded text in JSX
  Text: "Request Rate Over Time"
- Line 267: Hardcoded text in JSX
  Text: "HTTP requests per second"
- Line 312: Hardcoded text in JSX
  Text: "Success Rate"
- Line 316: Hardcoded text in JSX
  Text: "Tokens"
- Line 320: Hardcoded text in JSX
  Text: "Cost"
- Line 334: Hardcoded text in JSX
  Text: "Token Usage by Agent"
- Line 360: Hardcoded text in JSX
  Text: "Agent Response Times"
- Line 388: Hardcoded text in JSX
  Text: "Heap and RSS memory consumption"
- Line 409: Hardcoded text in JSX
  Text: "Database Query Performance"
- Line 473: Hardcoded text in JSX
  Text: "Largest Contentful Paint"
- Line 491: Hardcoded text in JSX
  Text: "First Input Delay"
- Line 509: Hardcoded text in JSX
  Text: "Cumulative Layout Shift"
- Line 527: Hardcoded text in JSX
  Text: "Time to First Byte"
- Line 543: Hardcoded text in JSX
  Text: "Web Vitals Trends"
- Line 547: Hardcoded text in JSX
  Text: "Core Web Vitals over time"
- Line 571: Hardcoded text in JSX
  Text: "System Logs"

### /client/src/pages/AgentFrameworkDashboard.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Framework Completion, System Compliance, Achievements"
- Line 194: Hardcoded text in JSX
  Text: "Framework Completion"
- Line 209: Hardcoded text in JSX
  Text: "System Compliance"
- Line 44: Hardcoded text in JSX
  Text: "Achievements"
- Line 239: Hardcoded text in JSX
  Text: "Critical Issues"
- Line 247: Hardcoded text in JSX
  Text: "No Issues"
- Line 249: Hardcoded text in JSX
  Text: "Needs Attention"
- Line 5: Hardcoded text in JSX
  Text: "Progress"
- Line 359: Hardcoded text in JSX
  Text: "🎯 Next Milestone"
- Line 441: Hardcoded text in JSX
  Text: "Technical Layers"
- Line 445: Hardcoded text in JSX
  Text: "Implementation Phases"
- Line 449: Hardcoded text in JSX
  Text: "Quality Checkpoints"

### /client/src/pages/AgentLearningDashboard.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Across all ESA layers"
- Line 90: Hardcoded text in JSX
  Text: "Across all ESA layers"

### /client/src/pages/AnalyticsDashboard.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Active Users, Avg Session, Total Events"
- Line 179: Hardcoded text in JSX
  Text: "Active Users"
- Line 194: Hardcoded text in JSX
  Text: "Avg Session"
- Line 209: Hardcoded text in JSX
  Text: "Total Events"
- Line 224: Hardcoded text in JSX
  Text: "Engagement Rate"
- Line 239: Hardcoded text in JSX
  Text: "Overview"
- Line 29: Hardcoded text in JSX
  Text: "Users"
- Line 2: Hardcoded text in JSX
  Text: "Content"
- Line 242: Hardcoded text in JSX
  Text: "Performance"
- Line 243: Hardcoded text in JSX
  Text: "Insights"
- Line 374: Hardcoded text in JSX
  Text: "New vs Returning"
- Line 389: Hardcoded text in JSX
  Text: "Bounce Rate"
- Line 398: Hardcoded text in JSX
  Text: "Total Users"
- Line 408: Hardcoded text in JSX
  Text: "Users by Tango Role"
- Line 469: Hardcoded text in JSX
  Text: "Total Views"
- Line 476: Hardcoded text in JSX
  Text: "Total Likes"
- Line 483: Hardcoded text in JSX
  Text: "Total Comments"
- Line 490: Hardcoded text in JSX
  Text: "Total Shares"
- Line 515: Hardcoded text in JSX
  Text: "Performance Metrics"
- Line 518: Hardcoded text in JSX
  Text: "Page Load Time"
- Line 522: Hardcoded text in JSX
  Text: "API Response Time"
- Line 526: Hardcoded text in JSX
  Text: "Cache Hit Rate"
- Line 530: Hardcoded text in JSX
  Text: "Error Rate"
- Line 537: Hardcoded text in JSX
  Text: "System Health"
- Line 540: Hardcoded text in JSX
  Text: "Server Uptime"
- Line 544: Hardcoded text in JSX
  Text: "Database Health"
- Line 545: Hardcoded text in JSX
  Text: "Healthy"
- Line 548: Hardcoded text in JSX
  Text: "Memory Usage"
- Line 552: Hardcoded text in JSX
  Text: "CPU Usage"

### /client/src/pages/BillingDashboard.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Billing & Subscription, Current Subscription, Next billing date"
- Line 133: Hardcoded text in JSX
  Text: "Billing & Subscription"
- Line 137: Hardcoded text in JSX
  Text: "Current Subscription"
- Line 170: Hardcoded text in JSX
  Text: "Next billing date"
- Line 247: Hardcoded text in JSX
  Text: "Payment Methods"
- Line 281: Hardcoded text in JSX
  Text: "Default"
- Line 301: Hardcoded text in JSX
  Text: "No payment methods saved"
- Line 306: Hardcoded text in JSX
  Text: "Billing History"
- Line 310: Hardcoded text in JSX
  Text: "Download your past invoices"
- Line 347: Hardcoded text in JSX
  Text: "No billing history available"

### /client/src/pages/Checkout.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Secured by Stripe, Back to Plans, Complete Your Subscription"
- Line 129: Hardcoded text in JSX
  Text: "Secured by Stripe"
- Line 104: Hardcoded text in JSX
  Text: "Back to Plans"
- Line 241: Hardcoded text in JSX
  Text: "Complete Your Subscription"
- Line 246: Hardcoded text in JSX
  Text: "Order Summary"
- Line 256: Hardcoded text in JSX
  Text: "Monthly subscription"
- Line 277: Hardcoded text in JSX
  Text: "Total"
- Line 290: Hardcoded text in JSX
  Text: "Enter code"

### /client/src/pages/CreateCommunity.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Basic Information, e.g., Buenos Aires Tango Community, Describe your community"
- Line 133: Hardcoded text in JSX
  Text: "Basic Information"
- Line 143: Hardcoded text in JSX
  Text: "e.g., Buenos Aires Tango Community"
- Line 177: Hardcoded text in JSX
  Text: "Describe your community"
- Line 13: Hardcoded text in JSX
  Text: "Location"
- Line 38: Hardcoded text in JSX
  Text: "City"
- Line 143: Hardcoded text in JSX
  Text: "Buenos Aires"
- Line 202: Hardcoded text in JSX
  Text: "Country"
- Line 207: Hardcoded text in JSX
  Text: "Argentina"
- Line 217: Hardcoded text in JSX
  Text: "Event Categories"
- Line 238: Hardcoded text in JSX
  Text: "Privacy Settings"
- Line 278: Hardcoded text in JSX
  Text: "Community Rules (Optional)"
- Line 282: Hardcoded text in JSX
  Text: "Add any specific rules or guidelines for your community members..."

### /client/src/pages/EnhancedEvents.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Total Events, Upcoming, Attending"
- Line 389: Hardcoded text in JSX
  Text: "Total Events"
- Line 400: Hardcoded text in JSX
  Text: "Upcoming"
- Line 411: Hardcoded text in JSX
  Text: "Attending"
- Line 422: Hardcoded text in JSX
  Text: "This Week"
- Line 437: Hardcoded text in JSX
  Text: "Search events... (Cmd+/)"
- Line 180: Hardcoded text in JSX
  Text: "Category"
- Line 469: Hardcoded text in JSX
  Text: "All Categories"
- Line 470: Hardcoded text in JSX
  Text: "Milonga"
- Line 471: Hardcoded text in JSX
  Text: "Class"
- Line 472: Hardcoded text in JSX
  Text: "Workshop"
- Line 473: Hardcoded text in JSX
  Text: "Festival"
- Line 474: Hardcoded text in JSX
  Text: "Performance"
- Line 475: Hardcoded text in JSX
  Text: "Practice"
- Line 476: Hardcoded text in JSX
  Text: "Social"
- Line 181: Hardcoded text in JSX
  Text: "Level"
- Line 485: Hardcoded text in JSX
  Text: "All Levels"
- Line 486: Hardcoded text in JSX
  Text: "Beginner"
- Line 487: Hardcoded text in JSX
  Text: "Intermediate"
- Line 488: Hardcoded text in JSX
  Text: "Advanced"
- Line 489: Hardcoded text in JSX
  Text: "Mixed"
- Line 182: Hardcoded text in JSX
  Text: "Price"
- Line 498: Hardcoded text in JSX
  Text: "Any Price"
- Line 296: Hardcoded text in JSX
  Text: "Free"
- Line 500: Hardcoded text in JSX
  Text: "Paid"
- Line 166: Hardcoded text in JSX
  Text: "Calendar View"

### /client/src/pages/EnhancedFriends.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Total Friends, Pending, Favorites"
- Line 541: Hardcoded text in JSX
  Text: "Total Friends"
- Line 337: Hardcoded text in JSX
  Text: "Pending"
- Line 563: Hardcoded text in JSX
  Text: "Favorites"
- Line 574: Hardcoded text in JSX
  Text: "Active Today"
- Line 588: Hardcoded text in JSX
  Text: "Search friends by name, username, or location... (Cmd+F)"
- Line 601: Hardcoded text in JSX
  Text: "Filter by..."
- Line 610: Hardcoded text in JSX
  Text: "Sort by..."
- Line 777: Hardcoded text in JSX
  Text: "Enter username or email"
- Line 787: Hardcoded text in JSX
  Text: "Hi! I"

### /client/src/pages/ErrorBoundaryPage.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Check your internet connection, Try using a different browser"
- Line 151: Hardcoded text in JSX
  Text: "Check your internet connection"
- Line 155: Hardcoded text in JSX
  Text: "Try using a different browser"

### /client/src/pages/Favorites.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Posts, Events, People"
- Line 290: Hardcoded text in JSX
  Text: "Posts"
- Line 291: Hardcoded text in JSX
  Text: "Events"
- Line 292: Hardcoded text in JSX
  Text: "People"
- Line 293: Hardcoded text in JSX
  Text: "Groups"
- Line 294: Hardcoded text in JSX
  Text: "Memories"
- Line 317: Hardcoded text in JSX
  Text: "No favorites yet"

### /client/src/pages/Friends.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Friends, Total Friends, Pending Requests"
- Line 36: Hardcoded text in JSX
  Text: "Friends"
- Line 252: Hardcoded text in JSX
  Text: "Total Friends"
- Line 263: Hardcoded text in JSX
  Text: "Pending Requests"
- Line 274: Hardcoded text in JSX
  Text: "Mutual Friends"
- Line 286: Hardcoded text in JSX
  Text: "Search friends by name or username..."
- Line 385: Hardcoded text in JSX
  Text: "No pending friend requests"
- Line 456: Hardcoded text in JSX
  Text: "Send Friend Request"
- Line 469: Hardcoded text in JSX
  Text: "Type a name or username..."
- Line 511: Hardcoded text in JSX
  Text: "Hi! I"

### /client/src/pages/FriendshipPage.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Dances Together, Shared Events, Groups in Common"
- Line 140: Hardcoded text in JSX
  Text: "Dances Together"
- Line 144: Hardcoded text in JSX
  Text: "Shared Events"
- Line 148: Hardcoded text in JSX
  Text: "Groups in Common"
- Line 152: Hardcoded text in JSX
  Text: "Mutual Friends"
- Line 156: Hardcoded text in JSX
  Text: "Closeness Score"
- Line 224: Hardcoded text in JSX
  Text: "Dance History"

### /client/src/pages/Gamification.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Total Points, Daily Streak, Weekly Rank"
- Line 278: Hardcoded text in JSX
  Text: "Total Points"
- Line 299: Hardcoded text in JSX
  Text: "Daily Streak"
- Line 309: Hardcoded text in JSX
  Text: "Weekly Rank"
- Line 127: Hardcoded text in JSX
  Text: "Achievements"
- Line 156: Hardcoded text in JSX
  Text: "Challenges"
- Line 92: Hardcoded text in JSX
  Text: "Leaderboard"
- Line 40: Hardcoded text in JSX
  Text: "Stats"
- Line 56: Hardcoded text in JSX
  Text: "Unlocked"
- Line 425: Hardcoded text in JSX
  Text: "Active Challenges"
- Line 492: Hardcoded text in JSX
  Text: "No Active Challenges"
- Line 511: Hardcoded text in JSX
  Text: "Global"
- Line 512: Hardcoded text in JSX
  Text: "City"
- Line 309: Hardcoded text in JSX
  Text: "Weekly"
- Line 521: Hardcoded text in JSX
  Text: "Monthly"
- Line 522: Hardcoded text in JSX
  Text: "All Time"
- Line 580: Hardcoded text in JSX
  Text: "No Leaderboard Data"
- Line 590: Hardcoded text in JSX
  Text: "Your Statistics"
- Line 668: Hardcoded text in JSX
  Text: "Point History"
- Line 669: Hardcoded text in JSX
  Text: "Your recent point transactions"

### /client/src/pages/GroupDetailPage.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Group not found, Back to Groups, About"
- Line 101: Hardcoded text in JSX
  Text: "Group not found"
- Line 103: Hardcoded text in JSX
  Text: "Back to Groups"
- Line 217: Hardcoded text in JSX
  Text: "About"
- Line 225: Hardcoded text in JSX
  Text: "Discussion"
- Line 226: Hardcoded text in JSX
  Text: "Members"
- Line 227: Hardcoded text in JSX
  Text: "Events"
- Line 228: Hardcoded text in JSX
  Text: "Media"
- Line 8: Hardcoded text in JSX
  Text: "Share"
- Line 326: Hardcoded text in JSX
  Text: "No upcoming events"
- Line 328: Hardcoded text in JSX
  Text: "Create Event"
- Line 349: Hardcoded text in JSX
  Text: "Group Information"
- Line 352: Hardcoded text in JSX
  Text: "Created"
- Line 356: Hardcoded text in JSX
  Text: "Type"
- Line 361: Hardcoded text in JSX
  Text: "Group Rules"

### /client/src/pages/GroupDetailPageMT.tsx
- Line 641: Hardcoded text in JSX
  Text: "Group not found"
- Line 664: Hardcoded text in JSX
  Text: "About this group"
- Line 678: Hardcoded text in JSX
  Text: "Group Stats"
- Line 45: Hardcoded text in JSX
  Text: "Members"
- Line 687: Hardcoded text in JSX
  Text: "Created"
- Line 50: Hardcoded text in JSX
  Text: "Type"
- Line 698: Hardcoded text in JSX
  Text: "Privacy"
- Line 704: Hardcoded text in JSX
  Text: "Group Admins"
- Line 785: Hardcoded text in JSX
  Text: "Group Events"
- Line 12: Hardcoded text in JSX
  Text: "Search"
- Line 832: Hardcoded text in JSX
  Text: "Search events..."
- Line 847: Hardcoded text in JSX
  Text: "All Types"
- Line 848: Hardcoded text in JSX
  Text: "Milonga"
- Line 850: Hardcoded text in JSX
  Text: "Workshop"
- Line 851: Hardcoded text in JSX
  Text: "Festival"
- Line 852: Hardcoded text in JSX
  Text: "Concert"
- Line 14: Hardcoded text in JSX
  Text: "Location"
- Line 861: Hardcoded text in JSX
  Text: "Search location..."
- Line 870: Hardcoded text in JSX
  Text: "From Date"
- Line 879: Hardcoded text in JSX
  Text: "To Date"
- Line 897: Hardcoded text in JSX
  Text: "Only show events with space"
- Line 948: Hardcoded text in JSX
  Text: "No events found"
- Line 1038: Hardcoded text in JSX
  Text: "All Posts"
- Line 1057: Hardcoded text in JSX
  Text: "Residents"
- Line 1076: Hardcoded text in JSX
  Text: "Visitors"
- Line 1095: Hardcoded text in JSX
  Text: "Friends in City"
- Line 45: Hardcoded text in JSX
  Text: "members"
- Line 38: Hardcoded text in JSX
  Text: "events"
- Line 1422: Hardcoded text in JSX
  Text: "hosts"
- Line 226: Hardcoded text in JSX
  Text: "recommendations"
- Line 189: Hardcoded text in JSX
  Text: "Posts"
- Line 314: Hardcoded text in JSX
  Text: "Events"
- Line 1822: Hardcoded text in JSX
  Text: "Community Hub"
- Line 25: Hardcoded text in JSX
  Text: "Housing"
- Line 27: Hardcoded text in JSX
  Text: "Recommendations"

### /client/src/pages/HelpSupport.tsx
- Line 153: Hardcoded text in JSX
  Text: "Search for help..."
- Line 167: Hardcoded text in JSX
  Text: "Live Chat"
- Line 168: Hardcoded text in JSX
  Text: "Chat with our support team"
- Line 180: Hardcoded text in JSX
  Text: "Email Support"
- Line 181: Hardcoded text in JSX
  Text: "Get help via email"
- Line 193: Hardcoded text in JSX
  Text: "Documentation"
- Line 194: Hardcoded text in JSX
  Text: "Browse our guides"
- Line 206: Hardcoded text in JSX
  Text: "Browse by Category"
- Line 264: Hardcoded text in JSX
  Text: "Still need help?"

### /client/src/pages/HierarchyDashboard.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "No Metrics Available, Project Hierarchy Dashboard, Overall Health Score"
- Line 118: Hardcoded text in JSX
  Text: "No Metrics Available"
- Line 132: Hardcoded text in JSX
  Text: "Project Hierarchy Dashboard"
- Line 159: Hardcoded text in JSX
  Text: "Overall Health Score"
- Line 173: Hardcoded text in JSX
  Text: "Module Cohesion"
- Line 179: Hardcoded text in JSX
  Text: "Coupling Score"
- Line 21: Hardcoded text in JSX
  Text: "Metrics"
- Line 199: Hardcoded text in JSX
  Text: "Issues"
- Line 206: Hardcoded text in JSX
  Text: "Total Files"
- Line 23: Hardcoded text in JSX
  Text: "Directories"
- Line 226: Hardcoded text in JSX
  Text: "Max Depth"
- Line 232: Hardcoded text in JSX
  Text: "Consider flattening"
- Line 255: Hardcoded text in JSX
  Text: "No Suggestions"
- Line 286: Hardcoded text in JSX
  Text: "Misplaced Files"
- Line 306: Hardcoded text in JSX
  Text: "Orphaned Files"
- Line 327: Hardcoded text in JSX
  Text: "No Issues Found"

### /client/src/pages/Invoices.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Life CEO Platform, Bill To:, Payment Details:"
- Line 80: Hardcoded text in JSX
  Text: "Life CEO Platform"
- Line 96: Hardcoded text in JSX
  Text: "Bill To:"
- Line 101: Hardcoded text in JSX
  Text: "Payment Details:"
- Line 2: Hardcoded text in JSX
  Text: "Description"
- Line 120: Hardcoded text in JSX
  Text: "Quantity"
- Line 121: Hardcoded text in JSX
  Text: "Unit Price"
- Line 122: Hardcoded text in JSX
  Text: "Amount"
- Line 207: Hardcoded text in JSX
  Text: "Paid"
- Line 209: Hardcoded text in JSX
  Text: "Failed"
- Line 211: Hardcoded text in JSX
  Text: "Pending"
- Line 219: Hardcoded text in JSX
  Text: "Invoices & Receipts"
- Line 227: Hardcoded text in JSX
  Text: "Invoice History"
- Line 251: Hardcoded text in JSX
  Text: "No invoices yet"
- Line 313: Hardcoded text in JSX
  Text: "Invoice Details"

### /client/src/pages/LifeCEO.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Life CEO, AI Life Management System, Active"
- Line 30: Hardcoded text in JSX
  Text: "Life CEO"
- Line 132: Hardcoded text in JSX
  Text: "AI Life Management System"
- Line 19: Hardcoded text in JSX
  Text: "Active"
- Line 237: Hardcoded text in JSX
  Text: "Tasks Today"
- Line 247: Hardcoded text in JSX
  Text: "Health Score"
- Line 257: Hardcoded text in JSX
  Text: "Budget"
- Line 258: Hardcoded text in JSX
  Text: "Good"
- Line 267: Hardcoded text in JSX
  Text: "Security"
- Line 268: Hardcoded text in JSX
  Text: "Safe"

### /client/src/pages/LifeCEOEnhanced.tsx
- Line 72: Hardcoded text in JSX
  Text: "Life CEO"

### /client/src/pages/LiveGlobalStatistics.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Total Users, Active Users, Verified Users"
- Line 172: Hardcoded text in JSX
  Text: "Total Users"
- Line 189: Hardcoded text in JSX
  Text: "Active Users"
- Line 202: Hardcoded text in JSX
  Text: "Verified Users"
- Line 215: Hardcoded text in JSX
  Text: "Total Groups"
- Line 238: Hardcoded text in JSX
  Text: "Posts"
- Line 245: Hardcoded text in JSX
  Text: "Memories"
- Line 252: Hardcoded text in JSX
  Text: "Active Stories"
- Line 256: Hardcoded text in JSX
  Text: "Total Engagement"
- Line 278: Hardcoded text in JSX
  Text: "Total Events"
- Line 282: Hardcoded text in JSX
  Text: "Upcoming Events"
- Line 290: Hardcoded text in JSX
  Text: "Total RSVPs"

### /client/src/pages/LiveStreaming.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Live Streaming, Create Live Stream, Title"
- Line 1: Hardcoded text in JSX
  Text: "Live Streaming"
- Line 282: Hardcoded text in JSX
  Text: "Create Live Stream"
- Line 5: Hardcoded text in JSX
  Text: "Title"
- Line 290: Hardcoded text in JSX
  Text: "Enter stream title"
- Line 61: Hardcoded text in JSX
  Text: "Description"
- Line 300: Hardcoded text in JSX
  Text: "Describe your stream"
- Line 58: Hardcoded text in JSX
  Text: "Category"
- Line 313: Hardcoded text in JSX
  Text: "Lesson"
- Line 314: Hardcoded text in JSX
  Text: "Performance"
- Line 315: Hardcoded text in JSX
  Text: "Milonga"
- Line 316: Hardcoded text in JSX
  Text: "Social"
- Line 322: Hardcoded text in JSX
  Text: "Schedule (optional)"
- Line 457: Hardcoded text in JSX
  Text: "No Live Streams"
- Line 506: Hardcoded text in JSX
  Text: "No Scheduled Streams"
- Line 552: Hardcoded text in JSX
  Text: "Live Chat"
- Line 570: Hardcoded text in JSX
  Text: "Type a message..."

### /client/src/pages/MediaUploadTest.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Media Upload Test"
- Line 8: Hardcoded text in JSX
  Text: "Media Upload Test"

### /client/src/pages/Messages.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Messages, Search conversations..."
- Line 26: Hardcoded text in JSX
  Text: "Messages"
- Line 109: Hardcoded text in JSX
  Text: "Search conversations..."

### /client/src/pages/MobileAppDashboard.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "App Status, Connection, Battery"
- Line 156: Hardcoded text in JSX
  Text: "App Status"
- Line 172: Hardcoded text in JSX
  Text: "Connection"
- Line 17: Hardcoded text in JSX
  Text: "Battery"
- Line 121: Hardcoded text in JSX
  Text: "Notifications"
- Line 32: Hardcoded text in JSX
  Text: "Install"
- Line 225: Hardcoded text in JSX
  Text: "Features"
- Line 226: Hardcoded text in JSX
  Text: "Performance"
- Line 174: Hardcoded text in JSX
  Text: "Offline"
- Line 25: Hardcoded text in JSX
  Text: "Settings"
- Line 265: Hardcoded text in JSX
  Text: "Manual Installation Steps:"
- Line 269: Hardcoded text in JSX
  Text: "Follow the prompts to install"
- Line 277: Hardcoded text in JSX
  Text: "App Installed Successfully!"
- Line 299: Hardcoded text in JSX
  Text: "Push Notifications"
- Line 317: Hardcoded text in JSX
  Text: "Offline Mode"
- Line 323: Hardcoded text in JSX
  Text: "Access content without internet"
- Line 326: Hardcoded text in JSX
  Text: "Active"
- Line 329: Hardcoded text in JSX
  Text: "App Shortcuts"
- Line 335: Hardcoded text in JSX
  Text: "Quick access from home screen"
- Line 338: Hardcoded text in JSX
  Text: "Available"
- Line 341: Hardcoded text in JSX
  Text: "Background Sync"
- Line 347: Hardcoded text in JSX
  Text: "Sync data when back online"
- Line 121: Hardcoded text in JSX
  Text: "Enabled"
- Line 373: Hardcoded text in JSX
  Text: "Page Load Time"
- Line 380: Hardcoded text in JSX
  Text: "Cache Hit Rate"
- Line 387: Hardcoded text in JSX
  Text: "Higher is better"
- Line 390: Hardcoded text in JSX
  Text: "Offline Coverage"
- Line 397: Hardcoded text in JSX
  Text: "Pages available offline"
- Line 400: Hardcoded text in JSX
  Text: "Storage Usage"
- Line 438: Hardcoded text in JSX
  Text: "Cached Content"
- Line 441: Hardcoded text in JSX
  Text: "Profile Data"
- Line 442: Hardcoded text in JSX
  Text: "Synced"
- Line 445: Hardcoded text in JSX
  Text: "Recent Posts"
- Line 449: Hardcoded text in JSX
  Text: "Event Details"
- Line 453: Hardcoded text in JSX
  Text: "Images"
- Line 459: Hardcoded text in JSX
  Text: "Sync Settings"
- Line 508: Hardcoded text in JSX
  Text: "Appearance"
- Line 525: Hardcoded text in JSX
  Text: "Privacy"
- Line 544: Hardcoded text in JSX
  Text: "Advanced"

### /client/src/pages/MonitoringDashboard.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Overview, Life CEO Agents, Feature Flags"
- Line 153: Hardcoded text in JSX
  Text: "Overview"
- Line 154: Hardcoded text in JSX
  Text: "Life CEO Agents"
- Line 155: Hardcoded text in JSX
  Text: "Feature Flags"
- Line 156: Hardcoded text in JSX
  Text: "Sessions"
- Line 164: Hardcoded text in JSX
  Text: "Active Users"
- Line 178: Hardcoded text in JSX
  Text: "Session Duration"
- Line 191: Hardcoded text in JSX
  Text: "Error Rate"
- Line 205: Hardcoded text in JSX
  Text: "OpenReplay Session Recording"
- Line 213: Hardcoded text in JSX
  Text: "Rage Click Detection"
- Line 126: Hardcoded text in JSX
  Text: "Active"
- Line 217: Hardcoded text in JSX
  Text: "Network Monitoring"
- Line 221: Hardcoded text in JSX
  Text: "Console Capture"
- Line 225: Hardcoded text in JSX
  Text: "Privacy Masking"
- Line 226: Hardcoded text in JSX
  Text: "Enabled"
- Line 239: Hardcoded text in JSX
  Text: "Life CEO Agent Tracking"
- Line 284: Hardcoded text in JSX
  Text: "PostHog Feature Flags"
- Line 321: Hardcoded text in JSX
  Text: "Session Analytics"
- Line 330: Hardcoded text in JSX
  Text: "Guest to Host Conversion Funnel"

### /client/src/pages/MonitoringTest.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Monitoring Test Page, Granted, Not Granted"
- Line 2: Hardcoded text in JSX
  Text: "Monitoring Test Page"
- Line 143: Hardcoded text in JSX
  Text: "Granted"
- Line 148: Hardcoded text in JSX
  Text: "Not Granted"
- Line 167: Hardcoded text in JSX
  Text: "Active"
- Line 172: Hardcoded text in JSX
  Text: "Inactive"
- Line 119: Hardcoded text in JSX
  Text: "Sentry"
- Line 94: Hardcoded text in JSX
  Text: "PostHog"
- Line 198: Hardcoded text in JSX
  Text: "OpenReplay"
- Line 208: Hardcoded text in JSX
  Text: "Test Actions"
- Line 240: Hardcoded text in JSX
  Text: "Consent Required"
- Line 249: Hardcoded text in JSX
  Text: "Test Results"

### /client/src/pages/Notifications.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "No notifications"
- Line 256: Hardcoded text in JSX
  Text: "No notifications"

### /client/src/pages/NotionEntryPage.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Notion, Details, Type"
- Line 20: Hardcoded text in JSX
  Text: "Notion"
- Line 276: Hardcoded text in JSX
  Text: "Details"
- Line 280: Hardcoded text in JSX
  Text: "Type"
- Line 289: Hardcoded text in JSX
  Text: "Emotional Tone"
- Line 295: Hardcoded text in JSX
  Text: "Visibility"
- Line 188: Hardcoded text in JSX
  Text: "Created"
- Line 308: Hardcoded text in JSX
  Text: "Last Updated"

### /client/src/pages/NotionHomePage.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Powered by Notion, Search stories, memories, and events..., Type"
- Line 162: Hardcoded text in JSX
  Text: "Powered by Notion"
- Line 172: Hardcoded text in JSX
  Text: "Search stories, memories, and events..."
- Line 68: Hardcoded text in JSX
  Text: "Type"
- Line 202: Hardcoded text in JSX
  Text: "All types"
- Line 216: Hardcoded text in JSX
  Text: "Emotional Tone"
- Line 219: Hardcoded text in JSX
  Text: "All tones"
- Line 70: Hardcoded text in JSX
  Text: "Tags"

### /client/src/pages/PaymentMethods.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Payment Methods, Your Payment Methods, No payment methods added yet"
- Line 240: Hardcoded text in JSX
  Text: "Payment Methods"
- Line 247: Hardcoded text in JSX
  Text: "Your Payment Methods"
- Line 266: Hardcoded text in JSX
  Text: "No payment methods added yet"
- Line 338: Hardcoded text in JSX
  Text: "Your payment information is secure"
- Line 145: Hardcoded text in JSX
  Text: "Add Payment Method"

### /client/src/pages/PrivacyAnalytics.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Privacy & Analytics, Current Status, Services"
- Line 2: Hardcoded text in JSX
  Text: "Privacy & Analytics"
- Line 349: Hardcoded text in JSX
  Text: "Current Status"
- Line 131: Hardcoded text in JSX
  Text: "Services"
- Line 367: Hardcoded text in JSX
  Text: "Data Details"
- Line 368: Hardcoded text in JSX
  Text: "Your Rights"
- Line 439: Hardcoded text in JSX
  Text: "Test Connection"
- Line 452: Hardcoded text in JSX
  Text: "Data Collection Details"
- Line 469: Hardcoded text in JSX
  Text: "Data Collected:"
- Line 480: Hardcoded text in JSX
  Text: "Purposes:"
- Line 516: Hardcoded text in JSX
  Text: "EU Data Centers"
- Line 523: Hardcoded text in JSX
  Text: "Automatic PII Masking"
- Line 593: Hardcoded text in JSX
  Text: "Exercise Your Rights"
- Line 621: Hardcoded text in JSX
  Text: "Data Protection Contact"
- Line 625: Hardcoded text in JSX
  Text: "Data Protection Officer"

### /client/src/pages/ProfileSwitcher.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Switch Profile, YOUR PROFILES, Create New Profile"
- Line 56: Hardcoded text in JSX
  Text: "Switch Profile"
- Line 77: Hardcoded text in JSX
  Text: "YOUR PROFILES"
- Line 104: Hardcoded text in JSX
  Text: "Create New Profile"
- Line 116: Hardcoded text in JSX
  Text: "QUICK ACTIONS"
- Line 124: Hardcoded text in JSX
  Text: "Open Life CEO Voice Assistant"
- Line 132: Hardcoded text in JSX
  Text: "Return to Mundo Tango"

### /client/src/pages/ProjectTracker.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Overall Grade, Total Projects, Active projects"
- Line 244: Hardcoded text in JSX
  Text: "Overall Grade"
- Line 257: Hardcoded text in JSX
  Text: "Total Projects"
- Line 259: Hardcoded text in JSX
  Text: "Active projects"
- Line 270: Hardcoded text in JSX
  Text: "Avg Completion"
- Line 272: Hardcoded text in JSX
  Text: "Project progress"
- Line 283: Hardcoded text in JSX
  Text: "Systems Audited"
- Line 285: Hardcoded text in JSX
  Text: "All operational"
- Line 296: Hardcoded text in JSX
  Text: "Audit Results"
- Line 297: Hardcoded text in JSX
  Text: "Project List"
- Line 298: Hardcoded text in JSX
  Text: "Analytics"
- Line 356: Hardcoded text in JSX
  Text: "Project Management"
- Line 6: Hardcoded text in JSX
  Text: "Progress"
- Line 445: Hardcoded text in JSX
  Text: "Project Status Distribution"
- Line 470: Hardcoded text in JSX
  Text: "Development Layers"
- Line 485: Hardcoded text in JSX
  Text: "No layer data available"
- Line 495: Hardcoded text in JSX
  Text: "Project Summary"
- Line 513: Hardcoded text in JSX
  Text: "Actual Hours"

### /client/src/pages/PromoCodesAdmin.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Promo Code Management, Active Codes, Total Uses"
- Line 224: Hardcoded text in JSX
  Text: "Promo Code Management"
- Line 246: Hardcoded text in JSX
  Text: "Active Codes"
- Line 260: Hardcoded text in JSX
  Text: "Total Uses"
- Line 274: Hardcoded text in JSX
  Text: "Avg Discount"
- Line 286: Hardcoded text in JSX
  Text: "Revenue Impact"
- Line 298: Hardcoded text in JSX
  Text: "All Promo Codes"
- Line 309: Hardcoded text in JSX
  Text: "No promo codes yet"
- Line 53: Hardcoded text in JSX
  Text: "Code"
- Line 317: Hardcoded text in JSX
  Text: "Type"
- Line 22: Hardcoded text in JSX
  Text: "Value"
- Line 319: Hardcoded text in JSX
  Text: "Usage"
- Line 320: Hardcoded text in JSX
  Text: "Valid Until"
- Line 321: Hardcoded text in JSX
  Text: "Status"
- Line 322: Hardcoded text in JSX
  Text: "Actions"
- Line 362: Hardcoded text in JSX
  Text: "No expiry"
- Line 63: Hardcoded text in JSX
  Text: "Active"
- Line 369: Hardcoded text in JSX
  Text: "Inactive"
- Line 106: Hardcoded text in JSX
  Text: "Promo Code"
- Line 421: Hardcoded text in JSX
  Text: "SUMMER2025"
- Line 428: Hardcoded text in JSX
  Text: "Discount Type"
- Line 437: Hardcoded text in JSX
  Text: "Percentage"
- Line 438: Hardcoded text in JSX
  Text: "Fixed Amount"
- Line 2: Hardcoded text in JSX
  Text: "Description"
- Line 462: Hardcoded text in JSX
  Text: "Summer sale discount"
- Line 469: Hardcoded text in JSX
  Text: "Valid From"
- Line 504: Hardcoded text in JSX
  Text: "Applicable Tiers"

### /client/src/pages/PublicProfilePage.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Page not found, User Not Found, Tango Roles"
- Line 85: Hardcoded text in JSX
  Text: "Page not found"
- Line 107: Hardcoded text in JSX
  Text: "User Not Found"
- Line 142: Hardcoded text in JSX
  Text: "Tango Roles"

### /client/src/pages/PublicResumePage.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Resume not found, No resume entries yet, Total Roles"
- Line 77: Hardcoded text in JSX
  Text: "Resume not found"
- Line 129: Hardcoded text in JSX
  Text: "No resume entries yet"
- Line 192: Hardcoded text in JSX
  Text: "Total Roles"
- Line 198: Hardcoded text in JSX
  Text: "Events Participated"
- Line 204: Hardcoded text in JSX
  Text: "Unique Roles"

### /client/src/pages/ResumePage.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Total Roles, Events Participated, Unique Roles"
- Line 138: Hardcoded text in JSX
  Text: "Total Roles"
- Line 142: Hardcoded text in JSX
  Text: "Events Participated"
- Line 146: Hardcoded text in JSX
  Text: "Unique Roles"
- Line 259: Hardcoded text in JSX
  Text: "Unable to load resume"
- Line 281: Hardcoded text in JSX
  Text: "My Tango Resume"
- Line 286: Hardcoded text in JSX
  Text: "No resume entries yet"
- Line 322: Hardcoded text in JSX
  Text: "Copy Public Resume Link"

### /client/src/pages/RoleInvitations.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Pending, Accepted, Total Invitations"
- Line 208: Hardcoded text in JSX
  Text: "Pending"
- Line 123: Hardcoded text in JSX
  Text: "Accepted"
- Line 232: Hardcoded text in JSX
  Text: "Total Invitations"
- Line 257: Hardcoded text in JSX
  Text: "Send Role Invitation"
- Line 262: Hardcoded text in JSX
  Text: "Username"
- Line 264: Hardcoded text in JSX
  Text: "Enter username..."
- Line 31: Hardcoded text in JSX
  Text: "Event"
- Line 278: Hardcoded text in JSX
  Text: "Select event..."
- Line 31: Hardcoded text in JSX
  Text: "Role"
- Line 297: Hardcoded text in JSX
  Text: "Select role..."
- Line 313: Hardcoded text in JSX
  Text: "Message (Optional)"
- Line 315: Hardcoded text in JSX
  Text: "Add a personal message..."
- Line 123: Hardcoded text in JSX
  Text: "Declined"

### /client/src/pages/Subscription.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Choose Your Plan, Complete Your Subscription"
- Line 205: Hardcoded text in JSX
  Text: "Choose Your Plan"
- Line 276: Hardcoded text in JSX
  Text: "Complete Your Subscription"

### /client/src/pages/SubscriptionAnalytics.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Subscription Analytics, Select time range, Last year"
- Line 159: Hardcoded text in JSX
  Text: "Subscription Analytics"
- Line 165: Hardcoded text in JSX
  Text: "Select time range"
- Line 171: Hardcoded text in JSX
  Text: "Last year"
- Line 184: Hardcoded text in JSX
  Text: "Monthly Recurring Revenue"
- Line 191: Hardcoded text in JSX
  Text: "Total Subscribers"
- Line 197: Hardcoded text in JSX
  Text: "Churn Rate"
- Line 203: Hardcoded text in JSX
  Text: "Average Revenue per User"
- Line 121: Hardcoded text in JSX
  Text: "Revenue"
- Line 119: Hardcoded text in JSX
  Text: "Subscribers"
- Line 216: Hardcoded text in JSX
  Text: "Churn Analysis"
- Line 217: Hardcoded text in JSX
  Text: "Growth Metrics"
- Line 272: Hardcoded text in JSX
  Text: "Subscription Tier Distribution"
- Line 300: Hardcoded text in JSX
  Text: "Key Performance Indicators"
- Line 301: Hardcoded text in JSX
  Text: "Critical metrics at a glance"
- Line 307: Hardcoded text in JSX
  Text: "Customer Lifetime Value"
- Line 314: Hardcoded text in JSX
  Text: "Trial Conversion Rate"
- Line 321: Hardcoded text in JSX
  Text: "Net Revenue Retention"
- Line 328: Hardcoded text in JSX
  Text: "Failed Payments"
- Line 401: Hardcoded text in JSX
  Text: "Track progress against targets"

### /client/src/pages/TangoStories.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Search stories..., Popular Topics, No Stories Yet"
- Line 146: Hardcoded text in JSX
  Text: "Search stories..."
- Line 163: Hardcoded text in JSX
  Text: "Popular Topics"
- Line 187: Hardcoded text in JSX
  Text: "No Stories Yet"
- Line 272: Hardcoded text in JSX
  Text: "Share Your Tango Story"
- Line 3: Hardcoded text in JSX
  Text: "Title"
- Line 281: Hardcoded text in JSX
  Text: "Give your story a title..."
- Line 157: Hardcoded text in JSX
  Text: "Your Story"
- Line 291: Hardcoded text in JSX
  Text: "Share your tango journey, memorable moments, or lessons learned..."
- Line 297: Hardcoded text in JSX
  Text: "Location (Optional)"
- Line 301: Hardcoded text in JSX
  Text: "Buenos Aires, Argentina"
- Line 106: Hardcoded text in JSX
  Text: "Tags"

### /client/src/pages/TravelPlanner.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Cities Visited, Events Attended, Countries"
- Line 176: Hardcoded text in JSX
  Text: "Cities Visited"
- Line 188: Hardcoded text in JSX
  Text: "Events Attended"
- Line 200: Hardcoded text in JSX
  Text: "Countries"
- Line 212: Hardcoded text in JSX
  Text: "Next Trip"
- Line 227: Hardcoded text in JSX
  Text: "Itinerary"
- Line 81: Hardcoded text in JSX
  Text: "Events"
- Line 53: Hardcoded text in JSX
  Text: "Budget"
- Line 230: Hardcoded text in JSX
  Text: "Saved Trips"
- Line 249: Hardcoded text in JSX
  Text: "Trip Name"
- Line 252: Hardcoded text in JSX
  Text: "e.g., Summer Tango Tour 2025"
- Line 259: Hardcoded text in JSX
  Text: "Total Budget"
- Line 270: Hardcoded text in JSX
  Text: "Number of Travelers"
- Line 61: Hardcoded text in JSX
  Text: "Destinations"
- Line 293: Hardcoded text in JSX
  Text: "City"
- Line 330: Hardcoded text in JSX
  Text: "e.g., Buenos Aires"
- Line 337: Hardcoded text in JSX
  Text: "Country"
- Line 339: Hardcoded text in JSX
  Text: "e.g., Argentina"
- Line 346: Hardcoded text in JSX
  Text: "Start Date"
- Line 355: Hardcoded text in JSX
  Text: "End Date"
- Line 364: Hardcoded text in JSX
  Text: "Accommodation"
- Line 366: Hardcoded text in JSX
  Text: "Hotel name or address"
- Line 373: Hardcoded text in JSX
  Text: "Notes"
- Line 375: Hardcoded text in JSX
  Text: "Special notes for this destination"
- Line 535: Hardcoded text in JSX
  Text: "Per Person"
- Line 543: Hardcoded text in JSX
  Text: "Per Day"
- Line 556: Hardcoded text in JSX
  Text: "Estimated Costs by Category"
- Line 572: Hardcoded text in JSX
  Text: "Transportation"
- Line 624: Hardcoded text in JSX
  Text: "No saved trips yet"

### /client/src/pages/TripPlannerView.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Map View, Browse Results"
- Line 208: Hardcoded text in JSX
  Text: "Map View"
- Line 209: Hardcoded text in JSX
  Text: "Browse Results"

### /client/src/pages/UserSettings.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Search settings..., You have unsaved changes, Notifications"
- Line 400: Hardcoded text in JSX
  Text: "Search settings..."
- Line 450: Hardcoded text in JSX
  Text: "You have unsaved changes"
- Line 61: Hardcoded text in JSX
  Text: "Notifications"
- Line 76: Hardcoded text in JSX
  Text: "Privacy"
- Line 480: Hardcoded text in JSX
  Text: "Security"
- Line 90: Hardcoded text in JSX
  Text: "Appearance"
- Line 103: Hardcoded text in JSX
  Text: "Advanced"
- Line 40: Hardcoded text in JSX
  Text: "Accessibility"
- Line 518: Hardcoded text in JSX
  Text: "All email notifications"
- Line 519: Hardcoded text in JSX
  Text: "Master toggle"
- Line 531: Hardcoded text in JSX
  Text: "Weekly activity digest"
- Line 542: Hardcoded text in JSX
  Text: "Marketing and announcements"
- Line 564: Hardcoded text in JSX
  Text: "Enable push notifications"
- Line 638: Hardcoded text in JSX
  Text: "SMS notifications"
- Line 639: Hardcoded text in JSX
  Text: "Premium"
- Line 657: Hardcoded text in JSX
  Text: "Privacy Settings"
- Line 672: Hardcoded text in JSX
  Text: "Who can see your profile"
- Line 704: Hardcoded text in JSX
  Text: "Show my location"
- Line 714: Hardcoded text in JSX
  Text: "Show my email address"
- Line 724: Hardcoded text in JSX
  Text: "Show my phone number"
- Line 734: Hardcoded text in JSX
  Text: "Appear in search results"
- Line 754: Hardcoded text in JSX
  Text: "Who can message me"
- Line 684: Hardcoded text in JSX
  Text: "Everyone"
- Line 690: Hardcoded text in JSX
  Text: "Friends only"
- Line 765: Hardcoded text in JSX
  Text: "Nobody"
- Line 781: Hardcoded text in JSX
  Text: "Allow others to tag me"
- Line 908: Hardcoded text in JSX
  Text: "Light"
- Line 920: Hardcoded text in JSX
  Text: "Dark"
- Line 932: Hardcoded text in JSX
  Text: "System"
- Line 33: Hardcoded text in JSX
  Text: "Language"
- Line 955: Hardcoded text in JSX
  Text: "English"
- Line 959: Hardcoded text in JSX
  Text: "Deutsch"
- Line 960: Hardcoded text in JSX
  Text: "Italiano"
- Line 968: Hardcoded text in JSX
  Text: "Date format"
- Line 985: Hardcoded text in JSX
  Text: "Time format"
- Line 1008: Hardcoded text in JSX
  Text: "Font size"
- Line 1017: Hardcoded text in JSX
  Text: "Small"
- Line 1018: Hardcoded text in JSX
  Text: "Medium"
- Line 1019: Hardcoded text in JSX
  Text: "Large"
- Line 1025: Hardcoded text in JSX
  Text: "Reduce motion"
- Line 1043: Hardcoded text in JSX
  Text: "Advanced Settings"
- Line 1059: Hardcoded text in JSX
  Text: "Developer Mode"
- Line 1072: Hardcoded text in JSX
  Text: "Beta Features"
- Line 1085: Hardcoded text in JSX
  Text: "API Access"
- Line 1107: Hardcoded text in JSX
  Text: "Performance Mode"
- Line 1116: Hardcoded text in JSX
  Text: "Balanced"
- Line 1117: Hardcoded text in JSX
  Text: "Power Saver"
- Line 1118: Hardcoded text in JSX
  Text: "High Performance"
- Line 1124: Hardcoded text in JSX
  Text: "Cache Size"
- Line 1142: Hardcoded text in JSX
  Text: "Offline Mode"
- Line 1164: Hardcoded text in JSX
  Text: "Sync Frequency"
- Line 1174: Hardcoded text in JSX
  Text: "Hourly"
- Line 1175: Hardcoded text in JSX
  Text: "Daily"
- Line 1176: Hardcoded text in JSX
  Text: "Manual"
- Line 1182: Hardcoded text in JSX
  Text: "Export Format"
- Line 1200: Hardcoded text in JSX
  Text: "Webhooks"
- Line 1220: Hardcoded text in JSX
  Text: "Accessibility Settings"
- Line 1236: Hardcoded text in JSX
  Text: "Screen Reader Optimization"
- Line 1249: Hardcoded text in JSX
  Text: "High Contrast Mode"
- Line 1262: Hardcoded text in JSX
  Text: "Enhanced Focus Indicators"
- Line 1274: Hardcoded text in JSX
  Text: "Alt Text Detail Level"
- Line 1283: Hardcoded text in JSX
  Text: "Basic"
- Line 1262: Hardcoded text in JSX
  Text: "Enhanced"
- Line 1285: Hardcoded text in JSX
  Text: "Detailed"
- Line 1302: Hardcoded text in JSX
  Text: "Keyboard Navigation"
- Line 1325: Hardcoded text in JSX
  Text: "Audio Descriptions"
- Line 1339: Hardcoded text in JSX
  Text: "Show captions on all videos"
- Line 1356: Hardcoded text in JSX
  Text: "Need Help?"
- Line 142: Hardcoded text in JSX
  Text: "Password"
- Line 1457: Hardcoded text in JSX
  Text: "Current Session"
- Line 1492: Hardcoded text in JSX
  Text: "Successful login"

### /client/src/pages/admin/AgentMetrics.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "ESA 61x21 Agent Monitoring, Total Requests, Avg Response Time"
- Line 253: Hardcoded text in JSX
  Text: "ESA 61x21 Agent Monitoring"
- Line 279: Hardcoded text in JSX
  Text: "Total Requests"
- Line 294: Hardcoded text in JSX
  Text: "Avg Response Time"
- Line 310: Hardcoded text in JSX
  Text: "Success Rate"
- Line 326: Hardcoded text in JSX
  Text: "Health Score"
- Line 343: Hardcoded text in JSX
  Text: "Overview"
- Line 128: Hardcoded text in JSX
  Text: "Agents"
- Line 141: Hardcoded text in JSX
  Text: "Performance"
- Line 119: Hardcoded text in JSX
  Text: "Errors"
- Line 158: Hardcoded text in JSX
  Text: "Queues"
- Line 142: Hardcoded text in JSX
  Text: "Patterns"
- Line 354: Hardcoded text in JSX
  Text: "Agent Performance"
- Line 378: Hardcoded text in JSX
  Text: "Queue Status"
- Line 382: Hardcoded text in JSX
  Text: "Current job distribution"
- Line 411: Hardcoded text in JSX
  Text: "System Information"
- Line 418: Hardcoded text in JSX
  Text: "Uptime"
- Line 424: Hardcoded text in JSX
  Text: "Node Version"
- Line 430: Hardcoded text in JSX
  Text: "Memory Usage"
- Line 436: Hardcoded text in JSX
  Text: "Total Jobs"
- Line 442: Hardcoded text in JSX
  Text: "Active Agents"
- Line 50: Hardcoded text in JSX
  Text: "Database"
- Line 51: Hardcoded text in JSX
  Text: "Layers"
- Line 294: Hardcoded text in JSX
  Text: "Avg Response"
- Line 508: Hardcoded text in JSX
  Text: "Response Time Trends"
- Line 509: Hardcoded text in JSX
  Text: "Agent response times over time"
- Line 532: Hardcoded text in JSX
  Text: "Errors by Agent"
- Line 550: Hardcoded text in JSX
  Text: "Recent Errors"
- Line 572: Hardcoded text in JSX
  Text: "No recent errors"
- Line 585: Hardcoded text in JSX
  Text: "Queue Metrics"
- Line 586: Hardcoded text in JSX
  Text: "Job processing statistics"
- Line 594: Hardcoded text in JSX
  Text: "Active Jobs"
- Line 600: Hardcoded text in JSX
  Text: "Waiting Jobs"
- Line 606: Hardcoded text in JSX
  Text: "Completed Jobs"
- Line 612: Hardcoded text in JSX
  Text: "Failed Jobs"
- Line 623: Hardcoded text in JSX
  Text: "Top Applied Patterns"

### /client/src/pages/admin/ESAMind.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Customer Journey Flow, Total Pages, Customer Journeys"
- Line 135: Hardcoded text in JSX
  Text: "Customer Journey Flow"
- Line 232: Hardcoded text in JSX
  Text: "Total Pages"
- Line 241: Hardcoded text in JSX
  Text: "Customer Journeys"
- Line 250: Hardcoded text in JSX
  Text: "Audit Framework"
- Line 324: Hardcoded text in JSX
  Text: "Journey-Based Audit System"
- Line 330: Hardcoded text in JSX
  Text: "Execution Command"
- Line 334: Hardcoded text in JSX
  Text: "Expected Duration"
- Line 392: Hardcoded text in JSX
  Text: "Page Context"
- Line 424: Hardcoded text in JSX
  Text: "Search agents, layers, or documentation..."
- Line 438: Hardcoded text in JSX
  Text: "Total Agents"
- Line 447: Hardcoded text in JSX
  Text: "Technical Layers"
- Line 456: Hardcoded text in JSX
  Text: "Trained Agents"
- Line 465: Hardcoded text in JSX
  Text: "Training Progress"
- Line 521: Hardcoded text in JSX
  Text: "Master Orchestration Guide"
- Line 530: Hardcoded text in JSX
  Text: "Agent Org Chart"
- Line 548: Hardcoded text in JSX
  Text: "Training Status"
- Line 30: Hardcoded text in JSX
  Text: "ESA Framework"
- Line 633: Hardcoded text in JSX
  Text: "Admin Center"

### /client/src/pages/admin/EpicDetail.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Epic not found, Admin, Epic Progress"
- Line 100: Hardcoded text in JSX
  Text: "Epic not found"
- Line 15: Hardcoded text in JSX
  Text: "Admin"
- Line 156: Hardcoded text in JSX
  Text: "Epic Progress"
- Line 170: Hardcoded text in JSX
  Text: "Total Stories"
- Line 182: Hardcoded text in JSX
  Text: "Story Points"
- Line 194: Hardcoded text in JSX
  Text: "Completed"
- Line 67: Hardcoded text in JSX
  Text: "In Progress"
- Line 223: Hardcoded text in JSX
  Text: "Status Breakdown"
- Line 309: Hardcoded text in JSX
  Text: "No stories yet"

### /client/src/pages/admin/EpicsList.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Admin, Projects, Epics"
- Line 14: Hardcoded text in JSX
  Text: "Admin"
- Line 162: Hardcoded text in JSX
  Text: "Projects"
- Line 1: Hardcoded text in JSX
  Text: "Epics"
- Line 190: Hardcoded text in JSX
  Text: "Search epics..."
- Line 202: Hardcoded text in JSX
  Text: "Filter by status"
- Line 205: Hardcoded text in JSX
  Text: "All Statuses"
- Line 120: Hardcoded text in JSX
  Text: "To Do"
- Line 121: Hardcoded text in JSX
  Text: "In Progress"
- Line 122: Hardcoded text in JSX
  Text: "Done"
- Line 123: Hardcoded text in JSX
  Text: "Cancelled"
- Line 217: Hardcoded text in JSX
  Text: "Filter by priority"
- Line 220: Hardcoded text in JSX
  Text: "All Priorities"
- Line 143: Hardcoded text in JSX
  Text: "Medium"
- Line 144: Hardcoded text in JSX
  Text: "High"
- Line 145: Hardcoded text in JSX
  Text: "Critical"

### /client/src/pages/admin/MrBlueDashboard.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "3D Avatar Coming Soon, Validations, Total checks run"
- Line 111: Hardcoded text in JSX
  Text: "3D Avatar Coming Soon"
- Line 212: Hardcoded text in JSX
  Text: "Validations"
- Line 216: Hardcoded text in JSX
  Text: "Total checks run"
- Line 221: Hardcoded text in JSX
  Text: "Learnings"
- Line 225: Hardcoded text in JSX
  Text: "Patterns captured"
- Line 230: Hardcoded text in JSX
  Text: "Fix Success"
- Line 234: Hardcoded text in JSX
  Text: "AI suggestions"

### /client/src/pages/admin/StoriesList.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Stories, Search stories..., All Statuses"
- Line 1: Hardcoded text in JSX
  Text: "Stories"
- Line 190: Hardcoded text in JSX
  Text: "Search stories..."
- Line 206: Hardcoded text in JSX
  Text: "All Statuses"
- Line 123: Hardcoded text in JSX
  Text: "To Do"
- Line 124: Hardcoded text in JSX
  Text: "In Progress"
- Line 125: Hardcoded text in JSX
  Text: "Done"
- Line 126: Hardcoded text in JSX
  Text: "Cancelled"
- Line 220: Hardcoded text in JSX
  Text: "Filter by agent..."
- Line 349: Hardcoded text in JSX
  Text: "Unassigned"

### /client/src/pages/admin/StoryDetail.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Story not found, Admin, Create New Task"
- Line 196: Hardcoded text in JSX
  Text: "Story not found"
- Line 25: Hardcoded text in JSX
  Text: "Admin"
- Line 281: Hardcoded text in JSX
  Text: "Create New Task"
- Line 290: Hardcoded text in JSX
  Text: "Task Title"
- Line 292: Hardcoded text in JSX
  Text: "Implement feature..."
- Line 305: Hardcoded text in JSX
  Text: "Task details..."
- Line 313: Hardcoded text in JSX
  Text: "Assign Agent"
- Line 317: Hardcoded text in JSX
  Text: "Select agent for this task..."
- Line 334: Hardcoded text in JSX
  Text: "Estimated Hours"
- Line 339: Hardcoded text in JSX
  Text: "2.5"
- Line 430: Hardcoded text in JSX
  Text: "No tasks yet"
- Line 146: Hardcoded text in JSX
  Text: "Status"
- Line 460: Hardcoded text in JSX
  Text: "To Do"
- Line 461: Hardcoded text in JSX
  Text: "In Progress"
- Line 462: Hardcoded text in JSX
  Text: "Done"
- Line 463: Hardcoded text in JSX
  Text: "Cancelled"
- Line 468: Hardcoded text in JSX
  Text: "Priority"
- Line 475: Hardcoded text in JSX
  Text: "Medium"
- Line 476: Hardcoded text in JSX
  Text: "High"
- Line 477: Hardcoded text in JSX
  Text: "Critical"
- Line 482: Hardcoded text in JSX
  Text: "Story Points"
- Line 496: Hardcoded text in JSX
  Text: "Assigned Agent"
- Line 505: Hardcoded text in JSX
  Text: "Not assigned"
- Line 510: Hardcoded text in JSX
  Text: "Team Agents"
- Line 532: Hardcoded text in JSX
  Text: "Task Progress"
- Line 571: Hardcoded text in JSX
  Text: "Not synced to GitHub"
- Line 604: Hardcoded text in JSX
  Text: "Click to filter"
- Line 613: Hardcoded text in JSX
  Text: "Actions"

### /client/src/pages/admin/analytics.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Select range, Last year, Total Users"
- Line 240: Hardcoded text in JSX
  Text: "Select range"
- Line 247: Hardcoded text in JSX
  Text: "Last year"
- Line 266: Hardcoded text in JSX
  Text: "Total Users"
- Line 273: Hardcoded text in JSX
  Text: "Monthly Revenue"
- Line 280: Hardcoded text in JSX
  Text: "Active Users"
- Line 287: Hardcoded text in JSX
  Text: "Engagement Rate"
- Line 42: Hardcoded text in JSX
  Text: "Users"
- Line 287: Hardcoded text in JSX
  Text: "Engagement"
- Line 5: Hardcoded text in JSX
  Text: "Content"
- Line 101: Hardcoded text in JSX
  Text: "Revenue"
- Line 302: Hardcoded text in JSX
  Text: "Demographics"
- Line 311: Hardcoded text in JSX
  Text: "User Growth Trend"
- Line 341: Hardcoded text in JSX
  Text: "User Retention Cohort"
- Line 370: Hardcoded text in JSX
  Text: "Churn Rate"
- Line 385: Hardcoded text in JSX
  Text: "Engagement Metrics"
- Line 400: Hardcoded text in JSX
  Text: "Session Analytics"
- Line 416: Hardcoded text in JSX
  Text: "Pages per Session"
- Line 459: Hardcoded text in JSX
  Text: "Content Distribution"
- Line 492: Hardcoded text in JSX
  Text: "Trending Hashtags"
- Line 531: Hardcoded text in JSX
  Text: "Posts per User"
- Line 537: Hardcoded text in JSX
  Text: "Top Performing Post"
- Line 563: Hardcoded text in JSX
  Text: "Revenue Growth"
- Line 587: Hardcoded text in JSX
  Text: "Subscription Tiers"
- Line 684: Hardcoded text in JSX
  Text: "Top Countries"
- Line 702: Hardcoded text in JSX
  Text: "Device Usage"
- Line 733: Hardcoded text in JSX
  Text: "Age Groups"
- Line 758: Hardcoded text in JSX
  Text: "Languages"
- Line 111: Hardcoded text in JSX
  Text: "Gender"
- Line 784: Hardcoded text in JSX
  Text: "Female"
- Line 788: Hardcoded text in JSX
  Text: "Male"
- Line 792: Hardcoded text in JSX
  Text: "Other"

### /client/src/pages/admin/dashboard.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Churn, Response, Errors"
- Line 297: Hardcoded text in JSX
  Text: "Churn"
- Line 361: Hardcoded text in JSX
  Text: "Response"
- Line 367: Hardcoded text in JSX
  Text: "Errors"
- Line 373: Hardcoded text in JSX
  Text: "Queue"
- Line 385: Hardcoded text in JSX
  Text: "User Growth"
- Line 422: Hardcoded text in JSX
  Text: "Revenue by Tier"
- Line 423: Hardcoded text in JSX
  Text: "Current month"
- Line 507: Hardcoded text in JSX
  Text: "ESA Agents"
- Line 513: Hardcoded text in JSX
  Text: "Active Agents"
- Line 521: Hardcoded text in JSX
  Text: "Tasks Processed"
- Line 529: Hardcoded text in JSX
  Text: "Performance"
- Line 562: Hardcoded text in JSX
  Text: "Quick Actions"
- Line 571: Hardcoded text in JSX
  Text: "Send Announcement"
- Line 575: Hardcoded text in JSX
  Text: "Moderation Queue"
- Line 579: Hardcoded text in JSX
  Text: "Database Backup"
- Line 583: Hardcoded text in JSX
  Text: "Export Reports"

### /client/src/pages/admin/moderation.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Search reports by content or user..., Category, All Categories"
- Line 330: Hardcoded text in JSX
  Text: "Search reports by content or user..."
- Line 120: Hardcoded text in JSX
  Text: "Category"
- Line 343: Hardcoded text in JSX
  Text: "All Categories"
- Line 344: Hardcoded text in JSX
  Text: "Spam"
- Line 345: Hardcoded text in JSX
  Text: "Harassment"
- Line 347: Hardcoded text in JSX
  Text: "Violence"
- Line 348: Hardcoded text in JSX
  Text: "Misinformation"
- Line 349: Hardcoded text in JSX
  Text: "Other"
- Line 121: Hardcoded text in JSX
  Text: "Severity"
- Line 358: Hardcoded text in JSX
  Text: "All Severity"
- Line 360: Hardcoded text in JSX
  Text: "Medium"
- Line 361: Hardcoded text in JSX
  Text: "High"
- Line 362: Hardcoded text in JSX
  Text: "Critical"
- Line 391: Hardcoded text in JSX
  Text: "Escalated"
- Line 285: Hardcoded text in JSX
  Text: "Resolved"
- Line 406: Hardcoded text in JSX
  Text: "No reports in this category"
- Line 89: Hardcoded text in JSX
  Text: "Suspended"
- Line 525: Hardcoded text in JSX
  Text: "Quick Actions"
- Line 576: Hardcoded text in JSX
  Text: "Confirm Moderation Action"
- Line 584: Hardcoded text in JSX
  Text: "Review Note"
- Line 588: Hardcoded text in JSX
  Text: "Provide details about this moderation action..."

### /client/src/pages/admin/open-sources.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Total Open Sources"
- Line 172: Hardcoded text in JSX
  Text: "Total Open Sources"

### /client/src/pages/admin/projects.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Create New Epic, MUN-1, Summary"
- Line 188: Hardcoded text in JSX
  Text: "Create New Epic"
- Line 199: Hardcoded text in JSX
  Text: "MUN-1"
- Line 28: Hardcoded text in JSX
  Text: "Summary"
- Line 212: Hardcoded text in JSX
  Text: "Epic summary"
- Line 223: Hardcoded text in JSX
  Text: "Description"
- Line 225: Hardcoded text in JSX
  Text: "Detailed description"
- Line 145: Hardcoded text in JSX
  Text: "Status"
- Line 245: Hardcoded text in JSX
  Text: "To Do"
- Line 246: Hardcoded text in JSX
  Text: "In Progress"
- Line 247: Hardcoded text in JSX
  Text: "Done"
- Line 248: Hardcoded text in JSX
  Text: "Cancelled"
- Line 260: Hardcoded text in JSX
  Text: "Priority"
- Line 269: Hardcoded text in JSX
  Text: "Medium"
- Line 270: Hardcoded text in JSX
  Text: "High"
- Line 271: Hardcoded text in JSX
  Text: "Critical"
- Line 299: Hardcoded text in JSX
  Text: "Create New Story"
- Line 310: Hardcoded text in JSX
  Text: "MUN-6"
- Line 325: Hardcoded text in JSX
  Text: "Select epic"
- Line 347: Hardcoded text in JSX
  Text: "Story summary"
- Line 358: Hardcoded text in JSX
  Text: "Story Points"
- Line 444: Hardcoded text in JSX
  Text: "Total Epics"
- Line 463: Hardcoded text in JSX
  Text: "Total Stories"
- Line 486: Hardcoded text in JSX
  Text: "Total across all stories"
- Line 499: Hardcoded text in JSX
  Text: "Active work items"
- Line 43: Hardcoded text in JSX
  Text: "Points"
- Line 743: Hardcoded text in JSX
  Text: "Active Sprint"
- Line 755: Hardcoded text in JSX
  Text: "Total Points"
- Line 761: Hardcoded text in JSX
  Text: "Completed"
- Line 775: Hardcoded text in JSX
  Text: "Sprint Backlog"

### /client/src/pages/admin/sprints.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Sprint Management, Create New Sprint, Sprint Name"
- Line 1: Hardcoded text in JSX
  Text: "Sprint Management"
- Line 117: Hardcoded text in JSX
  Text: "Create New Sprint"
- Line 126: Hardcoded text in JSX
  Text: "Sprint Name"
- Line 62: Hardcoded text in JSX
  Text: "Sprint 4"
- Line 139: Hardcoded text in JSX
  Text: "Sprint Goal"
- Line 141: Hardcoded text in JSX
  Text: "Complete self-hosted project tracker"
- Line 153: Hardcoded text in JSX
  Text: "Start Date"
- Line 166: Hardcoded text in JSX
  Text: "End Date"
- Line 200: Hardcoded text in JSX
  Text: "Active Sprint"
- Line 180: Hardcoded text in JSX
  Text: "Velocity Target"
- Line 227: Hardcoded text in JSX
  Text: "Story points planned"
- Line 233: Hardcoded text in JSX
  Text: "Avg Velocity"
- Line 247: Hardcoded text in JSX
  Text: "Velocity Trend"
- Line 265: Hardcoded text in JSX
  Text: "All Sprints"

### /client/src/pages/admin/users.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Suspended, Inactive, Verified"
- Line 239: Hardcoded text in JSX
  Text: "Suspended"
- Line 242: Hardcoded text in JSX
  Text: "Inactive"
- Line 90: Hardcoded text in JSX
  Text: "Verified"
- Line 247: Hardcoded text in JSX
  Text: "Pending"
- Line 389: Hardcoded text in JSX
  Text: "Search by name, email, or username..."
- Line 98: Hardcoded text in JSX
  Text: "Status"
- Line 402: Hardcoded text in JSX
  Text: "All Status"
- Line 91: Hardcoded text in JSX
  Text: "Active"
- Line 99: Hardcoded text in JSX
  Text: "Role"
- Line 415: Hardcoded text in JSX
  Text: "All Roles"
- Line 1: Hardcoded text in JSX
  Text: "User"
- Line 417: Hardcoded text in JSX
  Text: "Organizer"
- Line 418: Hardcoded text in JSX
  Text: "Teacher"
- Line 419: Hardcoded text in JSX
  Text: "Moderator"
- Line 5: Hardcoded text in JSX
  Text: "Admin"
- Line 115: Hardcoded text in JSX
  Text: "Subscription"
- Line 429: Hardcoded text in JSX
  Text: "All Tiers"
- Line 430: Hardcoded text in JSX
  Text: "Free"
- Line 431: Hardcoded text in JSX
  Text: "Basic"
- Line 432: Hardcoded text in JSX
  Text: "Enthusiast"
- Line 433: Hardcoded text in JSX
  Text: "Professional"
- Line 434: Hardcoded text in JSX
  Text: "Enterprise"
- Line 517: Hardcoded text in JSX
  Text: "Location"
- Line 518: Hardcoded text in JSX
  Text: "Joined"
- Line 519: Hardcoded text in JSX
  Text: "Last Active"
- Line 129: Hardcoded text in JSX
  Text: "Actions"
- Line 596: Hardcoded text in JSX
  Text: "Never"

### /client/src/pages/auth/reset-password.tsx
- Line 151: Hardcoded text in JSX
  Text: "Enter your new password"
- Line 162: Hardcoded text in JSX
  Text: "Re-enter your new password"

### /client/src/pages/billing.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Active, Canceled, Past Due"
- Line 33: Hardcoded text in JSX
  Text: "Active"
- Line 62: Hardcoded text in JSX
  Text: "Canceled"
- Line 106: Hardcoded text in JSX
  Text: "Past Due"
- Line 108: Hardcoded text in JSX
  Text: "Trial"
- Line 134: Hardcoded text in JSX
  Text: "Billing & Subscription"
- Line 143: Hardcoded text in JSX
  Text: "Current Plan"
- Line 144: Hardcoded text in JSX
  Text: "Your subscription details"
- Line 143: Hardcoded text in JSX
  Text: "Plan"
- Line 160: Hardcoded text in JSX
  Text: "Next Billing Date"
- Line 168: Hardcoded text in JSX
  Text: "Monthly Cost"
- Line 138: Hardcoded text in JSX
  Text: "Overview"
- Line 235: Hardcoded text in JSX
  Text: "Payment History"
- Line 236: Hardcoded text in JSX
  Text: "Payment Methods"
- Line 237: Hardcoded text in JSX
  Text: "Invoices"
- Line 246: Hardcoded text in JSX
  Text: "Plan Features"
- Line 260: Hardcoded text in JSX
  Text: "Usage Limits"
- Line 269: Hardcoded text in JSX
  Text: "AI Agents"
- Line 278: Hardcoded text in JSX
  Text: "Storage"
- Line 287: Hardcoded text in JSX
  Text: "API Calls"
- Line 305: Hardcoded text in JSX
  Text: "Your recent transactions"
- Line 160: Hardcoded text in JSX
  Text: "Date"
- Line 4: Hardcoded text in JSX
  Text: "Description"
- Line 314: Hardcoded text in JSX
  Text: "Amount"
- Line 99: Hardcoded text in JSX
  Text: "Status"
- Line 237: Hardcoded text in JSX
  Text: "Invoice"
- Line 371: Hardcoded text in JSX
  Text: "Manage your payment methods"
- Line 387: Hardcoded text in JSX
  Text: "No payment methods on file"
- Line 408: Hardcoded text in JSX
  Text: "Default"

### /client/src/pages/code-of-conduct.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Be Respectful, Keep It Friendly, Share With Consent"
- Line 115: Hardcoded text in JSX
  Text: "Be Respectful"
- Line 152: Hardcoded text in JSX
  Text: "Keep It Friendly"
- Line 189: Hardcoded text in JSX
  Text: "Share With Consent"
- Line 263: Hardcoded text in JSX
  Text: "Report Problems Gently"
- Line 341: Hardcoded text in JSX
  Text: "Final Agreement"
- Line 406: Hardcoded text in JSX
  Text: "Questions or Concerns?"

### /client/src/pages/community-world-map.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Search city..."
- Line 109: Hardcoded text in JSX
  Text: "Search city..."

### /client/src/pages/community.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "World Map, Share Moments, Discover Events"
- Line 56: Hardcoded text in JSX
  Text: "World Map"
- Line 75: Hardcoded text in JSX
  Text: "Share Moments"
- Line 92: Hardcoded text in JSX
  Text: "Discover Events"
- Line 109: Hardcoded text in JSX
  Text: "Your Profile"
- Line 135: Hardcoded text in JSX
  Text: "Global Network"
- Line 147: Hardcoded text in JSX
  Text: "Real-time Updates"
- Line 159: Hardcoded text in JSX
  Text: "Event Discovery"
- Line 171: Hardcoded text in JSX
  Text: "Skill Development"

### /client/src/pages/create-community.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Cover Image, Upload a cover image, Basic Information"
- Line 146: Hardcoded text in JSX
  Text: "Cover Image"
- Line 160: Hardcoded text in JSX
  Text: "Upload a cover image"
- Line 174: Hardcoded text in JSX
  Text: "Basic Information"
- Line 183: Hardcoded text in JSX
  Text: "Community Name"
- Line 187: Hardcoded text in JSX
  Text: "e.g., Buenos Aires Tango Collective"
- Line 24: Hardcoded text in JSX
  Text: "Description"
- Line 205: Hardcoded text in JSX
  Text: "Tell us about your community..."
- Line 220: Hardcoded text in JSX
  Text: "Community Type"
- Line 224: Hardcoded text in JSX
  Text: "Select type"
- Line 240: Hardcoded text in JSX
  Text: "Music"
- Line 241: Hardcoded text in JSX
  Text: "Practice"
- Line 242: Hardcoded text in JSX
  Text: "Festival"
- Line 243: Hardcoded text in JSX
  Text: "Social"
- Line 256: Hardcoded text in JSX
  Text: "Privacy"
- Line 260: Hardcoded text in JSX
  Text: "Select privacy"
- Line 7: Hardcoded text in JSX
  Text: "Location"
- Line 297: Hardcoded text in JSX
  Text: "Where is your community based?"

### /client/src/pages/database-security.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "RLS Coverage, Audit Logging, Critical tables"
- Line 230: Hardcoded text in JSX
  Text: "RLS Coverage"
- Line 245: Hardcoded text in JSX
  Text: "Audit Logging"
- Line 247: Hardcoded text in JSX
  Text: "Critical tables"
- Line 256: Hardcoded text in JSX
  Text: "Health Status"
- Line 259: Hardcoded text in JSX
  Text: "Healthy"
- Line 260: Hardcoded text in JSX
  Text: "Issues"
- Line 274: Hardcoded text in JSX
  Text: "GDPR Status"
- Line 42: Hardcoded text in JSX
  Text: "Compliant"
- Line 278: Hardcoded text in JSX
  Text: "Review"
- Line 281: Hardcoded text in JSX
  Text: "All functions ready"
- Line 37: Hardcoded text in JSX
  Text: "Connections"
- Line 306: Hardcoded text in JSX
  Text: "Cache Hit Ratio"
- Line 316: Hardcoded text in JSX
  Text: "Database Size"
- Line 327: Hardcoded text in JSX
  Text: "RLS Policies"
- Line 328: Hardcoded text in JSX
  Text: "Audit Logs"
- Line 329: Hardcoded text in JSX
  Text: "Table Security"
- Line 330: Hardcoded text in JSX
  Text: "GDPR Tools"
- Line 336: Hardcoded text in JSX
  Text: "Row Level Security Policies"
- Line 373: Hardcoded text in JSX
  Text: "Recent Audit Logs"
- Line 416: Hardcoded text in JSX
  Text: "Table Security Status"
- Line 421: Hardcoded text in JSX
  Text: "Table Name"
- Line 45: Hardcoded text in JSX
  Text: "Audit"
- Line 424: Hardcoded text in JSX
  Text: "Sensitive"
- Line 425: Hardcoded text in JSX
  Text: "Actions"
- Line 494: Hardcoded text in JSX
  Text: "Enter user ID or email"
- Line 543: Hardcoded text in JSX
  Text: "GDPR Compliance Checklist"

### /client/src/pages/enhanced-timeline-v2.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Share, Write a comment..., Share Memory"
- Line 23: Hardcoded text in JSX
  Text: "Share"
- Line 437: Hardcoded text in JSX
  Text: "Write a comment..."
- Line 469: Hardcoded text in JSX
  Text: "Share Memory"
- Line 475: Hardcoded text in JSX
  Text: "Share to Timeline"
- Line 486: Hardcoded text in JSX
  Text: "Share with Comment"
- Line 487: Hardcoded text in JSX
  Text: "Add your thoughts when sharing"
- Line 498: Hardcoded text in JSX
  Text: "Copy Link"
- Line 499: Hardcoded text in JSX
  Text: "Copy memory link to clipboard"
- Line 709: Hardcoded text in JSX
  Text: "Upcoming Events"
- Line 777: Hardcoded text in JSX
  Text: "No memories yet"

### /client/src/pages/enhanced-timeline.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "No posts available, ✅ TIMELINE PAGE - FACEBOOK DESIGN ACTIVE ✅"
- Line 151: Hardcoded text in JSX
  Text: "No posts available"
- Line 158: Hardcoded text in JSX
  Text: "✅ TIMELINE PAGE - FACEBOOK DESIGN ACTIVE ✅"

### /client/src/pages/event-detail.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Event not found, About this event, Level"
- Line 221: Hardcoded text in JSX
  Text: "Event not found"
- Line 345: Hardcoded text in JSX
  Text: "About this event"
- Line 364: Hardcoded text in JSX
  Text: "Level"
- Line 375: Hardcoded text in JSX
  Text: "Virtual Event Access"
- Line 393: Hardcoded text in JSX
  Text: "Event Photos"
- Line 618: Hardcoded text in JSX
  Text: "Page Views"
- Line 624: Hardcoded text in JSX
  Text: "Shares"
- Line 632: Hardcoded text in JSX
  Text: "Conversion Rate"
- Line 638: Hardcoded text in JSX
  Text: "Attendee Breakdown"
- Line 641: Hardcoded text in JSX
  Text: "Going"
- Line 645: Hardcoded text in JSX
  Text: "Interested"
- Line 649: Hardcoded text in JSX
  Text: "Maybe"
- Line 742: Hardcoded text in JSX
  Text: "Share this event"
- Line 804: Hardcoded text in JSX
  Text: "Hosted by"
- Line 830: Hardcoded text in JSX
  Text: "Event Stats"
- Line 837: Hardcoded text in JSX
  Text: "Capacity"
- Line 76: Hardcoded text in JSX
  Text: "Type"
- Line 850: Hardcoded text in JSX
  Text: "Frequency"
- Line 863: Hardcoded text in JSX
  Text: "Complete Your Purchase"
- Line 871: Hardcoded text in JSX
  Text: "Cardholder Name"
- Line 873: Hardcoded text in JSX
  Text: "John Doe"
- Line 880: Hardcoded text in JSX
  Text: "Card Number"
- Line 882: Hardcoded text in JSX
  Text: "1234 5678 9012 3456"
- Line 890: Hardcoded text in JSX
  Text: "Expiry Date"
- Line 892: Hardcoded text in JSX
  Text: "MM/YY"

### /client/src/pages/feature-navigation.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Implemented, Partial, Missing"
- Line 170: Hardcoded text in JSX
  Text: "Implemented"
- Line 172: Hardcoded text in JSX
  Text: "Partial"
- Line 174: Hardcoded text in JSX
  Text: "Missing"

### /client/src/pages/friends.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Friends, Total Friends, Pending Requests"
- Line 36: Hardcoded text in JSX
  Text: "Friends"
- Line 252: Hardcoded text in JSX
  Text: "Total Friends"
- Line 263: Hardcoded text in JSX
  Text: "Pending Requests"
- Line 274: Hardcoded text in JSX
  Text: "Mutual Friends"
- Line 286: Hardcoded text in JSX
  Text: "Search friends by name or username..."
- Line 385: Hardcoded text in JSX
  Text: "No pending friend requests"
- Line 456: Hardcoded text in JSX
  Text: "Send Friend Request"
- Line 469: Hardcoded text in JSX
  Text: "Type a name or username..."
- Line 511: Hardcoded text in JSX
  Text: "Hi! I"

### /client/src/pages/global-statistics.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Global Tango Statistics, Total Users, Active Users"
- Line 121: Hardcoded text in JSX
  Text: "Global Tango Statistics"
- Line 146: Hardcoded text in JSX
  Text: "Total Users"
- Line 160: Hardcoded text in JSX
  Text: "Active Users"
- Line 174: Hardcoded text in JSX
  Text: "Total Events"
- Line 31: Hardcoded text in JSX
  Text: "Communities"
- Line 202: Hardcoded text in JSX
  Text: "Total Posts"
- Line 33: Hardcoded text in JSX
  Text: "Friendships"
- Line 232: Hardcoded text in JSX
  Text: "Overview"
- Line 34: Hardcoded text in JSX
  Text: "Cities"
- Line 234: Hardcoded text in JSX
  Text: "Top Dancers"
- Line 36: Hardcoded text in JSX
  Text: "Trends"
- Line 236: Hardcoded text in JSX
  Text: "Engagement"
- Line 295: Hardcoded text in JSX
  Text: "Engagement Metrics"
- Line 425: Hardcoded text in JSX
  Text: "Activity Patterns"
- Line 430: Hardcoded text in JSX
  Text: "Peak Activity"
- Line 437: Hardcoded text in JSX
  Text: "Most Active Day"
- Line 439: Hardcoded text in JSX
  Text: "Saturday"
- Line 444: Hardcoded text in JSX
  Text: "Avg Session"
- Line 452: Hardcoded text in JSX
  Text: "Content Performance"
- Line 464: Hardcoded text in JSX
  Text: "Avg Event Attendance"
- Line 471: Hardcoded text in JSX
  Text: "User Satisfaction"

### /client/src/pages/group.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Group Not Found, Total Members, Upcoming Events"
- Line 111: Hardcoded text in JSX
  Text: "Group Not Found"
- Line 175: Hardcoded text in JSX
  Text: "Total Members"
- Line 182: Hardcoded text in JSX
  Text: "Upcoming Events"
- Line 189: Hardcoded text in JSX
  Text: "Joined This Week"
- Line 149: Hardcoded text in JSX
  Text: "Admin"
- Line 269: Hardcoded text in JSX
  Text: "No upcoming events in this area"
- Line 338: Hardcoded text in JSX
  Text: "No memories shared yet"

### /client/src/pages/groups-old.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Groups, Search groups..., City Group Automation"
- Line 9: Hardcoded text in JSX
  Text: "Groups"
- Line 75: Hardcoded text in JSX
  Text: "Search groups..."
- Line 101: Hardcoded text in JSX
  Text: "City Group Automation"
- Line 163: Hardcoded text in JSX
  Text: "Member"
- Line 207: Hardcoded text in JSX
  Text: "No groups found"
- Line 219: Hardcoded text in JSX
  Text: "Tango Beginners"
- Line 245: Hardcoded text in JSX
  Text: "Festival Travelers"
- Line 326: Hardcoded text in JSX
  Text: "Test City Group Assignment"
- Line 338: Hardcoded text in JSX
  Text: "e.g., Buenos Aires"
- Line 352: Hardcoded text in JSX
  Text: "e.g., Argentina"
- Line 388: Hardcoded text in JSX
  Text: "Automation Result"
- Line 28: Hardcoded text in JSX
  Text: "Error"
- Line 31: Hardcoded text in JSX
  Text: "Success"

### /client/src/pages/housing-marketplace.tsx
- Line 97: Hardcoded text in JSX
  Text: "Amenities"
- Line 490: Hardcoded text in JSX
  Text: "Capacity"

### /client/src/pages/landing.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Share Memories, Find Events, Explore Community"
- Line 89: Hardcoded text in JSX
  Text: "Share Memories"
- Line 103: Hardcoded text in JSX
  Text: "Find Events"
- Line 117: Hardcoded text in JSX
  Text: "Explore Community"
- Line 131: Hardcoded text in JSX
  Text: "Life CEO"
- Line 167: Hardcoded text in JSX
  Text: "Mundo Tango"
- Line 226: Hardcoded text in JSX
  Text: "Discover Events"
- Line 240: Hardcoded text in JSX
  Text: "Global Network"
- Line 254: Hardcoded text in JSX
  Text: "Share Stories"
- Line 282: Hardcoded text in JSX
  Text: "Authentic Community"

### /client/src/pages/listing-detail.tsx
- Line 617: Hardcoded text in JSX
  Text: "Entire place"
- Line 638: Hardcoded text in JSX
  Text: "About this space"
- Line 648: Hardcoded text in JSX
  Text: "What this place offers"
- Line 665: Hardcoded text in JSX
  Text: "No amenities listed"
- Line 2: Hardcoded text in JSX
  Text: "Location"
- Line 697: Hardcoded text in JSX
  Text: "Map integration coming soon"
- Line 739: Hardcoded text in JSX
  Text: "CHECK-IN"
- Line 740: Hardcoded text in JSX
  Text: "Add date"
- Line 772: Hardcoded text in JSX
  Text: "Meet your host"
- Line 778: Hardcoded text in JSX
  Text: "Host Name"
- Line 849: Hardcoded text in JSX
  Text: "Not yet connected"
- Line 864: Hardcoded text in JSX
  Text: "Select Dates"
- Line 963: Hardcoded text in JSX
  Text: "Select purpose..."
- Line 966: Hardcoded text in JSX
  Text: "Tango Classes"
- Line 967: Hardcoded text in JSX
  Text: "Tango Festival"
- Line 968: Hardcoded text in JSX
  Text: "Tango Practice"
- Line 969: Hardcoded text in JSX
  Text: "Vacation"
- Line 970: Hardcoded text in JSX
  Text: "Business"
- Line 971: Hardcoded text in JSX
  Text: "Other"
- Line 983: Hardcoded text in JSX
  Text: "Introduce yourself and let the host know why you"
- Line 1016: Hardcoded text in JSX
  Text: "Price Details"
- Line 204: Hardcoded text in JSX
  Text: "Total"

### /client/src/pages/messages.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Messages, Search conversations..."
- Line 26: Hardcoded text in JSX
  Text: "Messages"
- Line 109: Hardcoded text in JSX
  Text: "Search conversations..."

### /client/src/pages/onboarding.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Join the global tango community, Nickname, Enter your tango nickname"
- Line 216: Hardcoded text in JSX
  Text: "Join the global tango community"
- Line 94: Hardcoded text in JSX
  Text: "Nickname"
- Line 244: Hardcoded text in JSX
  Text: "Enter your tango nickname"
- Line 255: Hardcoded text in JSX
  Text: "Languages"
- Line 277: Hardcoded text in JSX
  Text: "Choose the languages you speak"
- Line 293: Hardcoded text in JSX
  Text: "Tango Activities"
- Line 326: Hardcoded text in JSX
  Text: "Do you dance as:"
- Line 353: Hardcoded text in JSX
  Text: "Beginner"
- Line 354: Hardcoded text in JSX
  Text: "Expert"
- Line 395: Hardcoded text in JSX
  Text: "Dancing Experience"
- Line 413: Hardcoded text in JSX
  Text: "Experience Level"
- Line 419: Hardcoded text in JSX
  Text: "Choose your experience level"
- Line 441: Hardcoded text in JSX
  Text: "e.g. 2018"
- Line 15: Hardcoded text in JSX
  Text: "Location"
- Line 492: Hardcoded text in JSX
  Text: "Search for your city..."
- Line 519: Hardcoded text in JSX
  Text: "Terms of Service"
- Line 542: Hardcoded text in JSX
  Text: "Privacy Policy"

### /client/src/pages/organizer.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Organizer Tools Coming Soon, Event Management, Analytics"
- Line 12: Hardcoded text in JSX
  Text: "Organizer Tools Coming Soon"
- Line 22: Hardcoded text in JSX
  Text: "Event Management"
- Line 30: Hardcoded text in JSX
  Text: "Analytics"
- Line 38: Hardcoded text in JSX
  Text: "Promotion Tools"

### /client/src/pages/pricing.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Get started with basic features, Perfect for professionals, For teams and organizations"
- Line 134: Hardcoded text in JSX
  Text: "Get started with basic features"
- Line 178: Hardcoded text in JSX
  Text: "Perfect for professionals"
- Line 229: Hardcoded text in JSX
  Text: "For teams and organizations"
- Line 280: Hardcoded text in JSX
  Text: "Custom solutions at scale"
- Line 280: Hardcoded text in JSX
  Text: "Custom"
- Line 64: Hardcoded text in JSX
  Text: "Contact sales"
- Line 311: Hardcoded text in JSX
  Text: "Compare Features"
- Line 309: Hardcoded text in JSX
  Text: "Feature"
- Line 128: Hardcoded text in JSX
  Text: "Free"
- Line 222: Hardcoded text in JSX
  Text: "Business"
- Line 65: Hardcoded text in JSX
  Text: "Enterprise"
- Line 325: Hardcoded text in JSX
  Text: "AI Agents"
- Line 327: Hardcoded text in JSX
  Text: "Unlimited"
- Line 332: Hardcoded text in JSX
  Text: "Storage"
- Line 339: Hardcoded text in JSX
  Text: "API Calls"
- Line 346: Hardcoded text in JSX
  Text: "Support"
- Line 347: Hardcoded text in JSX
  Text: "Community"
- Line 348: Hardcoded text in JSX
  Text: "Priority"
- Line 349: Hardcoded text in JSX
  Text: "Dedicated"
- Line 353: Hardcoded text in JSX
  Text: "Team Members"
- Line 366: Hardcoded text in JSX
  Text: "Frequently Asked Questions"

### /client/src/pages/profile.tsx
- Line 880: Hardcoded text in JSX
  Text: "Intermediate Tango Instructor"
- Line 904: Hardcoded text in JSX
  Text: "Milonga Organizer"
- Line 905: Hardcoded text in JSX
  Text: "Monthly Practica Series"
- Line 928: Hardcoded text in JSX
  Text: "Resident DJ"
- Line 929: Hardcoded text in JSX
  Text: "La Milonguita Weekly"
- Line 946: Hardcoded text in JSX
  Text: "DJ & Music Curator"

### /client/src/pages/search.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Search for users, posts, events, or groups..., Start typing to search, No results found"
- Line 83: Hardcoded text in JSX
  Text: "Search for users, posts, events, or groups..."
- Line 132: Hardcoded text in JSX
  Text: "Start typing to search"
- Line 142: Hardcoded text in JSX
  Text: "No results found"

### /client/src/pages/tango-communities.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Tango Communities, Total Communities, Joined Communities"
- Line 189: Hardcoded text in JSX
  Text: "Tango Communities"
- Line 208: Hardcoded text in JSX
  Text: "Total Communities"
- Line 219: Hardcoded text in JSX
  Text: "Joined Communities"
- Line 230: Hardcoded text in JSX
  Text: "Total Events"
- Line 241: Hardcoded text in JSX
  Text: "Cities"
- Line 253: Hardcoded text in JSX
  Text: "Search communities by name, location, or description..."
- Line 348: Hardcoded text in JSX
  Text: "No communities found"

### /client/src/pages/teacher.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Teaching Tools Coming Soon, Curriculum Builder, Online Classes"
- Line 12: Hardcoded text in JSX
  Text: "Teaching Tools Coming Soon"
- Line 22: Hardcoded text in JSX
  Text: "Curriculum Builder"
- Line 30: Hardcoded text in JSX
  Text: "Online Classes"
- Line 38: Hardcoded text in JSX
  Text: "Student Progress"

### /client/src/pages/timeline-debug.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Debug Page Working!, Available Routes:"
- Line 17: Hardcoded text in JSX
  Text: "Debug Page Working!"
- Line 23: Hardcoded text in JSX
  Text: "Available Routes:"

### /client/src/pages/timeline-minimal.tsx
- Line 0: Missing useTranslation hook - page has hardcoded text
  Text: "Timeline Minimal Test"
- Line 6: Hardcoded text in JSX
  Text: "Timeline Minimal Test"

