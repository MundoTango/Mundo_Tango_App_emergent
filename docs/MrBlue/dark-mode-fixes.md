# Dark Mode Fixes Required
Total Issues: 2576

## Steps to Fix:
1. Add `dark:` variants to all color classes
2. Use design tokens from Aurora Tide system
3. Replace inline styles with Tailwind classes

## Files Needing Fixes:

### /client/src/pages/AccountDelete.tsx
- Line 156: Color class without dark mode variant: text-red-600
  Context: <ShieldAlert className="h-5 w-5 text-red-600" />
- Line 325: Color class without dark mode variant: text-blue-600
  Context: <CheckCircle className="h-5 w-5 text-blue-600" />
- Line 343: Color class without dark mode variant: text-red-600
  Context: <AlertDialogTitle className="flex items-center gap-2 text-re
- Line 358: Color class without dark mode variant: bg-red-600
  Context: className="bg-red-600 hover:bg-red-700"

### /client/src/pages/AdminCenter.tsx
- Line 446: Color class without dark mode variant: bg-white
  Context: bgColor = "bg-white"
- Line 462: Color class without dark mode variant: text-gray-600
  Context: <h3 className="text-xs sm:text-sm font-medium text-gray-600"
- Line 466: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs sm:text-sm text-gray-500">{subtitle}</
- Line 492: Color class without dark mode variant: bg-green-50
  Context: case 'excellent': return 'text-green-600 bg-green-50';
- Line 493: Color class without dark mode variant: bg-blue-50
  Context: case 'good': return 'text-blue-600 bg-blue-50';
- Line 493: Color class without dark mode variant: text-blue-600
  Context: case 'good': return 'text-blue-600 bg-blue-50';
- Line 495: Color class without dark mode variant: bg-red-50
  Context: case 'critical': return 'text-red-600 bg-red-50';
- Line 495: Color class without dark mode variant: text-red-600
  Context: case 'critical': return 'text-red-600 bg-red-50';
- Line 496: Color class without dark mode variant: bg-gray-50
  Context: default: return 'text-gray-600 bg-gray-50';
- Line 496: Color class without dark mode variant: text-gray-600
  Context: default: return 'text-gray-600 bg-gray-50';
- Line 519: Color class without dark mode variant: text-gray-600
  Context: <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4"
- Line 552: Color class without dark mode variant: text-white
  Context: <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
- Line 572: Color class without dark mode variant: text-white
  Context: <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
- Line 592: Color class without dark mode variant: text-white
  Context: <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
- Line 612: Color class without dark mode variant: text-white
  Context: <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
- Line 641: Color class without dark mode variant: text-white
  Context: <Users className="w-6 h-6 text-white" />
- Line 654: Color class without dark mode variant: text-white
  Context: <Shield className="w-6 h-6 text-white" />
- Line 667: Color class without dark mode variant: text-white
  Context: <Activity className="w-6 h-6 text-white" />
- Line 679: Color class without dark mode variant: bg-white
  Context: <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl 
- Line 680: Color class without dark mode variant: text-white
  Context: <Code className="w-6 h-6 text-white" />
- Line 682: Color class without dark mode variant: text-white
  Context: <h3 className="font-semibold text-white mb-1">TTfiles Demo</
- Line 683: Color class without dark mode variant: text-white
  Context: <p className="text-sm text-white/90">View TrangoTech vintage
- Line 760: Color class without dark mode variant: text-gray-800
  Context: <h2 className="text-xl font-bold text-gray-800">Compliance C
- Line 762: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">
- Line 773: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purpl
- Line 777: Color class without dark mode variant: border-white
  Context: <div className="w-4 h-4 border-2 border-white border-t-trans
- Line 795: Color class without dark mode variant: bg-green-500
  Context: <div className="w-3 h-3 bg-green-500 rounded-full animate-pu
- Line 812: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-2xl p-6 shadow-lg">
- Line 813: Color class without dark mode variant: text-gray-800
  Context: <h3 className="text-lg font-semibold text-gray-800 mb-4">Rec
- Line 819: Color class without dark mode variant: bg-green-500
  Context: audit.overallScore >= 85 ? 'bg-green-500 shadow-lg shadow-gr
- Line 820: Color class without dark mode variant: bg-red-500
  Context: audit.overallScore >= 70 ? 'bg-yellow-500 shadow-lg shadow-y
- Line 823: Color class without dark mode variant: text-gray-800
  Context: <div className="font-medium text-gray-800">
- Line 827: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">
- Line 834: Color class without dark mode variant: text-red-600
  Context: audit.overallScore >= 70 ? 'text-yellow-600' : 'text-red-600
- Line 848: Color class without dark mode variant: text-gray-800
  Context: <h3 className="text-lg font-semibold text-gray-800">Overall 
- Line 849: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Comprehensive security 
- Line 892: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-2xl p-6 shadow-lg">
- Line 893: Color class without dark mode variant: text-gray-800
  Context: <h3 className="text-lg font-semibold text-gray-800 mb-4">Iss
- Line 896: Color class without dark mode variant: bg-red-500
  Context: <div className="p-2 bg-red-500 rounded-lg">
- Line 897: Color class without dark mode variant: text-white
  Context: <AlertTriangle className="w-5 h-5 text-white" />
