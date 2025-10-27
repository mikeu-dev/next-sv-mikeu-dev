import type { Project } from '$lib/types';
import { env } from '$env/dynamic/private';
import {
	SiBootstrap,
	SiCodeigniter,
	SiFi,
	SiLaravel,
	SiLeaflet,
	SiLivewire,
	SiNextdotjs,
	SiReact,
	SiTailwindcss,
	SiVuedotjs
} from 'svelte-icons-pack/si';
export const projects: Project[] = [
	{
		id: '1',
		slug: 'emameun',
		title: 'Emameun',
		description:
			'A modern and responsive Food Market website built with Vue.js and Tailwind CSS. This project features a dynamic product catalog, detailed food item pages, and a fully interactive shopping cart for a seamless user experience.',
		thumbnailUrl: `https://raw.githubusercontent.com/${env.GITHUB_USER}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/emameun/base.jpg`,
		repoUrl: 'https://github.com/mikeu-dev/next-sv-mikeu-dev',
		demoUrl: 'https://emameun.vercel.app/',
		tags: [
			{
				name: 'Vue',
				icon: SiVuedotjs,
				color: '#41B883',
				url: 'https://vuejs.org/'
			},
			{
				name: 'Tailwind CSS',
				icon: SiTailwindcss,
				color: '#5EEAD4',
				url: 'https://tailwindcss.com/'
			}
		],
		content: `
			<h3>Project Overview</h3>
			<p>The primary goal was to develop a visually appealing and highly user-friendly e-commerce platform for a food market. The focus was on creating a seamless browsing and purchasing experience for customers, from product discovery to checkout.</p>
			<h3>Key Features</h3>
			<ul>
				<li><strong>Dynamic Product Catalog:</strong> An easily browsable catalog of food items with clear categorization and search functionality.</li>
				<li><strong>Interactive Shopping Cart:</strong> Users can add, remove, and update item quantities in their cart in real-time without page reloads.</li>
				<li><strong>Responsive Design:</strong> Fully responsive layout built with Tailwind CSS, ensuring a great experience on both desktop and mobile devices.</li>
				<li><strong>Component-Based Architecture:</strong> Developed using Vue.js for a modular, maintainable, and scalable codebase.</li>
			</ul>`
	},
	{
		id: '2',
		slug: 'dlh-purwakarta',
		title: 'Dinas Lingkungan Hidup Kabupaten Purwakarta',
		description:
			'A comprehensive information system for the Environmental Agency of Purwakarta Regency. This platform serves as a central hub for environmental programs, public services, and educational resources, featuring an interactive map for visualizing environmental data.',
		thumbnailUrl: `https://raw.githubusercontent.com/${env.GITHUB_USER}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/dlh-purwakarta/base.jpg`,
		demoUrl: 'https://dlh.purwakartakab.go.id/',
		tags: [
			{
				name: 'Laravel',
				icon: SiLaravel,
				color: '#FF5555',
				url: 'laravel.com'
			},
			{
				name: 'Bootstrap',
				icon: SiBootstrap,
				color: '#BB86FC',
				url: 'bootstrap.com'
			},
			{
				name: 'Leaflet',
				icon: SiLeaflet,
				color: '#76FF03',
				url: 'leafletjs.com'
			}
		],
		content: `
			<h3>Project Overview</h3>
			<p>This project aimed to create an official, user-friendly website for the Environmental Agency of Purwakarta Regency. The goal was to effectively communicate their mission, services, and initiatives to the public, while also providing tools for data visualization and public engagement.</p>
			<h3>Key Features</h3>
			<ul>
				<li><strong>Information Portal:</strong> Serves as the primary source of information for pollution control, waste management, and conservation programs.</li>
				<li><strong>Interactive GIS Map:</strong> Built with Leaflet, this feature allows users to visualize key environmental data points across the Purwakarta region.</li>
				<li><strong>Public Service Information:</strong> Provides clear and accessible details on services offered by the agency.</li>
				<li><strong>Robust Backend:</strong> Powered by Laravel to ensure reliable data management and content updates.</li>
			</ul>`
	},
	{
		id: '3',
		slug: 'upi-jatiluhur',
		title: 'Unit Pengelolaan Irigasi D.I Jatiluhur',
		description:
			'A web-based information system for the Jatiluhur Irrigation Management Unit. This platform provides essential irrigation data, features an interactive mapping system for monitoring channels, and includes a public complaint submission feature.',
		thumbnailUrl: `https://raw.githubusercontent.com/${env.GITHUB_USER}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/upi-jatiluhur/base.jpg`,
		demoUrl: 'https://upijatiluhur.id/',
		tags: [
			{
				name: 'Laravel',
				icon: SiLaravel,
				color: '#FF5555',
				url: 'laravel.com'
			},
			{
				name: 'Bootstrap',
				icon: SiBootstrap,
				color: '#BB86FC',
				url: 'bootstrap.com'
			},
			{
				name: 'Leaflet',
				icon: SiLeaflet,
				color: '#76FF03',
				url: 'leafletjs.com'
			}
		],
		content: `
			<h3>Project Overview</h3>
			<p>The goal was to develop a digital platform to support the Jatiluhur Irrigation Management Unit. The system facilitates the management and monitoring of the irrigation network through a public-facing landing page and a feature-rich internal dashboard.</p>
			<h3>Key Features</h3>
			<ul>
				<li><strong>Interactive Mapping:</strong> Utilizes Leaflet to display and monitor the condition of irrigation channels, water distribution points, and other critical data visually, aiding in informed decision-making.</li>
				<li><strong>Public Complaint System:</strong> Allows the community to report issues such as blockages or damages directly through the website, which are then routed to the appropriate authorities for action.</li>
				<li><strong>Dashboard and Reporting:</strong> An internal dashboard provides administrators with tools to manage data, view reports, and oversee the status of the irrigation system.</li>
			</ul>`
	},
	{
		id: '4',
		slug: 'mapin-aja',
		title: 'Mapin Aja',
		description:
			'An interactive web application for creating, viewing, and managing geospatial data. Built with Next.js and React, it allows users to draw on the map, import/export various GIS file formats, and visualize data in real-time.',
		thumbnailUrl: `https://raw.githubusercontent.com/${env.GITHUB_USER}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/mapin-aja/base.jpg`,
		demoUrl: 'https://mapin-aja.vercel.app/',
		repoUrl: 'https://github.com/mikeu-dev/mapin-aja',
		tags: [
			{
				name: 'Next js',
				icon: SiNextdotjs,
				color: '#171d26',
				url: 'nextjs.org'
			},
			{
				name: 'React',
				icon: SiReact,
				color: '#42A5F5',
				url: 'react.dev'
			},
			{
				name: 'Tailwind CSS',
				icon: SiTailwindcss,
				color: '#5EEAD4',
				url: 'https://tailwindcss.com/'
			},
			{
				name: 'Leaflet',
				icon: SiLeaflet,
				color: '#76FF03',
				url: 'leafletjs.com'
			}
		],
		content: `
			<h3>Project Overview</h3>
			<p>Mapin Aja was created to be a lightweight, accessible, and powerful tool for anyone working with geospatial data. It removes the need for complex desktop software for many common GIS tasks, providing a fast and interactive web-based alternative.</p>
			<h3>Key Features</h3>
			<ul>
				<li><strong>Interactive Drawing Tools:</strong> Users can draw points, lines, and polygons directly on the map.</li>
				<li><strong>GeoJSON Editor:</strong> A built-in text editor allows for real-time creation and editing of GeoJSON data, which is instantly rendered on the map.</li>
				<li><strong>Multi-Format Support:</strong> Supports importing and exporting popular geospatial formats including GeoJSON, TopoJSON, KML, and Shapefile.</li>
				<li><strong>Modern Tech Stack:</strong> Built with Next.js and React for a high-performance, server-rendered user experience.</li>
			</ul>`
	},
	{
		id: '5',
		slug: 'investasi-purwakarta',
		title: 'Investasi Purwakarta',
		description:
			'A platform for managing and monitoring investment projects in the Purwakarta region. It features project management tools, advanced search/filtering, and data visualization in both table and map formats, all built on the CodeIgniter 4 framework.',
		thumbnailUrl: `https://raw.githubusercontent.com/${env.GITHUB_USER}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/investasi-purwakarta/base.jpg`,
		demoUrl: 'https://investasi.purwakartakab.go.id/',
		tags: [
			{
				name: 'Codeigniter 4',
				icon: SiCodeigniter,
				color: '#FF5722',
				url: 'codeigniter.com'
			},
			{
				name: 'Bootstrap',
				icon: SiBootstrap,
				color: '#BB86FC',
				url: 'bootstrap.com'
			},
			{
				name: 'Leaflet',
				icon: SiLeaflet,
				color: '#76FF03',
				url: 'leafletjs.com'
			}
		],
		content: `
			<h3>Project Overview</h3>
			<p>This platform was developed for the Investment and One-Stop Integrated Service Agency of Purwakarta (DPMPTSP) to streamline the management and monitoring of investment projects. It provides a centralized system for tracking project progress and visualizing investment distribution.</p>
			<h3>Key Features</h3>
			<ul>
				<li><strong>Project Management:</strong> Full CRUD (Create, Read, Update, Delete) functionality for investment project data.</li>
				<li><strong>Advanced Search and Filtering:</strong> Enables users to easily find projects based on criteria like category, location, and status.</li>
				<li><strong>Dual Data Visualization:</strong> Investment data can be viewed in a structured table format or spatially on an interactive map.</li>
				<li><strong>User Authentication:</strong> Secure login system to control access to administrative features.</li>
			</ul>`
	},
	{
		id: '6',
		slug: 'siperintis',
		title: 'Sistem Informasi Persetujuan Teknis',
		description:
			'A web application to streamline the technical approval process for construction projects. Built with Laravel and the TALL stack (Tailwind, Alpine.js, Livewire, Laravel), it provides a centralized platform for managing approval requests efficiently.',
		thumbnailUrl: `https://raw.githubusercontent.com/${env.GITHUB_USER}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/siperintis/siperintis-applicant-app.png`,
		demoUrl: 'https://siperintis.pratama.live/',
		tags: [
			{
				name: 'Laravel',
				icon: SiLaravel,
				color: '#FF5555',
				url: 'laravel.com'
			},
			{
				name: 'Filament',
				icon: SiFi,
				color: '#eb6b34',
				url: 'filamentphp.com'
			},
			{
				name: 'Livewire',
				icon: SiLivewire,
				color: '#f582d2',
				url: 'laravel-livewire.com'
			},
			{
				name: 'Tailwind CSS',
				icon: SiTailwindcss,
				color: '#5EEAD4',
				url: 'tailwindcss.com'
			}
		],
		content: `
			<h3>Project Overview</h3>
			<p>Siperintis was designed to digitize and simplify the traditionally paper-based process of obtaining technical approvals for construction. The system creates an efficient and transparent workflow for both applicants and the internal review committee.</p>
			<h3>Key Features</h3>
			<ul>
				<li><strong>Online Submission:</strong> Applicants can submit their technical approval requests and upload necessary documents through a user-friendly portal.</li>
				<li><strong>Admin Dashboard:</strong> A powerful administrative panel built with Filament allows the review committee to manage, review, and track the status of all incoming requests.</li>
				<li><strong>Reactive UI:</strong> The user interface is built with Livewire and Alpine.js, providing a dynamic and responsive experience without full page reloads.</li>
				<li><strong>Modern TALL Stack:</strong> Leverages the full power of the TALL stack for rapid and robust application development.</li>
			</ul>`
	}
];
