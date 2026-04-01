/**
 * @gundo/ui — Curated Icon Exports
 *
 * Re-exports from lucide-react for consistent icon usage across all GUNDO projects.
 * Consumers can import icons directly: `import { Search, Plus } from '@gundo/ui'`
 *
 * Only add icons here that are actually used. Tree-shaking ensures unused icons
 * are eliminated from the bundle.
 */

export {
  // Close / Dismiss
  X,

  // Navigation
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Home,

  // Email / Communication
  Inbox,
  Reply,
  Forward,
  Archive,
  MessageSquare,

  // Search
  Search,

  // Loading
  Loader2,

  // Actions
  Plus,
  Minus,
  Check,
  Copy,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  Send,
  Share2,
  MoreHorizontal,
  MoreVertical,
  Settings,
  Filter,
  SlidersHorizontal,
  Bookmark,
  Star,
  Heart,

  // AI / Special
  Sparkles,
  Brain,

  // Status / Feedback
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Bell,
  Shield,
  Zap,
  Clock,
  CircleDot,

  // Content
  FileText,
  Image,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,

  // Data / Charts
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,

  // Users / Profiles
  User,
  Users,
  LogOut,
  Mail,
  Phone,
  MapPin,

  // Calendar / Dates
  Calendar,
  CalendarDays,

  // Theme
  Sun,
  Moon,

  // Commerce
  ShoppingCart,
  DollarSign,
  Lock,
  CreditCard,

  // Organization
  FolderOpen,
  Database,
  Server,
  Globe,
  Link,
  Tag,
  Hash,
  Lightbulb,

  // Finance / Accounting
  LayoutDashboard,
  ArrowLeftRight,
  BookOpen,
  Wallet,
  Receipt,
  Plug,
  Flame,
  ArrowUp,
  ArrowDown,
  Landmark,
  Grid3x3,
  CloudUpload,
  FileCheck,
  ArrowRightLeft,

  // Health / Fitness / Marketing
  Utensils,
  Camera,
  Dumbbell,
  CalendarClock,
  FlaskConical,
  Cpu,
} from 'lucide-react';

// Re-export the icon type for consumers who need it
export type { LucideIcon, LucideProps } from 'lucide-react';
