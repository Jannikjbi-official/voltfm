import { FontAwesomeIcon, type FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { config, type IconDefinition } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

import {
  faPlay,
  faPause,
  faVolumeHigh,
  faVolumeLow,
  faVolumeXmark,
  faMagnifyingGlass,
  faTowerBroadcast,
  faMusic,
  faCalendarDays,
  faNewspaper,
  faTicket,
  faUser,
  faCircleUser,
  faBars,
  faXmark,
  faArrowRight,
  faArrowLeft,
  faArrowUpRightFromSquare,
  faShareNodes,
  faBookmark,
  faHeart,
  faGear,
  faPenToSquare,
  faTrash,
  faPlus,
  faCheck,
  faTriangleExclamation,
  faCircleExclamation,
  faSpinner,
  faSun,
  faMoon,
  faFingerprint,
  faRightFromBracket,
  faClock,
  faLocationDot,
  faMicrophoneLines,
  faImage,
  faGaugeHigh,
  faTag,
  faLink,
  faCopy,
  faPaperPlane,
  faChevronRight,
  faChevronDown,
  faDownload,
  faUsers,
  faBolt,
  faScrewdriverWrench,
  faListUl,
  faRotateRight,
  faHouse,
  faEllipsis,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";

import { faDiscord, faInstagram } from "@fortawesome/free-brands-svg-icons";

/**
 * Das eine Icon-System fuer VoltFM: Font Awesome.
 *
 * Jedes Icon, das VoltFM selbst zeichnet, wird hier exportiert — so bleibt die
 * Auswahl ueberschaubar, und keine Seite importiert Icon-Namen direkt.
 * HeroUI bringt fuer seine eigenen Bedienelemente (Schliessen-Knopf im Drawer,
 * Pfeile in Auswahllisten) eigene SVGs mit; die bleiben, wie sie sind.
 */

// Next.js already emits the Font Awesome stylesheet above; stop the library
// from injecting a second copy at runtime, which causes icons to flash huge
// before hydration.
config.autoAddCss = false;

export type { IconDefinition };

/**
 * Thin wrapper so call sites stay declarative and consistent.
 *
 * There is deliberately no size prop: Font Awesome glyphs scale to the
 * inherited font-size, so size them with a Tailwind class (`text-sm`,
 * `size-4`) on the icon or its container.
 */
export function Icon({ icon, spin = false, ...rest }: FontAwesomeIconProps) {
  return <FontAwesomeIcon icon={icon} spin={spin} {...rest} />;
}

/* Semantic aliases: pages name the meaning, not the glyph. */
export const PlayIcon = faPlay;
export const PauseIcon = faPause;
export const VolumeHighIcon = faVolumeHigh;
export const VolumeLowIcon = faVolumeLow;
export const VolumeMuteIcon = faVolumeXmark;
export const SearchIcon = faMagnifyingGlass;
export const RadioIcon = faTowerBroadcast;
export const MusicIcon = faMusic;
export const CalendarIcon = faCalendarDays;
export const NewsIcon = faNewspaper;
export const EventsIcon = faTicket;
export const UserIcon = faUser;
export const UserCircleIcon = faCircleUser;
export const MenuIcon = faBars;
export const CloseIcon = faXmark;
export const ArrowRightIcon = faArrowRight;
export const ArrowLeftIcon = faArrowLeft;
export const ExternalLinkIcon = faArrowUpRightFromSquare;
export const ShareIcon = faShareNodes;
export const BookmarkIcon = faBookmark;
export const HeartIcon = faHeart;
export const SettingsIcon = faGear;
export const EditIcon = faPenToSquare;
export const DeleteIcon = faTrash;
export const PlusIcon = faPlus;
export const CheckIcon = faCheck;
export const WarningIcon = faTriangleExclamation;
export const ErrorIcon = faCircleExclamation;
export const LoadingIcon = faSpinner;
export const SunIcon = faSun;
export const MoonIcon = faMoon;
export const DiscordIcon = faDiscord;
export const InstagramIcon = faInstagram;
export const PasskeyIcon = faFingerprint;
export const LogoutIcon = faRightFromBracket;
export const ClockIcon = faClock;
export const LocationIcon = faLocationDot;
export const MicIcon = faMicrophoneLines;
export const ImageIcon = faImage;
export const DashboardIcon = faGaugeHigh;
export const TagIcon = faTag;
export const LinkIcon = faLink;
export const CopyIcon = faCopy;
export const SendIcon = faPaperPlane;
export const ChevronRightIcon = faChevronRight;
export const ChevronDownIcon = faChevronDown;
export const DownloadIcon = faDownload;
export const CommunityIcon = faUsers;
export const BoltIcon = faBolt;
export const ToolsIcon = faScrewdriverWrench;
export const ListIcon = faListUl;
export const RetryIcon = faRotateRight;
export const HomeIcon = faHouse;
export const MoreIcon = faEllipsis;
export const ChevronLeftIcon = faChevronLeft;
