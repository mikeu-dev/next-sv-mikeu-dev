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
	SiVite
} from 'svelte-icons-pack/si';
import { FiHash, FiGithub, FiExternalLink, FiGlobe } from 'svelte-icons-pack/fi';
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

	// Feather Icons (fi)
	FiHash,
	FiGithub,
	FiExternalLink,
	FiGlobe,
    
    // Fallback/Default
    default: FiHash
};

export function getIconByName(name: string): IconType {
	return iconRegistry[name] || iconRegistry.default;
}
