import os
import shutil
import re

# Define source and destination root directories
src_root = '.'
dest_root = './frontend/src'

# Define mappings from Zite endpoint function names to their new modular API modules
function_to_api_module = {
    'analyzeATS': '@/api/ats',
    'optimizeResumeATS': '@/api/ats',
    'optimizeResume': '@/api/ats',
    'suggestRoles': '@/api/roadmap',
    'generateRoleSOP': '@/api/roadmap',
    'generateRoadmap': '@/api/roadmap',
    'suggestProjects': '@/api/roadmap',
    'generateCoverLetter': '@/api/coverLetter',
    'getCoverLetters': '@/api/coverLetter',
    'deleteCoverLetter': '@/api/coverLetter',
    'getDashboardStats': '@/api/dashboard',
    'generateInterviewQuestions': '@/api/interview',
    'scoreInterview': '@/api/interview',
    'getJobApplications': '@/api/jobs',
    'saveJobApplication': '@/api/jobs',
    'deleteJobApplication': '@/api/jobs',
    'reviewLinkedIn': '@/api/linkedin',
    'getResumes': '@/api/resume',
    'getResume': '@/api/resume',
    'saveResume': '@/api/resume',
    'deleteResume': '@/api/resume',
    'exportResumePdf': '@/api/resume',
    'updateProfile': '@/api/auth',
    'checkFeatureAccess': '@/api/settings',
    'createRazorpayOrder': '@/api/payment',
    'verifyRazorpayPayment': '@/api/payment'
}

def copy_and_rewrite_file(src_path, dest_path):
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    with open(src_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Rewrite zite-auth-sdk imports to @/services/auth
    content = content.replace("from 'zite-auth-sdk'", "from '@/services/auth'")
    content = content.replace('from "zite-auth-sdk"', 'from "@/services/auth"')

    # Rewrite zite-file-upload-sdk imports to @/services/upload
    content = content.replace("from 'zite-file-upload-sdk'", "from '@/services/upload'")
    content = content.replace('from "zite-file-upload-sdk"', 'from "@/services/upload"')

    # Rewrite zite-endpoints-sdk imports to modular local API paths
    # Matches: import { a, b } from 'zite-endpoints-sdk';
    # Or: import { a, b, c } from "zite-endpoints-sdk";
    zite_import_regex = r'import\s+\{([^}]+)\}\s+from\s+[\'"]zite-endpoints-sdk[\'"]'
    matches = re.findall(zite_import_regex, content)
    for match_content in matches:
        imported_symbols = [s.strip() for s in match_content.split(',')]
        # Group symbols by their target API module
        module_groups = {}
        for symbol in imported_symbols:
            # Separate alias names (e.g. GetResumesOutputType as GetResumesOutputType)
            sym_clean = symbol.split('as')[0].strip()
            # If it's a type like AnalyzeATSOutputType, map it to its corresponding API module
            # e.g. AnalyzeATSOutputType ->ats, GetCoverLettersOutputType -> coverLetter
            mapped = False
            for func, mod in function_to_api_module.items():
                if func.lower() in sym_clean.lower():
                    module_groups.setdefault(mod, []).append(symbol)
                    mapped = True
                    break
            if not mapped:
                # Fallbacks based on typical naming conventions if not direct match
                if 'resume' in sym_clean.lower():
                    module_groups.setdefault('@/api/resume', []).append(symbol)
                elif 'profile' in sym_clean.lower():
                    module_groups.setdefault('@/api/auth', []).append(symbol)
                elif 'application' in sym_clean.lower() or 'job' in sym_clean.lower():
                    module_groups.setdefault('@/api/jobs', []).append(symbol)
                elif 'cover' in sym_clean.lower():
                    module_groups.setdefault('@/api/coverLetter', []).append(symbol)
                elif 'interview' in sym_clean.lower():
                    module_groups.setdefault('@/api/interview', []).append(symbol)
                elif 'roadmap' in sym_clean.lower() or 'role' in sym_clean.lower() or 'project' in sym_clean.lower():
                    module_groups.setdefault('@/api/roadmap', []).append(symbol)
                elif 'linkedin' in sym_clean.lower():
                    module_groups.setdefault('@/api/linkedin', []).append(symbol)
                elif 'razorpay' in sym_clean.lower() or 'payment' in sym_clean.lower() or 'order' in sym_clean.lower():
                    module_groups.setdefault('@/api/payment', []).append(symbol)
                else:
                    # Generic fallback to settings
                    module_groups.setdefault('@/api/settings', []).append(symbol)
        
        # Replace the single old import statement with the new grouped import statements
        original_import_stmt = re.search(r'import\s+\{([^}]+)\}\s+from\s+[\'"]zite-endpoints-sdk[\'"];?', content)
        if original_import_stmt:
            new_imports = []
            for mod, symbols in module_groups.items():
                new_imports.append(f"import {{ {', '.join(symbols)} }} from '{mod}';")
            content = content.replace(original_import_stmt.group(0), '\n'.join(new_imports))

    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Copied & Rewrote: {src_path} -> {dest_path}")

def main():
    # 1. Copy pages
    pages_src = os.path.join(src_root, 'src', 'pages')
    pages_dest = os.path.join(dest_root, 'pages')
    for fname in os.listdir(pages_src):
        if fname.endswith('.tsx'):
            copy_and_rewrite_file(os.path.join(pages_src, fname), os.path.join(pages_dest, fname))

    # 2. Copy hooks
    hooks_src = os.path.join(src_root, 'src', 'hooks')
    hooks_dest = os.path.join(dest_root, 'hooks')
    if os.path.exists(hooks_src):
        for fname in os.listdir(hooks_src):
            if fname.endswith('.ts'):
                copy_and_rewrite_file(os.path.join(hooks_src, fname), os.path.join(hooks_dest, fname))

    # 3. Copy components
    components_src = os.path.join(src_root, 'src', 'components')
    components_dest = os.path.join(dest_root, 'components')
    for fname in os.listdir(components_src):
        if fname.endswith('.tsx'):
            copy_and_rewrite_file(os.path.join(components_src, fname), os.path.join(components_dest, fname))

    # 4. Copy index.css
    shutil.copy2(os.path.join(src_root, 'src', 'index.css'), os.path.join(dest_root, 'index.css'))
    print("Copied index.css")

if __name__ == '__main__':
    main()
