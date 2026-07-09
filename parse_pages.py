import os
import re

pages_dir = 'src/pages'
files = sorted([f for f in os.listdir(pages_dir) if f.endswith('.tsx')])

print("PAGES AND THEIR API CALLS:")
for fname in files:
    fpath = os.path.join(pages_dir, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("-" * 50)
    print(f"PAGE: {fname}")
    
    # Imports from zite-endpoints-sdk
    imports = re.findall(r'import\s+\{([^}]+)\}\s+from\s+[\'"]zite-endpoints-sdk[\'"]', content)
    if imports:
        print("  ZITE ENDPOINTS IMPORTS:")
        for imp in imports:
            print(f"    {imp.strip()}")
            
    # Also find if there are any other direct import references
    # Like useAuth
    auth_imports = re.findall(r'import\s+\{([^}]+)\}\s+from\s+[\'"]zite-auth-sdk[\'"]', content)
    if auth_imports:
        print("  AUTH IMPORTS:")
        for imp in auth_imports:
            print(f"    {imp.strip()}")
            
    # Quick regex search for UI components used
    ui_imports = re.findall(r'import\s+\{([^}]+)\}\s+from\s+[\'"]@/components/ui/[^\'"]+[\'"]', content)
    if ui_imports:
        print("  UI COMPONENT IMPORTS:")
        for imp in ui_imports:
            print(f"    {imp.strip()}")
            
    # And lucide icons
    icons = re.findall(r'import\s+\{([^}]+)\}\s+from\s+[\'"]lucide-react[\'"]', content)
    if icons:
        print("  ICONS:")
        for ic in icons:
            print(f"    {ic.strip()}")
            
    # Search for functions called inside the component
    # e.g., getDashboardStats({})...
    calls = []
    # match standard calls
    for word in ['getDashboardStats', 'updateProfile', 'getJobApplications', 'saveJobApplication', 'deleteJobApplication',
                 'getResumes', 'getResume', 'saveResume', 'deleteResume', 'analyzeATS', 'optimizeResume',
                 'optimizeResumeATS', 'reviewLinkedIn', 'scoreInterview', 'suggestProjects', 'suggestRoles',
                 'exportResumePdf', 'generateCoverLetter', 'generateInterviewQuestions', 'generateRoadmap',
                 'generateRoleSOP', 'getCoverLetters', 'deleteCoverLetter', 'createRazorpayOrder', 'verifyRazorpayPayment']:
        if word in content and word not in content.split('\n')[0]: # not in import
            calls.append(word)
    if calls:
        print(f"  ENDPOINT CALLS IN LOGIC: {list(set(calls))}")