- Line 900: Color class without dark mode variant: text-red-800
  Context: <div className="font-bold text-red-800 text-xl">{compliance?
- Line 901: Color class without dark mode variant: text-red-700
  Context: <div className="text-sm text-red-700">Critical Issues</div>
- Line 906: Color class without dark mode variant: text-white
  Context: <Clock className="w-5 h-5 text-white" />
- Line 914: Color class without dark mode variant: bg-green-500
  Context: <div className="p-2 bg-green-500 rounded-lg">
- Line 915: Color class without dark mode variant: text-white
  Context: <CheckCircle className="w-5 h-5 text-white" />
- Line 966: Color class without dark mode variant: text-gray-800
  Context: <h2 className="text-xl font-bold text-gray-800">User Managem
- Line 975: Color class without dark mode variant: border-gray-300
  Context: className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg
- Line 977: Color class without dark mode variant: text-gray-400
  Context: <Users className="w-4 h-4 text-gray-400 absolute left-3 top-
- Line 982: Color class without dark mode variant: border-gray-300
  Context: className="px-4 py-2 border border-gray-300 rounded-lg focus
- Line 992: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-gradient-to-r from-turquoise-600 to-
- Line 1004: Color class without dark mode variant: bg-blue-500
  Context: <div className="p-2 bg-blue-500 rounded-xl">
- Line 1005: Color class without dark mode variant: text-white
  Context: <Users className="w-5 h-5 text-white" />
- Line 1008: Color class without dark mode variant: text-gray-800
  Context: <div className="text-2xl font-bold text-gray-800">{stats?.to
- Line 1009: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-1">Total Users</div
- Line 1014: Color class without dark mode variant: bg-green-500
  Context: <div className="p-2 bg-green-500 rounded-xl">
- Line 1015: Color class without dark mode variant: text-white
  Context: <Activity className="w-5 h-5 text-white" />
- Line 1018: Color class without dark mode variant: text-gray-800
  Context: <div className="text-2xl font-bold text-gray-800">{stats?.ac
- Line 1019: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-1">Active Today</di
- Line 1024: Color class without dark mode variant: bg-red-500
  Context: <div className="p-2 bg-red-500 rounded-xl">
- Line 1025: Color class without dark mode variant: text-white
  Context: <Ban className="w-5 h-5 text-white" />
- Line 1028: Color class without dark mode variant: text-gray-800
  Context: <div className="text-2xl font-bold text-gray-800">3</div>
- Line 1029: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-1">Suspended</div>
- Line 1035: Color class without dark mode variant: text-white
  Context: <Clock className="w-5 h-5 text-white" />
- Line 1038: Color class without dark mode variant: text-gray-800
  Context: <div className="text-2xl font-bold text-gray-800">7</div>
- Line 1039: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-1">Pending Approval
- Line 1044: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-2xl p-6 shadow-lg">
- Line 1045: Color class without dark mode variant: text-gray-800
  Context: <h3 className="text-lg font-semibold text-gray-800 mb-4">Use
- Line 1047: Color class without dark mode variant: text-gray-500
  Context: <div className="text-center py-8 text-gray-500">Loading user
- Line 1049: Color class without dark mode variant: text-gray-500
  Context: <div className="text-center py-8 text-gray-500">No users fou
- Line 1054: Color class without dark mode variant: border-gray-200
  Context: <tr className="border-b border-gray-200">
- Line 1055: Color class without dark mode variant: text-gray-700
  Context: <th className="text-left py-3 px-4 font-medium text-gray-700
- Line 1056: Color class without dark mode variant: text-gray-700
  Context: <th className="text-left py-3 px-4 font-medium text-gray-700
- Line 1057: Color class without dark mode variant: text-gray-700
  Context: <th className="text-left py-3 px-4 font-medium text-gray-700
- Line 1058: Color class without dark mode variant: text-gray-700
  Context: <th className="text-left py-3 px-4 font-medium text-gray-700
- Line 1059: Color class without dark mode variant: text-gray-700
  Context: <th className="text-left py-3 px-4 font-medium text-gray-700
- Line 1060: Color class without dark mode variant: text-gray-700
  Context: <th className="text-right py-3 px-4 font-medium text-gray-70
- Line 1065: Color class without dark mode variant: bg-gray-50
  Context: <tr key={user.id} className="border-b border-gray-100 hover:
- Line 1065: Color class without dark mode variant: border-gray-100
  Context: <tr key={user.id} className="border-b border-gray-100 hover:
- Line 1068: Color class without dark mode variant: text-white
  Context: <div className="w-10 h-10 rounded-full bg-gradient-to-br fro
- Line 1072: Color class without dark mode variant: text-gray-900
  Context: <div className="font-medium text-gray-900">{user.username ||
- Line 1073: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500">ID: {user.id}</div>
- Line 1077: Color class without dark mode variant: text-gray-700
  Context: <td className="py-3 px-4 text-gray-700">{user.email || 'N/A'
- Line 1079: Color class without dark mode variant: bg-blue-100
  Context: <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded
- Line 1079: Color class without dark mode variant: text-blue-700
  Context: <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded
- Line 1085: Color class without dark mode variant: bg-red-100
  Context: user.suspended ? 'bg-red-100 text-red-700' :
- Line 1085: Color class without dark mode variant: text-red-700
  Context: user.suspended ? 'bg-red-100 text-red-700' :
- Line 1086: Color class without dark mode variant: bg-green-100
  Context: user.verified ? 'bg-green-100 text-green-700' :
- Line 1092: Color class without dark mode variant: text-gray-700
  Context: <td className="py-3 px-4 text-gray-700">
- Line 1102: Color class without dark mode variant: text-blue-600
  Context: className="text-blue-600 hover:text-blue-800"
- Line 1109: Color class without dark mode variant: text-red-600
  Context: className="text-red-600 hover:text-red-800"
- Line 1133: Color class without dark mode variant: bg-black
  Context: <div className="fixed inset-0 bg-black bg-opacity-50 flex it
- Line 1134: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-2xl p-6 max-w-2xl w-full ma
- Line 1136: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-xl font-bold text-gray-900">User Details
- Line 1139: Color class without dark mode variant: text-gray-400
  Context: className="text-gray-400 hover:text-gray-600"
- Line 1147: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500">Username</div>
- Line 1151: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500">Email</div>
- Line 1155: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500">Location</div>
- Line 1159: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500">Tango Role</div>
- Line 1167: Color class without dark mode variant: bg-green-600
  Context: className="px-4 py-2 bg-green-600 text-white rounded-lg hove
- Line 1167: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-green-600 text-white rounded-lg hove
- Line 1175: Color class without dark mode variant: bg-red-600
  Context: className="px-4 py-2 bg-red-600 text-white rounded-lg hover:
- Line 1175: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-red-600 text-white rounded-lg hover:
- Line 1182: Color class without dark mode variant: bg-green-600
  Context: className="px-4 py-2 bg-green-600 text-white rounded-lg hove
- Line 1182: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-green-600 text-white rounded-lg hove
- Line 1198: Color class without dark mode variant: text-gray-800
  Context: <h2 className="text-xl font-bold text-gray-800">Content Mode
- Line 1207: Color class without dark mode variant: border-gray-300
  Context: className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg
- Line 1209: Color class without dark mode variant: text-gray-400
  Context: <FileText className="w-4 h-4 text-gray-400 absolute left-3 t
- Line 1214: Color class without dark mode variant: border-gray-300
  Context: className="px-4 py-2 border border-gray-300 rounded-lg focus
- Line 1224: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-6
- Line 1236: Color class without dark mode variant: bg-blue-500
  Context: <div className="p-2 bg-blue-500 rounded-xl">
- Line 1237: Color class without dark mode variant: text-white
  Context: <FileText className="w-5 h-5 text-white" />
- Line 1240: Color class without dark mode variant: text-gray-800
  Context: <div className="text-2xl font-bold text-gray-800">{stats?.to
- Line 1241: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-1">Total Posts</div
- Line 1246: Color class without dark mode variant: bg-red-500
  Context: <div className="p-2 bg-red-500 rounded-xl">
- Line 1247: Color class without dark mode variant: text-white
  Context: <Flag className="w-5 h-5 text-white" />
- Line 1250: Color class without dark mode variant: text-gray-800
  Context: <div className="text-2xl font-bold text-gray-800">12</div>
- Line 1251: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-1">Flagged Content<
- Line 1256: Color class without dark mode variant: bg-green-500
  Context: <div className="p-2 bg-green-500 rounded-xl">
- Line 1257: Color class without dark mode variant: text-white
  Context: <Shield className="w-5 h-5 text-white" />
- Line 1260: Color class without dark mode variant: text-gray-800
  Context: <div className="text-2xl font-bold text-gray-800">89</div>
- Line 1261: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-1">Auto-Moderated</
- Line 1267: Color class without dark mode variant: text-white
  Context: <MessageSquare className="w-5 h-5 text-white" />
- Line 1270: Color class without dark mode variant: text-gray-800
  Context: <div className="text-2xl font-bold text-gray-800">4</div>
- Line 1271: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-1">Appeals</div>
- Line 1276: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-2xl p-6 shadow-lg">
- Line 1278: Color class without dark mode variant: text-gray-800
  Context: <h3 className="text-lg font-semibold text-gray-800">Content 
- Line 1279: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500">
- Line 1284: Color class without dark mode variant: text-gray-500
  Context: <div className="text-center py-8 text-gray-500">Loading cont
- Line 1286: Color class without dark mode variant: text-gray-500
  Context: <div className="text-center py-8 text-gray-500">No content t
- Line 1290: Color class without dark mode variant: border-gray-200
  Context: <div key={content.id} className="border border-gray-200 roun
- Line 1295: Color class without dark mode variant: bg-blue-100
  Context: content.type === 'post' ? 'bg-blue-100 text-blue-700' :
- Line 1295: Color class without dark mode variant: text-blue-700
  Context: content.type === 'post' ? 'bg-blue-100 text-blue-700' :
- Line 1296: Color class without dark mode variant: bg-green-100
  Context: content.type === 'comment' ? 'bg-green-100 text-green-700' :
- Line 1297: Color class without dark mode variant: bg-gray-100
  Context: 'bg-gray-100 text-gray-700'
- Line 1297: Color class without dark mode variant: text-gray-700
  Context: 'bg-gray-100 text-gray-700'
- Line 1302: Color class without dark mode variant: bg-red-100
  Context: content.status === 'flagged' ? 'bg-red-100 text-red-700' :
- Line 1302: Color class without dark mode variant: text-red-700
  Context: content.status === 'flagged' ? 'bg-red-100 text-red-700' :
- Line 1304: Color class without dark mode variant: bg-gray-100
  Context: 'bg-gray-100 text-gray-700'
- Line 1304: Color class without dark mode variant: text-gray-700
  Context: 'bg-gray-100 text-gray-700'
- Line 1309: Color class without dark mode variant: text-gray-500
  Context: <span className="text-xs text-gray-500">
- Line 1314: Color class without dark mode variant: text-gray-900
  Context: <div className="text-gray-900 mb-2">{content.content}</div>
- Line 1317: Color class without dark mode variant: bg-red-50
  Context: <div className="bg-red-50 rounded-lg p-2 mb-2">
- Line 1318: Color class without dark mode variant: text-red-700
  Context: <span className="text-xs font-medium text-red-700">Report Re
- Line 1319: Color class without dark mode variant: text-red-600
  Context: <span className="text-xs text-red-600">{content.reportReason
- Line 1321: Color class without dark mode variant: text-gray-600
  Context: <div className="text-xs text-gray-600 mt-1 italic">"{content
- Line 1325: Color class without dark mode variant: text-gray-600
  Context: <div className="flex items-center gap-4 text-sm text-gray-60
- Line 1329: Color class without dark mode variant: text-red-600
  Context: <span className="text-xs text-red-600">• Reported by @{conte
- Line 1340: Color class without dark mode variant: bg-blue-100
  Context: className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 r
- Line 1340: Color class without dark mode variant: text-blue-600
  Context: className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 r
- Line 1347: Color class without dark mode variant: bg-green-100
  Context: className="p-2 bg-green-100 text-green-600 hover:bg-green-20
- Line 1354: Color class without dark mode variant: bg-red-100
  Context: className="p-2 bg-red-100 text-red-600 hover:bg-red-200 roun
- Line 1354: Color class without dark mode variant: text-red-600
  Context: className="p-2 bg-red-100 text-red-600 hover:bg-red-200 roun
- Line 1372: Color class without dark mode variant: bg-black
  Context: className="fixed inset-0 bg-black bg-opacity-50 z-40"
- Line 1377: Color class without dark mode variant: bg-white
  Context: <div className={`fixed top-0 right-0 h-full w-[480px] bg-whi
- Line 1385: Color class without dark mode variant: text-white
  Context: <FileText className="w-5 h-5 text-white" />
- Line 1387: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-xl font-bold text-gray-900">Content Revi
- Line 1391: Color class without dark mode variant: bg-gray-100
  Context: className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gr
- Line 1391: Color class without dark mode variant: text-gray-400
  Context: className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gr
- Line 1400: Color class without dark mode variant: bg-gray-50
  Context: <div className="bg-gray-50 rounded-lg p-4">
- Line 1401: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500 mb-2">Content</div>
- Line 1402: Color class without dark mode variant: text-gray-900
  Context: <div className="text-gray-900">{selectedContent.content}</di
- Line 1407: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500">Author</div>
- Line 1411: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500">Type</div>
- Line 1415: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500">Posted</div>
- Line 1419: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500">Reports</div>
- Line 1425: Color class without dark mode variant: bg-red-50
  Context: <div className="bg-red-50 rounded-lg p-4">
- Line 1426: Color class without dark mode variant: text-red-700
  Context: <div className="text-sm font-medium text-red-700 mb-1">Repor
- Line 1427: Color class without dark mode variant: text-red-600
  Context: <div className="text-sm text-red-600">{selectedContent.repor
- Line 1429: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-2 italic">
- Line 1434: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500 mt-2">
- Line 1451: Color class without dark mode variant: text-white
  Context: className={`w-full px-4 py-3 bg-gradient-to-r from-green-600
- Line 1470: Color class without dark mode variant: text-white
  Context: className={`w-full px-4 py-3 bg-gradient-to-r from-red-600 t
- Line 1489: Color class without dark mode variant: text-white
  Context: className={`w-full px-4 py-3 bg-gradient-to-r from-yellow-60
- Line 1543: Color class without dark mode variant: text-gray-800
  Context: <h2 className="text-xl font-bold text-gray-800">Platform Ana
- Line 1547: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-gradient-to-r from-turquoise-600 to-
- Line 1553: Color class without dark mode variant: text-white
  Context: <button className="px-4 py-2 bg-gradient-to-r from-blue-600 
- Line 1564: Color class without dark mode variant: bg-gray-200
  Context: <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
- Line 1574: Color class without dark mode variant: bg-green-500
  Context: <div className="p-2 bg-green-500 rounded-xl">
- Line 1575: Color class without dark mode variant: text-white
  Context: <Users className="w-5 h-5 text-white" />
- Line 1577: Color class without dark mode variant: text-red-600
  Context: <span className={`text-xs font-medium ${analyticsData?.dauCh
- Line 1581: Color class without dark mode variant: text-gray-800
  Context: <div className="text-2xl font-bold text-gray-800">{analytics
- Line 1582: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-1">Daily Active Use
- Line 1583: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500 mt-1">
- Line 1590: Color class without dark mode variant: bg-blue-500
  Context: <div className="p-2 bg-blue-500 rounded-xl">
- Line 1591: Color class without dark mode variant: text-white
  Context: <Eye className="w-5 h-5 text-white" />
- Line 1593: Color class without dark mode variant: text-blue-600
  Context: <span className={`text-xs font-medium ${analyticsData?.pageV
- Line 1597: Color class without dark mode variant: text-gray-800
  Context: <div className="text-2xl font-bold text-gray-800">{analytics
- Line 1598: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-1">Page Views</div>
- Line 1599: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500 mt-1">
- Line 1607: Color class without dark mode variant: text-white
  Context: <TrendingUp className="w-5 h-5 text-white" />
- Line 1609: Color class without dark mode variant: text-red-600
  Context: <span className={`text-xs font-medium ${analyticsData?.engag
- Line 1613: Color class without dark mode variant: text-gray-800
  Context: <div className="text-2xl font-bold text-gray-800">{analytics
- Line 1614: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-1">Engagement Rate<
- Line 1615: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500 mt-1">
- Line 1622: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-2xl p-6 shadow-lg">
- Line 1623: Color class without dark mode variant: text-gray-800
  Context: <h3 className="text-lg font-semibold text-gray-800 mb-4">Top
- Line 1640: Color class without dark mode variant: text-blue-600
  Context: const textColors = ['text-purple-600', 'text-blue-600', 'tex
- Line 1646: Color class without dark mode variant: text-white
  Context: <Globe className="w-4 h-4 text-white" />
- Line 1648: Color class without dark mode variant: text-gray-800
  Context: <span className="font-medium text-gray-800">
- Line 1715: Color class without dark mode variant: text-gray-800
  Context: <h2 className="text-xl font-bold text-gray-800">Event Manage
- Line 1720: Color class without dark mode variant: border-gray-300
  Context: className="px-4 py-2 border border-gray-300 rounded-xl focus
- Line 1729: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-gradient-to-r from-turquoise-600 to-
- Line 1735: Color class without dark mode variant: text-white
  Context: <button className="px-4 py-2 bg-gradient-to-r from-green-600
- Line 1746: Color class without dark mode variant: bg-gray-200
  Context: <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
- Line 1756: Color class without dark mode variant: bg-green-500
  Context: <div className="p-2 bg-green-500 rounded-xl">
- Line 1757: Color class without dark mode variant: text-white
  Context: <Calendar className="w-5 h-5 text-white" />
- Line 1760: Color class without dark mode variant: text-gray-800
  Context: <div className="text-2xl font-bold text-gray-800">{eventsDat
- Line 1761: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-1">Total Events</di
- Line 1766: Color class without dark mode variant: bg-blue-500
  Context: <div className="p-2 bg-blue-500 rounded-xl">
- Line 1767: Color class without dark mode variant: text-white
  Context: <Calendar className="w-5 h-5 text-white" />
- Line 1770: Color class without dark mode variant: text-gray-800
  Context: <div className="text-2xl font-bold text-gray-800">{eventsDat
- Line 1771: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-1">This Month</div>
- Line 1777: Color class without dark mode variant: text-white
  Context: <Clock className="w-5 h-5 text-white" />
- Line 1780: Color class without dark mode variant: text-gray-800
  Context: <div className="text-2xl font-bold text-gray-800">{eventsDat
- Line 1781: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-1">Upcoming</div>
- Line 1787: Color class without dark mode variant: text-white
  Context: <TrendingUp className="w-5 h-5 text-white" />
- Line 1790: Color class without dark mode variant: text-gray-800
  Context: <div className="text-2xl font-bold text-gray-800">{eventsDat
- Line 1791: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-1">Featured Events<
- Line 1796: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-2xl p-6 shadow-lg">
- Line 1797: Color class without dark mode variant: text-gray-800
  Context: <h3 className="text-lg font-semibold text-gray-800 mb-4">Eve
- Line 1805: Color class without dark mode variant: text-gray-700
  Context: <div className="text-sm text-gray-700 font-medium">{category
- Line 1813: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-2xl p-6 shadow-lg">
- Line 1814: Color class without dark mode variant: text-gray-800
  Context: <h3 className="text-lg font-semibold text-gray-800 mb-4">Rec
- Line 1817: Color class without dark mode variant: bg-gray-50
  Context: <div key={event.id} className="flex items-center justify-bet
- Line 1819: Color class without dark mode variant: text-gray-800
  Context: <h4 className="font-medium text-gray-800">{event.title}</h4>
- Line 1820: Color class without dark mode variant: text-gray-600
  Context: <div className="flex gap-4 mt-1 text-sm text-gray-600">
- Line 1831: Color class without dark mode variant: text-white
  Context: ? 'bg-purple-600 text-white'
- Line 1832: Color class without dark mode variant: bg-gray-200
  Context: : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
- Line 1832: Color class without dark mode variant: text-gray-700
  Context: : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
- Line 1837: Color class without dark mode variant: text-white
  Context: <button className="px-3 py-1 bg-turquoise-600 text-white rou
- Line 1894: Color class without dark mode variant: text-gray-900
  Context: <h2 className="text-xl font-bold text-gray-900">User Reports
- Line 1899: Color class without dark mode variant: border-gray-300
  Context: className="px-4 py-2 border border-gray-300 rounded-lg focus
- Line 1910: Color class without dark mode variant: bg-blue-600
  Context: className="px-4 py-2 bg-blue-600 text-white rounded-lg hover
- Line 1910: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-blue-600 text-white rounded-lg hover
- Line 1923: Color class without dark mode variant: text-red-600
  Context: icon={<Flag className="w-5 h-5 text-red-600" />}
- Line 1924: Color class without dark mode variant: bg-red-50
  Context: bgColor="bg-red-50"
- Line 1936: Color class without dark mode variant: bg-green-50
  Context: bgColor="bg-green-50"
- Line 1941: Color class without dark mode variant: text-blue-600
  Context: icon={<Eye className="w-5 h-5 text-blue-600" />}
- Line 1942: Color class without dark mode variant: bg-blue-50
  Context: bgColor="bg-blue-50"
- Line 1947: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-xl p-6 border border-gray-2
- Line 1947: Color class without dark mode variant: border-gray-200
  Context: <div className="bg-white rounded-xl p-6 border border-gray-2
- Line 1948: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4">Use
- Line 1950: Color class without dark mode variant: text-gray-500
  Context: <div className="text-center py-8 text-gray-500">
- Line 1954: Color class without dark mode variant: text-gray-500
  Context: <div className="text-center py-8 text-gray-500">
- Line 1960: Color class without dark mode variant: bg-gray-50
  Context: <div key={report.id} className="border border-gray-200 round
- Line 1960: Color class without dark mode variant: border-gray-200
  Context: <div key={report.id} className="border border-gray-200 round
- Line 1965: Color class without dark mode variant: bg-red-100
  Context: report.report_type_name === 'Harassment' ? 'bg-red-100 text-
- Line 1965: Color class without dark mode variant: text-red-800
  Context: report.report_type_name === 'Harassment' ? 'bg-red-100 text-
- Line 1968: Color class without dark mode variant: bg-gray-100
  Context: 'bg-gray-100 text-gray-800'
- Line 1968: Color class without dark mode variant: text-gray-800
  Context: 'bg-gray-100 text-gray-800'
- Line 1972: Color class without dark mode variant: text-gray-500
  Context: <span className="text-sm text-gray-500">
- Line 1976: Color class without dark mode variant: bg-red-100
  Context: report.status === 'unresolved' ? 'bg-red-100 text-red-700' :
- Line 1976: Color class without dark mode variant: text-red-700
  Context: report.status === 'unresolved' ? 'bg-red-100 text-red-700' :
- Line 1978: Color class without dark mode variant: bg-green-100
  Context: report.status === 'resolved' ? 'bg-green-100 text-green-700'
- Line 1979: Color class without dark mode variant: bg-gray-100
  Context: 'bg-gray-100 text-gray-700'
- Line 1979: Color class without dark mode variant: text-gray-700
  Context: 'bg-gray-100 text-gray-700'
- Line 1984: Color class without dark mode variant: text-gray-900
  Context: <p className="text-sm text-gray-900 mb-2">{report.descriptio
- Line 1985: Color class without dark mode variant: text-gray-500
  Context: <div className="flex items-center gap-4 text-xs text-gray-50
- Line 2002: Color class without dark mode variant: text-white
  Context: className="px-3 py-1 text-sm bg-yellow-600 text-white rounde
- Line 2008: Color class without dark mode variant: bg-green-600
  Context: className="px-3 py-1 text-sm bg-green-600 text-white rounded
- Line 2008: Color class without dark mode variant: text-white
  Context: className="px-3 py-1 text-sm bg-green-600 text-white rounded
- Line 2014: Color class without dark mode variant: bg-gray-600
  Context: className="px-3 py-1 text-sm bg-gray-600 text-white rounded 
- Line 2014: Color class without dark mode variant: text-white
  Context: className="px-3 py-1 text-sm bg-gray-600 text-white rounded 
- Line 2024: Color class without dark mode variant: bg-green-600
  Context: className="px-3 py-1 text-sm bg-green-600 text-white rounded
- Line 2024: Color class without dark mode variant: text-white
  Context: className="px-3 py-1 text-sm bg-green-600 text-white rounded
- Line 2030: Color class without dark mode variant: bg-gray-600
  Context: className="px-3 py-1 text-sm bg-gray-600 text-white rounded 
- Line 2030: Color class without dark mode variant: text-white
  Context: className="px-3 py-1 text-sm bg-gray-600 text-white rounded 
- Line 2079: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mt-1">
- Line 2087: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-gradient-to-r from-turquoise-500 to-
- Line 2113: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">Render Time</div>
- Line 2114: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500">Target: {'<3s'}</div>
- Line 2119: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">Bundle Size</div>
- Line 2120: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500">99.5% reduction</div>
- Line 2125: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">Cache Hit Rate</div>
- Line 2126: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500">60-70% average</div>
- Line 2131: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">API Response</div>
- Line 2132: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500">Average latency</div>
- Line 2147: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">Build Memory</div>
- Line 2148: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500">Allocated for builds<
- Line 2153: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">Storage Used</div>
- Line 2154: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500">of allocated space</d
- Line 2159: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">Database Load</div>
- Line 2160: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500">Current utilization</
- Line 2165: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">Memory Cleanup</div>
- Line 2166: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500">Auto-optimizing</div>
- Line 2181: Color class without dark mode variant: text-gray-700
  Context: <span className="text-sm font-medium text-gray-700">SOC 2 Ty
- Line 2185: Color class without dark mode variant: bg-gray-200
  Context: <Progress value={70} className="mt-2 h-2 bg-gray-200" />
- Line 2186: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500 mt-2">Access controls:
- Line 2190: Color class without dark mode variant: text-gray-700
  Context: <span className="text-sm font-medium text-gray-700">Enterpri
- Line 2194: Color class without dark mode variant: bg-gray-200
  Context: <Progress value={45} className="mt-2 h-2 bg-gray-200" />
- Line 2195: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500 mt-2">Classification: 
- Line 2199: Color class without dark mode variant: text-gray-700
  Context: <span className="text-sm font-medium text-gray-700">Security
- Line 2200: Color class without dark mode variant: bg-gray-100
  Context: <Badge className="bg-gray-100 text-gray-700">Planned</Badge>
- Line 2200: Color class without dark mode variant: text-gray-700
  Context: <Badge className="bg-gray-100 text-gray-700">Planned</Badge>
- Line 2203: Color class without dark mode variant: bg-gray-200
  Context: <Progress value={0} className="mt-2 h-2 bg-gray-200" />
- Line 2204: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500 mt-2">IDS/IPS: 0% • Se
- Line 2213: Color class without dark mode variant: bg-green-500
  Context: <div className="p-2 bg-green-500 rounded-xl">
- Line 2214: Color class without dark mode variant: text-white
  Context: <Server className="w-5 h-5 text-white" />
- Line 2217: Color class without dark mode variant: text-gray-800
  Context: <div className="text-2xl font-bold text-gray-800">{systemMet
- Line 2218: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-1">Server Uptime</d
- Line 2219: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500 mt-1">30-day average</
- Line 2224: Color class without dark mode variant: bg-blue-500
  Context: <div className="p-2 bg-blue-500 rounded-xl">
- Line 2225: Color class without dark mode variant: text-white
  Context: <Gauge className="w-5 h-5 text-white" />
- Line 2228: Color class without dark mode variant: text-gray-800
  Context: <div className="text-2xl font-bold text-gray-800">92%</div>
- Line 2229: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-1">Performance Scor
- Line 2230: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500 mt-1">Life CEO optimiz
- Line 2236: Color class without dark mode variant: text-white
  Context: <Database className="w-5 h-5 text-white" />
- Line 2239: Color class without dark mode variant: text-gray-800
  Context: <div className="text-2xl font-bold text-gray-800">258</div>
- Line 2240: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-1">DB Indexes</div>
- Line 2241: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500 mt-1">Optimized querie
- Line 2247: Color class without dark mode variant: text-white
  Context: <Shield className="w-5 h-5 text-white" />
- Line 2250: Color class without dark mode variant: text-gray-800
  Context: <div className="text-2xl font-bold text-gray-800">40</div>
- Line 2251: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 mt-1">RLS Tables</div>
- Line 2252: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500 mt-1">Row-level securi
- Line 2257: Color class without dark mode variant: bg-white
  Context: <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6
- Line 2257: Color class without dark mode variant: border-white
  Context: <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6
- Line 2263: Color class without dark mode variant: text-white
  Context: <CheckCircle className="w-5 h-5 text-white" />
- Line 2272: Color class without dark mode variant: text-white
  Context: <CheckCircle className="w-5 h-5 text-white" />
- Line 2281: Color class without dark mode variant: text-white
  Context: <CheckCircle className="w-5 h-5 text-white" />
- Line 2290: Color class without dark mode variant: text-white
  Context: <Wifi className="w-5 h-5 text-white" />
- Line 2434: Color class without dark mode variant: text-gray-800
  Context: <h2 className="text-xl font-bold text-gray-800">Reports Mana
- Line 2439: Color class without dark mode variant: border-gray-300
  Context: className="px-4 py-2 border border-gray-300 rounded-xl focus
- Line 2448: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-gradient-to-r from-turquoise-600 to-
- Line 2458: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-2xl p-6 shadow-lg">
- Line 2459: Color class without dark mode variant: text-gray-800
  Context: <h3 className="text-lg font-semibold text-gray-800 mb-4">Use
- Line 2461: Color class without dark mode variant: text-gray-500
  Context: <div className="text-center py-8 text-gray-500">Loading repo
- Line 2463: Color class without dark mode variant: text-gray-500
  Context: <div className="text-center py-8 text-gray-500">No reports f
- Line 2467: Color class without dark mode variant: border-gray-200
  Context: <div key={report.id} className="border border-gray-200 round
- Line 2472: Color class without dark mode variant: bg-red-100
  Context: report.category === 'spam' ? 'bg-red-100 text-red-700' :
- Line 2472: Color class without dark mode variant: text-red-700
  Context: report.category === 'spam' ? 'bg-red-100 text-red-700' :
- Line 2475: Color class without dark mode variant: bg-gray-100
  Context: 'bg-gray-100 text-gray-700'
- Line 2475: Color class without dark mode variant: text-gray-700
  Context: 'bg-gray-100 text-gray-700'
- Line 2481: Color class without dark mode variant: bg-green-100
  Context: report.status === 'resolved' ? 'bg-green-100 text-green-700'
- Line 2482: Color class without dark mode variant: bg-gray-100
  Context: 'bg-gray-100 text-gray-700'
- Line 2482: Color class without dark mode variant: text-gray-700
  Context: 'bg-gray-100 text-gray-700'
- Line 2487: Color class without dark mode variant: text-gray-900
  Context: <div className="text-gray-900 mb-2 font-medium">Report #{rep
- Line 2489: Color class without dark mode variant: text-gray-600
  Context: <div className="text-gray-600 mb-2">"{report.description}"</
- Line 2491: Color class without dark mode variant: text-gray-600
  Context: <div className="flex items-center gap-4 text-sm text-gray-60
- Line 2502: Color class without dark mode variant: bg-green-100
  Context: className="p-2 bg-green-100 text-green-600 hover:bg-green-20
- Line 2509: Color class without dark mode variant: bg-gray-100
  Context: className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 r
- Line 2509: Color class without dark mode variant: text-gray-600
  Context: className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 r
- Line 2525: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-2xl p-6 shadow-lg">
- Line 2526: Color class without dark mode variant: text-gray-800
  Context: <h3 className="text-lg font-semibold text-gray-800 mb-4">Blo
- Line 2528: Color class without dark mode variant: text-gray-500
  Context: <div className="text-center py-8 text-gray-500">No blocked u
- Line 2532: Color class without dark mode variant: bg-gray-50
  Context: <div key={user.id} className="flex items-center justify-betw
- Line 2534: Color class without dark mode variant: bg-gray-300
  Context: <div className="w-10 h-10 bg-gray-300 rounded-full flex item
- Line 2535: Color class without dark mode variant: text-gray-600
  Context: <Users className="w-5 h-5 text-gray-600" />
- Line 2538: Color class without dark mode variant: text-gray-800
  Context: <div className="font-medium text-gray-800">{user.username}</
- Line 2539: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">{user.email}</div>
- Line 2544: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-gradient-to-r from-green-500 to-emer
- Line 2559: Color class without dark mode variant: text-gray-800
  Context: <h2 className="text-xl font-bold text-gray-800">Platform Set
- Line 2562: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-gradient-to-r from-turquoise-600 to-
- Line 2573: Color class without dark mode variant: bg-gray-200
  Context: <div key={i} className="h-40 bg-gray-200 rounded-2xl"></div>
- Line 2579: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-2xl p-6 shadow-lg">
- Line 2580: Color class without dark mode variant: text-gray-800
  Context: <h3 className="text-lg font-semibold text-gray-800 mb-4">Gen
- Line 2584: Color class without dark mode variant: text-gray-800
  Context: <div className="font-medium text-gray-800">Site Name</div>
- Line 2585: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">The name of your plat
- Line 2591: Color class without dark mode variant: border-gray-300
  Context: className="px-3 py-2 border border-gray-300 rounded-lg focus
- Line 2596: Color class without dark mode variant: text-gray-800
  Context: <div className="font-medium text-gray-800">Maintenance Mode<
- Line 2597: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">Show maintenance page
- Line 2606: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none
- Line 2606: Color class without dark mode variant: border-white
  Context: <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none
- Line 2613: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-2xl p-6 shadow-lg">
- Line 2614: Color class without dark mode variant: text-gray-800
  Context: <h3 className="text-lg font-semibold text-gray-800 mb-4">Reg
- Line 2618: Color class without dark mode variant: text-gray-800
  Context: <div className="font-medium text-gray-800">Registration Enab
- Line 2619: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">Allow new users to re
- Line 2628: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none
- Line 2628: Color class without dark mode variant: border-white
  Context: <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none
- Line 2635: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-2xl p-6 shadow-lg">
- Line 2636: Color class without dark mode variant: text-gray-800
  Context: <h3 className="text-lg font-semibold text-gray-800 mb-4">Fea
- Line 2641: Color class without dark mode variant: text-gray-800
  Context: <div className="font-medium text-gray-800">{flag.name.replac
- Line 2642: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">{flag.description}</d
- Line 2651: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none
- Line 2651: Color class without dark mode variant: border-white
  Context: <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none
- Line 2663: Color class without dark mode variant: text-white
  Context: className="px-6 py-3 bg-gradient-to-r from-green-600 to-emer
- Line 2676: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-xl p-6 border border-gray-2
- Line 2676: Color class without dark mode variant: border-gray-200
  Context: <div className="bg-white rounded-xl p-6 border border-gray-2
- Line 2679: Color class without dark mode variant: text-gray-900
  Context: <h2 className="text-xl font-bold text-gray-900 flex items-ce
- Line 2680: Color class without dark mode variant: text-blue-600
  Context: <Lock className="w-6 h-6 text-blue-600" />
- Line 2683: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mt-1">Centralized role-b
- Line 2689: Color class without dark mode variant: bg-blue-600
  Context: className="px-4 py-2 bg-blue-600 text-white rounded-lg hover
- Line 2689: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-blue-600 text-white rounded-lg hover
- Line 2696: Color class without dark mode variant: bg-green-600
  Context: className="px-4 py-2 bg-green-600 text-white rounded-lg hove
- Line 2696: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-green-600 text-white rounded-lg hove
- Line 2703: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-purple-600 text-white rounded-lg hov
- Line 2716: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-xl p-6 border border-gray-2
- Line 2716: Color class without dark mode variant: border-gray-200
  Context: <div className="bg-white rounded-xl p-6 border border-gray-2
- Line 2717: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4 flex
- Line 2718: Color class without dark mode variant: text-blue-600
  Context: <Users className="w-5 h-5 text-blue-600" />
- Line 2724: Color class without dark mode variant: bg-gray-50
  Context: <div key={role} className="bg-gray-50 rounded-lg p-4">
- Line 2725: Color class without dark mode variant: text-gray-900
  Context: <div className="text-2xl font-bold text-gray-900">{count as 
- Line 2726: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600 capitalize">{role.repl
- Line 2731: Color class without dark mode variant: text-gray-500
  Context: <div className="text-center py-8 text-gray-500">
- Line 2738: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-xl p-6 border border-gray-2
- Line 2738: Color class without dark mode variant: border-gray-200
  Context: <div className="bg-white rounded-xl p-6 border border-gray-2
- Line 2739: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4 flex
- Line 2745: Color class without dark mode variant: text-gray-700
  Context: <label className="block text-sm font-medium text-gray-700 mb
- Line 2750: Color class without dark mode variant: border-gray-300
  Context: className="w-full px-3 py-2 border border-gray-300 rounded-l
- Line 2755: Color class without dark mode variant: text-gray-700
  Context: <label className="block text-sm font-medium text-gray-700 mb
- Line 2759: Color class without dark mode variant: border-gray-300
  Context: className="w-full px-3 py-2 border border-gray-300 rounded-l
- Line 2770: Color class without dark mode variant: text-gray-700
  Context: <label className="block text-sm font-medium text-gray-700 mb
- Line 2774: Color class without dark mode variant: border-gray-300
  Context: className="w-full px-3 py-2 border border-gray-300 rounded-l
- Line 2785: Color class without dark mode variant: text-gray-700
  Context: <label className="block text-sm font-medium text-gray-700 mb
- Line 2788: Color class without dark mode variant: bg-blue-600
  Context: className="w-full px-4 py-2 bg-blue-600 text-white rounded-l
- Line 2788: Color class without dark mode variant: text-white
  Context: className="w-full px-4 py-2 bg-blue-600 text-white rounded-l
- Line 2797: Color class without dark mode variant: bg-green-50
  Context: permissionTest.result.granted ? 'bg-green-50 border border-g
- Line 2800: Color class without dark mode variant: text-red-800
  Context: permissionTest.result.granted ? 'text-green-800' : 'text-red
- Line 2811: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mt-1">{permissionTest.re
- Line 2814: Color class without dark mode variant: text-gray-500
  Context: <span className="text-xs font-medium text-gray-500">Applied 
- Line 2817: Color class without dark mode variant: bg-gray-100
  Context: <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rou
- Line 2829: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-xl p-6 border border-gray-2
- Line 2829: Color class without dark mode variant: border-gray-200
  Context: <div className="bg-white rounded-xl p-6 border border-gray-2
- Line 2830: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4 flex
- Line 2838: Color class without dark mode variant: text-gray-600
  Context: <span className="text-gray-600">Average Evaluation Time</spa
- Line 2841: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
- Line 2847: Color class without dark mode variant: text-gray-600
  Context: <span className="text-gray-600">Cache Hit Rate</span>
- Line 2850: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
- Line 2851: Color class without dark mode variant: bg-green-500
  Context: <div className="bg-green-500 h-2 rounded-full" style={{ widt
- Line 2856: Color class without dark mode variant: text-gray-500
  Context: <div className="text-center py-4 text-gray-500">
- Line 2863: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-xl p-6 border border-gray-2
- Line 2863: Color class without dark mode variant: border-gray-200
  Context: <div className="bg-white rounded-xl p-6 border border-gray-2
- Line 2864: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4 flex
- Line 2871: Color class without dark mode variant: bg-gray-50
  Context: <div key={idx} className="flex items-center justify-between 
- Line 2873: Color class without dark mode variant: text-gray-900
  Context: <div className="text-sm font-medium text-gray-900">{event.ty
- Line 2874: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500">{event.timestamp}</di
- Line 2877: Color class without dark mode variant: bg-red-100
  Context: event.severity === 'high' ? 'bg-red-100 text-red-800' :
- Line 2877: Color class without dark mode variant: text-red-800
  Context: event.severity === 'high' ? 'bg-red-100 text-red-800' :
- Line 2879: Color class without dark mode variant: bg-blue-100
  Context: 'bg-blue-100 text-blue-800'
- Line 2879: Color class without dark mode variant: text-blue-800
  Context: 'bg-blue-100 text-blue-800'
- Line 2887: Color class without dark mode variant: text-gray-500
  Context: <div className="text-center py-4 text-gray-500">
- Line 2896: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-xl p-6 border border-gray-2
- Line 2896: Color class without dark mode variant: border-gray-200
  Context: <div className="bg-white rounded-xl p-6 border border-gray-2
- Line 2897: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4 flex
- Line 2902: Color class without dark mode variant: bg-blue-50
  Context: <div className="p-4 bg-blue-50 rounded-lg border border-blue
- Line 2903: Color class without dark mode variant: text-blue-900
  Context: <h4 className="font-medium text-blue-900 mb-2">Location-Base
- Line 2904: Color class without dark mode variant: text-blue-700
  Context: <p className="text-sm text-blue-700">Users automatically ass
- Line 2906: Color class without dark mode variant: bg-green-50
  Context: <div className="p-4 bg-green-50 rounded-lg border border-gre
- Line 2982: Color class without dark mode variant: bg-white
  Context: className="lg:hidden p-2 rounded-lg hover:bg-white/20 transi
- Line 2984: Color class without dark mode variant: text-white
  Context: <svg className="w-6 h-6 text-white" fill="none" stroke="curr
- Line 2989: Color class without dark mode variant: bg-white
  Context: <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm roun
- Line 2990: Color class without dark mode variant: text-white
  Context: <Shield className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
- Line 2993: Color class without dark mode variant: text-white
  Context: <h1 className="text-lg sm:text-xl md:text-3xl font-bold text
- Line 2994: Color class without dark mode variant: text-white
  Context: <p className="text-xs sm:text-sm text-white/80 hidden sm:blo
- Line 3001: Color class without dark mode variant: bg-white
  Context: className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-whit
- Line 3003: Color class without dark mode variant: text-gray-700
  Context: <ArrowLeft className="w-4 h-4 text-gray-700 group-hover:text
- Line 3004: Color class without dark mode variant: text-gray-700
  Context: <span className="text-gray-700 font-medium text-sm sm:text-b
- Line 3007: Color class without dark mode variant: text-white
  Context: <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-gree
- Line 3016: Color class without dark mode variant: bg-white
  Context: <div className="glassmorphic-card backdrop-blur-md bg-white/
- Line 3020: Color class without dark mode variant: border-gray-200
  Context: <div key={idx} className="border-b border-gray-200 pb-3 last
- Line 3021: Color class without dark mode variant: text-gray-500
  Context: <h3 className="text-xs font-semibold text-gray-500 uppercase
- Line 3034: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-br from-turquoise-500 to-cyan-500 text-whi
- Line 3037: Color class without dark mode variant: bg-gray-50
  Context: : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-m
- Line 3037: Color class without dark mode variant: text-gray-700
  Context: : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-m
- Line 3040: Color class without dark mode variant: text-white
  Context: <span className={selectedTab === tab.id ? 'text-white' : tab
- Line 3049: Color class without dark mode variant: text-white
  Context: ? 'bg-purple-600 text-white'
- Line 3050: Color class without dark mode variant: bg-red-500
  Context: : 'bg-red-500 text-white'
- Line 3050: Color class without dark mode variant: text-white
  Context: : 'bg-red-500 text-white'
- Line 3068: Color class without dark mode variant: bg-white
  Context: <div className="glassmorphic-card backdrop-blur-xl bg-white/

### /client/src/pages/AdminMonitoring.tsx
- Line 109: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500">ESA LIFE CEO 61x21 - Real-time 
- Line 166: Color class without dark mode variant: text-blue-500
  Context: <TrendingUp className="h-4 w-4 text-blue-500" />
- Line 304: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">
- Line 312: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">Success Rate</p>
- Line 316: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">Tokens</p>
- Line 320: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">Cost</p>
- Line 455: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500 mt-2">
- Line 577: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500">[2025-09-14 11:54:00] INFO: Sys
- Line 579: Color class without dark mode variant: text-blue-500
  Context: <p className="text-blue-500">[2025-09-14 11:54:02] DEBUG: Ag
- Line 581: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500">[2025-09-14 11:54:04] INFO: Web
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/AgentFrameworkDashboard.tsx
- Line 108: Color class without dark mode variant: text-blue-500
  Context: case 'good': return <CheckCircle className="h-5 w-5 text-blu
- Line 110: Color class without dark mode variant: text-red-500
  Context: case 'critical': return <AlertCircle className="h-5 w-5 text
- Line 111: Color class without dark mode variant: text-gray-500
  Context: default: return <Settings className="h-5 w-5 text-gray-500" 
- Line 146: Color class without dark mode variant: text-red-700
  Context: <CardTitle className="flex items-center gap-2 text-red-700">
- Line 152: Color class without dark mode variant: text-red-600
  Context: <p className="text-red-600 mb-4">{error}</p>
- Line 192: Color class without dark mode variant: bg-white
  Context: <Card className="border-teal-200 bg-white/70 backdrop-blur-s
- Line 207: Color class without dark mode variant: bg-white
  Context: <Card className="border-blue-200 bg-white/70 backdrop-blur-s
- Line 209: Color class without dark mode variant: text-blue-700
  Context: <CardTitle className="text-sm font-medium text-blue-700">Sys
- Line 212: Color class without dark mode variant: text-blue-900
  Context: <div className="text-2xl font-bold text-blue-900 mb-2">
- Line 216: Color class without dark mode variant: text-blue-600
  Context: <p className="text-xs text-blue-600">
- Line 222: Color class without dark mode variant: bg-white
  Context: <Card className="border-green-200 bg-white/70 backdrop-blur-
- Line 237: Color class without dark mode variant: bg-white
  Context: <Card className="border-purple-200 bg-white/70 backdrop-blur
- Line 247: Color class without dark mode variant: bg-green-100
  Context: <Badge variant="default" className="bg-green-100 text-green-
- Line 260: Color class without dark mode variant: bg-white
  Context: <Card className="border-teal-200 bg-white/70 backdrop-blur-s
- Line 305: Color class without dark mode variant: bg-white
  Context: <Card className="border-yellow-200 bg-white/70 backdrop-blur
- Line 322: Color class without dark mode variant: bg-green-50
  Context: ? 'border-green-200 bg-green-50/50'
- Line 323: Color class without dark mode variant: bg-gray-50
  Context: : 'border-gray-200 bg-gray-50/50'
- Line 323: Color class without dark mode variant: border-gray-200
  Context: : 'border-gray-200 bg-gray-50/50'
- Line 329: Color class without dark mode variant: text-gray-700
  Context: achievement.completed ? 'text-green-900' : 'text-gray-700'
- Line 337: Color class without dark mode variant: text-gray-600
  Context: <p className="text-xs text-gray-600 mb-3">
- Line 348: Color class without dark mode variant: bg-green-100
  Context: <Badge variant="default" className="bg-green-100 text-green-
- Line 358: Color class without dark mode variant: bg-blue-50
  Context: <div className="mt-6 p-4 border border-blue-200 rounded-lg b
- Line 359: Color class without dark mode variant: text-blue-900
  Context: <h3 className="font-semibold text-blue-900 mb-2">🎯 Next Mil
- Line 360: Color class without dark mode variant: text-blue-800
  Context: <p className="text-sm text-blue-800 mb-2">
- Line 374: Color class without dark mode variant: bg-white
  Context: <Card className="border-green-200 bg-white/70 backdrop-blur-
- Line 387: Color class without dark mode variant: bg-green-50
  Context: <div key={layerId} className="p-3 border border-green-100 ro
- Line 404: Color class without dark mode variant: bg-green-100
  Context: <Badge variant="default" className="mt-1 bg-green-100 text-g
- Line 432: Color class without dark mode variant: bg-white
  Context: <Card className="border-teal-200 bg-white/70 backdrop-blur-s
- Line 444: Color class without dark mode variant: text-blue-900
  Context: <div className="text-3xl font-bold text-blue-900">21</div>
- Line 445: Color class without dark mode variant: text-blue-700
  Context: <div className="text-sm text-blue-700">Implementation Phases
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/AgentLearningDashboard.tsx
- Line 60: Color class without dark mode variant: text-white
  Context: <h1 className="text-4xl font-bold text-white mb-2 flex items
- Line 79: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/10 border-purple-500/30 backdrop-b
- Line 87: Color class without dark mode variant: text-white
  Context: <div className="text-3xl font-bold text-white" data-testid="
- Line 94: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/10 border-purple-500/30 backdrop-b
- Line 102: Color class without dark mode variant: text-white
  Context: <div className="text-3xl font-bold text-white" data-testid="
- Line 109: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/10 border-purple-500/30 backdrop-b
- Line 118: Color class without dark mode variant: text-white
  Context: <div className="text-3xl font-bold text-white" data-testid="
- Line 128: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/10 border-purple-500/30 backdrop-b
- Line 137: Color class without dark mode variant: bg-green-500
  Context: <Badge variant="default" className="bg-green-500 text-white"
- Line 137: Color class without dark mode variant: text-white
  Context: <Badge variant="default" className="bg-green-500 text-white"
- Line 147: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/10 border-purple-500/30 backdrop-b
- Line 149: Color class without dark mode variant: text-white
  Context: <CardTitle className="text-xl text-white flex items-center g
- Line 159: Color class without dark mode variant: bg-white
  Context: className="bg-white/5 rounded-lg p-4 border border-purple-50
- Line 164: Color class without dark mode variant: text-white
  Context: <h3 className="font-semibold text-white mb-1">{pattern.patte
- Line 194: Color class without dark mode variant: text-blue-300
  Context: <Badge key={layer} variant="outline" className="border-blue-
- Line 215: Color class without dark mode variant: text-white
  Context: <h3 className="font-semibold text-white mb-2 flex items-cent
- Line 216: Color class without dark mode variant: text-blue-400
  Context: <Database className="w-4 h-4 text-blue-400" />
- Line 222: Color class without dark mode variant: text-white
  Context: <h3 className="font-semibold text-white mb-2 flex items-cent
- Line 229: Color class without dark mode variant: text-white
  Context: <h3 className="font-semibold text-white mb-2 flex items-cent
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/AnalyticsDashboard.tsx
- Line 143: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Platform insights and performan
- Line 179: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Active Users</p>
- Line 194: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Avg Session</p>
- Line 209: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Total Events</p>
- Line 213: Color class without dark mode variant: bg-blue-100
  Context: <div className="p-3 rounded-full bg-blue-100">
- Line 214: Color class without dark mode variant: text-blue-600
  Context: <Calendar className="h-6 w-6 text-blue-600" />
- Line 224: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Engagement Rate</p>
- Line 330: Color class without dark mode variant: text-blue-500
  Context: <Zap className="h-5 w-5 text-blue-500" />
- Line 340: Color class without dark mode variant: text-gray-600
  Context: <span className="text-gray-600">{device.percentage}%</span>
- Line 349: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">{device.users.toLocaleS
- Line 374: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">New vs Returning</p>
- Line 379: Color class without dark mode variant: text-gray-500
  Context: <span className="text-gray-500">/</span>
- Line 389: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Bounce Rate</p>
- Line 398: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Total Users</p>
- Line 438: Color class without dark mode variant: text-red-500
  Context: <Heart className="h-5 w-5 text-red-500" />
- Line 469: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Total Views</p>
- Line 475: Color class without dark mode variant: text-red-500
  Context: <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
- Line 476: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Total Likes</p>
- Line 482: Color class without dark mode variant: text-blue-500
  Context: <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2
- Line 483: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Total Comments</p>
- Line 490: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Total Shares</p>
- Line 517: Color class without dark mode variant: bg-gray-50
  Context: <div className="flex items-center justify-between p-3 rounde
- Line 519: Color class without dark mode variant: bg-green-100
  Context: <Badge variant="secondary" className="bg-green-100 text-gree
- Line 521: Color class without dark mode variant: bg-gray-50
  Context: <div className="flex items-center justify-between p-3 rounde
- Line 523: Color class without dark mode variant: bg-green-100
  Context: <Badge variant="secondary" className="bg-green-100 text-gree
- Line 525: Color class without dark mode variant: bg-gray-50
  Context: <div className="flex items-center justify-between p-3 rounde
- Line 529: Color class without dark mode variant: bg-gray-50
  Context: <div className="flex items-center justify-between p-3 rounde
- Line 531: Color class without dark mode variant: bg-green-100
  Context: <Badge variant="secondary" className="bg-green-100 text-gree
- Line 539: Color class without dark mode variant: bg-gray-50
  Context: <div className="flex items-center justify-between p-3 rounde
- Line 541: Color class without dark mode variant: bg-green-100
  Context: <Badge variant="secondary" className="bg-green-100 text-gree
- Line 543: Color class without dark mode variant: bg-gray-50
  Context: <div className="flex items-center justify-between p-3 rounde
- Line 545: Color class without dark mode variant: bg-green-100
  Context: <Badge variant="secondary" className="bg-green-100 text-gree
- Line 547: Color class without dark mode variant: bg-gray-50
  Context: <div className="flex items-center justify-between p-3 rounde
- Line 551: Color class without dark mode variant: bg-gray-50
  Context: <div className="flex items-center justify-between p-3 rounde
- Line 553: Color class without dark mode variant: bg-green-100
  Context: <Badge variant="secondary" className="bg-green-100 text-gree
- Line 576: Color class without dark mode variant: bg-green-50
  Context: <Alert className="border-green-200 bg-green-50">
- Line 583: Color class without dark mode variant: bg-blue-50
  Context: <Alert className="border-blue-200 bg-blue-50">
- Line 584: Color class without dark mode variant: text-blue-600
  Context: <Users className="h-4 w-4 text-blue-600" />
- Line 585: Color class without dark mode variant: text-blue-800
  Context: <AlertDescription className="text-blue-800">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/BillingDashboard.tsx
- Line 133: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-3xl font-bold text-gray-900 mb-2">Billin
- Line 134: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Manage your subscription and pa
- Line 150: Color class without dark mode variant: bg-green-100
  Context: ? 'bg-green-100 text-green-800'
- Line 153: Color class without dark mode variant: bg-red-100
  Context: : 'bg-red-100 text-red-800'
- Line 153: Color class without dark mode variant: text-red-800
  Context: : 'bg-red-100 text-red-800'
- Line 167: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">${subscription.amount / 100}/mo
- Line 170: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">Next billing date</p>
- Line 236: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mb-4">You don't have an active s
- Line 272: Color class without dark mode variant: bg-gray-50
  Context: <div key={method.id} className="flex items-center justify-be
- Line 274: Color class without dark mode variant: text-gray-400
  Context: <CreditCard className="w-5 h-5 text-gray-400" />
- Line 277: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">
- Line 301: Color class without dark mode variant: text-gray-500
  Context: <p className="text-center text-gray-500 py-8">No payment met
- Line 316: Color class without dark mode variant: bg-gray-50
  Context: <div key={invoice.id} className="flex items-center justify-b
- Line 318: Color class without dark mode variant: text-gray-400
  Context: <Calendar className="w-5 h-5 text-gray-400" />
- Line 323: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">
- Line 331: Color class without dark mode variant: bg-green-100
  Context: className={invoice.status === 'paid' ? 'bg-green-100 text-gr
- Line 347: Color class without dark mode variant: text-gray-500
  Context: <p className="text-center text-gray-500 py-8">No billing his
- Line 354: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/Checkout.tsx
- Line 127: Color class without dark mode variant: text-gray-500
  Context: <div className="flex items-center justify-center gap-2 text-
- Line 241: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-3xl font-bold text-gray-900 mb-2">Comple
- Line 242: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Secure payment powered by Strip
- Line 256: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">Monthly subscription</p
- Line 312: Color class without dark mode variant: text-gray-700
  Context: <p className="text-sm font-medium text-gray-700">Included fe
- Line 314: Color class without dark mode variant: text-gray-600
  Context: <div key={index} className="flex items-center gap-2 text-sm 

### /client/src/pages/CreateCommunity.tsx
- Line 135: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900">Basic In
- Line 187: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900">Location
- Line 217: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900">Event Ca
- Line 218: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Select the types of eve
- Line 229: Color class without dark mode variant: border-gray-200
  Context: : 'border-gray-200 hover:border-gray-300'
- Line 240: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900">Privacy 
- Line 247: Color class without dark mode variant: text-gray-600
  Context: <Lock className="w-5 h-5 text-gray-600" />
- Line 278: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900">Communit
- Line 292: Color class without dark mode variant: text-white
  Context: className="flex-1 bg-gradient-to-r from-turquoise-600 to-cya
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/EnhancedEvents.tsx
- Line 361: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mt-1">Discover and join tango ev
- Line 374: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-turquoise-400 to-cyan-500 h
- Line 389: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Total Events</p>
- Line 400: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Upcoming</p>
- Line 406: Color class without dark mode variant: text-blue-600
  Context: <Users className="w-8 h-8 text-blue-600" />
- Line 411: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Attending</p>
- Line 422: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">This Week</p>
- Line 453: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-r from-turquoise-400 to-cyan-500 text-whit
- Line 509: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-r from-turquoise-400 to-cyan-500 text-whit
- Line 533: Color class without dark mode variant: text-white
  Context: <TabsTrigger value="upcoming" className="data-[state=active]
- Line 536: Color class without dark mode variant: text-white
  Context: <TabsTrigger value="today" className="data-[state=active]:bg
- Line 539: Color class without dark mode variant: text-white
  Context: <TabsTrigger value="thisWeek" className="data-[state=active]
- Line 542: Color class without dark mode variant: text-white
  Context: <TabsTrigger value="myEvents" className="data-[state=active]
- Line 557: Color class without dark mode variant: text-gray-500
  Context: <p className="text-center text-gray-500 mt-8">
- Line 657: Color class without dark mode variant: text-gray-600
  Context: <div className="text-gray-600">{format(new Date(event.start)
- Line 673: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Loading map...</p>
- Line 684: Color class without dark mode variant: text-gray-600
  Context: <p class="text-xs text-gray-600 mt-1">${format(new Date(even
- Line 685: Color class without dark mode variant: text-gray-500
  Context: ${event.location ? `<p class="text-xs text-gray-500">${event
- Line 687: Inline style with color - should use Tailwind dark: variants
  Context: <span class="inline-block px-2 py-1 text-xs rounded-full" st
- Line 706: Color class without dark mode variant: text-gray-500
  Context: <div className="mt-6 text-center text-sm text-gray-500">
- Line 708: Color class without dark mode variant: bg-gray-100
  Context: <kbd className="px-2 py-1 bg-gray-100 rounded">Cmd+N</kbd> C
- Line 709: Color class without dark mode variant: bg-gray-100
  Context: <kbd className="px-2 py-1 bg-gray-100 rounded ml-2">Cmd+E</k
- Line 710: Color class without dark mode variant: bg-gray-100
  Context: <kbd className="px-2 py-1 bg-gray-100 rounded ml-2">Cmd+/</k

### /client/src/pages/EnhancedFriends.tsx
- Line 175: Color class without dark mode variant: text-white
  Context: <div className="w-12 h-12 bg-gradient-to-r from-turquoise-40
- Line 179: Color class without dark mode variant: bg-green-500
  Context: <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-5
- Line 179: Color class without dark mode variant: border-white
  Context: <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-5
- Line 183: Color class without dark mode variant: text-gray-900
  Context: <h4 className="font-semibold text-gray-900">{friend.name}</h
- Line 184: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">@{friend.username}</p>
- Line 185: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 flex items-center gap-1 
- Line 197: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500 mt-2">
- Line 211: Color class without dark mode variant: bg-white
  Context: <div className="absolute right-0 mt-1 hidden group-hover:fle
- Line 264: Color class without dark mode variant: bg-white
  Context: className="bg-white p-2 rounded-lg border text-sm"
- Line 513: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mt-1">Connect with dancers in yo
- Line 526: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-turquoise-400 to-cyan-500 h
- Line 540: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">{friends.len
- Line 541: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Total Friends</p>
- Line 547: Color class without dark mode variant: text-blue-600
  Context: <Clock className="w-8 h-8 text-blue-600" />
- Line 549: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">
- Line 552: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Pending</p>
- Line 560: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">
- Line 563: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Favorites</p>
- Line 571: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">
- Line 574: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Active Today</p>
- Line 584: Color class without dark mode variant: text-gray-400
  Context: <Search className="absolute left-3 top-1/2 transform -transl
- Line 636: Color class without dark mode variant: text-gray-900
  Context: <h3 className="font-semibold text-gray-900 mb-4 flex items-c
- Line 643: Color class without dark mode variant: bg-gray-50
  Context: <div className="flex items-start gap-3 p-2 hover:bg-gray-50 
- Line 644: Color class without dark mode variant: text-white
  Context: <div className="w-8 h-8 bg-gradient-to-r from-turquoise-400 
- Line 648: Color class without dark mode variant: text-gray-900
  Context: <p className="text-sm font-medium text-gray-900 truncate">
- Line 651: Color class without dark mode variant: text-gray-600
  Context: <p className="text-xs text-gray-600">
- Line 654: Color class without dark mode variant: text-gray-400
  Context: <p className="text-xs text-gray-400 mt-1">
- Line 690: Color class without dark mode variant: text-gray-900
  Context: <h4 className="font-medium text-gray-900 mb-2 flex items-cen
- Line 731: Color class without dark mode variant: text-gray-500
  Context: <p className="text-center py-4 text-gray-500">
- Line 755: Color class without dark mode variant: text-gray-500
  Context: <div className="mt-6 text-center text-sm text-gray-500">
- Line 757: Color class without dark mode variant: bg-gray-100
  Context: Press <kbd className="px-2 py-1 bg-gray-100 rounded">Cmd+F</
- Line 758: Color class without dark mode variant: bg-gray-100
  Context: <kbd className="px-2 py-1 bg-gray-100 rounded ml-2">Cmd+A</k
- Line 772: Color class without dark mode variant: text-gray-700
  Context: <label className="block text-sm font-medium text-gray-700 mb
- Line 783: Color class without dark mode variant: text-gray-700
  Context: <label className="block text-sm font-medium text-gray-700 mb
- Line 830: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-turquoise-400 to-cyan-500 h
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/ErrorBoundaryPage.tsx
- Line 62: Color class without dark mode variant: text-red-600
  Context: <AlertTriangle className="h-10 w-10 text-red-600" />
- Line 71: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mb-2">
- Line 74: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">
- Line 80: Color class without dark mode variant: bg-red-50
  Context: <div className="p-4 bg-red-50 border border-red-200 rounded-
- Line 81: Color class without dark mode variant: text-red-800
  Context: <h4 className="font-semibold text-red-800 mb-2 flex items-ce
- Line 85: Color class without dark mode variant: text-red-700
  Context: <p className="text-sm text-red-700 font-mono break-all">
- Line 90: Color class without dark mode variant: text-red-600
  Context: <summary className="text-xs text-red-600 cursor-pointer hove
- Line 93: Color class without dark mode variant: bg-red-100
  Context: <pre className="mt-2 text-xs text-red-600 overflow-auto max-
- Line 93: Color class without dark mode variant: text-red-600
  Context: <pre className="mt-2 text-xs text-red-600 overflow-auto max-
- Line 104: Color class without dark mode variant: text-white
  Context: className="w-full bg-gradient-to-r from-turquoise-600 to-cya
- Line 144: Color class without dark mode variant: text-gray-600
  Context: <ul className="space-y-2 text-sm text-gray-600">
- Line 165: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/Favorites.tsx
- Line 122: Color class without dark mode variant: bg-white
  Context: theme === 'dark' ? "bg-slate-900/50 border-slate-700" : "bg-
- Line 122: Color class without dark mode variant: border-gray-200
  Context: theme === 'dark' ? "bg-slate-900/50 border-slate-700" : "bg-
- Line 137: Color class without dark mode variant: border-gray-300
  Context: className="h-4 w-4 text-purple-600 focus:ring-purple-500 bor
- Line 175: Color class without dark mode variant: text-blue-500
  Context: item.itemType === 'post' && "border-blue-500 text-blue-500",
- Line 185: Color class without dark mode variant: text-red-500
  Context: <Heart className="h-5 w-5 text-red-500 fill-red-500 animate-
- Line 193: Color class without dark mode variant: text-gray-600
  Context: theme === 'dark' ? "text-slate-300" : "text-gray-600"
- Line 223: Color class without dark mode variant: text-gray-400
  Context: theme === 'dark' ? "text-slate-500" : "text-gray-400"
- Line 245: Color class without dark mode variant: text-gray-600
  Context: theme === 'dark' ? "text-slate-400" : "text-gray-600"
- Line 255: Color class without dark mode variant: bg-gray-100
  Context: theme === 'dark' ? "bg-slate-800" : "bg-gray-100"
- Line 287: Color class without dark mode variant: bg-gray-100
  Context: theme === 'dark' ? "bg-slate-800" : "bg-gray-100"
- Line 314: Color class without dark mode variant: bg-white
  Context: theme === 'dark' ? "bg-slate-900/50" : "bg-white"
- Line 316: Color class without dark mode variant: text-gray-400
  Context: <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
- Line 320: Color class without dark mode variant: text-gray-600
  Context: theme === 'dark' ? "text-slate-400" : "text-gray-600"

### /client/src/pages/Friends.tsx
- Line 219: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Loading friends...</p>
- Line 233: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-3xl font-bold text-gray-900">Friends</h1
- Line 234: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mt-1">Connect with dancers in yo
- Line 238: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-turquoise-400 to-cyan-500 h
- Line 251: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">{friends.len
- Line 252: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Total Friends</p>
- Line 258: Color class without dark mode variant: text-blue-600
  Context: <Clock className="w-8 h-8 text-blue-600" />
- Line 260: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">
- Line 263: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Pending Requests</p>
- Line 271: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">
- Line 274: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Mutual Friends</p>
- Line 283: Color class without dark mode variant: text-gray-400
  Context: <Search className="absolute left-3 top-1/2 transform -transl
- Line 311: Color class without dark mode variant: text-gray-600
  Context: : 'text-gray-600 hover:text-gray-900'
- Line 317: Color class without dark mode variant: text-white
  Context: <Badge className="ml-2 bg-rose-500 text-white">
- Line 335: Color class without dark mode variant: text-white
  Context: <div className="w-12 h-12 bg-gradient-to-r from-turquoise-40
- Line 339: Color class without dark mode variant: text-gray-900
  Context: <h4 className="font-semibold text-gray-900">
- Line 342: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">@{request.friend_user?.
- Line 343: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 flex items-center gap-1 
- Line 348: Color class without dark mode variant: bg-gray-50
  Context: <div className="mt-3 p-3 bg-gray-50 rounded-lg">
- Line 349: Color class without dark mode variant: text-gray-700
  Context: <p className="text-sm text-gray-700 italic">"{request.sender
- Line 365: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-green-600 to-emerald-600 ho
- Line 384: Color class without dark mode variant: text-gray-400
  Context: <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
- Line 385: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">No pending friend requests</p>
- Line 400: Color class without dark mode variant: text-white
  Context: <div className="w-12 h-12 bg-gradient-to-r from-turquoise-40
- Line 404: Color class without dark mode variant: bg-green-500
  Context: <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-5
- Line 404: Color class without dark mode variant: border-white
  Context: <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-5
- Line 408: Color class without dark mode variant: text-gray-900
  Context: <h4 className="font-semibold text-gray-900">{friend.name}</h
- Line 409: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">@{friend.username}</p>
- Line 410: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 flex items-center gap-1 
- Line 422: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500 mt-2">
- Line 427: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500 mt-1">
- Line 443: Color class without dark mode variant: text-gray-400
  Context: <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
- Line 444: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">
- Line 458: Color class without dark mode variant: bg-black
  Context: <div className="fixed inset-0 bg-black/50 flex items-center 
- Line 460: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-xl font-bold text-gray-900 mb-4">Send Fr
- Line 464: Color class without dark mode variant: text-gray-700
  Context: <label className="block text-sm font-medium text-gray-700 mb
- Line 484: Color class without dark mode variant: bg-gray-50
  Context: : 'hover:bg-gray-50'
- Line 490: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">@{user.username}</p>
- Line 491: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">{user.location}</p>
- Line 507: Color class without dark mode variant: text-gray-700
  Context: <label className="block text-sm font-medium text-gray-700 mb
- Line 524: Color class without dark mode variant: text-white
  Context: className="flex-1 bg-gradient-to-r from-turquoise-500 to-cya
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/FriendshipPage.tsx
- Line 62: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-64 bg-gray-200 rounded-lg" />
- Line 63: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-32 bg-gray-200 rounded-lg" />
- Line 75: Color class without dark mode variant: text-red-500
  Context: <p className="text-red-500">
- Line 94: Color class without dark mode variant: border-white
  Context: <Avatar className="w-24 h-24 border-4 border-white shadow-xl
- Line 147: Color class without dark mode variant: text-blue-600
  Context: <div className="text-2xl font-bold text-blue-600">{friendshi
- Line 201: Color class without dark mode variant: text-white
  Context: <p className="text-white text-sm truncate">{memory.descripti
- Line 202: Color class without dark mode variant: text-white
  Context: <p className="text-white/80 text-xs">{new Date(memory.date).
- Line 253: Color class without dark mode variant: bg-black
  Context: <div className="fixed inset-0 bg-black/50 flex items-center 

### /client/src/pages/Gamification.tsx
- Line 256: Color class without dark mode variant: text-red-600
  Context: return <span className="text-red-600 flex items-center"><Che
- Line 258: Color class without dark mode variant: text-gray-400
  Context: return <span className="text-gray-400">-</span>;
- Line 272: Color class without dark mode variant: text-white
  Context: <div className="bg-gradient-to-r from-teal-500 to-cyan-600 r
- Line 292: Color class without dark mode variant: bg-white
  Context: <Progress value={userStats?.levelProgress || 0} className="h
- Line 400: Color class without dark mode variant: bg-green-600
  Context: <Badge className="bg-green-600">Unlocked</Badge>
- Line 411: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500 mt-1">{achievement.progr
- Line 473: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500 mt-1">{challenge.progres
- Line 491: Color class without dark mode variant: text-gray-400
  Context: <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
- Line 547: Color class without dark mode variant: text-gray-400
  Context: {entry.rank === 2 && <Medal className="h-5 w-5 text-gray-400
- Line 568: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">points</p>
- Line 579: Color class without dark mode variant: text-gray-400
  Context: <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />

### /client/src/pages/GroupDetailPage.tsx
- Line 102: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mb-4">This group may have been r
- Line 125: Color class without dark mode variant: text-white
  Context: className="flex items-center gap-2 text-white/80 hover:text-
- Line 132: Color class without dark mode variant: bg-white
  Context: <div className="w-20 h-20 bg-white rounded-full border-4 bor
- Line 132: Color class without dark mode variant: border-white
  Context: <div className="w-20 h-20 bg-white rounded-full border-4 bor
- Line 136: Color class without dark mode variant: text-white
  Context: <div className="w-full h-full rounded-full bg-gradient-to-br
- Line 143: Color class without dark mode variant: text-gray-600
  Context: <div className="flex items-center gap-4 text-gray-600 text-s
- Line 167: Color class without dark mode variant: bg-white
  Context: className="bg-white/10 border-white/20 text-white hover:bg-w
- Line 167: Color class without dark mode variant: text-white
  Context: className="bg-white/10 border-white/20 text-white hover:bg-w
- Line 167: Color class without dark mode variant: border-white
  Context: className="bg-white/10 border-white/20 text-white hover:bg-w
- Line 174: Color class without dark mode variant: bg-white
  Context: className="bg-white text-gray-900 hover:bg-gray-100"
- Line 174: Color class without dark mode variant: text-gray-900
  Context: className="bg-white text-gray-900 hover:bg-gray-100"
- Line 184: Color class without dark mode variant: bg-white
  Context: className="bg-white text-gray-900 hover:bg-gray-100"
- Line 184: Color class without dark mode variant: text-gray-900
  Context: className="bg-white text-gray-900 hover:bg-gray-100"
- Line 193: Color class without dark mode variant: bg-white
  Context: <Button variant="ghost" size="icon" className="text-white ho
- Line 193: Color class without dark mode variant: text-white
  Context: <Button variant="ghost" size="icon" className="text-white ho
- Line 202: Color class without dark mode variant: text-red-600
  Context: <DropdownMenuItem className="text-red-600">
- Line 218: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">{group.description}</p>
- Line 242: Color class without dark mode variant: bg-gray-100
  Context: <button className="w-full text-left px-4 py-2 bg-gray-100 ro
- Line 242: Color class without dark mode variant: text-gray-500
  Context: <button className="w-full text-left px-4 py-2 bg-gray-100 ro
- Line 275: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">2 hours ago</p>
- Line 282: Color class without dark mode variant: text-gray-500
  Context: <div className="flex items-center gap-4 text-gray-500">
- Line 283: Color class without dark mode variant: text-red-500
  Context: <button className="flex items-center gap-1 hover:text-red-50
- Line 287: Color class without dark mode variant: text-blue-500
  Context: <button className="flex items-center gap-1 hover:text-blue-5
- Line 312: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">Joined 2 months ago</p>
- Line 324: Color class without dark mode variant: text-gray-500
  Context: <div className="text-center py-12 text-gray-500">
- Line 325: Color class without dark mode variant: text-gray-300
  Context: <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" /
- Line 336: Color class without dark mode variant: bg-gray-200
  Context: <div key={i} className="aspect-square bg-gray-200 rounded-lg
- Line 352: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">Created</p>
- Line 356: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">Type</p>
- Line 361: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 mb-2">Group Rules</p>
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/GroupDetailPageMT.tsx
- Line 627: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Loading group details...</p>
- Line 640: Color class without dark mode variant: text-red-400
  Context: <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4"
- Line 642: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mb-6">This group may have been r
- Line 682: Color class without dark mode variant: text-gray-600
  Context: <span className="text-gray-600">Members</span>
- Line 687: Color class without dark mode variant: text-gray-600
  Context: <span className="text-gray-600">Created</span>
- Line 694: Color class without dark mode variant: text-gray-600
  Context: <span className="text-gray-600">Type</span>
- Line 698: Color class without dark mode variant: text-gray-600
  Context: <span className="text-gray-600">Privacy</span>
- Line 719: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">@{admin.user.username}<
- Line 825: Color class without dark mode variant: bg-gray-50
  Context: <div className="bg-gray-50 p-4 rounded-lg space-y-4">
- Line 983: Color class without dark mode variant: text-white
  Context: <Send className="h-6 w-6 text-white mx-auto transition-trans
- Line 1009: Color class without dark mode variant: text-gray-500
  Context: className="mt-2 text-sm text-gray-500 hover:text-gray-700 tr
- Line 1030: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 shadow-lg
- Line 1031: Color class without dark mode variant: bg-gray-100
  Context: : 'bg-gray-100 opacity-60 hover:opacity-100'
- Line 1049: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 shadow-lg
- Line 1050: Color class without dark mode variant: bg-gray-100
  Context: : 'bg-gray-100 opacity-60 hover:opacity-100'
- Line 1068: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 shadow-lg
- Line 1069: Color class without dark mode variant: bg-gray-100
  Context: : 'bg-gray-100 opacity-60 hover:opacity-100'
- Line 1087: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 shadow-lg
- Line 1088: Color class without dark mode variant: bg-gray-100
  Context: : 'bg-gray-100 opacity-60 hover:opacity-100'
- Line 1108: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 shadow-lg
- Line 1109: Color class without dark mode variant: bg-gray-100
  Context: : 'bg-gray-100 opacity-60 hover:opacity-100'
- Line 1127: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 shadow-lg
- Line 1128: Color class without dark mode variant: bg-gray-100
  Context: : 'bg-gray-100 opacity-60 hover:opacity-100'
- Line 1146: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 shadow-lg
- Line 1147: Color class without dark mode variant: bg-gray-100
  Context: : 'bg-gray-100 opacity-60 hover:opacity-100'
- Line 1174: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500">Loading group data...
- Line 1221: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-cyan-500 via-teal-500 to-bl
- Line 1320: Color class without dark mode variant: text-white
  Context: className="data-[state=active]:bg-gradient-to-r data-[state=
- Line 1328: Color class without dark mode variant: text-white
  Context: className="data-[state=active]:bg-gradient-to-r data-[state=
- Line 1369: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-cyan-500 via-teal-500 to-bl
- Line 1591: Color class without dark mode variant: text-white
  Context: <div className="w-full h-full flex items-center justify-cent
- Line 1732: Color class without dark mode variant: bg-white
  Context: <Button variant="ghost" size="icon" className="text-white ho
- Line 1732: Color class without dark mode variant: text-white
  Context: <Button variant="ghost" size="icon" className="text-white ho
- Line 1744: Color class without dark mode variant: border-gray-200
  Context: <div className="border-b border-gray-200 mb-6">
- Line 1881: Color class without dark mode variant: bg-black
  Context: <div className="fixed inset-0 z-50 flex items-center justify

### /client/src/pages/GuestOnboarding.tsx
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/HelpSupport.tsx
- Line 166: Color class without dark mode variant: text-blue-600
  Context: <MessageCircle className="h-8 w-8 text-blue-600 mb-2" />
- Line 262: Color class without dark mode variant: text-white
  Context: <Card className="mt-12 bg-gradient-to-r from-blue-600 to-pur
- Line 272: Color class without dark mode variant: bg-white
  Context: <Button variant="outline" size="lg" className="bg-white/10 b
- Line 272: Color class without dark mode variant: text-white
  Context: <Button variant="outline" size="lg" className="bg-white/10 b
- Line 272: Color class without dark mode variant: border-white
  Context: <Button variant="outline" size="lg" className="bg-white/10 b

### /client/src/pages/HierarchyDashboard.tsx
- Line 94: Color class without dark mode variant: text-red-600
  Context: return 'text-red-600';
- Line 133: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mt-1">
- Line 173: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">Module Cohesion</spa
- Line 179: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">Coupling Score</span
- Line 336: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500 text-right">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/HostDashboard.tsx
- Line 72: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-8 bg-gray-200 rounded w-1/3" />
- Line 75: Color class without dark mode variant: bg-gray-200
  Context: <div key={i} className="h-64 bg-gray-200 rounded" />
- Line 92: Color class without dark mode variant: text-white
  Context: <Home className="w-12 h-12 text-white" />
- Line 109: Color class without dark mode variant: text-white
  Context: <Users className="w-6 h-6 text-white" />
- Line 121: Color class without dark mode variant: text-white
  Context: <MessageCircle className="w-6 h-6 text-white" />
- Line 133: Color class without dark mode variant: text-white
  Context: <Calendar className="w-6 h-6 text-white" />
- Line 147: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-cyan-500 via-teal-500 to-bl
- Line 179: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-cyan-500 via-teal-500 to-bl
- Line 195: Color class without dark mode variant: text-white
  Context: <Home className="w-5 h-5 text-white" />
- Line 211: Color class without dark mode variant: text-white
  Context: <Calendar className="w-5 h-5 text-white" />
- Line 227: Color class without dark mode variant: text-white
  Context: <Users className="w-5 h-5 text-white" />
- Line 243: Color class without dark mode variant: text-white
  Context: <Star className="w-5 h-5 text-white" />
- Line 271: Color class without dark mode variant: text-white
  Context: <Home className="w-16 h-16 text-white/50" />
- Line 276: Color class without dark mode variant: bg-green-500
  Context: <Badge className={property.isActive ? 'bg-green-500' : 'bg-g
- Line 354: Color class without dark mode variant: text-white
  Context: <Calendar className="w-6 h-6 text-white" />
- Line 376: Color class without dark mode variant: text-white
  Context: <BarChart3 className="w-6 h-6 text-white" />

### /client/src/pages/HostOnboarding.tsx
- Line 321: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white'
- Line 323: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
- Line 390: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-cyan-500 via-teal-500 to-bl
- Line 403: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-cyan-500 via-teal-500 to-bl

### /client/src/pages/Invoices.tsx
- Line 73: Color class without dark mode variant: bg-white
  Context: <div ref={invoiceRef} className="bg-white p-8 rounded-lg sha
- Line 80: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500 mt-1">Life CEO Platform</p>
- Line 84: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">#{invoice.number}</p>
- Line 85: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 mt-2">
- Line 96: Color class without dark mode variant: text-gray-700
  Context: <h3 className="font-semibold text-gray-700 mb-2">Bill To:</h
- Line 97: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">{userInfo?.firstName} {userInfo
- Line 98: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">{userInfo?.email}</p>
- Line 101: Color class without dark mode variant: text-gray-700
  Context: <h3 className="font-semibold text-gray-700 mb-2">Payment Det
- Line 102: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">
- Line 103: Color class without dark mode variant: text-red-600
  Context: Status: <span className={invoice.status === 'paid' ? 'text-g
- Line 108: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">
- Line 159: Color class without dark mode variant: text-gray-500
  Context: <div className="mt-12 pt-8 border-t border-gray-200 text-cen
- Line 159: Color class without dark mode variant: border-gray-200
  Context: <div className="mt-12 pt-8 border-t border-gray-200 text-cen
- Line 198: Color class without dark mode variant: text-red-500
  Context: return <XCircle className="w-4 h-4 text-red-500" />;
- Line 207: Color class without dark mode variant: bg-green-100
  Context: return <Badge className="bg-green-100 text-green-700">Paid</
- Line 209: Color class without dark mode variant: bg-red-100
  Context: return <Badge className="bg-red-100 text-red-700">Failed</Ba
- Line 209: Color class without dark mode variant: text-red-700
  Context: return <Badge className="bg-red-100 text-red-700">Failed</Ba
- Line 219: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoic
- Line 220: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">View and download your subscrip
- Line 250: Color class without dark mode variant: text-gray-400
  Context: <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" /
- Line 251: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500">No invoices yet</p>
- Line 252: Color class without dark mode variant: text-gray-400
  Context: <p className="text-sm text-gray-400 mt-2">Your invoices will
- Line 259: Color class without dark mode variant: bg-gray-50
  Context: className="flex items-center justify-between p-4 border bord
- Line 259: Color class without dark mode variant: border-gray-200
  Context: className="flex items-center justify-between p-4 border bord
- Line 262: Color class without dark mode variant: text-gray-400
  Context: <FileText className="h-8 w-8 text-gray-400" />
- Line 268: Color class without dark mode variant: text-gray-500
  Context: <div className="flex items-center gap-4 mt-1 text-sm text-gr
- Line 309: Color class without dark mode variant: bg-black
  Context: <div className="fixed inset-0 z-50 flex items-center justify
- Line 310: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-lg max-w-4xl w-full max-h-[
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/LifeCEO.tsx
- Line 120: Color class without dark mode variant: bg-white
  Context: <div className="bg-white border-b border-gray-200 shadow-sm"
- Line 120: Color class without dark mode variant: border-gray-200
  Context: <div className="bg-white border-b border-gray-200 shadow-sm"
- Line 131: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-xl font-semibold text-gray-900">Life CEO
- Line 132: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">AI Life Management Syst
- Line 143: Color class without dark mode variant: bg-gray-100
  Context: : 'text-gray-500 hover:bg-gray-100'
- Line 143: Color class without dark mode variant: text-gray-500
  Context: : 'text-gray-500 hover:bg-gray-100'
- Line 153: Color class without dark mode variant: bg-gray-100
  Context: : 'text-gray-500 hover:bg-gray-100'
- Line 153: Color class without dark mode variant: text-gray-500
  Context: : 'text-gray-500 hover:bg-gray-100'
- Line 173: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">Active</p>
- Line 176: Color class without dark mode variant: bg-green-500
  Context: <div className="w-2 h-2 bg-green-500 rounded-full animate-pu
- Line 191: Color class without dark mode variant: bg-red-500
  Context: ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse'
- Line 193: Color class without dark mode variant: text-white
  Context: } text-white shadow-lg hover:shadow-xl disabled:opacity-50`}
- Line 202: Color class without dark mode variant: text-gray-600
  Context: <p className="mt-4 text-sm text-gray-600">
- Line 211: Color class without dark mode variant: bg-gray-50
  Context: <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
- Line 212: Color class without dark mode variant: text-gray-700
  Context: <p className="text-sm text-gray-700">
- Line 237: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">Tasks Today</p>
- Line 240: Color class without dark mode variant: text-blue-500
  Context: <Calendar className="w-6 h-6 text-blue-500" />
- Line 247: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">Health Score</p>
- Line 250: Color class without dark mode variant: text-red-500
  Context: <Heart className="w-6 h-6 text-red-500" />
- Line 257: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">Budget</p>
- Line 267: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">Security</p>
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/LifeCEOEnhanced.tsx
- Line 469: Color class without dark mode variant: bg-gray-50
  Context: <main role="main" aria-label={t('lifeceo.aria.main', 'Life C
- Line 474: Color class without dark mode variant: bg-white
  Context: className={`${showSidebar ? 'w-64' : 'w-0'} transition-all d
- Line 474: Color class without dark mode variant: border-gray-200
  Context: className={`${showSidebar ? 'w-64' : 'w-0'} transition-all d
- Line 476: Color class without dark mode variant: border-gray-100
  Context: <div className="p-4 border-b border-gray-100">
- Line 491: Color class without dark mode variant: text-gray-400
  Context: <Search className="absolute left-3 top-1/2 -translate-y-1/2 
- Line 509: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm font-medium text-gray-600">{t('life
- Line 526: Color class without dark mode variant: bg-gray-100
  Context: className={`flex items-center gap-2 p-2 rounded cursor-point
- Line 551: Color class without dark mode variant: bg-gray-100
  Context: className={`p-2 rounded cursor-pointer hover:bg-gray-100 w-f
- Line 559: Color class without dark mode variant: text-gray-400
  Context: <MessageSquare className="h-4 w-4 text-gray-400" />
- Line 561: Color class without dark mode variant: text-gray-400
  Context: <MoreVertical className="h-4 w-4 text-gray-400" data-testid=
- Line 572: Color class without dark mode variant: bg-white
  Context: <div className="bg-white border-b border-gray-200 p-4">
- Line 572: Color class without dark mode variant: border-gray-200
  Context: <div className="bg-white border-b border-gray-200 p-4">
- Line 650: Color class without dark mode variant: text-white
  Context: ? 'bg-purple-600 text-white'
- Line 651: Color class without dark mode variant: bg-gray-100
  Context: : 'bg-gray-100 text-gray-800'
- Line 651: Color class without dark mode variant: text-gray-800
  Context: : 'bg-gray-100 text-gray-800'
- Line 668: Color class without dark mode variant: bg-gray-100
  Context: <div className="bg-gray-100 p-4 rounded-lg">
- Line 678: Color class without dark mode variant: bg-white
  Context: <div className="bg-white border-t border-gray-200 p-4">
- Line 678: Color class without dark mode variant: border-gray-200
  Context: <div className="bg-white border-t border-gray-200 p-4">
- Line 688: Color class without dark mode variant: bg-red-500
  Context: ? 'bg-red-500 hover:bg-red-600 animate-pulse'
- Line 725: Color class without dark mode variant: text-red-500
  Context: className="mt-2 text-sm text-red-500 animate-pulse"
- Line 734: Color class without dark mode variant: bg-gray-100
  Context: <div className="bg-gray-100 border-t border-gray-200 p-2">
- Line 734: Color class without dark mode variant: border-gray-200
  Context: <div className="bg-gray-100 border-t border-gray-200 p-2">
- Line 740: Color class without dark mode variant: text-gray-600
  Context: <span className="text-gray-600">{agent.name}</span>
- Line 741: Color class without dark mode variant: bg-green-500
  Context: <div className="w-2 h-2 bg-green-500 rounded-full animate-pu
- Line 762: Color class without dark mode variant: bg-black
  Context: className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 f
- Line 770: Color class without dark mode variant: text-white
  Context: <div className="bg-gradient-to-r from-turquoise-400 to-cyan-
- Line 782: Color class without dark mode variant: bg-white
  Context: className="text-white hover:bg-white/20 rounded-full"
- Line 782: Color class without dark mode variant: text-white
  Context: className="text-white hover:bg-white/20 rounded-full"
- Line 797: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">{t('lifeceo.modal.curre
- Line 842: Color class without dark mode variant: text-white
  Context: <div className="absolute -top-2 -right-2 bg-gradient-to-r fr
- Line 862: Color class without dark mode variant: text-gray-800
  Context: : "text-gray-800 group-hover:text-turquoise-600"
- Line 866: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 leading-relaxed">
- Line 880: Color class without dark mode variant: border-gray-200
  Context: <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-10
- Line 881: Color class without dark mode variant: text-gray-600
  Context: <p className="text-center text-sm text-gray-600">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/LifeCeoPerformance.tsx
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/LiveGlobalStatistics.tsx
- Line 126: Color class without dark mode variant: text-red-500
  Context: <div className="text-center text-red-500 p-8">
- Line 162: Color class without dark mode variant: text-gray-500
  Context: <span className="text-sm text-gray-500">
- Line 259: Color class without dark mode variant: text-red-500
  Context: <Heart className="inline h-4 w-4 text-red-500 mr-1" />
- Line 261: Color class without dark mode variant: text-blue-500
  Context: <MessageSquare className="inline h-4 w-4 text-blue-500 ml-3 

### /client/src/pages/LiveStreaming.tsx
- Line 275: Color class without dark mode variant: bg-red-600
  Context: <Button className="bg-red-600 hover:bg-red-700" data-testid=
- Line 418: Color class without dark mode variant: text-gray-400
  Context: <Video className="h-12 w-12 text-gray-400" />
- Line 421: Color class without dark mode variant: bg-red-600
  Context: <Badge className="absolute top-2 left-2 bg-red-600">
- Line 425: Color class without dark mode variant: bg-black
  Context: <Badge variant="secondary" className="bg-black/50 text-white
- Line 425: Color class without dark mode variant: text-white
  Context: <Badge variant="secondary" className="bg-black/50 text-white
- Line 443: Color class without dark mode variant: text-gray-500
  Context: <span className="text-xs text-gray-500">{stream.category}</s
- Line 456: Color class without dark mode variant: text-gray-400
  Context: <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
- Line 505: Color class without dark mode variant: text-gray-400
  Context: <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" /
- Line 517: Color class without dark mode variant: bg-black
  Context: <div className="fixed inset-0 z-50 bg-black">

### /client/src/pages/MediaUploadTest.tsx
- Line 6: Color class without dark mode variant: bg-gray-50
  Context: <div className="min-h-screen bg-gray-50 py-8">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/Messages.tsx
- Line 97: Color class without dark mode variant: border-gray-200
  Context: <div className="p-4 border-b border-gray-200">
- Line 107: Color class without dark mode variant: text-gray-400
  Context: <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray
- Line 124: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
- Line 126: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-4 bg-gray-200 rounded w-3/4"></div>
- Line 127: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-3 bg-gray-200 rounded w-1/2"></div>
- Line 138: Color class without dark mode variant: border-gray-100
  Context: className={`p-4 border-b border-gray-100 hover:bg-tango-gray
- Line 144: Color class without dark mode variant: text-white
  Context: <div className="w-12 h-12 bg-tango-red rounded-full flex ite
- Line 161: Color class without dark mode variant: text-gray-400
  Context: <span className="text-xs text-gray-400">
- Line 170: Color class without dark mode variant: text-white
  Context: <span className="bg-tango-red text-white text-xs rounded-ful
- Line 177: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500 truncate mt-1">
- Line 187: Color class without dark mode variant: text-gray-400
  Context: <div className="text-gray-400 mb-4">
- Line 190: Color class without dark mode variant: text-gray-600
  Context: <h3 className="text-lg font-semibold text-gray-600 mb-2">
- Line 193: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500 text-sm">
- Line 217: Color class without dark mode variant: text-gray-400
  Context: <div className="text-gray-400 mb-4">
- Line 220: Color class without dark mode variant: text-gray-600
  Context: <h3 className="text-xl font-semibold text-gray-600 mb-2">
- Line 223: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500">

### /client/src/pages/MobileAppDashboard.tsx
- Line 147: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Manage your Progressive Web App
- Line 156: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">App Status</p>
- Line 161: Color class without dark mode variant: bg-green-100
  Context: <div className={`p-3 rounded-full ${isInstalled ? 'bg-green-
- Line 172: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Connection</p>
- Line 177: Color class without dark mode variant: bg-red-100
  Context: <div className={`p-3 rounded-full ${isOnline ? 'bg-turquoise
- Line 181: Color class without dark mode variant: text-red-600
  Context: <WifiOff className="h-6 w-6 text-red-600" />
- Line 192: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Battery</p>
- Line 208: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Notifications</p>
- Line 213: Color class without dark mode variant: bg-green-100
  Context: <div className={`p-3 rounded-full ${pushPermission === 'gran
- Line 214: Color class without dark mode variant: text-gray-600
  Context: <Bell className={`h-6 w-6 ${pushPermission === 'granted' ? '
- Line 266: Color class without dark mode variant: text-gray-600
  Context: <ol className="list-decimal list-inside space-y-1 text-sm te
- Line 278: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">You're enjoying the full PWA ex
- Line 305: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Receive event reminders
- Line 323: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Access content without 
- Line 332: Color class without dark mode variant: text-blue-600
  Context: <Share2 className="h-5 w-5 text-blue-600" />
- Line 335: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Quick access from home 
- Line 347: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Sync data when back onl
- Line 374: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">2.1s</span>
- Line 377: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">Target: Under 3 seconds
- Line 384: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">87%</span>
- Line 387: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">Higher is better</p>
- Line 394: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">65%</span>
- Line 397: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">Pages available offline
- Line 404: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">124 MB</span>
- Line 407: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">24% of 500MB quota</p>
- Line 440: Color class without dark mode variant: bg-gray-50
  Context: <div className="flex items-center justify-between p-3 rounde
- Line 444: Color class without dark mode variant: bg-gray-50
  Context: <div className="flex items-center justify-between p-3 rounde
- Line 448: Color class without dark mode variant: bg-gray-50
  Context: <div className="flex items-center justify-between p-3 rounde
- Line 452: Color class without dark mode variant: bg-gray-50
  Context: <div className="flex items-center justify-between p-3 rounde
- Line 497: Color class without dark mode variant: text-gray-500
  Context: <Settings className="h-5 w-5 text-gray-500" />
- Line 550: Color class without dark mode variant: text-red-600
  Context: <Button variant="outline" className="w-full text-red-600 hov

### /client/src/pages/MonitoringDashboard.tsx
- Line 102: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:
- Line 256: Color class without dark mode variant: text-gray-500
  Context: <span className="text-gray-500">Success Rate:</span>
- Line 260: Color class without dark mode variant: text-gray-500
  Context: <span className="text-gray-500">Avg Response:</span>
- Line 264: Color class without dark mode variant: text-gray-500
  Context: <span className="text-gray-500">Tokens Used:</span>
- Line 272: Color class without dark mode variant: text-gray-500
  Context: <p className="text-center text-gray-500 py-8">
- Line 295: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">
- Line 333: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-full bg-gray-200 rounded-full h-2">
- Line 339: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-full bg-gray-200 rounded-full h-2">
- Line 345: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-full bg-gray-200 rounded-full h-2">
- Line 351: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-full bg-gray-200 rounded-full h-2">
- Line 357: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-full bg-gray-200 rounded-full h-2">

### /client/src/pages/MonitoringTest.tsx
- Line 147: Color class without dark mode variant: text-red-500
  Context: <XCircle className="w-5 h-5 text-red-500" />
- Line 171: Color class without dark mode variant: text-red-500
  Context: <XCircle className="w-5 h-5 text-red-500" />
- Line 189: Color class without dark mode variant: bg-green-500
  Context: <div className={`w-2 h-2 rounded-full ${import.meta.env.VITE
- Line 193: Color class without dark mode variant: bg-green-500
  Context: <div className={`w-2 h-2 rounded-full ${import.meta.env.VITE
- Line 197: Color class without dark mode variant: bg-green-500
  Context: <div className={`w-2 h-2 rounded-full ${import.meta.env.VITE
- Line 224: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:
- Line 274: Color class without dark mode variant: text-red-500
  Context: <XCircle className="w-5 h-5 text-red-500" />

### /client/src/pages/Notifications.tsx
- Line 200: Color class without dark mode variant: border-white
  Context: <div className="relative mb-8 p-8 rounded-xl bg-gradient-to-
- Line 203: Color class without dark mode variant: text-white
  Context: <div className="p-3 rounded-full bg-gradient-to-br from-[#5E
- Line 220: Color class without dark mode variant: bg-white
  Context: className="bg-white/50 backdrop-blur-sm hover:bg-white/70"
- Line 232: Color class without dark mode variant: bg-white
  Context: <TabsList className="bg-white/50 backdrop-blur-sm">
- Line 233: Color class without dark mode variant: text-white
  Context: <TabsTrigger value="all" className="data-[state=active]:bg-g
- Line 236: Color class without dark mode variant: text-white
  Context: <TabsTrigger value="unread" className="data-[state=active]:b
- Line 239: Color class without dark mode variant: bg-red-500
  Context: <Badge className="ml-2 bg-red-500 text-white">
- Line 239: Color class without dark mode variant: text-white
  Context: <Badge className="ml-2 bg-red-500 text-white">
- Line 254: Color class without dark mode variant: bg-white
  Context: <Card className="p-12 text-center bg-white/50 backdrop-blur-
- Line 254: Color class without dark mode variant: border-white
  Context: <Card className="p-12 text-center bg-white/50 backdrop-blur-
- Line 272: Color class without dark mode variant: border-white
  Context: "bg-gradient-to-r backdrop-blur-sm border-white/20",
- Line 281: Color class without dark mode variant: bg-gray-100
  Context: !notification.isRead ? "bg-gradient-to-br from-[#5EEAD4] to-
- Line 281: Color class without dark mode variant: text-white
  Context: !notification.isRead ? "bg-gradient-to-br from-[#5EEAD4] to-
- Line 315: Color class without dark mode variant: bg-white
  Context: className="h-8 w-8 hover:bg-white/50"
- Line 327: Color class without dark mode variant: bg-red-100
  Context: className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
- Line 327: Color class without dark mode variant: text-red-600
  Context: className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/NotionEntryPage.tsx
- Line 44: Color class without dark mode variant: bg-blue-50
  Context: event: 'bg-blue-50 text-blue-700 border-blue-200',
- Line 44: Color class without dark mode variant: text-blue-700
  Context: event: 'bg-blue-50 text-blue-700 border-blue-200',
- Line 45: Color class without dark mode variant: bg-green-50
  Context: note: 'bg-green-50 text-green-700 border-green-200',
- Line 51: Color class without dark mode variant: bg-blue-100
  Context: melancholic: 'bg-blue-100 text-blue-800 border-blue-300',
- Line 51: Color class without dark mode variant: text-blue-800
  Context: melancholic: 'bg-blue-100 text-blue-800 border-blue-300',
- Line 52: Color class without dark mode variant: bg-red-100
  Context: passionate: 'bg-red-100 text-red-800 border-red-300',
- Line 52: Color class without dark mode variant: text-red-800
  Context: passionate: 'bg-red-100 text-red-800 border-red-300',
- Line 54: Color class without dark mode variant: bg-green-100
  Context: inspiring: 'bg-green-100 text-green-800 border-green-300',
- Line 103: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-8 bg-gray-200 rounded w-1/4" />
- Line 104: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-12 bg-gray-200 rounded w-3/4" />
- Line 106: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-4 bg-gray-200 rounded" />
- Line 107: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-4 bg-gray-200 rounded w-5/6" />
- Line 108: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-4 bg-gray-200 rounded w-4/6" />
- Line 121: Color class without dark mode variant: bg-gray-100
  Context: <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-
- Line 122: Color class without dark mode variant: text-gray-400
  Context: <FileText className="w-8 h-8 text-gray-400" />
- Line 124: Color class without dark mode variant: text-gray-900
  Context: <h2 className="text-2xl font-semibold text-gray-900 mb-2">
- Line 127: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mb-6">
- Line 145: Color class without dark mode variant: bg-white
  Context: <div className="bg-white/80 backdrop-blur-sm border-b">
- Line 159: Color class without dark mode variant: bg-gray-50
  Context: className={`flex items-center gap-2 ${TYPE_COLORS[entry.type
- Line 159: Color class without dark mode variant: text-gray-700
  Context: className={`flex items-center gap-2 ${TYPE_COLORS[entry.type
- Line 168: Color class without dark mode variant: bg-gray-100
  Context: className={`${TONE_COLORS[entry.emotionalTone.toLowerCase() 
- Line 168: Color class without dark mode variant: text-gray-700
  Context: className={`${TONE_COLORS[entry.emotionalTone.toLowerCase() 
- Line 175: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-4xl font-bold text-gray-900 mb-4">
- Line 180: Color class without dark mode variant: text-gray-600
  Context: <p className="text-xl text-gray-600 mb-4 font-medium">
- Line 185: Color class without dark mode variant: text-gray-500
  Context: <div className="flex items-center gap-4 text-sm text-gray-50
- Line 201: Color class without dark mode variant: text-gray-500
  Context: <span className="text-sm text-gray-500">Notion</span>
- Line 217: Color class without dark mode variant: text-gray-700
  Context: <div className="text-gray-700 leading-relaxed">
- Line 221: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500 italic">No content available for
- Line 238: Color class without dark mode variant: text-gray-700
  Context: <p className="text-gray-700 italic">
- Line 241: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500 mt-2">
- Line 280: Color class without dark mode variant: text-gray-500
  Context: <label className="text-sm font-medium text-gray-500">Type</l
- Line 289: Color class without dark mode variant: text-gray-500
  Context: <label className="text-sm font-medium text-gray-500">Emotion
- Line 295: Color class without dark mode variant: text-gray-500
  Context: <label className="text-sm font-medium text-gray-500">Visibil
- Line 302: Color class without dark mode variant: text-gray-500
  Context: <label className="text-sm font-medium text-gray-500">Created
- Line 308: Color class without dark mode variant: text-gray-500
  Context: <label className="text-sm font-medium text-gray-500">Last Up
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/NotionHomePage.tsx
- Line 52: Color class without dark mode variant: bg-blue-50
  Context: event: 'bg-blue-50 text-blue-700 border-blue-200',
- Line 52: Color class without dark mode variant: text-blue-700
  Context: event: 'bg-blue-50 text-blue-700 border-blue-200',
- Line 53: Color class without dark mode variant: bg-green-50
  Context: note: 'bg-green-50 text-green-700 border-green-200',
- Line 59: Color class without dark mode variant: bg-blue-100
  Context: melancholic: 'bg-blue-100 text-blue-800',
- Line 59: Color class without dark mode variant: text-blue-800
  Context: melancholic: 'bg-blue-100 text-blue-800',
- Line 60: Color class without dark mode variant: bg-red-100
  Context: passionate: 'bg-red-100 text-red-800',
- Line 60: Color class without dark mode variant: text-red-800
  Context: passionate: 'bg-red-100 text-red-800',
- Line 62: Color class without dark mode variant: bg-green-100
  Context: inspiring: 'bg-green-100 text-green-800',
- Line 149: Color class without dark mode variant: bg-white
  Context: <div className="bg-white/80 backdrop-blur-sm border-b sticky
- Line 153: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-4xl font-bold text-gray-900 mb-2">
- Line 156: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">
- Line 162: Color class without dark mode variant: text-gray-500
  Context: <span className="text-sm text-gray-500">Powered by Notion</s
- Line 170: Color class without dark mode variant: text-gray-400
  Context: <Search className="absolute left-3 top-1/2 transform -transl
- Line 263: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-4 bg-gray-200 rounded mb-4" />
- Line 264: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-3 bg-gray-200 rounded mb-2" />
- Line 265: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-3 bg-gray-200 rounded w-2/3" />
- Line 277: Color class without dark mode variant: text-gray-900
  Context: <h2 className="text-2xl font-semibold text-gray-900">
- Line 298: Color class without dark mode variant: bg-gray-50
  Context: className={`flex items-center gap-1 flex-shrink-0 ${TYPE_COL
- Line 298: Color class without dark mode variant: text-gray-700
  Context: className={`flex items-center gap-1 flex-shrink-0 ${TYPE_COL
- Line 308: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 text-sm mb-4 line-clamp-3">
- Line 317: Color class without dark mode variant: bg-gray-100
  Context: className={`text-xs ${TONE_COLORS[entry.emotionalTone.toLowe
- Line 317: Color class without dark mode variant: text-gray-700
  Context: className={`text-xs ${TONE_COLORS[entry.emotionalTone.toLowe
- Line 339: Color class without dark mode variant: text-gray-500
  Context: <div className="text-xs text-gray-500 pt-2 border-t">
- Line 354: Color class without dark mode variant: bg-gray-100
  Context: <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-
- Line 355: Color class without dark mode variant: text-gray-400
  Context: <Search className="w-8 h-8 text-gray-400" />
- Line 357: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-2">
- Line 360: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mb-4">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/PaymentMethods.tsx
- Line 240: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-3xl font-bold text-gray-900 mb-2">Paymen
- Line 241: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Manage your payment methods for
- Line 265: Color class without dark mode variant: text-gray-400
  Context: <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4"
- Line 266: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500">No payment methods added yet</p
- Line 267: Color class without dark mode variant: text-gray-400
  Context: <p className="text-sm text-gray-400 mt-2">Add a payment meth
- Line 274: Color class without dark mode variant: bg-gray-50
  Context: className="flex items-center justify-between p-4 border bord
- Line 274: Color class without dark mode variant: border-gray-200
  Context: className="flex items-center justify-between p-4 border bord
- Line 281: Color class without dark mode variant: text-gray-500
  Context: <span className="text-gray-500">•••• {method.card?.last4}</s
- Line 289: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">
- Line 318: Color class without dark mode variant: text-red-600
  Context: className="text-red-600 hover:text-red-700"
- Line 335: Color class without dark mode variant: bg-white
  Context: <div className="bg-white/70 backdrop-blur-xl rounded-lg p-6 
- Line 338: Color class without dark mode variant: text-gray-900
  Context: <h3 className="font-semibold text-gray-900 mb-1">Your paymen
- Line 339: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/PrivacyAnalytics.tsx
- Line 315: Color class without dark mode variant: text-white
  Context: <Shield className="w-6 h-6 text-white" />
- Line 328: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:

### /client/src/pages/ProfileSwitcher.tsx
- Line 45: Color class without dark mode variant: bg-gray-50
  Context: <div className="min-h-screen bg-gray-50">
- Line 47: Color class without dark mode variant: bg-white
  Context: <div className="bg-white border-b border-gray-200 px-4 py-4"
- Line 47: Color class without dark mode variant: border-gray-200
  Context: <div className="bg-white border-b border-gray-200 px-4 py-4"
- Line 62: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-xl p-4 shadow-sm">
- Line 64: Color class without dark mode variant: text-white
  Context: <div className="w-12 h-12 rounded-full bg-gradient-to-r from
- Line 69: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">{user?.email}</p>
- Line 77: Color class without dark mode variant: text-gray-500
  Context: <h2 className="text-sm font-medium text-gray-500 mb-3">YOUR 
- Line 83: Color class without dark mode variant: bg-white
  Context: className={`w-full bg-white rounded-xl p-4 shadow-sm hover:s
- Line 93: Color class without dark mode variant: text-gray-900
  Context: <h3 className="font-medium text-gray-900">{profile.name}</h3
- Line 94: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">{profile.description}</
- Line 97: Color class without dark mode variant: text-gray-400
  Context: <ChevronRight className="h-5 w-5 text-gray-400" />
- Line 106: Color class without dark mode variant: bg-gray-100
  Context: <button className="w-full bg-gray-100 rounded-xl p-4 hover:b
- Line 107: Color class without dark mode variant: text-gray-600
  Context: <div className="flex items-center justify-center gap-3 text-
- Line 116: Color class without dark mode variant: text-gray-500
  Context: <h2 className="text-sm font-medium text-gray-500 mb-3">QUICK
- Line 117: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-xl p-4 shadow-sm space-y-3"
- Line 121: Color class without dark mode variant: bg-gray-50
  Context: className="w-full flex items-center gap-3 p-3 hover:bg-gray-
- Line 129: Color class without dark mode variant: bg-gray-50
  Context: className="w-full flex items-center gap-3 p-3 hover:bg-gray-
- Line 131: Color class without dark mode variant: text-blue-500
  Context: <Globe className="h-5 w-5 text-blue-500" />
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/ProjectTracker.tsx
- Line 196: Color class without dark mode variant: text-red-500
  Context: case 'failed': return <AlertCircle className="h-5 w-5 text-r
- Line 197: Color class without dark mode variant: text-gray-500
  Context: default: return <Clock className="h-5 w-5 text-gray-500" />;
- Line 203: Color class without dark mode variant: bg-green-100
  Context: case 'completed': return 'bg-green-100 text-green-800';
- Line 204: Color class without dark mode variant: bg-blue-100
  Context: case 'in_progress': return 'bg-blue-100 text-blue-800';
- Line 204: Color class without dark mode variant: text-blue-800
  Context: case 'in_progress': return 'bg-blue-100 text-blue-800';
- Line 206: Color class without dark mode variant: bg-red-100
  Context: case 'on_hold': return 'bg-red-100 text-red-800';
- Line 206: Color class without dark mode variant: text-red-800
  Context: case 'on_hold': return 'bg-red-100 text-red-800';
- Line 207: Color class without dark mode variant: bg-gray-100
  Context: default: return 'bg-gray-100 text-gray-800';
- Line 207: Color class without dark mode variant: text-gray-800
  Context: default: return 'bg-gray-100 text-gray-800';
- Line 213: Color class without dark mode variant: bg-red-100
  Context: case 'critical': return 'bg-red-100 text-red-800';
- Line 213: Color class without dark mode variant: text-red-800
  Context: case 'critical': return 'bg-red-100 text-red-800';
- Line 216: Color class without dark mode variant: bg-green-100
  Context: case 'low': return 'bg-green-100 text-green-800';
- Line 217: Color class without dark mode variant: bg-gray-100
  Context: default: return 'bg-gray-100 text-gray-800';
- Line 217: Color class without dark mode variant: text-gray-800
  Context: default: return 'bg-gray-100 text-gray-800';
- Line 233: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 text-lg">
- Line 240: Color class without dark mode variant: text-white
  Context: <Card className="bg-gradient-to-br from-green-500 to-emerald
- Line 253: Color class without dark mode variant: text-white
  Context: <Card className="bg-gradient-to-br from-blue-500 to-cyan-600
- Line 257: Color class without dark mode variant: text-blue-100
  Context: <p className="text-blue-100">Total Projects</p>
- Line 259: Color class without dark mode variant: text-blue-100
  Context: <p className="text-sm text-blue-100">Active projects</p>
- Line 261: Color class without dark mode variant: text-blue-100
  Context: <Layers className="h-8 w-8 text-blue-100" />
- Line 266: Color class without dark mode variant: text-white
  Context: <Card className="bg-gradient-to-br from-purple-500 to-pink-6
- Line 279: Color class without dark mode variant: text-white
  Context: <Card className="bg-gradient-to-br from-orange-500 to-red-60
- Line 322: Color class without dark mode variant: bg-green-100
  Context: <Badge variant="secondary" className="bg-green-100 text-gree
- Line 331: Color class without dark mode variant: text-gray-600
  Context: <ul className="text-sm text-gray-600 space-y-1">
- Line 340: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500 mt-2">
- Line 382: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500 mt-2">Loading projects...</p>
- Line 407: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mb-3 line-clamp-2">{proj
- Line 416: Color class without dark mode variant: text-gray-500
  Context: <div className="flex items-center justify-between text-sm te
- Line 423: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500 mt-2">
- Line 432: Color class without dark mode variant: text-gray-400
  Context: <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
- Line 433: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500">No projects found for the selec
- Line 485: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500 text-center py-4">No layer data 
- Line 500: Color class without dark mode variant: text-blue-600
  Context: <p className="text-2xl font-bold text-blue-600">{metrics.tot
- Line 501: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Total Projects</p>
- Line 505: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Avg Completion</p>
- Line 509: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Est. Hours</p>
- Line 513: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Actual Hours</p>
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/PromoCodesAdmin.tsx
- Line 224: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-3xl font-bold text-gray-900 mb-2">Promo 
- Line 225: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Create and manage discount code
- Line 246: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Active Codes</p>
- Line 260: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Total Uses</p>
- Line 265: Color class without dark mode variant: text-blue-500
  Context: <Users className="h-8 w-8 text-blue-500" />
- Line 274: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Avg Discount</p>
- Line 286: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Revenue Impact</p>
- Line 308: Color class without dark mode variant: text-gray-400
  Context: <Gift className="mx-auto h-12 w-12 text-gray-400 mb-4" />
- Line 309: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500">No promo codes yet</p>
- Line 310: Color class without dark mode variant: text-gray-400
  Context: <p className="text-sm text-gray-400 mt-2">Create your first 
- Line 330: Color class without dark mode variant: bg-gray-100
  Context: <code className="font-mono bg-gray-100 px-2 py-1 rounded">
- Line 354: Color class without dark mode variant: text-gray-500
  Context: <span className="text-gray-500">/ {promo.usageLimit}</span>
- Line 362: Color class without dark mode variant: text-gray-500
  Context: <span className="text-gray-500">No expiry</span>
- Line 367: Color class without dark mode variant: bg-green-100
  Context: <Badge className="bg-green-100 text-green-700">Active</Badge
- Line 369: Color class without dark mode variant: bg-gray-100
  Context: <Badge className="bg-gray-100 text-gray-700">Inactive</Badge
- Line 369: Color class without dark mode variant: text-gray-700
  Context: <Badge className="bg-gray-100 text-gray-700">Inactive</Badge
- Line 385: Color class without dark mode variant: text-red-600
  Context: className="text-red-600 hover:text-red-700"
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/PublicProfilePage.tsx
- Line 94: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 text-lg">Loading profile...</p>
- Line 106: Color class without dark mode variant: text-gray-300
  Context: <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
- Line 107: Color class without dark mode variant: text-gray-900
  Context: <h2 className="text-xl font-semibold text-gray-900 mb-2">Use
- Line 108: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">
- Line 124: Color class without dark mode variant: bg-blue-50
  Context: <div className="bg-blue-50 border border-blue-200 rounded-lg
- Line 126: Color class without dark mode variant: text-blue-600
  Context: <Users className="h-5 w-5 text-blue-600" />
- Line 127: Color class without dark mode variant: text-blue-800
  Context: <p className="text-blue-800 font-medium">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/PublicResumePage.tsx
- Line 65: Color class without dark mode variant: text-gray-500
  Context: <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
- Line 66: Color class without dark mode variant: text-gray-600
  Context: <span className="ml-2 text-gray-600">Loading resume...</span
- Line 76: Color class without dark mode variant: text-gray-300
  Context: <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300
- Line 77: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-medium text-gray-900 mb-2">Resum
- Line 78: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">
- Line 94: Color class without dark mode variant: bg-blue-50
  Context: <div className="mb-6 p-4 bg-blue-50 border border-blue-200 r
- Line 95: Color class without dark mode variant: text-blue-800
  Context: <p className="text-blue-800 text-sm">
- Line 109: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-16 h-16 rounded-full bg-gray-200 flex item
- Line 110: Color class without dark mode variant: text-gray-400
  Context: <User className="h-8 w-8 text-gray-400" />
- Line 114: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-3xl font-bold text-gray-900">{resumeData
- Line 115: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">@{resumeData.username}</p>
- Line 117: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">
- Line 128: Color class without dark mode variant: text-gray-300
  Context: <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
- Line 129: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-medium text-gray-900 mb-2">No re
- Line 130: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">This user hasn't participated i
- Line 152: Color class without dark mode variant: bg-blue-50
  Context: <div className="mb-6 p-4 bg-blue-50 border border-blue-200 r
- Line 153: Color class without dark mode variant: text-blue-800
  Context: <p className="text-blue-800 text-sm">
- Line 167: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-16 h-16 rounded-full bg-gray-200 flex item
- Line 168: Color class without dark mode variant: text-gray-400
  Context: <User className="h-8 w-8 text-gray-400" />
- Line 172: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-3xl font-bold text-gray-900">{resumeData
- Line 173: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">@{resumeData.username}</p>
- Line 175: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">
- Line 187: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white rounded-xl shadow-md">
- Line 192: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">Total Roles</div>
- Line 198: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">Events Participated</
- Line 204: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">Unique Roles</div>
- Line 215: Color class without dark mode variant: text-gray-900
  Context: <h2 className="text-2xl font-semibold text-gray-900 mb-4">{y
- Line 220: Color class without dark mode variant: bg-white
  Context: <Card key={`${entry.event_name}-${entry.role}-${index}`} cla
- Line 224: Color class without dark mode variant: text-gray-900
  Context: <CardTitle className="text-lg font-bold text-gray-900 mb-2">
- Line 227: Color class without dark mode variant: text-gray-600
  Context: <div className="flex items-center space-x-4 text-xs text-gra
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/RecommendationsBrowsePage.tsx
- Line 54: Color class without dark mode variant: text-gray-400
  Context: <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 
- Line 67: Color class without dark mode variant: text-white
  Context: className="h-12 px-6 bg-gradient-to-r from-turquoise-500 to-
- Line 80: Color class without dark mode variant: text-white
  Context: <span className="inline-flex items-center gap-1 px-3 py-1 bg

### /client/src/pages/ResumePage.tsx
- Line 130: Inline style with color - should use Tailwind dark: variants
  Context: <h1 style="color: #8E142E; font-size: 28px; margin: 0 0 10px
- Line 131: Inline style with color - should use Tailwind dark: variants
  Context: <p style="color: #666; font-size: 14px; margin: 0;">Generate
- Line 135: Inline style with color - should use Tailwind dark: variants
  Context: <div style="display: flex; justify-content: space-around; ba
- Line 137: Inline style with color - should use Tailwind dark: variants
  Context: <div style="font-size: 24px; font-weight: bold; color: #8E14
- Line 138: Inline style with color - should use Tailwind dark: variants
  Context: <div style="font-size: 12px; color: #666;">Total Roles</div>
- Line 141: Inline style with color - should use Tailwind dark: variants
  Context: <div style="font-size: 24px; font-weight: bold; color: #8E14
- Line 142: Inline style with color - should use Tailwind dark: variants
  Context: <div style="font-size: 12px; color: #666;">Events Participat
- Line 145: Inline style with color - should use Tailwind dark: variants
  Context: <div style="font-size: 24px; font-weight: bold; color: #8E14
- Line 146: Inline style with color - should use Tailwind dark: variants
  Context: <div style="font-size: 12px; color: #666;">Unique Roles</div
- Line 156: Inline style with color - should use Tailwind dark: variants
  Context: <h2 style="color: #333; font-size: 20px; margin-bottom: 15px
- Line 163: Inline style with color - should use Tailwind dark: variants
  Context: <div style="background: white; border: 1px solid #ddd; borde
- Line 166: Inline style with color - should use Tailwind dark: variants
  Context: <h3 style="color: #333; font-size: 16px; font-weight: bold; 
- Line 167: Inline style with color - should use Tailwind dark: variants
  Context: <div style="font-size: 12px; color: #666; margin-bottom: 4px
- Line 170: Inline style with color - should use Tailwind dark: variants
  Context: <div style="font-size: 12px; color: #666; margin-bottom: 8px
- Line 173: Inline style with color - should use Tailwind dark: variants
  Context: <div style="font-size: 11px; color: #888;">
- Line 177: Inline style with color - should use Tailwind dark: variants
  Context: <div style="background: #f0f0f0; border: 1px solid #8E142E; 
- Line 258: Color class without dark mode variant: text-red-300
  Context: <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-300"
- Line 259: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-medium text-gray-900 mb-2">Unabl
- Line 260: Color class without dark mode variant: text-red-600
  Context: <p className="text-red-600 mb-4">
- Line 265: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">
- Line 281: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tan
- Line 282: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Professional experience in the 
- Line 285: Color class without dark mode variant: text-gray-300
  Context: <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
- Line 286: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-medium text-gray-900 mb-2">No re
- Line 287: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Tag yourself or get tagged at e
- Line 310: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tan
- Line 311: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Professional experience in the 
- Line 319: Color class without dark mode variant: bg-gray-100
  Context: className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-
- Line 319: Color class without dark mode variant: text-gray-700
  Context: className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-
- Line 341: Color class without dark mode variant: bg-blue-500
  Context: className="bg-blue-500 text-white px-4 py-2 hover:bg-blue-60
- Line 341: Color class without dark mode variant: text-white
  Context: className="bg-blue-500 text-white px-4 py-2 hover:bg-blue-60
- Line 352: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white rounded-xl shadow-md">
- Line 355: Color class without dark mode variant: text-gray-600
  Context: <div className="text-xs text-gray-600">Total Roles</div>
- Line 358: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white rounded-xl shadow-md">
- Line 363: Color class without dark mode variant: text-gray-600
  Context: <div className="text-xs text-gray-600">Events Participated</
- Line 366: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white rounded-xl shadow-md">
- Line 371: Color class without dark mode variant: text-gray-600
  Context: <div className="text-xs text-gray-600">Unique Roles</div>
- Line 380: Color class without dark mode variant: text-gray-900
  Context: <h2 className="text-2xl font-semibold text-gray-900 mb-4">{y
- Line 385: Color class without dark mode variant: bg-white
  Context: <Card key={`${entry.event_id}-${entry.role}-${index}`} class
- Line 389: Color class without dark mode variant: text-gray-900
  Context: <CardTitle className="text-lg font-bold text-gray-900 mb-2">
- Line 392: Color class without dark mode variant: text-gray-600
  Context: <div className="flex items-center space-x-4 text-xs text-gra
- Line 412: Color class without dark mode variant: text-gray-600
  Context: <div className="text-xs text-gray-600">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/RoleInvitations.tsx
- Line 64: Color class without dark mode variant: bg-blue-100
  Context: teacher: 'bg-blue-100 text-blue-800',
- Line 64: Color class without dark mode variant: text-blue-800
  Context: teacher: 'bg-blue-100 text-blue-800',
- Line 65: Color class without dark mode variant: bg-green-100
  Context: musician: 'bg-green-100 text-green-800',
- Line 69: Color class without dark mode variant: bg-red-100
  Context: organizer: 'bg-red-100 text-red-800',
- Line 69: Color class without dark mode variant: text-red-800
  Context: organizer: 'bg-red-100 text-red-800',
- Line 199: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Manage your event role invitati
- Line 208: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Pending</p>
- Line 220: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Accepted</p>
- Line 232: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Total Invitations</p>
- Line 244: Color class without dark mode variant: text-white
  Context: className="w-full bg-gradient-to-r from-turquoise-600 to-cya
- Line 327: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-turquoise-600 to-cyan-600 h
- Line 358: Color class without dark mode variant: text-gray-400
  Context: <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
- Line 365: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">
- Line 381: Color class without dark mode variant: bg-gray-100
  Context: className={`flex items-center gap-1 ${ROLE_COLORS[invitation
- Line 381: Color class without dark mode variant: text-gray-800
  Context: className={`flex items-center gap-1 ${ROLE_COLORS[invitation
- Line 386: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">
- Line 393: Color class without dark mode variant: text-gray-600
  Context: <div className="flex flex-wrap items-center gap-4 text-sm te
- Line 409: Color class without dark mode variant: bg-gray-50
  Context: <div className="p-3 bg-gray-50 rounded-lg mb-4">
- Line 410: Color class without dark mode variant: text-gray-700
  Context: <p className="text-sm text-gray-700 italic">"{invitation.mes
- Line 419: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-green-600 to-emerald-600 ho
- Line 428: Color class without dark mode variant: bg-red-50
  Context: className="border-red-200 text-red-600 hover:bg-red-50"
- Line 428: Color class without dark mode variant: text-red-600
  Context: className="border-red-200 text-red-600 hover:bg-red-50"
- Line 440: Color class without dark mode variant: bg-green-100
  Context: className={invitation.status === 'accepted' ? 'bg-green-100 
- Line 440: Color class without dark mode variant: text-red-800
  Context: className={invitation.status === 'accepted' ? 'bg-green-100 
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/Subscribe.tsx
- Line 162: Color class without dark mode variant: text-gray-600
  Context: <p className="text-xl text-gray-600">
- Line 170: Color class without dark mode variant: text-gray-700
  Context: <p className="text-gray-700">
- Line 208: Color class without dark mode variant: text-gray-500
  Context: {tier.price > 0 && <span className="text-gray-500">/month</s
- Line 218: Color class without dark mode variant: text-gray-700
  Context: <span className="text-sm text-gray-700">{feature}</span>
- Line 225: Color class without dark mode variant: border-gray-200
  Context: <div className="space-y-2 pt-4 border-t border-gray-200">
- Line 228: Color class without dark mode variant: text-gray-400
  Context: <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
- Line 229: Color class without dark mode variant: text-gray-500
  Context: <span className="text-sm text-gray-500">{feature}</span>
- Line 276: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/Subscription.tsx
- Line 168: Color class without dark mode variant: border-gray-300
  Context: free: 'border-gray-300',
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/SubscriptionAnalytics.tsx
- Line 72: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mb-1">{title}</p>
- Line 73: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-2xl font-bold text-gray-900">
- Line 80: Color class without dark mode variant: text-red-500
  Context: <TrendingDown className="w-4 h-4 text-red-500" />
- Line 82: Color class without dark mode variant: text-red-600
  Context: <span className={`text-sm font-medium ${isPositive ? 'text-g
- Line 85: Color class without dark mode variant: text-gray-500
  Context: <span className="text-sm text-gray-500">vs last month</span>
- Line 159: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscr
- Line 160: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Monitor your subscription perfo
- Line 327: Color class without dark mode variant: text-red-600
  Context: <AlertCircle className="w-5 h-5 text-red-600" />

### /client/src/pages/TangoStories.tsx
- Line 137: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Share and discover personal tan
- Line 143: Color class without dark mode variant: text-gray-400
  Context: <Search className="absolute left-3 top-1/2 transform -transl
- Line 154: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-turquoise-600 to-cyan-600 h
- Line 186: Color class without dark mode variant: text-gray-400
  Context: <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" /
- Line 188: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mb-4">Be the first to share your
- Line 191: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-turquoise-600 to-cyan-600 h
- Line 203: Color class without dark mode variant: text-white
  Context: <div className="w-12 h-12 bg-gradient-to-r from-turquoise-40
- Line 208: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">
- Line 220: Color class without dark mode variant: text-gray-700
  Context: <p className="text-gray-700 whitespace-pre-wrap mb-4 line-cl
- Line 228: Color class without dark mode variant: text-gray-600
  Context: <span className="flex items-center gap-1 text-sm text-gray-6
- Line 247: Color class without dark mode variant: text-red-500
  Context: className={story.isLiked ? 'text-red-500' : ''}
- Line 269: Color class without dark mode variant: bg-black
  Context: <div className="fixed inset-0 bg-black/50 flex items-center 
- Line 335: Color class without dark mode variant: text-white
  Context: className="flex-1 bg-gradient-to-r from-turquoise-600 to-cya
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/TravelPlanner.tsx
- Line 166: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Plan your tango journey across 
- Line 176: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Cities Visited</p>
- Line 188: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Events Attended</p>
- Line 200: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Countries</p>
- Line 203: Color class without dark mode variant: text-blue-500
  Context: <Globe className="h-8 w-8 text-blue-500" />
- Line 212: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Next Trip</p>
- Line 320: Color class without dark mode variant: text-red-500
  Context: className="text-red-500"
- Line 386: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mb-2">
- Line 476: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mb-2">{event.location}</
- Line 477: Color class without dark mode variant: text-gray-500
  Context: <div className="flex items-center gap-4 text-sm text-gray-50
- Line 525: Color class without dark mode variant: bg-green-50
  Context: <Card className="bg-green-50">
- Line 527: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Total Budget</p>
- Line 533: Color class without dark mode variant: bg-blue-50
  Context: <Card className="bg-blue-50">
- Line 535: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Per Person</p>
- Line 536: Color class without dark mode variant: text-blue-600
  Context: <p className="text-2xl font-bold text-blue-600">
- Line 543: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Per Day</p>
- Line 558: Color class without dark mode variant: bg-gray-50
  Context: <div className="flex items-center justify-between p-3 rounde
- Line 560: Color class without dark mode variant: text-gray-600
  Context: <Hotel className="h-4 w-4 text-gray-600" />
- Line 569: Color class without dark mode variant: bg-gray-50
  Context: <div className="flex items-center justify-between p-3 rounde
- Line 571: Color class without dark mode variant: text-gray-600
  Context: <Plane className="h-4 w-4 text-gray-600" />
- Line 580: Color class without dark mode variant: bg-gray-50
  Context: <div className="flex items-center justify-between p-3 rounde
- Line 582: Color class without dark mode variant: text-gray-600
  Context: <CalendarIcon className="h-4 w-4 text-gray-600" />
- Line 591: Color class without dark mode variant: bg-gray-50
  Context: <div className="flex items-center justify-between p-3 rounde
- Line 593: Color class without dark mode variant: text-gray-600
  Context: <Heart className="h-4 w-4 text-gray-600" />
- Line 622: Color class without dark mode variant: text-gray-500
  Context: <div className="text-center py-8 text-gray-500">
- Line 623: Color class without dark mode variant: text-gray-300
  Context: <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" 
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/UserSettings.tsx
- Line 391: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Manage your account preferences
- Line 397: Color class without dark mode variant: text-gray-400
  Context: <Search className="absolute left-3 top-1/2 transform -transl
- Line 437: Color class without dark mode variant: bg-red-50
  Context: className="flex items-center gap-2 hover:bg-red-50 hover:bor
- Line 455: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-turquoise-600 to-cyan-600 t
- Line 469: Color class without dark mode variant: bg-white
  Context: <TabsList className="grid grid-cols-6 w-full mb-6 bg-white/8
- Line 469: Color class without dark mode variant: border-white
  Context: <TabsList className="grid grid-cols-6 w-full mb-6 bg-white/8
- Line 498: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/90 backdrop-blur-xl border border-
- Line 498: Color class without dark mode variant: border-white
  Context: <Card className="bg-white/90 backdrop-blur-xl border border-
- Line 503: Color class without dark mode variant: text-gray-600
  Context: <CardDescription className="text-gray-600">
- Line 655: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/90 backdrop-blur-xl border border-
- Line 655: Color class without dark mode variant: border-white
  Context: <Card className="bg-white/90 backdrop-blur-xl border border-
- Line 883: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/90 backdrop-blur-xl border border-
- Line 883: Color class without dark mode variant: border-white
  Context: <Card className="bg-white/90 backdrop-blur-xl border border-
- Line 886: Color class without dark mode variant: text-gray-600
  Context: <CardDescription className="text-gray-600">
- Line 904: Color class without dark mode variant: border-gray-200
  Context: : 'border-gray-200 hover:border-gray-300'
- Line 916: Color class without dark mode variant: border-gray-200
  Context: : 'border-gray-200 hover:border-gray-300'
- Line 919: Color class without dark mode variant: text-gray-700
  Context: <Moon className="w-8 h-8 mx-auto mb-2 text-gray-700" />
- Line 928: Color class without dark mode variant: border-gray-200
  Context: : 'border-gray-200 hover:border-gray-300'
- Line 931: Color class without dark mode variant: text-blue-500
  Context: <Monitor className="w-8 h-8 mx-auto mb-2 text-blue-500" />
- Line 1041: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/90 backdrop-blur-xl border border-
- Line 1041: Color class without dark mode variant: border-white
  Context: <Card className="bg-white/90 backdrop-blur-xl border border-
- Line 1044: Color class without dark mode variant: text-gray-600
  Context: <CardDescription className="text-gray-600">
- Line 1060: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 mt-1">Enable console log
- Line 1073: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 mt-1">Try experimental f
- Line 1086: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 mt-1">Enable programmati
- Line 1143: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 mt-1">Cache content for 
- Line 1201: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 mt-1">Send events to ext
- Line 1218: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/90 backdrop-blur-xl border border-
- Line 1218: Color class without dark mode variant: border-white
  Context: <Card className="bg-white/90 backdrop-blur-xl border border-
- Line 1221: Color class without dark mode variant: text-gray-600
  Context: <CardDescription className="text-gray-600">
- Line 1237: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 mt-1">Enhance compatibil
- Line 1250: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 mt-1">Increase contrast 
- Line 1263: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 mt-1">Make focused eleme
- Line 1303: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 mt-1">Navigate the app u
- Line 1326: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 mt-1">Narrate visual con
- Line 1339: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 mt-1">Show captions on a
- Line 1372: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/90 backdrop-blur-xl border border-
- Line 1372: Color class without dark mode variant: border-white
  Context: <Card className="bg-white/90 backdrop-blur-xl border border-
- Line 1390: Color class without dark mode variant: bg-gray-50
  Context: <div className="p-4 bg-gray-50 rounded-lg">
- Line 1394: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mt-1">
- Line 1418: Color class without dark mode variant: bg-gray-50
  Context: <div className="p-4 bg-gray-50 rounded-lg">
- Line 1422: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mt-1">
- Line 1452: Color class without dark mode variant: bg-gray-50
  Context: <div className="p-4 bg-gray-50 rounded-lg">
- Line 1455: Color class without dark mode variant: text-gray-600
  Context: <Monitor className="w-5 h-5 text-gray-600" />
- Line 1458: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">
- Line 1463: Color class without dark mode variant: bg-green-100
  Context: <Badge variant="secondary" className="bg-green-100 text-gree
- Line 1471: Color class without dark mode variant: bg-red-50
  Context: className="w-full hover:bg-red-50 hover:border-red-300"
- Line 1487: Color class without dark mode variant: bg-gray-50
  Context: <div className="p-3 bg-gray-50 rounded-lg">
- Line 1493: Color class without dark mode variant: text-gray-600
  Context: <p className="text-xs text-gray-600">Today at 11:34 AM</p>
- Line 1503: Color class without dark mode variant: text-red-600
  Context: <h3 className="text-lg font-semibold flex items-center gap-2
- Line 1511: Color class without dark mode variant: bg-red-50
  Context: className="w-full border-red-300 text-red-600 hover:bg-red-5
- Line 1511: Color class without dark mode variant: text-red-600
  Context: className="w-full border-red-300 text-red-600 hover:bg-red-5
- Line 1531: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-turquoise-600 to-cyan-600 t

### /client/src/pages/admin/AgentMetrics.tsx
- Line 242: Color class without dark mode variant: text-red-500
  Context: overallStatus === 'degraded' ? 'text-yellow-500' : 'text-red
- Line 254: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500 mt-2">
- Line 591: Color class without dark mode variant: text-blue-500
  Context: <div className="text-3xl font-bold text-blue-500">
- Line 609: Color class without dark mode variant: text-red-500
  Context: <div className="text-3xl font-bold text-red-500">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/admin/ESAMind.tsx
- Line 223: Color class without dark mode variant: text-gray-900
  Context: <h2 className="text-3xl font-bold text-gray-900 mb-2">Custom
- Line 224: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Visual map of all 5 customer jo
- Line 232: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">Total Pages</p>
- Line 241: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">Customer Journeys</p>
- Line 250: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">Audit Framework</p>
- Line 252: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">phases/page</p>
- Line 262: Color class without dark mode variant: border-gray-200
  Context: <GlassCard key={journey.id} className="p-6 border border-gra
- Line 266: Color class without dark mode variant: text-white
  Context: <span className="text-2xl font-bold text-white">{journey.id}
- Line 273: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-xl font-semibold text-gray-900 mb-1">{jo
- Line 274: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">{journey.description}</p>
- Line 276: Color class without dark mode variant: text-white
  Context: <Badge className={`bg-gradient-to-r ${journey.color} text-wh
- Line 285: Color class without dark mode variant: bg-white
  Context: <div className="px-3 py-1.5 bg-white border border-gray-200 
- Line 285: Color class without dark mode variant: text-gray-700
  Context: <div className="px-3 py-1.5 bg-white border border-gray-200 
- Line 285: Color class without dark mode variant: border-gray-200
  Context: <div className="px-3 py-1.5 bg-white border border-gray-200 
- Line 289: Color class without dark mode variant: text-gray-400
  Context: <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
- Line 294: Color class without dark mode variant: bg-gray-100
  Context: <Badge className="bg-gray-100 text-gray-600">
- Line 294: Color class without dark mode variant: text-gray-600
  Context: <Badge className="bg-gray-100 text-gray-600">
- Line 302: Color class without dark mode variant: border-gray-100
  Context: <div className="mt-4 pt-4 border-t border-gray-100">
- Line 303: Color class without dark mode variant: text-gray-500
  Context: <div className="flex items-center gap-2 text-sm text-gray-50
- Line 305: Color class without dark mode variant: text-white
  Context: <Badge className={`bg-gradient-to-r ${journeys[idx + 1].colo
- Line 324: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-2">Jou
- Line 325: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mb-4">
- Line 329: Color class without dark mode variant: bg-white
  Context: <div className="p-3 bg-white rounded-lg border border-gray-2
- Line 329: Color class without dark mode variant: border-gray-200
  Context: <div className="p-3 bg-white rounded-lg border border-gray-2
- Line 330: Color class without dark mode variant: text-gray-700
  Context: <p className="text-sm font-medium text-gray-700 mb-1">Execut
- Line 331: Color class without dark mode variant: bg-gray-50
  Context: <code className="text-xs text-turquoise-600 font-mono bg-gra
- Line 333: Color class without dark mode variant: bg-white
  Context: <div className="p-3 bg-white rounded-lg border border-gray-2
- Line 333: Color class without dark mode variant: border-gray-200
  Context: <div className="p-3 bg-white rounded-lg border border-gray-2
- Line 334: Color class without dark mode variant: text-gray-700
  Context: <p className="text-sm font-medium text-gray-700 mb-1">Expect
- Line 335: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">~4-5 hours (automated)<
- Line 348: Color class without dark mode variant: text-white
  Context: className="flex items-center gap-2 px-6 py-3 bg-gradient-to-
- Line 365: Color class without dark mode variant: text-white
  Context: <Map className="w-8 h-8 text-white" />
- Line 367: Color class without dark mode variant: text-white
  Context: <Badge className="bg-gradient-to-r from-purple-500 to-pink-5
- Line 374: Color class without dark mode variant: text-gray-600
  Context: <p className="text-xl text-gray-600">
- Line 377: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500 max-w-2xl mx-auto">
- Line 392: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-2">Pag
- Line 393: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mb-4">
- Line 398: Color class without dark mode variant: bg-white
  Context: <div key={agent.id} className="flex items-center gap-2 px-3 
- Line 398: Color class without dark mode variant: border-gray-200
  Context: <div key={agent.id} className="flex items-center gap-2 px-3 
- Line 400: Color class without dark mode variant: text-white
  Context: ? "bg-turquoise-500 text-white"
- Line 401: Color class without dark mode variant: bg-gray-100
  Context: : "bg-gray-100 text-gray-700"
- Line 401: Color class without dark mode variant: text-gray-700
  Context: : "bg-gray-100 text-gray-700"
- Line 405: Color class without dark mode variant: text-gray-700
  Context: <span className="text-sm text-gray-700">
- Line 421: Color class without dark mode variant: text-gray-400
  Context: <Search className="absolute left-4 top-1/2 transform -transl
- Line 427: Color class without dark mode variant: bg-white
  Context: className="pl-12 h-12 bg-white border-gray-200 focus:border-
- Line 427: Color class without dark mode variant: border-gray-200
  Context: className="pl-12 h-12 bg-white border-gray-200 focus:border-
- Line 438: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">Total Agents</p>
- Line 447: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">Technical Layers</p>
- Line 448: Color class without dark mode variant: text-blue-600
  Context: <p className="text-3xl font-bold text-blue-600">61</p>
- Line 450: Color class without dark mode variant: text-blue-400
  Context: <Layers className="w-10 h-10 text-blue-400" />
- Line 456: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">Trained Agents</p>
- Line 465: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">Training Progress</p>
- Line 480: Color class without dark mode variant: border-gray-100
  Context: className="p-6 hover:shadow-xl transition-all duration-300 c
- Line 486: Color class without dark mode variant: text-gray-700
  Context: <Icon className="w-8 h-8 text-gray-700" />
- Line 489: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-xl font-semibold text-gray-900 mb-2 grou
- Line 492: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mb-4">{view.description}</p>
- Line 508: Color class without dark mode variant: border-gray-100
  Context: <GlassCard className="p-6 border border-gray-100">
- Line 509: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4 flex
- Line 521: Color class without dark mode variant: text-gray-700
  Context: <span className="text-gray-700 group-hover:text-turquoise-70
- Line 530: Color class without dark mode variant: text-gray-700
  Context: <span className="text-gray-700 group-hover:text-turquoise-70
- Line 539: Color class without dark mode variant: text-gray-700
  Context: <span className="text-gray-700 group-hover:text-turquoise-70
- Line 548: Color class without dark mode variant: text-gray-700
  Context: <span className="text-gray-700 group-hover:text-turquoise-70
- Line 575: Color class without dark mode variant: text-gray-900
  Context: <h2 className="text-2xl font-bold text-gray-900">{view.title
- Line 576: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mt-1">{view.description}</p>
- Line 582: Color class without dark mode variant: text-white
  Context: className="flex items-center gap-2 px-4 py-2 bg-gradient-to-
- Line 609: Color class without dark mode variant: bg-white
  Context: className="lg:hidden p-2 rounded-lg hover:bg-white/20 transi
- Line 612: Color class without dark mode variant: text-white
  Context: <svg className="w-6 h-6 text-white" fill="none" stroke="curr
- Line 617: Color class without dark mode variant: bg-white
  Context: <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm roun
- Line 618: Color class without dark mode variant: text-white
  Context: <Map className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
- Line 621: Color class without dark mode variant: text-white
  Context: <h1 className="text-lg sm:text-xl md:text-3xl font-bold text
- Line 622: Color class without dark mode variant: text-white
  Context: <p className="text-xs sm:text-sm text-white/80 hidden sm:blo
- Line 629: Color class without dark mode variant: bg-white
  Context: className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-whit
- Line 632: Color class without dark mode variant: text-gray-700
  Context: <ArrowLeft className="w-4 h-4 text-gray-700 group-hover:text
- Line 633: Color class without dark mode variant: text-gray-700
  Context: <span className="text-gray-700 font-medium text-sm sm:text-b
- Line 642: Color class without dark mode variant: bg-white
  Context: <div className="bg-white/50 backdrop-blur-sm border-b border
- Line 642: Color class without dark mode variant: border-gray-200
  Context: <div className="bg-white/50 backdrop-blur-sm border-b border
- Line 647: Color class without dark mode variant: text-gray-400
  Context: {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400
- Line 653: Color class without dark mode variant: text-gray-500
  Context: : 'text-gray-500 hover:text-gray-700'
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/admin/EpicDetail.tsx
- Line 72: Color class without dark mode variant: text-white
  Context: to_do: 'bg-gradient-to-r from-gray-400 to-gray-500 text-whit
- Line 73: Color class without dark mode variant: text-white
  Context: in_progress: 'bg-gradient-to-r from-turquoise-500 to-ocean-6
- Line 74: Color class without dark mode variant: text-white
  Context: done: 'bg-gradient-to-r from-green-500 to-emerald-600 text-w
- Line 75: Color class without dark mode variant: text-white
  Context: cancelled: 'bg-gradient-to-r from-red-500 to-rose-600 text-w
- Line 79: Color class without dark mode variant: text-gray-800
  Context: low: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-8
- Line 80: Color class without dark mode variant: text-white
  Context: medium: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-
- Line 81: Color class without dark mode variant: text-white
  Context: high: 'bg-gradient-to-r from-orange-500 to-red-500 text-whit
- Line 82: Color class without dark mode variant: text-white
  Context: critical: 'bg-gradient-to-r from-red-600 to-rose-700 text-wh
- Line 199: Color class without dark mode variant: text-white
  Context: <div className="h-8 w-8 rounded-full bg-gradient-to-br from-
- Line 214: Color class without dark mode variant: bg-white
  Context: <div className="h-3 w-3 rounded-full bg-white animate-pulse"
- Line 247: Inline style with color - should use Tailwind dark: variants
  Context: <div className="h-3 w-3 rounded-full" style={{ backgroundCol
- Line 294: Color class without dark mode variant: text-white
  Context: <div className="flex h-8 w-8 items-center justify-center rou
- Line 306: Color class without dark mode variant: text-white
  Context: <Target className="h-8 w-8 text-white" />

### /client/src/pages/admin/EpicsList.tsx
- Line 101: Color class without dark mode variant: text-gray-400
  Context: return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" /
- Line 113: Color class without dark mode variant: text-white
  Context: to_do: 'bg-gradient-to-r from-gray-400 to-gray-500 text-whit
- Line 114: Color class without dark mode variant: text-white
  Context: in_progress: 'bg-gradient-to-r from-turquoise-500 to-ocean-6
- Line 115: Color class without dark mode variant: text-white
  Context: done: 'bg-gradient-to-r from-green-500 to-emerald-600 text-w
- Line 116: Color class without dark mode variant: text-white
  Context: cancelled: 'bg-gradient-to-r from-red-500 to-rose-600 text-w
- Line 127: Color class without dark mode variant: bg-gray-400
  Context: <Badge className={statusColors[status as keyof typeof status
- Line 135: Color class without dark mode variant: text-gray-800
  Context: low: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-8
- Line 136: Color class without dark mode variant: text-white
  Context: medium: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-
- Line 137: Color class without dark mode variant: text-white
  Context: high: 'bg-gradient-to-r from-orange-500 to-red-500 text-whit
- Line 138: Color class without dark mode variant: text-white
  Context: critical: 'bg-gradient-to-r from-red-600 to-rose-700 text-wh
- Line 149: Color class without dark mode variant: bg-gray-400
  Context: <Badge className={priorityColors[priority as keyof typeof pr
- Line 175: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-turquoise-500 to-ocean-600 
- Line 188: Color class without dark mode variant: text-gray-400
  Context: <Search className="absolute left-3 top-1/2 -translate-y-1/2 

### /client/src/pages/admin/MrBlueDashboard.tsx
- Line 52: Color class without dark mode variant: text-blue-500
  Context: <Sparkles className="h-8 w-8 text-blue-500" />
- Line 110: Color class without dark mode variant: text-blue-500
  Context: <Sparkles className="h-20 w-20 mx-auto mb-4 text-blue-500 an

### /client/src/pages/admin/StoriesList.tsx
- Line 104: Color class without dark mode variant: text-gray-400
  Context: return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" /
- Line 116: Color class without dark mode variant: text-white
  Context: to_do: 'bg-gradient-to-r from-gray-400 to-gray-500 text-whit
- Line 117: Color class without dark mode variant: text-white
  Context: in_progress: 'bg-gradient-to-r from-turquoise-500 to-ocean-6
- Line 118: Color class without dark mode variant: text-white
  Context: done: 'bg-gradient-to-r from-green-500 to-emerald-600 text-w
- Line 119: Color class without dark mode variant: text-white
  Context: cancelled: 'bg-gradient-to-r from-red-500 to-rose-600 text-w
- Line 130: Color class without dark mode variant: bg-gray-400
  Context: <Badge className={statusColors[status as keyof typeof status
- Line 138: Color class without dark mode variant: text-gray-800
  Context: low: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-8
- Line 139: Color class without dark mode variant: text-white
  Context: medium: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-
- Line 140: Color class without dark mode variant: text-white
  Context: high: 'bg-gradient-to-r from-orange-500 to-red-500 text-whit
- Line 141: Color class without dark mode variant: text-white
  Context: critical: 'bg-gradient-to-r from-red-600 to-rose-700 text-wh
- Line 152: Color class without dark mode variant: bg-gray-400
  Context: <Badge className={priorityColors[priority as keyof typeof pr
- Line 175: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-turquoise-500 to-ocean-600 
- Line 188: Color class without dark mode variant: text-gray-400
  Context: <Search className="absolute left-3 top-1/2 -translate-y-1/2 
- Line 341: Color class without dark mode variant: text-white
  Context: <div className="flex h-6 w-6 items-center justify-center rou
- Line 349: Color class without dark mode variant: text-gray-400
  Context: <span className="text-sm text-gray-400">Unassigned</span>
- Line 358: Color class without dark mode variant: text-gray-400
  Context: <span className="text-sm text-gray-400">-</span>

### /client/src/pages/admin/StoryDetail.tsx
- Line 168: Color class without dark mode variant: text-white
  Context: to_do: 'bg-gradient-to-r from-gray-400 to-gray-500 text-whit
- Line 169: Color class without dark mode variant: text-white
  Context: in_progress: 'bg-gradient-to-r from-turquoise-500 to-ocean-6
- Line 170: Color class without dark mode variant: text-white
  Context: done: 'bg-gradient-to-r from-green-500 to-emerald-600 text-w
- Line 171: Color class without dark mode variant: text-white
  Context: cancelled: 'bg-gradient-to-r from-red-500 to-rose-600 text-w
- Line 175: Color class without dark mode variant: text-gray-800
  Context: low: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-8
- Line 176: Color class without dark mode variant: text-white
  Context: medium: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-
- Line 177: Color class without dark mode variant: text-white
  Context: high: 'bg-gradient-to-r from-orange-500 to-red-500 text-whit
- Line 178: Color class without dark mode variant: text-white
  Context: critical: 'bg-gradient-to-r from-red-600 to-rose-700 text-wh
- Line 370: Color class without dark mode variant: text-white
  Context: <div className="flex h-6 w-6 items-center justify-center rou
- Line 427: Color class without dark mode variant: text-white
  Context: <Check className="h-8 w-8 text-white" />
- Line 499: Color class without dark mode variant: text-white
  Context: <div className="flex h-8 w-8 items-center justify-center rou
- Line 513: Color class without dark mode variant: text-white
  Context: <div key={agentId} className="flex h-8 w-8 items-center just
- Line 541: Color class without dark mode variant: text-gray-500
  Context: <Clock className="h-3 w-3 text-gray-500" />
- Line 547: Color class without dark mode variant: text-gray-500
  Context: <FileCode className="h-3 w-3 text-gray-500" />
- Line 602: Color class without dark mode variant: bg-gray-900
  Context: <TooltipContent className="bg-gray-900 text-white">
- Line 602: Color class without dark mode variant: text-white
  Context: <TooltipContent className="bg-gray-900 text-white">
- Line 604: Color class without dark mode variant: text-gray-300
  Context: <p className="text-xs text-gray-300 mt-1">Click to filter</p
- Line 639: Color class without dark mode variant: text-white
  Context: <Badge className="bg-gradient-to-r from-purple-500 to-indigo
- Line 657: Color class without dark mode variant: bg-red-600
  Context: story.metadata.risk_level === 'critical' ? 'bg-red-600 text-
- Line 657: Color class without dark mode variant: text-white
  Context: story.metadata.risk_level === 'critical' ? 'bg-red-600 text-
- Line 658: Color class without dark mode variant: text-white
  Context: story.metadata.risk_level === 'high' ? 'bg-orange-600 text-w
- Line 659: Color class without dark mode variant: text-white
  Context: story.metadata.risk_level === 'medium' ? 'bg-yellow-600 text
- Line 660: Color class without dark mode variant: bg-green-600
  Context: 'bg-green-600 text-white text-xs'
- Line 660: Color class without dark mode variant: text-white
  Context: 'bg-green-600 text-white text-xs'

### /client/src/pages/admin/analytics.tsx
- Line 195: Color class without dark mode variant: text-gray-600
  Context: <CardTitle className="text-sm font-medium text-gray-600">
- Line 198: Color class without dark mode variant: text-gray-400
  Context: <Icon className="w-4 h-4 text-gray-400" />
- Line 202: Color class without dark mode variant: text-gray-900
  Context: <div className="text-2xl font-bold text-gray-900">{value}</d
- Line 212: Color class without dark mode variant: text-red-500
  Context: <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
- Line 213: Color class without dark mode variant: text-red-600
  Context: <span className="text-red-600">{change}%</span>
- Line 216: Color class without dark mode variant: text-gray-500
  Context: <span className="text-gray-500 ml-1">vs last period</span>
- Line 232: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mt-1">
- Line 256: Color class without dark mode variant: text-white
  Context: <Button className="bg-gradient-to-r from-teal-500 to-cyan-50
- Line 350: Color class without dark mode variant: text-gray-600
  Context: <span className="text-gray-600">{week}</span>
- Line 353: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-full bg-gray-200 rounded-full h-2">
- Line 366: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Avg. Retention</p>
- Line 370: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Churn Rate</p>
- Line 371: Color class without dark mode variant: text-red-600
  Context: <p className="text-xl font-bold text-red-600">37.5%</p>
- Line 408: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Avg. Session Duration</
- Line 416: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Pages per Session</p>
- Line 426: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mb-3">Active Users</p>
- Line 519: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">Avg. Likes per Post<
- Line 523: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">Avg. Comments per Po
- Line 527: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">Avg. Shares per Post
- Line 531: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">Posts per User</span
- Line 537: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mb-2">Top Performing Pos
- Line 592: Color class without dark mode variant: bg-gray-500
  Context: { tier: 'Free', users: 450, revenue: 0, color: 'bg-gray-500'
- Line 593: Color class without dark mode variant: bg-blue-500
  Context: { tier: 'Basic', users: 320, revenue: 3200, color: 'bg-blue-
- Line 596: Color class without dark mode variant: bg-red-500
  Context: { tier: 'Enterprise', users: 30, revenue: 6000, color: 'bg-r
- Line 606: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">{tier.users} users</p>
- Line 609: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-full bg-gray-200 rounded-full h-2">
- Line 626: Color class without dark mode variant: text-gray-600
  Context: <CardTitle className="text-sm text-gray-600">MRR</CardTitle>
- Line 639: Color class without dark mode variant: text-gray-600
  Context: <CardTitle className="text-sm text-gray-600">ARR</CardTitle>
- Line 652: Color class without dark mode variant: text-gray-600
  Context: <CardTitle className="text-sm text-gray-600">ARPU</CardTitle
- Line 665: Color class without dark mode variant: text-gray-600
  Context: <CardTitle className="text-sm text-gray-600">LTV</CardTitle>
- Line 738: Color class without dark mode variant: text-gray-600
  Context: <span className="text-gray-600">{age}</span>
- Line 740: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-24 bg-gray-200 rounded-full h-2">
- Line 769: Color class without dark mode variant: text-gray-600
  Context: <span className="text-gray-600">{item.lang}</span>
- Line 784: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">Female</span>
- Line 788: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">Male</span>
- Line 792: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">Other</span>
- Line 800: Color class without dark mode variant: bg-blue-500
  Context: <div className="bg-blue-500" style={{ width: '46%' }} />
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/admin/dashboard.tsx
- Line 173: Color class without dark mode variant: text-blue-600
  Context: user: 'text-blue-600',
- Line 176: Color class without dark mode variant: text-red-600
  Context: like: 'text-red-600',
- Line 180: Color class without dark mode variant: text-gray-600
  Context: system: 'text-gray-600',
- Line 182: Color class without dark mode variant: text-gray-600
  Context: return colors[type] || 'text-gray-600';
- Line 194: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mt-1">
- Line 221: Color class without dark mode variant: text-gray-600
  Context: <CardTitle className="text-sm font-medium text-gray-600">
- Line 228: Color class without dark mode variant: text-gray-900
  Context: <div className="text-2xl font-bold text-gray-900">
- Line 241: Color class without dark mode variant: text-red-500
  Context: <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
- Line 242: Color class without dark mode variant: text-red-600
  Context: <span className="text-red-600">
- Line 252: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500 mt-1">
- Line 262: Color class without dark mode variant: text-gray-600
  Context: <CardTitle className="text-sm font-medium text-gray-600">
- Line 269: Color class without dark mode variant: text-gray-900
  Context: <div className="text-2xl font-bold text-gray-900">
- Line 282: Color class without dark mode variant: text-red-500
  Context: <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
- Line 283: Color class without dark mode variant: text-red-600
  Context: <span className="text-red-600">
- Line 291: Color class without dark mode variant: text-gray-500
  Context: <span className="text-gray-500">ARR</span>
- Line 297: Color class without dark mode variant: text-gray-500
  Context: <span className="text-gray-500">Churn</span>
- Line 310: Color class without dark mode variant: text-gray-600
  Context: <CardTitle className="text-sm font-medium text-gray-600">
- Line 317: Color class without dark mode variant: text-gray-900
  Context: <div className="text-2xl font-bold text-gray-900">
- Line 320: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500">posts today</div>
- Line 323: Color class without dark mode variant: text-gray-400
  Context: <MessageSquare className="w-4 h-4 text-gray-400 mx-auto" />
- Line 329: Color class without dark mode variant: text-gray-400
  Context: <Heart className="w-4 h-4 text-gray-400 mx-auto" />
- Line 335: Color class without dark mode variant: text-gray-400
  Context: <Image className="w-4 h-4 text-gray-400 mx-auto" />
- Line 348: Color class without dark mode variant: text-gray-600
  Context: <CardTitle className="text-sm font-medium text-gray-600">
- Line 355: Color class without dark mode variant: text-gray-900
  Context: <div className="text-2xl font-bold text-gray-900">
- Line 358: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500">uptime</div>
- Line 361: Color class without dark mode variant: text-gray-500
  Context: <span className="text-gray-500">Response</span>
- Line 367: Color class without dark mode variant: text-gray-500
  Context: <span className="text-gray-500">Errors</span>
- Line 373: Color class without dark mode variant: text-gray-500
  Context: <span className="text-gray-500">Queue</span>
- Line 457: Color class without dark mode variant: bg-green-500
  Context: <Badge className="bg-green-500">
- Line 469: Color class without dark mode variant: bg-gray-50
  Context: className="flex items-start gap-3 p-3 rounded-lg hover:bg-gr
- Line 482: Color class without dark mode variant: text-gray-600
  Context: <span className="text-gray-600 ml-1">{item.action}</span>
- Line 484: Color class without dark mode variant: text-gray-400
  Context: <span className="text-xs text-gray-400">
- Line 489: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500 mt-1">{item.details}</p>
- Line 494: Color class without dark mode variant: text-gray-500
  Context: <div className="text-center py-8 text-gray-500">
- Line 513: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">Active Agents</span>
- Line 521: Color class without dark mode variant: text-gray-600
  Context: <span className="text-gray-600">Tasks Processed</span>
- Line 529: Color class without dark mode variant: text-gray-600
  Context: <span className="text-gray-600">Performance</span>
- Line 541: Color class without dark mode variant: text-gray-500
  Context: <span className="text-gray-500">{layer}</span>
- Line 552: Color class without dark mode variant: text-white
  Context: className="w-full bg-gradient-to-r from-teal-500 to-cyan-500
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/admin/moderation.tsx
- Line 186: Color class without dark mode variant: bg-blue-100
  Context: low: 'bg-blue-100 text-blue-700',
- Line 186: Color class without dark mode variant: text-blue-700
  Context: low: 'bg-blue-100 text-blue-700',
- Line 189: Color class without dark mode variant: bg-red-100
  Context: critical: 'bg-red-100 text-red-700'
- Line 189: Color class without dark mode variant: text-red-700
  Context: critical: 'bg-red-100 text-red-700'
- Line 220: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mt-1">
- Line 234: Color class without dark mode variant: text-white
  Context: <Button className="bg-gradient-to-r from-teal-500 to-cyan-50
- Line 246: Color class without dark mode variant: text-gray-600
  Context: <CardTitle className="text-sm font-medium text-gray-600">
- Line 249: Color class without dark mode variant: text-red-500
  Context: <AlertTriangle className="w-4 h-4 text-red-500" />
- Line 253: Color class without dark mode variant: text-gray-900
  Context: <div className="text-2xl font-bold text-gray-900">
- Line 256: Color class without dark mode variant: text-red-600
  Context: <div className="text-sm text-red-600 mt-2">
- Line 265: Color class without dark mode variant: text-gray-600
  Context: <CardTitle className="text-sm font-medium text-gray-600">
- Line 272: Color class without dark mode variant: text-gray-900
  Context: <div className="text-2xl font-bold text-gray-900">
- Line 275: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500 mt-2">
- Line 284: Color class without dark mode variant: text-gray-600
  Context: <CardTitle className="text-sm font-medium text-gray-600">
- Line 291: Color class without dark mode variant: text-gray-900
  Context: <div className="text-2xl font-bold text-gray-900">
- Line 294: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500 mt-2">
- Line 303: Color class without dark mode variant: text-gray-600
  Context: <CardTitle className="text-sm font-medium text-gray-600">
- Line 310: Color class without dark mode variant: text-gray-900
  Context: <div className="text-2xl font-bold text-gray-900">
- Line 326: Color class without dark mode variant: text-gray-400
  Context: <Search className="absolute left-3 top-1/2 transform -transl
- Line 401: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500">Loading reports...</p>
- Line 406: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500">No reports in this category</p>
- Line 412: Color class without dark mode variant: bg-gray-50
  Context: className="border rounded-lg p-4 hover:bg-gray-50 transition
- Line 428: Color class without dark mode variant: text-gray-500
  Context: <span className="text-sm text-gray-500">@{report.reportedUse
- Line 438: Color class without dark mode variant: text-gray-500
  Context: <div className="flex items-center gap-4 text-sm text-gray-50
- Line 453: Color class without dark mode variant: bg-gray-50
  Context: <div className="bg-gray-50 rounded-lg p-3 mb-3">
- Line 465: Color class without dark mode variant: text-gray-700
  Context: <p className="text-sm text-gray-700 line-clamp-3">
- Line 471: Color class without dark mode variant: bg-gray-200
  Context: <div key={idx} className="w-16 h-16 bg-gray-200 rounded flex
- Line 473: Color class without dark mode variant: text-gray-400
  Context: <Video className="w-6 h-6 text-gray-400" />
- Line 475: Color class without dark mode variant: text-gray-400
  Context: <Image className="w-6 h-6 text-gray-400" />
- Line 480: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-16 h-16 bg-gray-200 rounded flex items-cen
- Line 481: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">
- Line 493: Color class without dark mode variant: text-gray-600
  Context: <span className="text-gray-600">
- Line 496: Color class without dark mode variant: text-gray-600
  Context: <span className="text-gray-600">
- Line 500: Color class without dark mode variant: text-red-600
  Context: <Badge variant="outline" className="text-red-600">
- Line 550: Color class without dark mode variant: text-red-600
  Context: className="text-red-600"
- Line 595: Color class without dark mode variant: bg-red-50
  Context: <div className="p-3 bg-red-50 border border-red-200 rounded-
- Line 596: Color class without dark mode variant: text-red-700
  Context: <p className="text-sm text-red-700">
- Line 610: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-teal-500 to-cyan-500 text-w
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/admin/open-sources.tsx
- Line 160: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-gradient-to-r from-turquoise-500 to-
- Line 391: Color class without dark mode variant: text-white
  Context: className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 
- Line 400: Color class without dark mode variant: text-white
  Context: className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to

### /client/src/pages/admin/projects.tsx
- Line 147: Color class without dark mode variant: text-white
  Context: to_do: 'bg-gradient-to-r from-gray-400 to-gray-500 text-whit
- Line 148: Color class without dark mode variant: text-white
  Context: in_progress: 'bg-gradient-to-r from-turquoise-500 to-ocean-6
- Line 149: Color class without dark mode variant: text-white
  Context: done: 'bg-gradient-to-r from-green-500 to-emerald-600 text-w
- Line 150: Color class without dark mode variant: text-white
  Context: cancelled: 'bg-gradient-to-r from-red-500 to-rose-600 text-w
- Line 154: Color class without dark mode variant: text-gray-800
  Context: low: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-8
- Line 155: Color class without dark mode variant: text-white
  Context: medium: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-
- Line 156: Color class without dark mode variant: text-white
  Context: high: 'bg-gradient-to-r from-orange-500 to-red-500 text-whit
- Line 157: Color class without dark mode variant: text-white
  Context: critical: 'bg-gradient-to-r from-red-600 to-rose-700 text-wh
- Line 180: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-turquoise-500 to-ocean-600 
- Line 381: Color class without dark mode variant: text-white
  Context: className="data-[state=active]:bg-gradient-to-r data-[state=
- Line 388: Color class without dark mode variant: text-white
  Context: className="data-[state=active]:bg-gradient-to-r data-[state=
- Line 395: Color class without dark mode variant: text-white
  Context: className="data-[state=active]:bg-gradient-to-r data-[state=
- Line 402: Color class without dark mode variant: text-white
  Context: className="data-[state=active]:bg-gradient-to-r data-[state=
- Line 409: Color class without dark mode variant: text-white
  Context: className="data-[state=active]:bg-gradient-to-r data-[state=
- Line 488: Color class without dark mode variant: text-blue-600
  Context: <Calendar className="h-10 w-10 text-blue-600" />
- Line 548: Color class without dark mode variant: text-white
  Context: <Target className="h-8 w-8 text-white" />
- Line 597: Color class without dark mode variant: text-white
  Context: <ListTodo className="h-8 w-8 text-white" />
- Line 674: Color class without dark mode variant: border-white
  Context: <thead className="bg-gradient-to-r from-turquoise-500/10 to-
- Line 715: Color class without dark mode variant: text-gray-400
  Context: <span className="text-sm text-gray-400">-</span>
- Line 726: Color class without dark mode variant: text-white
  Context: <Table2 className="h-8 w-8 text-white" />
- Line 748: Color class without dark mode variant: text-white
  Context: <Button className="bg-gradient-to-r from-turquoise-500 to-oc

### /client/src/pages/admin/sprints.tsx
- Line 86: Color class without dark mode variant: bg-gray-500
  Context: planning: 'bg-gray-500',
- Line 87: Color class without dark mode variant: bg-blue-500
  Context: active: 'bg-blue-500',
- Line 88: Color class without dark mode variant: bg-green-500
  Context: completed: 'bg-green-500',
- Line 89: Color class without dark mode variant: bg-red-500
  Context: cancelled: 'bg-red-500'

### /client/src/pages/admin/users.tsx
- Line 245: Color class without dark mode variant: bg-green-500
  Context: return <Badge className="bg-green-500">Verified</Badge>;
- Line 254: Color class without dark mode variant: bg-gray-500
  Context: free: 'bg-gray-500',
- Line 255: Color class without dark mode variant: bg-blue-500
  Context: basic: 'bg-blue-500',
- Line 258: Color class without dark mode variant: bg-red-500
  Context: enterprise: 'bg-red-500'
- Line 262: Color class without dark mode variant: bg-gray-500
  Context: <Badge className={cn(colors[tier as keyof typeof colors] || 
- Line 278: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mt-1">
- Line 292: Color class without dark mode variant: text-white
  Context: <Button className="bg-gradient-to-r from-teal-500 to-cyan-50
- Line 304: Color class without dark mode variant: text-gray-600
  Context: <CardTitle className="text-sm font-medium text-gray-600">
- Line 311: Color class without dark mode variant: text-gray-900
  Context: <div className="text-2xl font-bold text-gray-900">
- Line 324: Color class without dark mode variant: text-gray-600
  Context: <CardTitle className="text-sm font-medium text-gray-600">
- Line 331: Color class without dark mode variant: text-gray-900
  Context: <div className="text-2xl font-bold text-gray-900">
- Line 334: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500 mt-2">
- Line 343: Color class without dark mode variant: text-gray-600
  Context: <CardTitle className="text-sm font-medium text-gray-600">
- Line 350: Color class without dark mode variant: text-gray-900
  Context: <div className="text-2xl font-bold text-gray-900">
- Line 353: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500 mt-2">
- Line 362: Color class without dark mode variant: text-gray-600
  Context: <CardTitle className="text-sm font-medium text-gray-600">
- Line 365: Color class without dark mode variant: text-red-500
  Context: <Ban className="w-4 h-4 text-red-500" />
- Line 369: Color class without dark mode variant: text-gray-900
  Context: <div className="text-2xl font-bold text-gray-900">
- Line 372: Color class without dark mode variant: text-red-600
  Context: <div className="text-sm text-red-600 mt-2">
- Line 385: Color class without dark mode variant: text-gray-400
  Context: <Search className="absolute left-3 top-1/2 transform -transl
- Line 477: Color class without dark mode variant: text-red-600
  Context: className="text-red-600 hover:text-red-700"
- Line 535: Color class without dark mode variant: text-gray-500
  Context: <TableCell colSpan={showBulkActions ? 9 : 8} className="text
- Line 541: Color class without dark mode variant: bg-gray-50
  Context: <TableRow key={user.id} className="hover:bg-gray-50">
- Line 555: Color class without dark mode variant: text-white
  Context: <AvatarFallback className="bg-gradient-to-br from-teal-500 t
- Line 560: Color class without dark mode variant: text-gray-900
  Context: <div className="font-medium text-gray-900">{user.name}</div>
- Line 561: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500">{user.email}</div>
- Line 562: Color class without dark mode variant: text-gray-400
  Context: <div className="text-xs text-gray-400">@{user.username}</div
- Line 577: Color class without dark mode variant: text-gray-600
  Context: <div className="flex items-center gap-1 text-sm text-gray-60
- Line 582: Color class without dark mode variant: text-gray-400
  Context: <span className="text-gray-400">-</span>
- Line 586: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">
- Line 592: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">
- Line 596: Color class without dark mode variant: text-gray-400
  Context: <span className="text-gray-400">Never</span>
- Line 653: Color class without dark mode variant: text-red-600
  Context: <DropdownMenuItem className="text-red-600">
- Line 670: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/auth/forgot-password.tsx
- Line 70: Color class without dark mode variant: bg-white
  Context: <Card className="w-full max-w-md shadow-2xl border-0 glassmo
- Line 75: Color class without dark mode variant: text-gray-600
  Context: className="absolute left-6 top-6 flex items-center gap-2 tex
- Line 85: Color class without dark mode variant: text-white
  Context: <CheckCircle className="text-white w-10 h-10" />
- Line 87: Color class without dark mode variant: text-white
  Context: <Key className="text-white w-10 h-10" />
- Line 102: Color class without dark mode variant: text-gray-600
  Context: <CardDescription className="text-gray-600 mt-2 flex items-ce
- Line 159: Color class without dark mode variant: bg-green-50
  Context: <div className="p-6 bg-green-50 border border-green-200 roun
- Line 169: Color class without dark mode variant: text-gray-600
  Context: <div className="space-y-3 text-sm text-gray-600">
- Line 199: Color class without dark mode variant: border-gray-200
  Context: <div className="mt-8 pt-6 border-t border-gray-200 text-cent
- Line 200: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/auth/login.tsx
- Line 56: Color class without dark mode variant: bg-white
  Context: <Card className="w-full max-w-md shadow-2xl border-0 glassmo
- Line 61: Color class without dark mode variant: text-gray-600
  Context: className="absolute left-6 top-6 flex items-center gap-2 tex
- Line 70: Color class without dark mode variant: text-white
  Context: <Heart className="text-white w-10 h-10 animate-pulse" />
- Line 79: Color class without dark mode variant: text-gray-600
  Context: <CardDescription className="text-gray-600 mt-2 flex items-ce
- Line 116: Color class without dark mode variant: text-gray-600
  Context: <label className="flex items-center gap-2 text-sm text-gray-
- Line 120: Color class without dark mode variant: border-gray-300
  Context: className="rounded border-gray-300 text-teal-600 focus:ring-
- Line 147: Color class without dark mode variant: border-gray-200
  Context: <div className="w-full border-t border-gray-200"></div>
- Line 150: Color class without dark mode variant: bg-white
  Context: <span className="px-4 bg-white text-gray-500">{t('auth.login
- Line 150: Color class without dark mode variant: text-gray-500
  Context: <span className="px-4 bg-white text-gray-500">{t('auth.login
- Line 198: Color class without dark mode variant: text-blue-600
  Context: <svg className="h-5 w-5 text-blue-600" fill="currentColor" v
- Line 205: Color class without dark mode variant: border-gray-200
  Context: <div className="mt-8 pt-6 border-t border-gray-200 text-cent
- Line 206: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/auth/register.tsx
- Line 68: Color class without dark mode variant: bg-white
  Context: <Card className="w-full max-w-md shadow-2xl border-0 glassmo
- Line 73: Color class without dark mode variant: text-gray-600
  Context: className="absolute left-6 top-6 flex items-center gap-2 tex
- Line 82: Color class without dark mode variant: text-white
  Context: <Users className="text-white w-10 h-10" />
- Line 93: Color class without dark mode variant: text-gray-600
  Context: <CardDescription className="text-gray-600 mt-2">
- Line 197: Color class without dark mode variant: border-gray-200
  Context: <div className="w-full border-t border-gray-200"></div>
- Line 200: Color class without dark mode variant: bg-white
  Context: <span className="px-4 bg-white text-gray-500">{t('auth.regis
- Line 200: Color class without dark mode variant: text-gray-500
  Context: <span className="px-4 bg-white text-gray-500">{t('auth.regis
- Line 248: Color class without dark mode variant: text-blue-600
  Context: <svg className="h-5 w-5 text-blue-600" fill="currentColor" v
- Line 255: Color class without dark mode variant: border-gray-200
  Context: <div className="mt-8 pt-6 border-t border-gray-200 text-cent
- Line 256: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/auth/reset-password.tsx
- Line 106: Color class without dark mode variant: bg-white
  Context: <Card className="w-full max-w-md shadow-2xl border-0 glassmo
- Line 111: Color class without dark mode variant: text-white
  Context: <CheckCircle className="text-white w-10 h-10" />
- Line 113: Color class without dark mode variant: text-white
  Context: <Lock className="text-white w-10 h-10" />
- Line 128: Color class without dark mode variant: text-gray-600
  Context: <CardDescription className="text-gray-600 mt-2 flex items-ce
- Line 195: Color class without dark mode variant: bg-green-50
  Context: <div className="p-6 bg-green-50 border border-green-200 roun
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/billing.tsx
- Line 102: Color class without dark mode variant: bg-green-100
  Context: return <Badge className="bg-green-100 text-green-800">Active
- Line 104: Color class without dark mode variant: bg-red-100
  Context: return <Badge className="bg-red-100 text-red-800">Canceled</
- Line 104: Color class without dark mode variant: text-red-800
  Context: return <Badge className="bg-red-100 text-red-800">Canceled</
- Line 108: Color class without dark mode variant: bg-blue-100
  Context: return <Badge className="bg-blue-100 text-blue-800">Trial</B
- Line 108: Color class without dark mode variant: text-blue-800
  Context: return <Badge className="bg-blue-100 text-blue-800">Trial</B
- Line 135: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mt-2">Manage your subscription a
- Line 156: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Plan</p>
- Line 160: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Next Billing Date</p>
- Line 168: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Monthly Cost</p>
- Line 272: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-full bg-gray-200 rounded-full h-2">
- Line 281: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-full bg-gray-200 rounded-full h-2">
- Line 290: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-full bg-gray-200 rounded-full h-2">
- Line 322: Color class without dark mode variant: text-gray-500
  Context: <td colSpan={5} className="text-center p-8 text-gray-500">
- Line 336: Color class without dark mode variant: bg-green-100
  Context: <Badge className="bg-green-100 text-green-800">
- Line 341: Color class without dark mode variant: bg-red-100
  Context: <Badge className="bg-red-100 text-red-800">
- Line 341: Color class without dark mode variant: text-red-800
  Context: <Badge className="bg-red-100 text-red-800">
- Line 385: Color class without dark mode variant: text-gray-500
  Context: <div className="text-center p-8 text-gray-500">
- Line 386: Color class without dark mode variant: text-gray-300
  Context: <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300"
- Line 399: Color class without dark mode variant: text-gray-400
  Context: <CreditCard className="h-8 w-8 text-gray-400" />
- Line 404: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">
- Line 409: Color class without dark mode variant: bg-blue-100
  Context: <Badge className="bg-blue-100 text-blue-800">Default</Badge>
- Line 409: Color class without dark mode variant: text-blue-800
  Context: <Badge className="bg-blue-100 text-blue-800">Default</Badge>
- Line 415: Color class without dark mode variant: text-red-600
  Context: className="text-red-600"
- Line 437: Color class without dark mode variant: bg-gray-50
  Context: <div key={payment.id} className="flex items-center justify-b
- Line 442: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">
- Line 457: Color class without dark mode variant: text-gray-500
  Context: <div className="text-center p-8 text-gray-500">
- Line 473: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/code-of-conduct.tsx
- Line 90: Color class without dark mode variant: text-white
  Context: <span className="text-white text-xl">🌱</span>
- Line 96: Color class without dark mode variant: text-gray-600
  Context: <p className="text-xl text-gray-600 max-w-2xl mx-auto leadin
- Line 99: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">Effective Date: June 27
- Line 105: Color class without dark mode variant: text-gray-700
  Context: <p className="text-lg text-gray-700 leading-relaxed text-cen
- Line 126: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 leading-relaxed">
- Line 141: Color class without dark mode variant: text-gray-700
  Context: <FormLabel className="text-sm font-medium text-gray-700">
- Line 156: Color class without dark mode variant: bg-blue-100
  Context: <div className="p-3 bg-blue-100 rounded-full group-hover:bg-
- Line 157: Color class without dark mode variant: text-blue-600
  Context: <Heart className="w-6 h-6 text-blue-600" />
- Line 159: Color class without dark mode variant: text-blue-700
  Context: <CardTitle className="text-xl text-blue-700">Keep It Friendl
- Line 163: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 leading-relaxed">
- Line 170: Color class without dark mode variant: bg-blue-50
  Context: <FormItem className="flex flex-row items-center space-x-3 sp
- Line 178: Color class without dark mode variant: text-gray-700
  Context: <FormLabel className="text-sm font-medium text-gray-700">
- Line 193: Color class without dark mode variant: bg-green-100
  Context: <div className="p-3 bg-green-100 rounded-full group-hover:bg
- Line 200: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 leading-relaxed">
- Line 207: Color class without dark mode variant: bg-green-50
  Context: <FormItem className="flex flex-row items-center space-x-3 sp
- Line 215: Color class without dark mode variant: text-gray-700
  Context: <FormLabel className="text-sm font-medium text-gray-700">
- Line 237: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 leading-relaxed">
- Line 252: Color class without dark mode variant: text-gray-700
  Context: <FormLabel className="text-sm font-medium text-gray-700">
- Line 274: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 leading-relaxed">
- Line 289: Color class without dark mode variant: text-gray-700
  Context: <FormLabel className="text-sm font-medium text-gray-700">
- Line 311: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 leading-relaxed">
- Line 326: Color class without dark mode variant: text-gray-700
  Context: <FormLabel className="text-sm font-medium text-gray-700">
- Line 341: Color class without dark mode variant: text-gray-800
  Context: <CardTitle className="text-2xl text-gray-800">Final Agreemen
- Line 342: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Please confirm you agree to all
- Line 349: Color class without dark mode variant: bg-gray-50
  Context: <FormItem className="flex flex-row items-start space-x-3 spa
- Line 349: Color class without dark mode variant: border-gray-300
  Context: <FormItem className="flex flex-row items-start space-x-3 spa
- Line 357: Color class without dark mode variant: text-gray-800
  Context: <FormLabel className="text-base font-medium text-gray-800">
- Line 360: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">
- Line 378: Color class without dark mode variant: text-white
  Context: className="relative w-full sm:w-auto min-w-[300px] h-14 bg-g
- Line 383: Color class without dark mode variant: border-white
  Context: <div className="w-5 h-5 border-2 border-white border-t-trans
- Line 396: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 mt-4">
- Line 406: Color class without dark mode variant: text-gray-800
  Context: <h3 className="text-lg font-semibold text-gray-800 mb-2">Que
- Line 407: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">
- Line 408: Color class without dark mode variant: text-blue-600
  Context: Contact us at <span className="font-medium text-blue-600">su
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/community.tsx
- Line 23: Color class without dark mode variant: text-white
  Context: <Users className="h-8 w-8 text-white" />
- Line 26: Color class without dark mode variant: text-white
  Context: <Heart className="h-8 w-8 text-white" />
- Line 29: Color class without dark mode variant: text-white
  Context: <Globe className="h-8 w-8 text-white" />
- Line 35: Color class without dark mode variant: text-gray-600
  Context: <p className="text-xl text-gray-600 max-w-3xl mx-auto">
- Line 44: Color class without dark mode variant: text-white
  Context: <div className="absolute top-0 right-0 px-3 py-1 bg-gradient
- Line 50: Color class without dark mode variant: text-white
  Context: <Globe className="h-10 w-10 text-white animate-pulse" />
- Line 53: Color class without dark mode variant: text-white
  Context: <MapPin className="h-3 w-3 text-white" />
- Line 56: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-xl font-bold text-gray-900 mb-3 group-ho
- Line 57: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 leading-relaxed">Interactive glo
- Line 65: Color class without dark mode variant: bg-white
  Context: <div className="group glassmorphic-card bg-white/70 backdrop
- Line 65: Color class without dark mode variant: border-white
  Context: <div className="group glassmorphic-card bg-white/70 backdrop
- Line 69: Color class without dark mode variant: text-white
  Context: <MessageCircle className="h-10 w-10 text-white" />
- Line 72: Color class without dark mode variant: text-white
  Context: <Sparkles className="h-3 w-3 text-white" />
- Line 75: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-xl font-bold text-gray-900 mb-3 group-ho
- Line 76: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 leading-relaxed">Connect with da
- Line 82: Color class without dark mode variant: bg-white
  Context: <div className="group glassmorphic-card bg-white/70 backdrop
- Line 82: Color class without dark mode variant: border-white
  Context: <div className="group glassmorphic-card bg-white/70 backdrop
- Line 86: Color class without dark mode variant: text-white
  Context: <Calendar className="h-10 w-10 text-white" />
- Line 89: Color class without dark mode variant: text-white
  Context: <MapPin className="h-3 w-3 text-white" />
- Line 92: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-xl font-bold text-gray-900 mb-3 group-ho
- Line 93: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 leading-relaxed">Find milongas, 
- Line 99: Color class without dark mode variant: bg-white
  Context: <div className="group glassmorphic-card bg-white/70 backdrop
- Line 99: Color class without dark mode variant: border-white
  Context: <div className="group glassmorphic-card bg-white/70 backdrop
- Line 103: Color class without dark mode variant: text-white
  Context: <Users className="h-10 w-10 text-white" />
- Line 106: Color class without dark mode variant: text-white
  Context: <Heart className="h-3 w-3 text-white" />
- Line 109: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-xl font-bold text-gray-900 mb-3 group-ho
- Line 110: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 leading-relaxed">Showcase your t
- Line 117: Color class without dark mode variant: bg-white
  Context: <div className="glassmorphic-card bg-white/70 backdrop-blur-
- Line 117: Color class without dark mode variant: border-white
  Context: <div className="glassmorphic-card bg-white/70 backdrop-blur-
- Line 122: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 text-lg">
- Line 131: Color class without dark mode variant: text-white
  Context: <Globe className="h-6 w-6 text-white" />
- Line 135: Color class without dark mode variant: text-gray-900
  Context: <h4 className="text-xl font-bold text-gray-900 mb-2 group-ho
- Line 136: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 leading-relaxed">Connect with pa
- Line 143: Color class without dark mode variant: text-white
  Context: <Sparkles className="h-6 w-6 text-white" />
- Line 147: Color class without dark mode variant: text-gray-900
  Context: <h4 className="text-xl font-bold text-gray-900 mb-2 group-ho
- Line 148: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 leading-relaxed">Stay connected 
- Line 155: Color class without dark mode variant: text-white
  Context: <MapPin className="h-6 w-6 text-white" />
- Line 159: Color class without dark mode variant: text-gray-900
  Context: <h4 className="text-xl font-bold text-gray-900 mb-2 group-ho
- Line 160: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 leading-relaxed">Find and join l
- Line 167: Color class without dark mode variant: text-white
  Context: <Heart className="h-6 w-6 text-white" />
- Line 171: Color class without dark mode variant: text-gray-900
  Context: <h4 className="text-xl font-bold text-gray-900 mb-2 group-ho
- Line 172: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 leading-relaxed">Learn from mast
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/create-community.tsx
- Line 124: Color class without dark mode variant: text-gray-600
  Context: className="flex items-center gap-2 text-gray-600 hover:text-
- Line 131: Color class without dark mode variant: text-white
  Context: <div className="p-3 bg-gradient-to-br from-purple-500 to-pin
- Line 138: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">
- Line 147: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-xl shadow-sm p-6">
- Line 150: Color class without dark mode variant: bg-gray-100
  Context: <div className="w-full h-48 bg-gray-100 rounded-xl overflow-
- Line 158: Color class without dark mode variant: text-gray-400
  Context: <div className="flex flex-col items-center justify-center h-
- Line 175: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-xl shadow-sm p-6 space-y-6"
- Line 286: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-xl shadow-sm p-6">
- Line 320: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-purple-600 to-pink-600 text
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/database-security.tsx
- Line 187: Color class without dark mode variant: text-red-600
  Context: return 'text-red-600';
- Line 209: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-3xl font-bold text-gray-900 flex items-c
- Line 213: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mt-2">Monitor and manage databas
- Line 218: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-indigo-600 to-purple-600 ho
- Line 230: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">RLS Coverage</p>
- Line 231: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">
- Line 245: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Audit Logging</p>
- Line 246: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">{mockMetrics
- Line 247: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Critical tables</p>
- Line 256: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Health Status</p>
- Line 257: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">
- Line 260: Color class without dark mode variant: text-red-600
  Context: <span className="text-red-600">Issues</span>
- Line 263: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">
- Line 274: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">GDPR Status</p>
- Line 275: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">
- Line 278: Color class without dark mode variant: text-red-600
  Context: <span className="text-red-600">Review</span>
- Line 281: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">All functions ready</p>
- Line 294: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Connections</p>
- Line 295: Color class without dark mode variant: text-gray-900
  Context: <p className="text-lg font-bold text-gray-900">
- Line 306: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Cache Hit Ratio</p>
- Line 307: Color class without dark mode variant: text-gray-900
  Context: <p className="text-lg font-bold text-gray-900">{mockMetrics.
- Line 316: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Database Size</p>
- Line 317: Color class without dark mode variant: text-gray-900
  Context: <p className="text-lg font-bold text-gray-900">{mockMetrics.
- Line 336: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4">Row
- Line 340: Color class without dark mode variant: bg-gray-50
  Context: className="border rounded-lg p-4 hover:bg-gray-50">
- Line 344: Color class without dark mode variant: text-gray-900
  Context: <h4 className="font-medium text-gray-900">{policy.policy_nam
- Line 350: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mb-2">
- Line 354: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">
- Line 373: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4">Rec
- Line 376: Color class without dark mode variant: bg-gray-50
  Context: <div key={log.id} className="flex items-center justify-betwe
- Line 379: Color class without dark mode variant: bg-green-100
  Context: log.action === 'INSERT' ? 'bg-green-100' :
- Line 380: Color class without dark mode variant: bg-blue-100
  Context: log.action === 'UPDATE' ? 'bg-blue-100' :
- Line 381: Color class without dark mode variant: bg-red-100
  Context: 'bg-red-100'
- Line 385: Color class without dark mode variant: text-blue-600
  Context: log.action === 'UPDATE' ? 'text-blue-600' :
- Line 386: Color class without dark mode variant: text-red-600
  Context: 'text-red-600'
- Line 390: Color class without dark mode variant: text-gray-900
  Context: <p className="font-medium text-gray-900">
- Line 393: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">
- Line 416: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4">Tab
- Line 421: Color class without dark mode variant: text-gray-700
  Context: <th className="text-left py-2 px-4 font-medium text-gray-700
- Line 422: Color class without dark mode variant: text-gray-700
  Context: <th className="text-center py-2 px-4 font-medium text-gray-7
- Line 423: Color class without dark mode variant: text-gray-700
  Context: <th className="text-center py-2 px-4 font-medium text-gray-7
- Line 424: Color class without dark mode variant: text-gray-700
  Context: <th className="text-center py-2 px-4 font-medium text-gray-7
- Line 425: Color class without dark mode variant: text-gray-700
  Context: <th className="text-center py-2 px-4 font-medium text-gray-7
- Line 430: Color class without dark mode variant: bg-gray-50
  Context: <tr key={table.name} className="border-b hover:bg-gray-50">
- Line 433: Color class without dark mode variant: text-gray-500
  Context: <Database className="w-4 h-4 text-gray-500" />
- Line 448: Color class without dark mode variant: text-gray-400
  Context: <AlertCircle className="w-5 h-5 text-gray-400 mx-auto" />
- Line 479: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4 flex
- Line 483: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mb-4">
- Line 489: Color class without dark mode variant: text-gray-700
  Context: <label className="block text-sm font-medium text-gray-700 mb
- Line 501: Color class without dark mode variant: text-white
  Context: className="w-full bg-gradient-to-r from-indigo-600 to-purple
- Line 509: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4 flex
- Line 510: Color class without dark mode variant: text-red-600
  Context: <Key className="w-5 h-5 text-red-600" />
- Line 513: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mb-4">
- Line 519: Color class without dark mode variant: text-gray-700
  Context: <label className="block text-sm font-medium text-gray-700 mb
- Line 535: Color class without dark mode variant: text-red-600
  Context: <p className="text-xs text-red-600 text-center">
- Line 543: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4">GDP
- Line 547: Color class without dark mode variant: text-gray-700
  Context: <span className="text-gray-700">Data export function impleme
- Line 551: Color class without dark mode variant: text-gray-700
  Context: <span className="text-gray-700">Data anonymization function 
- Line 555: Color class without dark mode variant: text-gray-700
  Context: <span className="text-gray-700">Audit logging enabled for co
- Line 559: Color class without dark mode variant: text-gray-700
  Context: <span className="text-gray-700">User consent tracking implem
- Line 563: Color class without dark mode variant: text-gray-700
  Context: <span className="text-gray-700">Privacy policy and terms upd
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/enhanced-timeline-v2.tsx
- Line 245: Color class without dark mode variant: bg-white
  Context: <Card className="relative p-6 space-y-4 hover:shadow-2xl tra
- Line 256: Color class without dark mode variant: text-white
  Context: <AvatarFallback className="bg-gradient-to-br from-turquoise-
- Line 261: Color class without dark mode variant: border-white
  Context: <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-eme
- Line 266: Color class without dark mode variant: text-gray-900
  Context: <h3 className="font-bold text-lg text-gray-900 group-hover:t
- Line 269: Color class without dark mode variant: text-gray-500
  Context: <span className="text-sm text-gray-500">@{memory.userUsernam
- Line 290: Color class without dark mode variant: text-gray-500
  Context: <div className="flex items-center gap-2 text-sm text-gray-50
- Line 328: Color class without dark mode variant: text-gray-800
  Context: <p className="text-gray-800 leading-relaxed whitespace-pre-w
- Line 359: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 text-whit
- Line 360: Color class without dark mode variant: text-gray-700
  Context: : 'text-gray-700 hover:bg-gradient-to-r hover:from-turquoise
- Line 368: Color class without dark mode variant: text-gray-700
  Context: className="flex items-center gap-2 px-4 py-2.5 rounded-xl te
- Line 411: Color class without dark mode variant: text-red-600
  Context: className="text-red-600"
- Line 450: Color class without dark mode variant: bg-gray-100
  Context: <div className="bg-gray-100 rounded-lg p-3">
- Line 454: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500 mt-1">
- Line 467: Color class without dark mode variant: bg-black
  Context: <div className="fixed inset-0 bg-black/50 flex items-center 
- Line 468: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-xl p-6 w-96 max-w-[90vw]" o
- Line 473: Color class without dark mode variant: bg-gray-50
  Context: className="w-full p-3 text-left hover:bg-gray-50 rounded-lg 
- Line 476: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Share this memory on yo
- Line 484: Color class without dark mode variant: bg-gray-50
  Context: className="w-full p-3 text-left hover:bg-gray-50 rounded-lg 
- Line 487: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Add your thoughts when 
- Line 496: Color class without dark mode variant: bg-gray-50
  Context: className="w-full p-3 text-left hover:bg-gray-50 rounded-lg 
- Line 499: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Copy memory link to cli
- Line 676: Color class without dark mode variant: text-white
  Context: <Sparkles className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
- Line 682: Color class without dark mode variant: text-gray-700
  Context: <p className="text-sm sm:text-base text-gray-700 ml-0 sm:ml-
- Line 709: Color class without dark mode variant: text-gray-800
  Context: <h3 className="font-semibold text-gray-800 mb-2">Upcoming Ev
- Line 710: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Event integration comin
- Line 723: Color class without dark mode variant: border-white
  Context: <Card className="relative glassmorphic-card p-6 space-y-4 ro
- Line 775: Color class without dark mode variant: text-white
  Context: <Sparkles className="h-8 w-8 text-white" />
- Line 777: Color class without dark mode variant: text-gray-800
  Context: <h3 className="text-xl font-semibold text-gray-800 mb-2">No 
- Line 778: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Start sharing your precious Tan
- Line 789: Color class without dark mode variant: text-gray-800
  Context: <h3 className="font-semibold text-gray-800 mb-4">Upcoming Ev
- Line 790: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Event integration comin

### /client/src/pages/enhanced-timeline.tsx
- Line 129: Color class without dark mode variant: bg-gray-50
  Context: <div className="min-h-screen bg-gray-50">
- Line 146: Color class without dark mode variant: text-red-600
  Context: <Loader2 className="h-8 w-8 animate-spin text-red-600" />
- Line 149: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white">
- Line 151: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500">No posts available</p>
- Line 157: Color class without dark mode variant: bg-green-100
  Context: <div className="bg-green-100 border-4 border-green-600 p-4 r
- Line 188: Color class without dark mode variant: bg-white
  Context: <div className="bg-white/95 backdrop-blur-xl rounded-2xl sha
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/event-detail.tsx
- Line 205: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-64 bg-gray-200 rounded"></div>
- Line 206: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-8 bg-gray-200 rounded w-3/4"></div>
- Line 207: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-4 bg-gray-200 rounded w-1/2"></div>
- Line 220: Color class without dark mode variant: text-gray-400
  Context: <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4
- Line 222: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mb-4">This event may have been d
- Line 250: Color class without dark mode variant: text-white
  Context: <Badge className="bg-cyan-500/90 text-white">
- Line 256: Color class without dark mode variant: text-white
  Context: <Badge className="bg-turquoise-500/90 text-white">
- Line 262: Color class without dark mode variant: bg-white
  Context: <Badge className="bg-white/90 text-gray-800">
- Line 262: Color class without dark mode variant: text-gray-800
  Context: <Badge className="bg-white/90 text-gray-800">
- Line 273: Color class without dark mode variant: bg-white
  Context: className="bg-white/20 backdrop-blur-sm text-white hover:bg-
- Line 273: Color class without dark mode variant: text-white
  Context: className="bg-white/20 backdrop-blur-sm text-white hover:bg-
- Line 296: Color class without dark mode variant: bg-white
  Context: className="bg-white/20 backdrop-blur-sm text-white hover:bg-
- Line 296: Color class without dark mode variant: text-white
  Context: className="bg-white/20 backdrop-blur-sm text-white hover:bg-
- Line 304: Color class without dark mode variant: bg-red-500
  Context: className="bg-red-500/20 backdrop-blur-sm text-white hover:b
- Line 304: Color class without dark mode variant: text-white
  Context: className="bg-red-500/20 backdrop-blur-sm text-white hover:b
- Line 319: Color class without dark mode variant: text-white
  Context: <h1 className="text-3xl lg:text-4xl font-bold text-white mb-
- Line 322: Color class without dark mode variant: text-white
  Context: <div className="flex items-center gap-4 text-white/90">
- Line 348: Color class without dark mode variant: text-gray-700
  Context: <p className="text-gray-700">{event.description}</p>
- Line 352: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 mb-1">Date & Time</p>
- Line 357: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">
- Line 364: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 mb-1">Level</p>
- Line 463: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500 text-center py-8">
- Line 479: Color class without dark mode variant: text-gray-500
  Context: : 'text-gray-500 hover:text-gray-700'
- Line 490: Color class without dark mode variant: text-gray-500
  Context: : 'text-gray-500 hover:text-gray-700'
- Line 501: Color class without dark mode variant: text-gray-500
  Context: : 'text-gray-500 hover:text-gray-700'
- Line 528: Color class without dark mode variant: text-gray-500
  Context: <span className="text-sm text-gray-500">
- Line 532: Color class without dark mode variant: text-gray-700
  Context: <p className="text-gray-700">{post.content}</p>
- Line 547: Color class without dark mode variant: text-gray-400
  Context: <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb
- Line 548: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500">
- Line 566: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 text-whit
- Line 579: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 text-whit
- Line 592: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500 text-whit
- Line 618: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">Page Views</p>
- Line 624: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">Shares</p>
- Line 632: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">Conversion Rate</p>
- Line 676: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">per ticket</p>
- Line 688: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 text-center">
- Line 816: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">@{event.user?.username}
- Line 837: Color class without dark mode variant: text-gray-500
  Context: <span className="text-sm text-gray-500">Capacity</span>
- Line 843: Color class without dark mode variant: text-gray-500
  Context: <span className="text-sm text-gray-500">Type</span>
- Line 850: Color class without dark mode variant: text-gray-500
  Context: <span className="text-sm text-gray-500">Frequency</span>
- Line 918: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500 text-center">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/feature-navigation.tsx
- Line 170: Color class without dark mode variant: bg-green-500
  Context: return <Badge className="bg-green-500 text-white">Implemente
- Line 170: Color class without dark mode variant: text-white
  Context: return <Badge className="bg-green-500 text-white">Implemente
- Line 172: Color class without dark mode variant: text-white
  Context: return <Badge className="bg-yellow-500 text-white">Partial</
- Line 174: Color class without dark mode variant: bg-red-500
  Context: return <Badge className="bg-red-500 text-white">Missing</Bad
- Line 174: Color class without dark mode variant: text-white
  Context: return <Badge className="bg-red-500 text-white">Missing</Bad
- Line 187: Color class without dark mode variant: text-red-500
  Context: return <XCircle className="w-5 h-5 text-red-500" />;
- Line 200: Color class without dark mode variant: bg-gray-50
  Context: <div className="min-h-screen bg-gray-50 p-6">
- Line 203: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-3xl font-bold text-gray-900 mb-2">
- Line 206: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">
- Line 213: Color class without dark mode variant: bg-green-50
  Context: <Card className="bg-green-50 border-green-200">
- Line 225: Color class without dark mode variant: bg-red-50
  Context: <Card className="bg-red-50 border-red-200">
- Line 227: Color class without dark mode variant: text-red-700
  Context: <div className="text-3xl font-bold text-red-700">{stats.miss
- Line 228: Color class without dark mode variant: text-red-600
  Context: <div className="text-sm text-red-600">Missing</div>
- Line 240: Color class without dark mode variant: bg-gray-100
  Context: <div className="p-2 bg-gray-100 rounded-lg">
- Line 249: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">{feature.description}</
- Line 255: Color class without dark mode variant: text-gray-700
  Context: <p className="text-sm font-medium text-gray-700">Issues:</p>
- Line 256: Color class without dark mode variant: text-gray-600
  Context: <ul className="text-sm text-gray-600 list-disc list-inside">
- Line 266: Color class without dark mode variant: text-gray-700
  Context: <p className="text-sm font-medium text-gray-700">Required Fe
- Line 267: Color class without dark mode variant: text-gray-600
  Context: <ul className="text-sm text-gray-600 list-disc list-inside">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/friends.tsx
- Line 219: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Loading friends...</p>
- Line 233: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-3xl font-bold text-gray-900">Friends</h1
- Line 234: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mt-1">Connect with dancers in yo
- Line 238: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-turquoise-400 to-cyan-500 h
- Line 251: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">{friends.len
- Line 252: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Total Friends</p>
- Line 258: Color class without dark mode variant: text-blue-600
  Context: <Clock className="w-8 h-8 text-blue-600" />
- Line 260: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">
- Line 263: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Pending Requests</p>
- Line 271: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">
- Line 274: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Mutual Friends</p>
- Line 283: Color class without dark mode variant: text-gray-400
  Context: <Search className="absolute left-3 top-1/2 transform -transl
- Line 311: Color class without dark mode variant: text-gray-600
  Context: : 'text-gray-600 hover:text-gray-900'
- Line 317: Color class without dark mode variant: text-white
  Context: <Badge className="ml-2 bg-rose-500 text-white">
- Line 335: Color class without dark mode variant: text-white
  Context: <div className="w-12 h-12 bg-gradient-to-r from-turquoise-40
- Line 339: Color class without dark mode variant: text-gray-900
  Context: <h4 className="font-semibold text-gray-900">
- Line 342: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">@{request.friend_user?.
- Line 343: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 flex items-center gap-1 
- Line 348: Color class without dark mode variant: bg-gray-50
  Context: <div className="mt-3 p-3 bg-gray-50 rounded-lg">
- Line 349: Color class without dark mode variant: text-gray-700
  Context: <p className="text-sm text-gray-700 italic">"{request.sender
- Line 365: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-green-600 to-emerald-600 ho
- Line 384: Color class without dark mode variant: text-gray-400
  Context: <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
- Line 385: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">No pending friend requests</p>
- Line 400: Color class without dark mode variant: text-white
  Context: <div className="w-12 h-12 bg-gradient-to-r from-turquoise-40
- Line 404: Color class without dark mode variant: bg-green-500
  Context: <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-5
- Line 404: Color class without dark mode variant: border-white
  Context: <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-5
- Line 408: Color class without dark mode variant: text-gray-900
  Context: <h4 className="font-semibold text-gray-900">{friend.name}</h
- Line 409: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">@{friend.username}</p>
- Line 410: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 flex items-center gap-1 
- Line 422: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500 mt-2">
- Line 427: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500 mt-1">
- Line 443: Color class without dark mode variant: text-gray-400
  Context: <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
- Line 444: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">
- Line 458: Color class without dark mode variant: bg-black
  Context: <div className="fixed inset-0 bg-black/50 flex items-center 
- Line 460: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-xl font-bold text-gray-900 mb-4">Send Fr
- Line 464: Color class without dark mode variant: text-gray-700
  Context: <label className="block text-sm font-medium text-gray-700 mb
- Line 484: Color class without dark mode variant: bg-gray-50
  Context: : 'hover:bg-gray-50'
- Line 490: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">@{user.username}</p>
- Line 491: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">{user.location}</p>
- Line 507: Color class without dark mode variant: text-gray-700
  Context: <label className="block text-sm font-medium text-gray-700 mb
- Line 524: Color class without dark mode variant: text-white
  Context: className="flex-1 bg-gradient-to-r from-turquoise-500 to-cya
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/global-statistics.tsx
- Line 121: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-3xl font-bold text-gray-900">Global Tang
- Line 122: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mt-2">Comprehensive overview of 
- Line 132: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white
- Line 146: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Total Users</p>
- Line 147: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">{formatNumbe
- Line 160: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Active Users</p>
- Line 161: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">{formatNumbe
- Line 174: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Total Events</p>
- Line 175: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">{formatNumbe
- Line 188: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Communities</p>
- Line 189: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">{formatNumbe
- Line 202: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Total Posts</p>
- Line 203: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">{formatNumbe
- Line 216: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Friendships</p>
- Line 217: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">{formatNumbe
- Line 244: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4 flex
- Line 251: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">{month.month}</span>
- Line 253: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-32 bg-gray-200 rounded-full h-2">
- Line 259: Color class without dark mode variant: text-gray-900
  Context: <span className="text-sm font-medium text-gray-900 w-12 text
- Line 270: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4 flex
- Line 277: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">{role.role}</span>
- Line 279: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-32 bg-gray-200 rounded-full h-2">
- Line 285: Color class without dark mode variant: text-gray-900
  Context: <span className="text-sm font-medium text-gray-900 w-12 text
- Line 297: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4">Eng
- Line 299: Color class without dark mode variant: bg-gray-50
  Context: <div className="text-center p-4 bg-gray-50 rounded-lg">
- Line 301: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mt-1">Avg Posts/User</p>
- Line 303: Color class without dark mode variant: bg-gray-50
  Context: <div className="text-center p-4 bg-gray-50 rounded-lg">
- Line 305: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mt-1">Avg Events/User</p
- Line 307: Color class without dark mode variant: bg-gray-50
  Context: <div className="text-center p-4 bg-gray-50 rounded-lg">
- Line 309: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mt-1">Avg Friends/User</
- Line 311: Color class without dark mode variant: bg-gray-50
  Context: <div className="text-center p-4 bg-gray-50 rounded-lg">
- Line 313: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mt-1">Active Users</p>
- Line 322: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4 flex
- Line 328: Color class without dark mode variant: bg-gray-50
  Context: <div key={city.city} className="flex items-center justify-be
- Line 330: Color class without dark mode variant: text-white
  Context: <div className={`w-10 h-10 rounded-full flex items-center ju
- Line 338: Color class without dark mode variant: text-gray-900
  Context: <p className="font-semibold text-gray-900">{city.city}</p>
- Line 339: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">
- Line 346: Color class without dark mode variant: text-gray-600
  Context: <p className="text-xs text-gray-600">of total users</p>
- Line 357: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4 flex
- Line 363: Color class without dark mode variant: bg-gray-50
  Context: <div key={dancer.username} className="flex items-center just
- Line 365: Color class without dark mode variant: text-white
  Context: <div className={`w-10 h-10 rounded-full flex items-center ju
- Line 373: Color class without dark mode variant: text-gray-900
  Context: <p className="font-semibold text-gray-900">{dancer.name}</p>
- Line 374: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">@{dancer.username}</p>
- Line 386: Color class without dark mode variant: text-gray-600
  Context: <p className="text-xs text-gray-600">followers</p>
- Line 397: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4 flex
- Line 404: Color class without dark mode variant: text-gray-700
  Context: <span className="text-sm font-medium text-gray-700 w-12">{mo
- Line 406: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-full bg-gray-200 rounded-full h-6">
- Line 411: Color class without dark mode variant: text-white
  Context: <span className="text-xs text-white font-medium">{month.coun
- Line 425: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4">Act
- Line 430: Color class without dark mode variant: text-gray-700
  Context: <span className="text-sm font-medium text-gray-700">Peak Act
- Line 437: Color class without dark mode variant: text-gray-700
  Context: <span className="text-sm font-medium text-gray-700">Most Act
- Line 444: Color class without dark mode variant: text-gray-700
  Context: <span className="text-sm font-medium text-gray-700">Avg Sess
- Line 452: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-4">Con
- Line 454: Color class without dark mode variant: bg-green-50
  Context: <div className="flex items-center justify-between p-3 bg-gre
- Line 457: Color class without dark mode variant: text-gray-700
  Context: <span className="text-sm font-medium text-gray-700">Avg Like
- Line 461: Color class without dark mode variant: bg-blue-50
  Context: <div className="flex items-center justify-between p-3 bg-blu
- Line 463: Color class without dark mode variant: text-blue-600
  Context: <Users className="w-5 h-5 text-blue-600" />
- Line 464: Color class without dark mode variant: text-gray-700
  Context: <span className="text-sm font-medium text-gray-700">Avg Even
- Line 466: Color class without dark mode variant: text-blue-600
  Context: <span className="text-sm font-bold text-blue-600">67.3%</spa
- Line 471: Color class without dark mode variant: text-gray-700
  Context: <span className="text-sm font-medium text-gray-700">User Sat
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/group.tsx
- Line 99: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 text-lg">Loading group...</p>
- Line 111: Color class without dark mode variant: text-gray-800
  Context: <h1 className="text-2xl font-bold text-gray-800 mb-4">Group 
- Line 112: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">The group you're looking for do
- Line 132: Color class without dark mode variant: text-white
  Context: <h1 className="text-4xl font-bold text-white mb-2">{group.na
- Line 133: Color class without dark mode variant: text-white
  Context: <div className="flex items-center text-white/90 mb-3">
- Line 137: Color class without dark mode variant: text-white
  Context: <p className="text-white/80 text-lg leading-relaxed max-w-2x
- Line 147: Color class without dark mode variant: bg-white
  Context: <Badge variant="secondary" className="bg-white/20 text-white
- Line 147: Color class without dark mode variant: text-white
  Context: <Badge variant="secondary" className="bg-white/20 text-white
- Line 147: Color class without dark mode variant: border-white
  Context: <Badge variant="secondary" className="bg-white/20 text-white
- Line 151: Color class without dark mode variant: text-white
  Context: <div className="text-white/80 text-sm">
- Line 159: Color class without dark mode variant: bg-white
  Context: className="bg-white/20 hover:bg-white/30 text-white border b
- Line 159: Color class without dark mode variant: text-white
  Context: className="bg-white/20 hover:bg-white/30 text-white border b
- Line 159: Color class without dark mode variant: border-white
  Context: className="bg-white/20 hover:bg-white/30 text-white border b
- Line 172: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/95 backdrop-blur-sm border-0 shado
- Line 175: Color class without dark mode variant: text-gray-600
  Context: <div className="text-gray-600 font-medium">Total Members</di
- Line 179: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/95 backdrop-blur-sm border-0 shado
- Line 181: Color class without dark mode variant: text-blue-600
  Context: <div className="text-3xl font-bold text-blue-600 mb-2">{upco
- Line 182: Color class without dark mode variant: text-gray-600
  Context: <div className="text-gray-600 font-medium">Upcoming Events</
- Line 186: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/95 backdrop-blur-sm border-0 shado
- Line 189: Color class without dark mode variant: text-gray-600
  Context: <div className="text-gray-600 font-medium">Joined This Week<
- Line 198: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/95 backdrop-blur-sm border-0 shado
- Line 200: Color class without dark mode variant: text-gray-800
  Context: <CardTitle className="flex items-center text-gray-800">
- Line 207: Color class without dark mode variant: bg-gray-50
  Context: <div key={member.id} className="flex items-center space-x-3 
- Line 210: Color class without dark mode variant: text-white
  Context: <AvatarFallback className="bg-gradient-to-br from-coral-400 
- Line 215: Color class without dark mode variant: text-gray-900
  Context: <div className="font-medium text-gray-900 truncate">{member.
- Line 216: Color class without dark mode variant: text-gray-500
  Context: <div className="text-sm text-gray-500">@{member.user.usernam
- Line 238: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/95 backdrop-blur-sm border-0 shado
- Line 240: Color class without dark mode variant: text-gray-800
  Context: <CardTitle className="flex items-center text-gray-800">
- Line 241: Color class without dark mode variant: text-blue-500
  Context: <Calendar className="h-5 w-5 mr-2 text-blue-500" />
- Line 249: Color class without dark mode variant: bg-gray-50
  Context: <div key={event.id} className="p-4 border border-gray-100 ro
- Line 249: Color class without dark mode variant: border-gray-100
  Context: <div key={event.id} className="p-4 border border-gray-100 ro
- Line 252: Color class without dark mode variant: text-gray-900
  Context: <h3 className="font-semibold text-gray-900 mb-1">{event.titl
- Line 253: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 mb-2">{event.description
- Line 254: Color class without dark mode variant: text-gray-500
  Context: <div className="flex items-center text-sm text-gray-500">
- Line 259: Color class without dark mode variant: text-blue-600
  Context: <Badge variant="outline" className="text-blue-600 border-blu
- Line 267: Color class without dark mode variant: text-gray-500
  Context: <div className="text-center py-8 text-gray-500">
- Line 268: Color class without dark mode variant: text-gray-300
  Context: <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" /
- Line 279: Color class without dark mode variant: text-white
  Context: <Sparkles className="h-5 w-5 text-white animate-pulse" />
- Line 336: Color class without dark mode variant: text-white
  Context: <Heart className="h-10 w-10 text-white" />
- Line 338: Color class without dark mode variant: text-gray-800
  Context: <h3 className="text-xl font-bold text-gray-800 mb-2">No memo
- Line 339: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mb-6">Be the first to share a ta
- Line 340: Color class without dark mode variant: text-white
  Context: <Button className="bg-gradient-to-r from-indigo-500 to-coral
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/groups-old.tsx
- Line 60: Color class without dark mode variant: text-black
  Context: <h1 className="text-2xl font-bold text-black-text-color">Gro
- Line 63: Color class without dark mode variant: text-white
  Context: <button className="rounded-xl bg-btn-color text-sm font-bold
- Line 93: Color class without dark mode variant: text-black
  Context: : 'text-gray-text-color hover:text-black-text-color'
- Line 107: Color class without dark mode variant: text-white
  Context: <MapPin className="h-5 w-5 text-white" />
- Line 110: Color class without dark mode variant: text-black
  Context: <h3 className="text-lg font-semibold text-black-text-color">
- Line 123: Color class without dark mode variant: text-black
  Context: <h3 className="text-lg font-semibold text-black-text-color m
- Line 153: Color class without dark mode variant: text-black
  Context: <h4 className="font-semibold text-black-text-color">{group.n
- Line 172: Color class without dark mode variant: bg-green-100
  Context: className="w-full rounded-lg bg-green-100 text-green-800 bor
- Line 185: Color class without dark mode variant: text-white
  Context: : 'bg-btn-color text-white'
- Line 216: Color class without dark mode variant: text-white
  Context: <Users className="h-6 w-6 text-white" />
- Line 219: Color class without dark mode variant: text-black
  Context: <h4 className="font-semibold text-black-text-color">Tango Be
- Line 231: Color class without dark mode variant: text-white
  Context: <button className="w-full rounded-lg bg-btn-color text-white
- Line 242: Color class without dark mode variant: text-white
  Context: <Users className="h-6 w-6 text-white" />
- Line 245: Color class without dark mode variant: text-black
  Context: <h4 className="font-semibold text-black-text-color">Festival
- Line 257: Color class without dark mode variant: text-white
  Context: <button className="w-full rounded-lg bg-btn-color text-white
- Line 322: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-lg border border-border-col
- Line 326: Color class without dark mode variant: text-black
  Context: <h4 className="font-semibold text-black-text-color mb-3">Tes
- Line 333: Color class without dark mode variant: text-black
  Context: <label className="block text-sm font-medium text-black-text-
- Line 347: Color class without dark mode variant: text-black
  Context: <label className="block text-sm font-medium text-black-text-
- Line 364: Color class without dark mode variant: text-white
  Context: className="rounded-lg bg-btn-color text-white px-4 py-2 text
- Line 367: Color class without dark mode variant: border-white
  Context: <div className="w-4 h-4 border-2 border-white border-t-trans
- Line 388: Color class without dark mode variant: text-black
  Context: <h4 className="font-semibold text-black-text-color mb-3">Aut
- Line 391: Color class without dark mode variant: bg-red-50
  Context: <div className="bg-red-50 border border-red-200 rounded-lg p
- Line 392: Color class without dark mode variant: text-red-700
  Context: <div className="flex items-center gap-2 text-red-700">
- Line 393: Color class without dark mode variant: bg-red-500
  Context: <div className="w-4 h-4 bg-red-500 rounded-full flex items-c
- Line 394: Color class without dark mode variant: text-white
  Context: <span className="text-white text-xs">!</span>
- Line 398: Color class without dark mode variant: text-red-600
  Context: <p className="text-sm text-red-600 mt-1">{error}</p>
- Line 403: Color class without dark mode variant: bg-green-50
  Context: <div className="bg-green-50 border border-green-200 rounded-
- Line 405: Color class without dark mode variant: bg-green-500
  Context: <div className="w-4 h-4 bg-green-500 rounded-full flex items
- Line 406: Color class without dark mode variant: text-white
  Context: <span className="text-white text-xs">✓</span>
- Line 415: Color class without dark mode variant: text-black
  Context: <p className="font-medium text-black-text-color">{result.gro
- Line 438: Color class without dark mode variant: bg-gray-50
  Context: <div className="bg-gray-50 border border-gray-200 rounded-lg
- Line 438: Color class without dark mode variant: border-gray-200
  Context: <div className="bg-gray-50 border border-gray-200 rounded-lg
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/groups.tsx
- Line 159: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-3xl font-bold text-gray-900 mb-2" data-t
- Line 160: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mb-3">{t('groups.subtitle', 'Con
- Line 180: Color class without dark mode variant: bg-white
  Context: className="glassmorphic-card rounded-xl p-6 text-center shad
- Line 180: Color class without dark mode variant: border-white
  Context: className="glassmorphic-card rounded-xl p-6 text-center shad
- Line 184: Color class without dark mode variant: bg-blue-100
  Context: className="flex items-center justify-center w-12 h-12 bg-blu
- Line 184: Color class without dark mode variant: text-blue-600
  Context: className="flex items-center justify-center w-12 h-12 bg-blu
- Line 189: Color class without dark mode variant: text-gray-900
  Context: <div className="text-2xl font-bold text-gray-900" aria-label
- Line 190: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">{t('groups.stats.tota
- Line 195: Color class without dark mode variant: bg-white
  Context: className="glassmorphic-card rounded-xl p-6 text-center shad
- Line 195: Color class without dark mode variant: border-white
  Context: className="glassmorphic-card rounded-xl p-6 text-center shad
- Line 204: Color class without dark mode variant: text-gray-900
  Context: <div className="text-2xl font-bold text-gray-900" aria-label
- Line 205: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">{t('groups.stats.join
- Line 210: Color class without dark mode variant: bg-white
  Context: className="glassmorphic-card rounded-xl p-6 text-center shad
- Line 210: Color class without dark mode variant: border-white
  Context: className="glassmorphic-card rounded-xl p-6 text-center shad
- Line 214: Color class without dark mode variant: bg-green-100
  Context: className="flex items-center justify-center w-12 h-12 bg-gre
- Line 219: Color class without dark mode variant: text-gray-900
  Context: <div className="text-2xl font-bold text-gray-900" aria-label
- Line 220: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">{t('groups.stats.tota
- Line 225: Color class without dark mode variant: bg-white
  Context: className="glassmorphic-card rounded-xl p-6 text-center shad
- Line 225: Color class without dark mode variant: border-white
  Context: className="glassmorphic-card rounded-xl p-6 text-center shad
- Line 234: Color class without dark mode variant: text-gray-900
  Context: <div className="text-2xl font-bold text-gray-900" aria-label
- Line 235: Color class without dark mode variant: text-gray-600
  Context: <div className="text-sm text-gray-600">{t('groups.stats.citi
- Line 272: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-r from-[#8E142E] to-[#0D448A] text-white s
- Line 273: Color class without dark mode variant: bg-white
  Context: : 'bg-white text-gray-700 hover:bg-gray-50 border border-gra
- Line 273: Color class without dark mode variant: text-gray-700
  Context: : 'bg-white text-gray-700 hover:bg-gray-50 border border-gra
- Line 273: Color class without dark mode variant: border-gray-200
  Context: : 'bg-white text-gray-700 hover:bg-gray-50 border border-gra
- Line 303: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">{t('groups.loading', 'Loading c
- Line 389: Color class without dark mode variant: text-gray-300
  Context: <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" aria
- Line 390: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-2">{t(
- Line 391: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 max-w-md mx-auto">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/home.tsx
- Line 88: Color class without dark mode variant: bg-black
  Context: className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidd

### /client/src/pages/host-bookings.tsx
- Line 298: Color class without dark mode variant: text-white
  Context: <div className="w-10 h-10 rounded-full bg-gradient-to-br fro
- Line 396: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-gradient-to-r from-cyan-500 via-teal
- Line 408: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-
- Line 466: Color class without dark mode variant: text-white
  Context: className="gap-2 data-[state=active]:bg-gradient-to-r data-[
- Line 474: Color class without dark mode variant: text-white
  Context: className="gap-2 data-[state=active]:bg-gradient-to-r data-[
- Line 482: Color class without dark mode variant: text-white
  Context: className="gap-2 data-[state=active]:bg-gradient-to-r data-[
- Line 490: Color class without dark mode variant: text-white
  Context: className="gap-2 data-[state=active]:bg-gradient-to-r data-[
- Line 637: Color class without dark mode variant: text-white
  Context: className={`px-4 py-2 text-white rounded-xl ${responseAction
- Line 672: Color class without dark mode variant: text-white
  Context: <div className="w-12 h-12 rounded-full bg-gradient-to-br fro

### /client/src/pages/host-calendar.tsx
- Line 184: Color class without dark mode variant: text-white
  Context: <PulseButton className="px-6 py-3 bg-gradient-to-r from-cyan

### /client/src/pages/housing-marketplace.tsx
- Line 267: Color class without dark mode variant: text-white
  Context: className="aurora-gradient text-white hover:shadow-aurora tr
- Line 387: Color class without dark mode variant: text-white
  Context: ? 'aurora-gradient text-white border-0 px-3 py-1.5 rounded-m
- Line 429: Color class without dark mode variant: bg-gray-50
  Context: className="p-6 bg-gray-50"
- Line 449: Color class without dark mode variant: border-gray-300
  Context: className="w-4 h-4 text-indigo-600 border-gray-300 rounded f
- Line 481: Color class without dark mode variant: text-gray-600
  Context: <div className="flex justify-between text-xs text-gray-600">
- Line 493: Color class without dark mode variant: text-gray-600
  Context: <Label className="text-xs text-gray-600">{t('housing.marketp
- Line 508: Color class without dark mode variant: bg-white
  Context: className="px-4 py-1 bg-white border rounded text-sm font-me
- Line 527: Color class without dark mode variant: text-gray-600
  Context: <Label className="text-xs text-gray-600">{t('housing.marketp
- Line 542: Color class without dark mode variant: bg-white
  Context: className="px-4 py-1 bg-white border rounded text-sm font-me
- Line 577: Color class without dark mode variant: border-gray-300
  Context: className="w-4 h-4 text-indigo-600 border-gray-300 rounded f
- Line 603: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600" data-testid="text-results-count
- Line 625: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-48 bg-gray-200" />
- Line 627: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-6 bg-gray-200 rounded w-3/4" />
- Line 628: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-4 bg-gray-200 rounded w-1/2" />
- Line 629: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-4 bg-gray-200 rounded w-full" />
- Line 679: Color class without dark mode variant: bg-black
  Context: <div className="absolute inset-0 bg-black/20 flex items-cent
- Line 680: Color class without dark mode variant: text-white
  Context: <VideoIcon className="w-12 h-12 text-white" />
- Line 697: Color class without dark mode variant: text-white
  Context: <Heart className={`w-4 h-4 transition-colors ${listing.isFav
- Line 767: Color class without dark mode variant: text-white
  Context: <div className="w-8 h-8 aurora-gradient rounded-full flex it
- Line 779: Color class without dark mode variant: text-white
  Context: className="aurora-gradient text-white hover:shadow-aurora tr
- Line 796: Color class without dark mode variant: text-gray-400
  Context: <Home className="w-12 h-12 mx-auto text-gray-400 mb-4" />
- Line 797: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-2">{t(
- Line 798: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">{t('housing.marketplace.try_adj
- Line 805: Color class without dark mode variant: bg-black
  Context: className="fixed inset-0 bg-black/50 flex items-center justi
- Line 813: Color class without dark mode variant: text-gray-900
  Context: <h2 id="modal-title" className="text-2xl font-bold text-gray
- Line 825: Color class without dark mode variant: text-gray-700
  Context: <p className="text-gray-700">{selectedListing.description}</
- Line 828: Color class without dark mode variant: text-gray-500
  Context: <MapPin className="w-5 h-5 text-gray-500" />
- Line 829: Color class without dark mode variant: text-gray-700
  Context: <span className="text-gray-700">{selectedListing.address || 
- Line 833: Color class without dark mode variant: bg-gray-50
  Context: <div className="bg-gray-50 rounded-lg p-4">
- Line 834: Color class without dark mode variant: text-gray-900
  Context: <h4 className="font-semibold text-gray-900 mb-2">Amenities</
- Line 839: Color class without dark mode variant: text-gray-700
  Context: <div key={amenity} className="flex items-center gap-2 text-s
- Line 846: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">+{selectedListing.ameni
- Line 862: Color class without dark mode variant: text-white
  Context: <Button className="flex-1 bg-gradient-to-r from-indigo-600 t

### /client/src/pages/invitations.tsx
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/landing.tsx
- Line 53: Color class without dark mode variant: bg-black
  Context: className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidd
- Line 72: Color class without dark mode variant: text-white
  Context: <Music className="h-6 w-6 text-white" />
- Line 78: Color class without dark mode variant: text-gray-700
  Context: <p className="text-gray-700 ml-[60px] font-medium">Ready to 
- Line 84: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/80 backdrop-blur-sm border-0 shado
- Line 87: Color class without dark mode variant: text-white
  Context: <Heart className="w-6 h-6 text-white" />
- Line 89: Color class without dark mode variant: text-gray-900
  Context: <CardTitle className="text-xl text-gray-900">Share Memories<
- Line 92: Color class without dark mode variant: text-gray-600
  Context: <CardDescription className="text-gray-600 text-center">
- Line 98: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/80 backdrop-blur-sm border-0 shado
- Line 101: Color class without dark mode variant: text-white
  Context: <Calendar className="w-6 h-6 text-white" />
- Line 103: Color class without dark mode variant: text-gray-900
  Context: <CardTitle className="text-xl text-gray-900">Find Events</Ca
- Line 106: Color class without dark mode variant: text-gray-600
  Context: <CardDescription className="text-gray-600 text-center">
- Line 112: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/80 backdrop-blur-sm border-0 shado
- Line 115: Color class without dark mode variant: text-white
  Context: <Users className="w-6 h-6 text-white" />
- Line 117: Color class without dark mode variant: text-gray-900
  Context: <CardTitle className="text-xl text-gray-900">Explore Communi
- Line 120: Color class without dark mode variant: text-gray-600
  Context: <CardDescription className="text-gray-600 text-center">
- Line 126: Color class without dark mode variant: bg-white
  Context: <Card className="bg-white/80 backdrop-blur-sm border-0 shado
- Line 129: Color class without dark mode variant: text-white
  Context: <Star className="w-6 h-6 text-white" />
- Line 131: Color class without dark mode variant: text-gray-900
  Context: <CardTitle className="text-xl text-gray-900">Life CEO</CardT
- Line 134: Color class without dark mode variant: text-gray-600
  Context: <CardDescription className="text-gray-600 text-center">
- Line 165: Color class without dark mode variant: text-white
  Context: <Music className="w-6 h-6 text-white" />
- Line 171: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:
- Line 192: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:
- Line 210: Color class without dark mode variant: text-white
  Context: <Users className="w-6 h-6 text-white" />
- Line 224: Color class without dark mode variant: text-white
  Context: <Calendar className="w-6 h-6 text-white" />
- Line 238: Color class without dark mode variant: text-white
  Context: <MapPin className="w-6 h-6 text-white" />
- Line 252: Color class without dark mode variant: text-white
  Context: <Heart className="w-6 h-6 text-white" />
- Line 266: Color class without dark mode variant: text-white
  Context: <Music className="w-6 h-6 text-white" />
- Line 280: Color class without dark mode variant: text-white
  Context: <Star className="w-6 h-6 text-white" />
- Line 303: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:

### /client/src/pages/listing-detail.tsx
- Line 414: Color class without dark mode variant: bg-gray-50
  Context: <div className="min-h-screen bg-gray-50 p-6">
- Line 434: Color class without dark mode variant: bg-gray-50
  Context: <div className="min-h-screen bg-gray-50 flex items-center ju
- Line 438: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mb-4">
- Line 514: Color class without dark mode variant: text-white
  Context: <Home className="h-24 w-24 text-white opacity-50" />
- Line 539: Color class without dark mode variant: bg-black
  Context: <div className="absolute inset-0 bg-black/30 flex items-cent
- Line 540: Color class without dark mode variant: text-white
  Context: <VideoIcon className="w-6 h-6 text-white" />
- Line 556: Color class without dark mode variant: bg-gray-200
  Context: className="w-full h-24 md:h-[120px] bg-gray-200 rounded-lg f
- Line 616: Color class without dark mode variant: text-gray-500
  Context: <Home className="h-5 w-5 mr-2 text-gray-500" />
- Line 620: Color class without dark mode variant: text-gray-500
  Context: <Users className="h-5 w-5 mr-2 text-gray-500" />
- Line 624: Color class without dark mode variant: text-gray-500
  Context: <Bed className="h-5 w-5 mr-2 text-gray-500" />
- Line 628: Color class without dark mode variant: text-gray-500
  Context: <Bath className="h-5 w-5 mr-2 text-gray-500" />
- Line 694: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mb-4">{home.address}</p>
- Line 695: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-64 bg-gray-200 rounded-lg flex items-cente
- Line 696: Color class without dark mode variant: text-gray-400
  Context: <MapPin className="h-12 w-12 text-gray-400" />
- Line 697: Color class without dark mode variant: text-gray-500
  Context: <span className="ml-2 text-gray-500">Map integration coming 
- Line 754: Color class without dark mode variant: text-white
  Context: className="w-full aurora-gradient text-white font-semibold p
- Line 774: Color class without dark mode variant: text-white
  Context: <div className="w-16 h-16 rounded-full bg-gradient-to-br fro
- Line 779: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Joined in 2023</p>
- Line 782: Color class without dark mode variant: text-gray-700
  Context: <div className="space-y-2 text-sm text-gray-700 mb-4">
- Line 867: Color class without dark mode variant: text-gray-600
  Context: <Label className="text-sm text-gray-600 mb-2 block">Check-in
- Line 890: Color class without dark mode variant: text-gray-600
  Context: <Label className="text-sm text-gray-600 mb-2 block">Check-ou
- Line 915: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600" data-testid="text-night
- Line 990: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500">
- Line 996: Color class without dark mode variant: bg-gray-50
  Context: <div className="flex items-start space-x-3 p-4 bg-gray-50 ro
- Line 1050: Color class without dark mode variant: text-white
  Context: className="flex-1 bg-gradient-to-r from-cyan-500 via-teal-50

### /client/src/pages/messages.tsx
- Line 97: Color class without dark mode variant: border-gray-200
  Context: <div className="p-4 border-b border-gray-200">
- Line 107: Color class without dark mode variant: text-gray-400
  Context: <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray
- Line 124: Color class without dark mode variant: bg-gray-200
  Context: <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
- Line 126: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-4 bg-gray-200 rounded w-3/4"></div>
- Line 127: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-3 bg-gray-200 rounded w-1/2"></div>
- Line 138: Color class without dark mode variant: border-gray-100
  Context: className={`p-4 border-b border-gray-100 hover:bg-tango-gray
- Line 144: Color class without dark mode variant: text-white
  Context: <div className="w-12 h-12 bg-tango-red rounded-full flex ite
- Line 161: Color class without dark mode variant: text-gray-400
  Context: <span className="text-xs text-gray-400">
- Line 170: Color class without dark mode variant: text-white
  Context: <span className="bg-tango-red text-white text-xs rounded-ful
- Line 177: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500 truncate mt-1">
- Line 187: Color class without dark mode variant: text-gray-400
  Context: <div className="text-gray-400 mb-4">
- Line 190: Color class without dark mode variant: text-gray-600
  Context: <h3 className="text-lg font-semibold text-gray-600 mb-2">
- Line 193: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500 text-sm">
- Line 217: Color class without dark mode variant: text-gray-400
  Context: <div className="text-gray-400 mb-4">
- Line 220: Color class without dark mode variant: text-gray-600
  Context: <h3 className="text-xl font-semibold text-gray-600 mb-2">
- Line 223: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500">

### /client/src/pages/my-bookings.tsx
- Line 233: Color class without dark mode variant: text-white
  Context: <PulseButton className="px-6 py-3 bg-gradient-to-r from-cyan
- Line 384: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-
- Line 439: Color class without dark mode variant: text-white
  Context: className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-5

### /client/src/pages/not-found.tsx
- Line 20: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">
- Line 28: Color class without dark mode variant: text-white
  Context: className="w-full bg-gradient-to-r from-turquoise-600 to-cya
- Line 53: Color class without dark mode variant: border-gray-200
  Context: <div className="mt-8 pt-6 border-t border-gray-200">
- Line 54: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/onboarding.tsx
- Line 208: Color class without dark mode variant: text-gray-600
  Context: className="absolute left-6 top-6 flex items-center gap-2 tex
- Line 216: Color class without dark mode variant: text-gray-600
  Context: <p className="text-xl text-gray-600 hover:text-gray-800 tran
- Line 226: Color class without dark mode variant: bg-white
  Context: <div className="space-y-4 group hover:scale-[1.02] transitio
- Line 227: Color class without dark mode variant: border-gray-200
  Context: <div className="flex items-center gap-3 pb-2 border-b border
- Line 231: Color class without dark mode variant: text-gray-900
  Context: <h2 className="text-xl font-medium text-gray-900 group-hover
- Line 241: Color class without dark mode variant: text-gray-700
  Context: <FormLabel className="text-sm font-medium text-gray-700 grou
- Line 246: Color class without dark mode variant: border-gray-200
  Context: className="h-12 border-gray-200 focus:border-cyan-500 focus:
- Line 256: Color class without dark mode variant: bg-white
  Context: <div className="space-y-4 group hover:scale-[1.02] transitio
- Line 257: Color class without dark mode variant: border-gray-200
  Context: <div className="flex items-center gap-3 pb-2 border-b border
- Line 259: Color class without dark mode variant: text-blue-600
  Context: <Globe className="w-5 h-5 text-blue-600 group-hover:text-cya
- Line 261: Color class without dark mode variant: text-gray-900
  Context: <h2 className="text-xl font-medium text-gray-900 group-hover
- Line 263: Color class without dark mode variant: bg-blue-100
  Context: <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1
- Line 263: Color class without dark mode variant: text-blue-700
  Context: <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1
- Line 271: Color class without dark mode variant: text-gray-700
  Context: <FormLabel className="text-sm font-medium text-gray-700 grou
- Line 288: Color class without dark mode variant: bg-white
  Context: <div className="space-y-4 group hover:scale-[1.02] transitio
- Line 289: Color class without dark mode variant: border-gray-200
  Context: <div className="flex items-center gap-3 pb-2 border-b border
- Line 293: Color class without dark mode variant: text-gray-900
  Context: <h2 className="text-xl font-medium text-gray-900 group-hover
- Line 321: Color class without dark mode variant: bg-white
  Context: <div className="space-y-4 group hover:scale-[1.02] transitio
- Line 322: Color class without dark mode variant: border-gray-200
  Context: <div className="flex items-center gap-3 pb-2 border-b border
- Line 326: Color class without dark mode variant: text-gray-900
  Context: <h2 className="text-xl font-medium text-gray-900 group-hover
- Line 339: Color class without dark mode variant: text-gray-700
  Context: <FormLabel className="text-sm font-medium text-gray-700 grou
- Line 352: Color class without dark mode variant: text-gray-500
  Context: <div className="flex justify-between text-xs text-gray-500 m
- Line 369: Color class without dark mode variant: text-gray-700
  Context: <FormLabel className="text-sm font-medium text-gray-700 grou
- Line 382: Color class without dark mode variant: text-gray-500
  Context: <div className="flex justify-between text-xs text-gray-500 m
- Line 396: Color class without dark mode variant: bg-white
  Context: <div className="space-y-4 group hover:scale-[1.02] transitio
- Line 397: Color class without dark mode variant: border-gray-200
  Context: <div className="flex items-center gap-3 pb-2 border-b border
- Line 401: Color class without dark mode variant: text-gray-900
  Context: <h2 className="text-xl font-medium text-gray-900 group-hover
- Line 413: Color class without dark mode variant: text-gray-700
  Context: <FormLabel className="text-sm font-medium text-gray-700 grou
- Line 434: Color class without dark mode variant: text-gray-700
  Context: <FormLabel className="text-sm font-medium text-gray-700 grou
- Line 450: Color class without dark mode variant: text-gray-500
  Context: <p className="text-xs text-gray-500 mt-1">
- Line 460: Color class without dark mode variant: bg-white
  Context: <div className="space-y-4 group hover:scale-[1.02] transitio
- Line 461: Color class without dark mode variant: border-gray-200
  Context: <div className="flex items-center gap-3 pb-2 border-b border
- Line 465: Color class without dark mode variant: text-gray-900
  Context: <h2 className="text-xl font-medium text-gray-900 group-hover
- Line 475: Color class without dark mode variant: text-gray-700
  Context: <FormLabel className="text-sm font-medium text-gray-700 grou
- Line 491: Color class without dark mode variant: border-gray-200
  Context: className="border-gray-200 focus:border-indigo-500 rounded-l
- Line 503: Color class without dark mode variant: bg-gray-50
  Context: <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
- Line 514: Color class without dark mode variant: border-gray-300
  Context: className="mt-1 rounded border-gray-300 text-cyan-600 focus:
- Line 518: Color class without dark mode variant: text-gray-700
  Context: <FormLabel className="text-sm text-gray-700">
- Line 537: Color class without dark mode variant: border-gray-300
  Context: className="mt-1 rounded border-gray-300 text-cyan-600 focus:
- Line 541: Color class without dark mode variant: text-gray-700
  Context: <FormLabel className="text-sm text-gray-700">
- Line 564: Color class without dark mode variant: text-white
  Context: className="relative w-full h-14 bg-gradient-to-r from-cyan-6
- Line 569: Color class without dark mode variant: border-white
  Context: <div className="w-5 h-5 border-2 border-white border-t-trans
- Line 582: Color class without dark mode variant: text-gray-500
  Context: <p className="text-sm text-gray-500 mt-4 opacity-0 group-hov
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/organizer.tsx
- Line 12: Color class without dark mode variant: text-black
  Context: <h1 className="text-3xl font-bold text-black-text-color mb-4
- Line 22: Color class without dark mode variant: text-black
  Context: <h3 className="font-semibold text-black-text-color mb-2">Eve
- Line 30: Color class without dark mode variant: text-black
  Context: <h3 className="font-semibold text-black-text-color mb-2">Ana
- Line 38: Color class without dark mode variant: text-black
  Context: <h3 className="font-semibold text-black-text-color mb-2">Pro
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/pricing.tsx
- Line 77: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-12 w-96 bg-gray-200 rounded mx-auto" />
- Line 80: Color class without dark mode variant: bg-gray-200
  Context: <div key={i} className="h-96 bg-gray-200 rounded-lg" />
- Line 95: Color class without dark mode variant: bg-white
  Context: <div className="bg-white/80 backdrop-blur-sm border-b">
- Line 101: Color class without dark mode variant: text-gray-600
  Context: <p className="mt-4 text-lg text-gray-600">
- Line 118: Color class without dark mode variant: bg-green-100
  Context: <Badge className="ml-2 bg-green-100 text-green-800">Save 20%
- Line 129: Color class without dark mode variant: border-gray-200
  Context: <Card className="relative border-gray-200 hover:shadow-lg tr
- Line 137: Color class without dark mode variant: text-gray-500
  Context: <span className="text-gray-500">/month</span>
- Line 170: Color class without dark mode variant: text-white
  Context: <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 
- Line 185: Color class without dark mode variant: text-gray-500
  Context: <span className="text-gray-500">/month</span>
- Line 210: Color class without dark mode variant: text-white
  Context: className="w-full bg-[#5EEAD4] hover:bg-[#5EEAD4]/90 text-wh
- Line 223: Color class without dark mode variant: border-gray-200
  Context: <Card className="relative border-gray-200 hover:shadow-lg tr
- Line 226: Color class without dark mode variant: text-blue-600
  Context: <Building2 className="h-5 w-5 text-blue-600" />
- Line 236: Color class without dark mode variant: text-gray-500
  Context: <span className="text-gray-500">/month</span>
- Line 261: Color class without dark mode variant: bg-blue-600
  Context: className="w-full bg-blue-600 hover:bg-blue-700 text-white"
- Line 261: Color class without dark mode variant: text-white
  Context: className="w-full bg-blue-600 hover:bg-blue-700 text-white"
- Line 274: Color class without dark mode variant: border-gray-900
  Context: <Card className="relative border-gray-900 hover:shadow-lg tr
- Line 283: Color class without dark mode variant: text-gray-500
  Context: <span className="text-gray-500 block text-sm mt-1">Contact s
- Line 298: Color class without dark mode variant: bg-gray-900
  Context: className="w-full bg-gray-900 hover:bg-gray-800 text-white"
- Line 298: Color class without dark mode variant: text-white
  Context: className="w-full bg-gray-900 hover:bg-gray-800 text-white"
- Line 373: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">
- Line 383: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">
- Line 393: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">
- Line 403: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/profile.tsx
- Line 187: Color class without dark mode variant: text-gray-500
  Context: <p className="text-gray-500">{t('profile.loading', 'Loading 
- Line 216: Color class without dark mode variant: bg-white
  Context: <div className="bg-white rounded-lg shadow-sm">
- Line 361: Color class without dark mode variant: text-red-600
  Context: <p className="text-sm text-red-600">{t('profile.error.guest_
- Line 371: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-3 bg-gray-200 rounded w-3/4"></div>
- Line 372: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-3 bg-gray-200 rounded w-1/2"></div>
- Line 380: Color class without dark mode variant: text-gray-600
  Context: <p className="text-xs text-gray-600">{t('profile.guest.ready
- Line 393: Color class without dark mode variant: text-gray-300
  Context: <UserCheck className="w-8 h-8 text-gray-300 mx-auto" />
- Line 394: Color class without dark mode variant: text-gray-600
  Context: <p className="text-xs text-gray-600">{t('profile.guest.creat
- Line 398: Color class without dark mode variant: text-white
  Context: className="w-full text-xs bg-gradient-to-r from-turquoise-50
- Line 441: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600 line-clamp-3 mb-3">
- Line 474: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">
- Line 480: Color class without dark mode variant: text-gray-600
  Context: <span className="text-sm text-gray-600">
- Line 504: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">
- Line 510: Color class without dark mode variant: border-white
  Context: <div key={i} className="w-6 h-6 bg-gradient-to-br from-turqu
- Line 595: Color class without dark mode variant: text-blue-600
  Context: <Star className="w-8 h-8 mx-auto text-blue-600 mb-2" />
- Line 596: Color class without dark mode variant: text-blue-800
  Context: <h4 className="font-semibold text-blue-800">{t('profile.even
- Line 597: Color class without dark mode variant: text-blue-600
  Context: <p className="text-blue-600 text-sm">{t('profile.stat.events
- Line 604: Color class without dark mode variant: text-gray-800
  Context: <h4 className="font-semibold text-gray-800">{t('profile.even
- Line 617: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-turquoise-500 to-cyan-600 h
- Line 690: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-turquoise-500 to-cyan-600 t
- Line 732: Color class without dark mode variant: bg-white
  Context: className="text-xs bg-white/80 text-gray-700"
- Line 732: Color class without dark mode variant: text-gray-700
  Context: className="text-xs bg-white/80 text-gray-700"
- Line 738: Color class without dark mode variant: bg-white
  Context: <Button variant="ghost" size="sm" className="h-8 w-8 bg-whit
- Line 759: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-turquoise-500 to-cyan-600 h
- Line 793: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mb-4">
- Line 797: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-turquoise-500 to-cyan-600 h
- Line 855: Color class without dark mode variant: text-blue-600
  Context: <div className="text-2xl font-bold text-blue-600">{(user as 
- Line 856: Color class without dark mode variant: text-blue-700
  Context: <div className="text-sm text-blue-700">{t('profile.experienc
- Line 869: Color class without dark mode variant: text-gray-800
  Context: <h4 className="font-semibold text-gray-800 text-lg">{t('prof
- Line 880: Color class without dark mode variant: text-gray-900
  Context: <h6 className="font-semibold text-gray-900">Intermediate Tan
- Line 882: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 text-sm">Taught advanced techniq
- Line 883: Color class without dark mode variant: text-gray-500
  Context: <div className="flex items-center gap-4 mt-2 text-sm text-gr
- Line 904: Color class without dark mode variant: text-gray-900
  Context: <h6 className="font-semibold text-gray-900">Milonga Organize
- Line 906: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 text-sm">Coordinated weekly even
- Line 907: Color class without dark mode variant: text-gray-500
  Context: <div className="flex items-center gap-4 mt-2 text-sm text-gr
- Line 928: Color class without dark mode variant: text-gray-900
  Context: <h6 className="font-semibold text-gray-900">Resident DJ</h6>
- Line 930: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 text-sm">Curated traditional tan
- Line 931: Color class without dark mode variant: text-gray-500
  Context: <div className="flex items-center gap-4 mt-2 text-sm text-gr
- Line 946: Color class without dark mode variant: text-gray-900
  Context: <h5 className="font-semibold text-gray-900">DJ & Music Curat
- Line 948: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 text-sm">Curated and performed m
- Line 949: Color class without dark mode variant: text-gray-500
  Context: <div className="flex items-center gap-4 mt-2 text-sm text-gr
- Line 955: Color class without dark mode variant: bg-green-100
  Context: <Badge className="bg-green-100 text-green-700">{t('profile.e
- Line 967: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-turquoise-500 to-cyan-600 h
- Line 993: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-4 bg-gray-200 rounded w-1/4"></div>
- Line 994: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-4 bg-gray-200 rounded w-3/4"></div>
- Line 995: Color class without dark mode variant: bg-gray-200
  Context: <div className="h-4 bg-gray-200 rounded w-1/2"></div>
- Line 1007: Color class without dark mode variant: text-gray-300
  Context: <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" 
- Line 1008: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-2">{t(
- Line 1009: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mb-4">
- Line 1012: Color class without dark mode variant: text-white
  Context: <a href="/guest-onboarding" className="inline-flex items-cen
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/search.tsx
- Line 70: Color class without dark mode variant: bg-white
  Context: <div className="glassmorphic-card bg-white/70 backdrop-blur-
- Line 70: Color class without dark mode variant: border-white
  Context: <div className="glassmorphic-card bg-white/70 backdrop-blur-
- Line 78: Color class without dark mode variant: text-gray-400
  Context: <SearchIcon className="absolute left-4 top-1/2 transform -tr
- Line 84: Color class without dark mode variant: bg-white
  Context: className="w-full pl-12 pr-12 py-4 glassmorphic-card bg-whit
- Line 90: Color class without dark mode variant: bg-gray-100
  Context: className="absolute right-4 top-1/2 transform -translate-y-1
- Line 92: Color class without dark mode variant: text-gray-400
  Context: <X className="h-5 w-5 text-gray-400" />
- Line 107: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-r from-turquoise-400 to-cyan-500 text-whit
- Line 108: Color class without dark mode variant: bg-white
  Context: : 'glassmorphic-card bg-white/60 hover:bg-white/80 text-gray
- Line 108: Color class without dark mode variant: text-gray-700
  Context: : 'glassmorphic-card bg-white/60 hover:bg-white/80 text-gray
- Line 130: Color class without dark mode variant: bg-white
  Context: <div className="glassmorphic-card bg-white/60 backdrop-blur-
- Line 132: Color class without dark mode variant: text-gray-800
  Context: <h2 className="text-xl font-semibold text-gray-800 mb-2">Sta
- Line 133: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Find users, posts, events, and 
- Line 140: Color class without dark mode variant: bg-white
  Context: <div className="glassmorphic-card bg-white/60 backdrop-blur-
- Line 141: Color class without dark mode variant: text-gray-400
  Context: <SearchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4"
- Line 142: Color class without dark mode variant: text-gray-800
  Context: <h2 className="text-xl font-semibold text-gray-800 mb-2">No 
- Line 143: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Try adjusting your search terms
- Line 152: Color class without dark mode variant: bg-white
  Context: <div className="glassmorphic-card bg-white/70 backdrop-blur-
- Line 163: Color class without dark mode variant: text-white
  Context: <div className="w-16 h-16 bg-gradient-to-r from-turquoise-40
- Line 176: Color class without dark mode variant: text-gray-500
  Context: <span className="text-xs text-gray-500">
- Line 181: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 truncate"
- Line 185: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mt-1 line-clamp-2">
- Line 190: Color class without dark mode variant: text-gray-500
  Context: <div className="flex items-center gap-4 mt-2 text-sm text-gr
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/tango-communities.tsx
- Line 189: Color class without dark mode variant: text-gray-900
  Context: <h1 className="text-3xl font-bold text-gray-900">Tango Commu
- Line 190: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mt-2">Connect with tango dancers
- Line 194: Color class without dark mode variant: text-white
  Context: className="bg-gradient-to-r from-indigo-600 to-purple-600 ho
- Line 207: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">{mockCommuni
- Line 208: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Total Communities</p>
- Line 216: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">
- Line 219: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Joined Communities</p>
- Line 227: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">
- Line 230: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Total Events</p>
- Line 238: Color class without dark mode variant: text-gray-900
  Context: <p className="text-2xl font-bold text-gray-900">
- Line 241: Color class without dark mode variant: text-gray-600
  Context: <p className="text-sm text-gray-600">Cities</p>
- Line 250: Color class without dark mode variant: text-gray-400
  Context: <Search className="absolute left-3 top-1/2 transform -transl
- Line 269: Color class without dark mode variant: text-white
  Context: ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white
- Line 287: Color class without dark mode variant: bg-black
  Context: <div className="absolute inset-0 bg-black/20" />
- Line 289: Color class without dark mode variant: text-white
  Context: <h3 className="text-xl font-bold text-white mb-1">{community
- Line 290: Color class without dark mode variant: text-white
  Context: <p className="text-white/90 text-sm flex items-center gap-1"
- Line 299: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600 mb-4 line-clamp-2">{community.de
- Line 304: Color class without dark mode variant: text-gray-400
  Context: <Users className="w-4 h-4 text-gray-400" />
- Line 305: Color class without dark mode variant: text-gray-600
  Context: <span className="text-gray-600">{community.memberCount} memb
- Line 308: Color class without dark mode variant: text-gray-400
  Context: <Calendar className="w-4 h-4 text-gray-400" />
- Line 309: Color class without dark mode variant: text-gray-600
  Context: <span className="text-gray-600">{community.eventCount} event
- Line 314: Color class without dark mode variant: text-gray-600
  Context: <span className="text-gray-600">{community.rating}</span>
- Line 326: Color class without dark mode variant: text-white
  Context: : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from
- Line 347: Color class without dark mode variant: text-gray-400
  Context: <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
- Line 348: Color class without dark mode variant: text-gray-900
  Context: <h3 className="text-lg font-semibold text-gray-900 mb-2">No 
- Line 349: Color class without dark mode variant: text-gray-600
  Context: <p className="text-gray-600">Try adjusting your search or fi
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/teacher.tsx
- Line 12: Color class without dark mode variant: text-black
  Context: <h1 className="text-3xl font-bold text-black-text-color mb-4
- Line 22: Color class without dark mode variant: text-black
  Context: <h3 className="font-semibold text-black-text-color mb-2">Cur
- Line 30: Color class without dark mode variant: text-black
  Context: <h3 className="font-semibold text-black-text-color mb-2">Onl
- Line 38: Color class without dark mode variant: text-black
  Context: <h3 className="font-semibold text-black-text-color mb-2">Stu
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/timeline-debug.tsx
- Line 22: Inline style with color - should use Tailwind dark: variants
  Context: <div style={{ marginTop: '40px', padding: '20px', background
- Line 25: Inline style with color - should use Tailwind dark: variants
  Context: <li><a href="/" style={{ color: 'blue' }}>/ - Home</a></li>
- Line 26: Inline style with color - should use Tailwind dark: variants
  Context: <li><a href="/moments" style={{ color: 'blue' }}>/moments - 
- Line 27: Inline style with color - should use Tailwind dark: variants
  Context: <li><a href="/enhanced-timeline" style={{ color: 'blue' }}>/
- Line 28: Inline style with color - should use Tailwind dark: variants
  Context: <li><a href="/timeline-v2" style={{ color: 'blue' }}>/timeli
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

### /client/src/pages/timeline-minimal.tsx
- Line 5: Inline style with color - should use Tailwind dark: variants
  Context: <div style={{ padding: '50px', backgroundColor: 'lightgreen'
- Line 0: Page does not reference theme/dark mode - may not respond to theme changes

