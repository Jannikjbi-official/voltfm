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
} from "@fortawesome/free-solid-svg-icons";

import { faDiscord } from "@fortawesome/free-brands-svg-icons";

/**
 * The single icon system for VoltFM: Font Awesome.
 *
 * Every icon used by VoltFM-authored UI is re-exported here, so the set stays
 * auditable and no page imports icon names directly.
 *
 * Note on OlyxUI: the vendored OlyxUI components render Hugeicons internally
 * for their own affordances (select chevrons, dialog close buttons). Those are
 * part of the unmodified OlyxUI sources — swapping them would mean editing the
 * vendored library, so they stay as-is. Font Awesome is the icon system for
 * everything VoltFM draws itself.
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
 * inherited font-size, so sizing is set in the CSS module that owns the
 * surrounding layout rather than sprinkled through JSX.
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
