import {
	SiBootstrap,
	SiCodeigniter,
	SiCsharp,
	SiCss3,
	SiDocker,
	SiDotnet,
	SiFi,
	SiFirebase,
	SiGit,
	SiHtml5,
	SiJavascript,
	SiJquery,
	SiLaravel,
	SiLeaflet,
	SiLinux,
	SiMysql,
	SiNextdotjs,
	SiNodedotjs,
	SiOpenlayers,
	SiPhp,
	SiReact,
	SiSvelte,
	SiTailwindcss,
	SiTypescript,
	SiUnity,
	SiVite,
	SiInstagram,
	SiLinkedin,
	SiTwitter,
	SiFacebook,
	SiWhatsapp,
	SiTelegram
} from 'svelte-icons-pack/si';
import { FiHash, FiGithub, FiExternalLink, FiGlobe } from 'svelte-icons-pack/fi';
import {
	BsArrowUpCircleFill,
	BsCalendar3,
	BsClock,
	BsArrowRight,
	BsHouseFill,
	BsChevronRight
} from 'svelte-icons-pack/bs';
import {
	LuGithub,
	LuExternalLink,
	LuClock,
	LuCalendar,
	LuArrowRight,
	LuHome,
	LuChevronRight
} from 'svelte-icons-pack/lu';
import { FaSolidRocket, FaSolidStar, FaSolidCircleInfo, FaSolidCircleCheck, FaSolidTriangleExclamation } from 'svelte-icons-pack/fa';
import { IoLogoIonic, IoLogoJavascript, IoLogoPython, IoLogoGithub } from 'svelte-icons-pack/io';
import { AiFillHome, AiFillSetting, AiFillMessage } from 'svelte-icons-pack/ai';
import type { IconType } from 'svelte-icons-pack';

export const iconRegistry: Record<string, IconType> = {
	// Simple Icons (si)
	SiBootstrap,
	SiCodeigniter,
	SiCsharp,
	SiCss3,
	SiDocker,
	SiDotnet,
	SiFi,
	SiFirebase,
	SiGit,
	SiHtml5,
	SiJavascript,
	SiJquery,
	SiLaravel,
	SiLeaflet,
	SiLinux,
	SiMysql,
	SiNextdotjs,
	SiNodedotjs,
	SiOpenlayers,
	SiPhp,
	SiReact,
	SiSvelte,
	SiTailwindcss,
	SiTypescript,
	SiUnity,
	SiVite,
	SiInstagram,
	SiLinkedin,
	SiTwitter,
	SiFacebook,
	SiWhatsapp,
	SiTelegram,

	// Common Names / Aliases
	Instagram: SiInstagram,
	Linkedin: SiLinkedin,
	Twitter: SiTwitter,
	Facebook: SiFacebook,
	Whatsapp: SiWhatsapp,
	Telegram: SiTelegram,
	SiDefault: FiHash,

	// Feather Icons (fi)
	FiHash,
	FiGithub,
	FiExternalLink,
	FiGlobe,

	// Bootstrap Icons (bs)
	BsArrowUpCircleFill,
	BsCalendar3,
	BsClock,
	BsArrowRight,
	BsHouseFill,
	BsChevronRight,

	// Lucide Icons (lu) - Mapping common names for consistency
	LuGithub,
	LuExternalLink,
	LuClock,
	LuCalendar,
	LuArrowRight,
	LuHome,
	LuChevronRight,
	Github: LuGithub,
	ExternalLink: LuExternalLink,
	Clock: LuClock,
	Calendar: LuCalendar,
	ArrowRight: LuArrowRight,
	Home: LuHome,
	ChevronRight: LuChevronRight,

	// FontAwesome (fa)
	FaSolidRocket,
	FaSolidStar,
	FaSolidCircleInfo,
	FaSolidCircleCheck,
	FaSolidTriangleExclamation,

	// Ionicons (io)
	IoLogoIonic,
	IoLogoJavascript,
	IoLogoPython,
	IoLogoGithub,

	// Ant Design (ai)
	AiFillHome,
	AiFillSetting,
	AiFillMessage,

	// Fallback/Default
	default: FiHash
};

export function getIconByName(name: string): IconType {
	return iconRegistry[name] || iconRegistry.default;
}
