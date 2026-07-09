# User Interface & Design System Analysis

This document provides a detailed analysis of the frontend design system, global layout, responsive navigation elements, typography, and styling directives for **Ascend**.

---

## 1. Application Layout & Navigation

The frontend interface utilizes a responsive workspace container defined in [DashboardLayout.tsx](file:///C:/Users/hirem/.gemini/antigravity/scratch/ascend/src/components/DashboardLayout.tsx):

*   **Desktop Sidebar Layout**:
    *   Widescreen views (`lg` screens and up) render a fixed, left-aligned sidebar with a width of `w-64`.
    *   Features a branding section, a scrollable vertical navigation list containing the 10 core pages, an Upgrade to Pro banner for Free tier users, and an accounts settings dropdown at the bottom.
*   **Mobile Viewport Header Layout**:
    *   Under `lg` screens (laptops and tablets), the sidebar is hidden. A thin header bar spans the top.
    *   Includes a drawer menu button (Lucide `Menu`) that opens a mobile sheet (`SheetContent` sliding from the left) containing the navigation items.
*   **Active Link Styles**:
    *   Managed by React Router's `<NavLink>`. Active links receive styling: `bg-primary text-primary-foreground` (solid primary color).
    *   Inactive links transition color smoothly on hover: `text-muted-foreground hover:text-foreground hover:bg-muted`.

---

## 2. Shadcn UI Component Dependencies

The project relies on **Shadcn UI** components. These components are imported from `@/components/ui/` but are **not present** in the unpacked directory structure (they are injected or resolved by the Zite platform runtime):

1.  **`Button`** (`@/components/ui/button`): Used for primary action buttons, icon buttons, and outlines.
2.  **`Input`** (`@/components/ui/input`): Standard text input field.
3.  **`Textarea`** (`@/components/ui/textarea`): Multiline text input area.
4.  **`Card`**, **`CardContent`**, **`CardHeader`**, **`CardTitle`**, **`CardDescription`** (`@/components/ui/card`): Content containers for lists, dashboards, stats, and sections.
5.  **`Progress`** (`@/components/ui/progress`): Horizontal progress bar (used for scoring meters, ATS compatibility percentages, and loading states).
6.  **`Badge`** (`@/components/ui/badge`): Inline labels for user plans, difficulty levels, and skill tags.
7.  **`Tabs`**, **`TabsContent`**, **`TabsList`**, **`TabsTrigger`** (`@/components/ui/tabs`): Tab-based views for the Resume Editor, ATS Analyzer, and Career Roadmaps.
8.  **`Select`**, **`SelectContent`**, **`SelectItem`**, **`SelectTrigger`**, **`SelectValue`** (`@/components/ui/select`): Dropdown selects for interview focuses, resume templates, cover letter tones, and project difficulty levels.
9.  **`Skeleton`** (`@/components/ui/skeleton`): Pulse skeleton placeholders displayed while data is loading.
10. **`Dialog`**, **`DialogContent`**, **`DialogHeader`**, **`DialogTitle`**, **`DialogFooter`** (`@/components/ui/dialog`): Modal popups for upgrading plans, creating resumes, and editing application details.
11. **`AlertDialog`**, **`AlertDialogAction`**, **`AlertDialogCancel`**, **`AlertDialogContent`**, **`AlertDialogDescription`**, **`AlertDialogFooter`**, **`AlertDialogHeader`**, **`AlertDialogTitle`**, **`AlertDialogTrigger`** (`@/components/ui/alert-dialog`): Confirmation dialogs for deleting resumes, cover letters, and job applications.
12. **`Sheet`**, **`SheetContent`**, **`SheetTrigger`** (`@/components/ui/sheet`): Slide-out panels (used for mobile navigation drawers).
13. **`DropdownMenu`**, **`DropdownMenuContent`**, **`DropdownMenuItem`**, **`DropdownMenuSeparator`**, **`DropdownMenuTrigger`** (`@/components/ui/dropdown-menu`): Popover menus for account settings, logouts, and resume option lists.
14. **`Accordion`**, **`AccordionContent`**, **`AccordionItem`**, **`AccordionTrigger`** (`@/components/ui/accordion`): Collapsible FAQ sections on the Landing Page.

---

## 3. Styling & Theme System

Styles are configured in [tailwind.config.ts](file:///C:/Users/hirem/.gemini/antigravity/scratch/ascend/tailwind.config.ts) and [src/index.css](file:///C:/Users/hirem/.gemini/antigravity/scratch/ascend/src/index.css):

*   **Typography**: Implements **Inter** as the primary font family (`--font-sans`). Fallbacks include system sans-serif fonts. Font weights range from light (100) to bold (900).
*   **Colors**: Configured using HSL channels to support both light and dark modes:
    *   `--background`: `0 0% 100%` (White) / Dark: `224 71% 4%` (Dark Navy Black).
    *   `--foreground`: `222.2 47.4% 11.2%` (Charcoal) / Dark: `213 31% 91%` (Off-white).
    *   `--primary`: `221 83% 53%` (Indigo-Blue) / Dark: same.
    *   `--primary-foreground`: `210 40% 98%` (Very Light Grey) / Dark: same.
    *   `--muted`: `210 40% 96.1%` (Light Grey) / Dark: `223 47% 11%` (Dark Navy).
    *   `--border` / `--input`: `214.3 31.8% 91.4%` / Dark: `216 34% 17%`.
    *   `--destructive`: `0 72% 51%` (Red) / Dark: `0 63% 31%` (Deep Red).
*   **Borders**: Standard radius matches `0.625rem` (`--radius`).
*   **Shadows**: Custom shadow levels (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`) configured using `color-mix` to scale transparency relative to background colors.
*   **Base Rules**:
    ```css
    @layer base {
      * {
        @apply border-border outline-ring/50;
      }
      body {
        @apply font-sans antialiased bg-background text-foreground;
      }
    }
    ```

---

## 4. Icons Mapping

The interface uses icons from the `lucide-react` library:

*   **DashboardLayout**: `FileText`, `BarChart3`, `Mail`, `Mic`, `Briefcase`, `Map`, `Linkedin`, `Lightbulb`, `Settings`, `LogOut`, `Menu`, `LayoutDashboard`, `ChevronUp`, `Sparkles`, `Crown`, `Zap`.
*   **LandingPage**: `ChevronUp`, `FileText`, `BarChart3`, `Mail`, `Mic`, `Briefcase`, `Map`, `Linkedin`, `Lightbulb`, `Sparkles`, `ArrowRight`, `Check`, `Star`.
*   **AtsAnalyzer**: `BarChart3`, `Sparkles`, `CheckCircle2`, `AlertCircle`, `Upload`, `FileText`, `X`, `Download`, `Wand2`, `Loader2`, `Copy`.
*   **CareerRoadmap**: `Sparkles`, `Map`, `Clock`, `Award`, `DollarSign`, `ArrowRight`, `Target`, `TrendingUp`, `CheckCircle2`, `BookOpen`, `Loader2`, `ArrowLeft`, `Zap`, `CalendarDays`, `Trophy`, `BarChart3`.
*   **CoverLetterGenerator**: `Sparkles`, `Copy`, `Trash2`, `Mail`.
*   **InterviewPrep**: `Sparkles`, `ChevronDown`, `ChevronUp`, `Mic`, `Send`.
*   **JobTracker**: `Plus`, `Briefcase`, `Trash2`, `Edit2`, `ExternalLink`.
*   **LinkedInReview**: `Sparkles`, `Copy`, `Linkedin`.
*   **ProjectGenerator**: `Sparkles`, `Lightbulb`, `Clock`, `Github`.
*   **ResumeBuilder**: `Plus`, `FileText`, `Trash2`, `MoreVertical`.
*   **ResumeEditor**: `ArrowLeft`, `Save`, `Download`, `Plus`, `Trash2`, `Sparkles`.

---

## 5. Toast Notifications

User feedback is displayed via the `sonner` package:

*   **Global Provider**: A `<Toaster />` component is mounted inside the root route wrapper in [src/App.tsx](file:///C:/Users/hirem/.gemini/antigravity/scratch/ascend/src/App.tsx) to listen for alerts globally.
*   **Client Triggers**: Triggered via `toast.success()` and `toast.error()` commands:
    *   "Profile updated" / "Failed to save" (Settings Page).
    *   "Resume saved" / "Failed to save" (Resume Editor).
    *   "PDF generated" / "Failed to export" (Resume PDF export).
    *   "Analysis complete!" / "Analysis failed..." (ATS Analyzer).
    *   "Copied to clipboard" (Optimize block / cover letters).
    *   "Added" / "Updated" / "Deleted" (Job applications tracking card changes).
