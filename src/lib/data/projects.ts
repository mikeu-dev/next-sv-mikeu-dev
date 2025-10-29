import type { Project } from '$lib/types';
import { env } from '$env/dynamic/private';
import {
	SiBootstrap,
	SiCodeigniter,
	SiDrizzle,
	SiFi,
	SiLaravel,
	SiLeaflet,
	SiLivewire,
	SiMysql,
	SiNextdotjs,
	SiNodedotjs,
	SiOpenlayers,
	SiReact,
	SiShadcnui,
	SiSvelte,
	SiTailwindcss,
	SiThreedotjs,
	SiTypescript,
	SiVite,
	SiVuedotjs
} from 'svelte-icons-pack/si';

/**
 *  Proyek-proyek gueh!
 */
export const projects: Record<string, Project[]> = {
	en: [
		{
			id: '1',
			slug: 'emameun',
			title: 'Emameun',
			description:
				'A modern and responsive Food Market website built with Vue.js and Tailwind CSS. This project features a dynamic product catalog, detailed food item pages, and a fully interactive shopping cart for a seamless user experience.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/emameun/base.jpg`,
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
			title: 'Environmental Agency of Purwakarta Regency',
			description:
				'A comprehensive information system for the Environmental Agency of Purwakarta Regency. This platform serves as a central hub for environmental programs, public services, and educational resources, featuring an interactive map for visualizing environmental data.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/dlh-purwakarta/base.jpg`,
			imagesUrl: [
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/dlh-purwakarta/base.jpg`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/dlh-purwakarta/dlh-pengaduan.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/dlh-purwakarta/dlh-lacak-pengaduan.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/dlh-purwakarta/dlh-dashboard.png`
			],
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
			pinned: true,
			slug: 'upi-jatiluhur',
			title: 'Jatiluhur D.I. Irrigation Management Unit',
			description:
				'A web-based information system for the Jatiluhur Irrigation Management Unit. This platform provides essential irrigation data, features an interactive mapping system for monitoring channels, and includes a public complaint submission feature.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/upi-jatiluhur/base.jpg`,
			imagesUrl: [
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/upi-jatiluhur/base.jpg`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/upi-jatiluhur/upi-map.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/upi-jatiluhur/upi-login.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/upi-jatiluhur/upi-dashboard.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/upi-jatiluhur/upi-pengaduan.png`
			],
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
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/mapin-aja/base.jpg`,
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
			pinned: true,
			slug: 'investasi-purwakarta',
			title: 'Purwakarta Investment',
			description:
				'A platform for managing and monitoring investment projects in the Purwakarta region. It features project management tools, advanced search/filtering, and data visualization in both table and map formats, all built on the CodeIgniter 4 framework.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/investasi-purwakarta/base.jpg`,
			imagesUrl: [
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/investasi-purwakarta/base.jpg`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/investasi-purwakarta/investasi-map.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/investasi-purwakarta/investasi-login.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/investasi-purwakarta/investasi-dashboard.png`
			],
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
			slug: 'purbakesa',
			title: 'Purbakesa',
			description:
				'A platform developed for Purwakarta to analyze and manage public health data, built using CodeIgniter 3.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/purbakesa/purbakesa-login.png`,
			imagesUrl: [
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/purbakesa/purbakesa-login.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/purbakesa/purbakesa-dashboard.png`
			],
			demoUrl: 'https://www.purbakesa.purwakartakab.go.id/',
			tags: [
				{
					name: 'CodeIgniter 3',
					icon: SiCodeigniter,
					color: '#FF5722',
					url: 'https://codeigniter.com'
				},
				{ name: 'Bootstrap', icon: SiBootstrap, color: '#7952B3', url: 'https://getbootstrap.com' },
				{ name: 'Leaflet', icon: SiLeaflet, color: '#76FF03', url: 'https://leafletjs.com' }
			],
			content: `
		<h3>Project Overview</h3>
		<p>
			Purbakesa is a health analysis and control platform developed for the Purwakarta Health Department.
			It helps manage healthcare data, medicine availability, service facilities, and integrates BPJS (Indonesian National Health Insurance) data in real time.
		</p>

		<h3>Key Features</h3>
		<ul>
			<li><strong>Statistics Dashboard:</strong> Displays dynamic statistics on medicines, hospitals, clinics, patients, and finances.</li>
			<li><strong>Bed Monitoring:</strong> Real-time hospital bed availability integrated with BPJS Health data.</li>
			<li><strong>E-Dinkes:</strong> Analytics for top diagnoses and patient visits.</li>
			<li><strong>PERBEKES:</strong> Monitoring of medicine and IDL vaccine availability.</li>
			<li><strong>Finance Module:</strong> Health financial reporting and bookkeeping management.</li>
			<li><strong>SDK:</strong> Financial human resources management.</li>
			<li><strong>Yankes:</strong> Health service modules for Family Health, Dental Care, Financing, and Primary Referrals.</li>
			<li><strong>P2P:</strong> Modules for Immunization, Communicable and Non-Communicable Disease Control.</li>
			<li><strong>Public Health (Kesmas):</strong> Modules for Nutrition, Maternal &amp; Child Health, Environmental Health, Health Promotion, Posyandu, PHBS, and Village Health Programs.</li>
			<li><strong>Jabang Tutuka:</strong> Maternal and child health service management.</li>
			<li><strong>Call Center:</strong> Management of referral and non-referral cases.</li>
			<li><strong>Health Information System:</strong> Redirects to integrated external systems.</li>
			<li><strong>Medicine Management:</strong> Manage medicines, units, incoming/outgoing stock, and reports.</li>
			<li><strong>Map &amp; Location:</strong> Interactive maps for hospitals, clinics, doctors, midwives, and medical staff.</li>
			<li><strong>Patient Management:</strong> Complete patient data management.</li>
			<li><strong>User Management:</strong> Secure login and role-based access control for administrators.</li>
		</ul>`
		},
		{
			id: '7',
			slug: 'siperintis',
			title: 'Technical Approval Information System',
			description:
				'A web application to streamline the technical approval process for construction projects. Built with Laravel and the TALL stack (Tailwind, Alpine.js, Livewire, Laravel), it provides a centralized platform for managing approval requests efficiently.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/siperintis/siperintis-applicant-app.png`,
			imagesUrl: [
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/siperintis/siperintis-applicant-app.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/siperintis/siperintis-login-page.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/siperintis/siperintis-dashboard-page.png`
			],
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
		},
		{
			id: '8',
			pinned: true,
			slug: 'pratama-tech-solution',
			title: 'PT Pratama Solusi Teknologi',
			description:
				'A web-based application for a trusted software house providing application development, information systems, API integration, and innovative technology solutions to support business and institutional growth. Built using SvelteKit, Drizzle-Kit, MySQL, and Shadcn UI.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/pst/pst-landing.png`,
			imagesUrl: [
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/pst/pst-landing.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/pst/pst-landing-light.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/pst/pst-login.png`
			],
			demoUrl: 'https://pratamatechsolution.co.id/',
			tags: [
				{ name: 'SvelteKit', icon: SiSvelte, color: '#FC3D03', url: 'https://svelte.dev' },
				{ name: 'Drizzle-Kit', icon: SiDrizzle, color: '#03FC17', url: 'https://orm.drizzle.team' },
				{ name: 'MySQL', icon: SiMysql, color: '#52829C', url: 'https://www.mysql.com' },
				{
					name: 'Tailwind CSS',
					icon: SiTailwindcss,
					color: '#5EEAD4',
					url: 'https://tailwindcss.com'
				},
				{
					name: 'Shadcn UI',
					icon: SiShadcnui,
					color: '#B0420B',
					url: 'https://www.shadcn-svelte.com'
				},
				{ name: 'Vite', icon: SiVite, color: '#FCFC05', url: 'https://vite.dev' },
				{ name: 'Node.js', icon: SiNodedotjs, color: '#0AA105', url: 'https://nodejs.org' }
			],
			content: `
		<h3>Project Overview</h3>
		<p>
			This web application was developed for <strong>PT Pratama Solusi Teknologi</strong>, a trusted software house in Indonesia.
			It serves as both the company’s official website and the foundation for an internal ERP system
			to manage projects, clients, finances, and human resources effectively.
		</p>

		<h3>Key Features</h3>
		<ul>
			<li><strong>Landing Page:</strong> Showcases company profile, services, portfolio, and contact information with a modern and responsive design.</li>
			<li><strong>ERP Management (On-Going):</strong> Internal management modules for handling projects, teams, and client operations.</li>
			<li><strong>Authentication &amp; Role Management:</strong> Secure login system with role-based access control for administrators and employees.</li>
			<li><strong>API Integration:</strong> Backend structure designed for future modular connectivity and third-party system integration.</li>
			<li><strong>Modular UI Design:</strong> Built using Shadcn UI and Tailwind CSS components for scalability and consistent design language.</li>
			<li><strong>Optimized Performance:</strong> Powered by Vite and Node.js to ensure fast builds and smooth user experience.</li>
		</ul>
	`
		},
		{
			id: '9',
			slug: 'sidolih',
			title: 'Environmental Document Information System of Purwakarta Regency',
			description:
				'A comprehensive information system developed for the Environmental Agency of Purwakarta Regency. This platform serves as a centralized and digital archive for managing environmental documents efficiently.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/sidolih/sidolih-login.png`,
			imagesUrl: [
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/sidolih/sidolih-login.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/sidolih/sidolih-dashboard.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/sidolih/sidolih-pelaporan.png`
			],
			demoUrl: 'https://siardlin.purwakartakab.go.id/',
			tags: [
				{ name: 'Laravel', icon: SiLaravel, color: '#FF5555', url: 'https://laravel.com' },
				{ name: 'Bootstrap', icon: SiBootstrap, color: '#7952B3', url: 'https://getbootstrap.com' },
				{ name: 'Leaflet', icon: SiLeaflet, color: '#76FF03', url: 'https://leafletjs.com' }
			],
			content: `
		<h3>Project Overview</h3>
		<p>
			SIDOLIH (Environmental Document Information System) is a web-based platform developed for the
			<strong>Environmental Agency of Purwakarta Regency</strong>. The system is designed to digitize, manage, and
			monitor environmental documents in an integrated and centralized way.
		</p>

		<h3>Key Features</h3>
		<ul>
			<li><strong>Environmental Document Submission:</strong> Online submission for environmental documents such as UKL-UPL, AMDAL, and other permits.</li>
			<li><strong>RKTL Reporting:</strong> Reporting module for Environmental Management and Monitoring Plans (RKTL) submitted by companies.</li>
			<li><strong>Document Archiving:</strong> Digital archiving system for UKL-UPL, AMDAL, and environmental assessment documents.</li>
			<li><strong>Data Synchronization:</strong> API integration with sub-district and village data for activity location validation.</li>
			<li><strong>User Management:</strong> Role-based access control and account management for system users.</li>
			<li><strong>System Configuration:</strong> Application settings for customizing the system name, logo, and other preferences.</li>
		</ul>
	`
		},
		{
			id: '10',
			pinned: true,
			slug: 'geo-draw',
			title: 'GeoDraw',
			description:
				'GeoDraw is a simple web-based tool for creating and editing GeoJSON data interactively, inspired by geojson.io. Users can draw points, lines, and polygons on a map and instantly see the generated GeoJSON output in real-time.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/geo-draw/base.png`,
			demoUrl: 'https://geo-draw-ol.vercel.app/',
			repoUrl: 'https://github.com/mikeu-dev/geo-draw',
			tags: [
				{
					name: 'Next.js',
					icon: SiNextdotjs,
					color: '#171d26',
					url: 'https://nextjs.org/'
				},
				{
					name: 'React',
					icon: SiReact,
					color: '#42A5F5',
					url: 'https://react.dev/'
				},
				{
					name: 'Tailwind CSS',
					icon: SiTailwindcss,
					color: '#5EEAD4',
					url: 'https://tailwindcss.com/'
				},
				{
					name: 'OpenLayers',
					icon: SiOpenlayers,
					color: '#009688',
					url: 'https://openlayers.org/'
				},
				{
					name: 'Shadcn UI',
					icon: SiShadcnui,
					color: '#171d26',
					url: 'https://ui.shadcn.com/'
				}
			],
			content: `
		<h3>Project Overview</h3>
		<p>
			GeoDraw is a lightweight and interactive web application designed to create, edit, and visualize 
			<strong>GeoJSON</strong> data easily. Inspired by <em>geojson.io</em>, it enables users to draw 
			<strong>Points</strong>, <strong>LineStrings</strong>, and <strong>Polygons</strong> directly on a map, 
			with real-time updates to the GeoJSON output.
		</p>

		<h3>Key Features</h3>
		<ul>
			<li><strong>Interactive Map:</strong> Pan and zoom freely on a base map powered by OpenStreetMap.</li>
			<li><strong>Drawing Tools:</strong> Draw points, lines, and polygons interactively.</li>
			<li><strong>Edit & Delete:</strong> Modify or remove existing shapes easily.</li>
			<li><strong>Real-time GeoJSON Output:</strong> Instantly see updated GeoJSON as you draw or edit.</li>
			<li><strong>AI Validation:</strong> Validate your GeoJSON structure using an AI-powered checker.</li>
			<li><strong>Copy to Clipboard:</strong> Copy generated GeoJSON with one click.</li>
			<li><strong>Responsive Design:</strong> Optimized for both desktop and mobile devices.</li>
		</ul>
	`
		},
		{
			id: '11',
			pinned: true,
			slug: 'satu-peta',
			title: 'Satu Peta — Purwakarta Geospatial System',
			description:
				'A comprehensive geospatial information system developed for the Department of Communication and Information (Diskominfo) of Purwakarta Regency. This innovative platform integrates spatial data to support regional development and public services. With its modern interface and interactive features, exploring spatial data becomes more intuitive and engaging.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/satu-peta/satu-peta-landing.png`,
			imagesUrl: [
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/satu-peta/satu-peta-landing.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/satu-peta/satu-peta-map.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/satu-peta/satu-peta-login.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/satu-peta/satu-peta-dashboard.png`
			],
			tags: [
				{ name: 'Laravel', icon: SiLaravel, color: '#FF5555', url: 'https://laravel.com' },
				{ name: 'Bootstrap', icon: SiBootstrap, color: '#BB86FC', url: 'https://getbootstrap.com' },
				{
					name: 'OpenLayers',
					icon: SiOpenlayers,
					color: '#009688',
					url: 'https://openlayers.org/'
				},
				{ name: 'MySQL', icon: SiMysql, color: '#52829C', url: 'https://www.mysql.com/' },
				{ name: 'Vite', icon: SiVite, color: '#FCFC05', url: 'https://vite.dev/' },
				{ name: 'Node.js', icon: SiNodedotjs, color: '#0AA105', url: 'https://nodejs.org/' }
			],
			content: `
		<h3>Project Overview</h3>
		<p>
			Satu Peta is an official geospatial web platform developed for <strong>Diskominfo Purwakarta</strong>.
			This system integrates various spatial datasets to support regional development, infrastructure planning,
			and public services. With a modern interface and interactive map tools, users can explore and analyze spatial
			data more intuitively than ever before.
		</p>

		<h3>Key Features</h3>
		<ul>
			<li><strong>Interactive Map Exploration:</strong> Smooth navigation with a responsive user interface, complete with zoom and pan controls for seamless spatial exploration.</li>
			<li><strong>Advanced Spatial Filters:</strong> 
				<ul>
					<li><strong>Bounding Box Query:</strong> Filter data by selecting custom geographic areas.</li>
					<li><strong>Dataset & Agency Filters:</strong> Quickly access specific spatial information by category or organization.</li>
				</ul>
			</li>
			<li><strong>Data Management Dashboard:</strong> Manage map datasets, user accounts, articles, app settings, categories, and institutional data synchronization in one place.</li>
			<li><strong>Responsive Design:</strong> Optimized for both desktop and mobile devices for smooth map interaction.</li>
		</ul>
	`
		},
		{
			id: '12',
			pinned: true,
			slug: 'cubets',
			title: 'Cubets — Cube Arena Game',
			description:
				'A minimalist 3D mini-game built with Three.js, featuring a neon cyberpunk aesthetic and futuristic glow effects. Players control a glowing cube and must avoid enemies in a dynamic arena — similar in concept to agar.io or snake-style gameplay.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/cubets/base.png`,
			repoUrl: 'https://github.com/mikeu-dev/cubets',
			demoUrl: 'https://cubets.vercel.app/',
			tags: [
				{
					name: 'TypeScript',
					icon: SiTypescript,
					color: '#048fd4',
					url: 'https://www.typescriptlang.org/'
				},
				{ name: 'Three.js', icon: SiThreedotjs, color: '#171d26', url: 'https://threejs.org/' },
				{ name: 'Vite', icon: SiVite, color: '#FCFC05', url: 'https://vite.dev/' },
				{ name: 'Node.js', icon: SiNodedotjs, color: '#0AA105', url: 'https://nodejs.org/' }
			],
			content: `
		<h3>Project Overview</h3>
		<p>
			<strong>Cubets</strong> is a lightweight 3D web game built with <strong>Three.js</strong>, combining neon cyberpunk visuals
			with smooth gameplay and glowing aesthetic effects. You control a luminous cube that navigates through a 2D-like arena,
			avoiding randomly spawned enemies while scoring points and leveling up.
		</p>

		<h3>Key Features</h3>
		<ul>
			<li><strong>Neon Glow FX:</strong> Futuristic visual effects powered by <em>UnrealBloomPass</em>.</li>
			<li><strong>Player Control:</strong> Smooth 2D movement using WASD or arrow keys.</li>
			<li><strong>Dynamic Enemies:</strong> Randomly generated enemy cubes with adjustable spawn limits.</li>
			<li><strong>Scoring & Level System:</strong> Gain points, level up, and trigger color transitions with neon bursts.</li>
			<li><strong>Modular Architecture:</strong> Separated components for player, enemy, collision, scoring, transitions, and more.</li>
			<li><strong>Design Patterns Implemented:</strong>
				<ul>
					<li>Composition Root</li>
					<li>Event-Driven Visual Pattern</li>
					<li>Observable State Pattern</li>
					<li>UI Overlay Pattern</li>
					<li>State Gate Pattern</li>
				</ul>
			</li>
		</ul>
	`
		}
	],
	id: [
		{
			id: '1',
			slug: 'emameun',
			title: 'Emameun',
			description:
				'Sebuah website Food Market modern dan responsif yang dibangun dengan Vue.js dan Tailwind CSS. Proyek ini menampilkan katalog produk dinamis, halaman detail makanan, dan keranjang belanja interaktif untuk pengalaman pengguna yang lancar.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/emameun/base.jpg`,
			repoUrl: 'https://github.com/mikeu-dev/next-sv-mikeu-dev',
			demoUrl: 'https://emameun.vercel.app/',
			tags: [
				{ name: 'Vue', icon: SiVuedotjs, color: '#41B883', url: 'https://vuejs.org/' },
				{
					name: 'Tailwind CSS',
					icon: SiTailwindcss,
					color: '#5EEAD4',
					url: 'https://tailwindcss.com/'
				}
			],
			content: `
			<h3>Ikhtisar Proyek</h3>
			<p>Tujuan utama adalah mengembangkan platform e-commerce yang menarik secara visual dan sangat mudah digunakan untuk pasar makanan. Fokusnya adalah menciptakan pengalaman browsing dan pembelian yang lancar bagi pelanggan, dari menemukan produk hingga checkout.</p>
			<h3>Fitur Utama</h3>
			<ul>
				<li><strong>Katalog Produk Dinamis:</strong> Katalog makanan yang mudah dijelajahi dengan kategorisasi dan fungsi pencarian yang jelas.</li>
				<li><strong>Keranjang Belanja Interaktif:</strong> Pengguna dapat menambahkan, menghapus, dan memperbarui jumlah item di keranjang secara real-time tanpa memuat ulang halaman.</li>
				<li><strong>Desain Responsif:</strong> Layout sepenuhnya responsif dengan Tailwind CSS, memberikan pengalaman yang baik di desktop maupun perangkat mobile.</li>
				<li><strong>Arsitektur Berbasis Komponen:</strong> Dibangun menggunakan Vue.js untuk kode yang modular, mudah dipelihara, dan dapat diskalakan.</li>
			</ul>`
		},
		{
			id: '2',
			slug: 'dlh-purwakarta',
			title: 'Dinas Lingkungan Hidup Kabupaten Purwakarta',
			description:
				'Sebuah sistem informasi komprehensif untuk Dinas Lingkungan Hidup Kabupaten Purwakarta. Platform ini menjadi pusat informasi program lingkungan, layanan publik, dan sumber edukasi, dilengkapi peta interaktif untuk memvisualisasikan data lingkungan.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/dlh-purwakarta/base.jpg`,
			imagesUrl: [
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/dlh-purwakarta/base.jpg`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/dlh-purwakarta/dlh-pengaduan.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/dlh-purwakarta/dlh-lacak-pengaduan.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/dlh-purwakarta/dlh-dashboard.png`
			],
			demoUrl: 'https://dlh.purwakartakab.go.id/',
			tags: [
				{ name: 'Laravel', icon: SiLaravel, color: '#FF5555', url: 'laravel.com' },
				{ name: 'Bootstrap', icon: SiBootstrap, color: '#BB86FC', url: 'bootstrap.com' },
				{ name: 'Leaflet', icon: SiLeaflet, color: '#76FF03', url: 'leafletjs.com' }
			],
			content: `
			<h3>Ikhtisar Proyek</h3>
			<p>Proyek ini bertujuan membuat website resmi yang ramah pengguna untuk Dinas Lingkungan Hidup Kabupaten Purwakarta. Tujuannya adalah menyampaikan misi, layanan, dan inisiatif mereka kepada publik secara efektif, sekaligus menyediakan alat visualisasi data dan partisipasi publik.</p>
			<h3>Fitur Utama</h3>
			<ul>
				<li><strong>Portal Informasi:</strong> Menjadi sumber utama informasi terkait pengendalian polusi, pengelolaan sampah, dan program konservasi.</li>
				<li><strong>Peta GIS Interaktif:</strong> Dibangun dengan Leaflet, fitur ini memungkinkan pengguna memvisualisasikan data lingkungan penting di seluruh wilayah Purwakarta.</li>
				<li><strong>Informasi Layanan Publik:</strong> Memberikan detail layanan secara jelas dan mudah diakses.</li>
				<li><strong>Backend Andal:</strong> Dijalankan dengan Laravel untuk memastikan manajemen data dan pembaruan konten yang handal.</li>
			</ul>`
		},
		{
			id: '3',
			pinned: true,
			slug: 'upi-jatiluhur',
			title: 'Unit Pengelolaan Irigasi D.I Jatiluhur',
			description:
				'Sebuah sistem informasi berbasis web untuk Unit Pengelolaan Irigasi Jatiluhur. Platform ini menyediakan data irigasi penting, sistem pemetaan interaktif untuk memantau saluran, dan fitur pengaduan publik.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/upi-jatiluhur/base.jpg`,
			imagesUrl: [
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/upi-jatiluhur/base.jpg`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/upi-jatiluhur/upi-map.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/upi-jatiluhur/upi-login.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/upi-jatiluhur/upi-dashboard.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/upi-jatiluhur/upi-pengaduan.png`
			],
			demoUrl: 'https://upijatiluhur.id/',
			tags: [
				{ name: 'Laravel', icon: SiLaravel, color: '#FF5555', url: 'laravel.com' },
				{ name: 'Bootstrap', icon: SiBootstrap, color: '#BB86FC', url: 'bootstrap.com' },
				{ name: 'Leaflet', icon: SiLeaflet, color: '#76FF03', url: 'leafletjs.com' }
			],
			content: `
			<h3>Ikhtisar Proyek</h3>
			<p>Tujuan proyek ini adalah mengembangkan platform digital untuk mendukung Unit Pengelolaan Irigasi Jatiluhur. Sistem ini memfasilitasi pengelolaan dan pemantauan jaringan irigasi melalui landing page publik dan dashboard internal yang lengkap.</p>
			<h3>Fitur Utama</h3>
			<ul>
				<li><strong>Pemetaan Interaktif:</strong> Menggunakan Leaflet untuk menampilkan dan memantau kondisi saluran irigasi, titik distribusi air, dan data penting lainnya secara visual, membantu pengambilan keputusan.</li>
				<li><strong>Sistem Pengaduan Publik:</strong> Masyarakat dapat melaporkan masalah seperti penyumbatan atau kerusakan melalui website, yang kemudian diteruskan ke pihak berwenang.</li>
				<li><strong>Dashboard dan Pelaporan:</strong> Dashboard internal menyediakan alat bagi administrator untuk mengelola data, melihat laporan, dan memantau status sistem irigasi.</li>
			</ul>`
		},
		{
			id: '4',
			slug: 'mapin-aja',
			title: 'Mapin Aja',
			description:
				'Aplikasi web interaktif untuk membuat, melihat, dan mengelola data geospasial. Dibangun dengan Next.js dan React, memungkinkan pengguna menggambar di peta, impor/ekspor berbagai format file GIS, dan memvisualisasikan data secara real-time.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/mapin-aja/base.jpg`,
			demoUrl: 'https://mapin-aja.vercel.app/',
			repoUrl: 'https://github.com/mikeu-dev/mapin-aja',
			tags: [
				{ name: 'Next js', icon: SiNextdotjs, color: '#171d26', url: 'nextjs.org' },
				{ name: 'React', icon: SiReact, color: '#42A5F5', url: 'react.dev' },
				{
					name: 'Tailwind CSS',
					icon: SiTailwindcss,
					color: '#5EEAD4',
					url: 'https://tailwindcss.com/'
				},
				{ name: 'Leaflet', icon: SiLeaflet, color: '#76FF03', url: 'leafletjs.com' }
			],
			content: `
			<h3>Ikhtisar Proyek</h3>
			<p>Mapin Aja dibuat untuk menjadi alat ringan, mudah diakses, dan kuat bagi siapa pun yang bekerja dengan data geospasial. Menghilangkan kebutuhan software desktop kompleks untuk banyak tugas GIS umum, menyediakan alternatif web yang cepat dan interaktif.</p>
			<h3>Fitur Utama</h3>
			<ul>
				<li><strong>Alat Gambar Interaktif:</strong> Pengguna dapat menggambar titik, garis, dan poligon langsung di peta.</li>
				<li><strong>Editor GeoJSON:</strong> Editor teks bawaan memungkinkan pembuatan dan pengeditan GeoJSON secara real-time, langsung ditampilkan di peta.</li>
				<li><strong>Dukungan Multi-Format:</strong> Mendukung impor dan ekspor format geospasial populer seperti GeoJSON, TopoJSON, KML, dan Shapefile.</li>
				<li><strong>Teknologi Modern:</strong> Dibangun dengan Next.js dan React untuk pengalaman pengguna yang cepat dan server-rendered.</li>
			</ul>`
		},
		{
			id: '5',
			pinned: true,
			slug: 'investasi-purwakarta',
			title: 'Investasi Purwakarta',
			description:
				'Platform untuk mengelola dan memantau proyek investasi di wilayah Purwakarta. Menyediakan alat manajemen proyek, pencarian/filter lanjutan, dan visualisasi data dalam format tabel dan peta, dibangun dengan CodeIgniter 4.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/investasi-purwakarta/base.jpg`,
			imagesUrl: [
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/investasi-purwakarta/base.jpg`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/investasi-purwakarta/investasi-map.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/investasi-purwakarta/investasi-login.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/investasi-purwakarta/investasi-dashboard.png`
			],
			demoUrl: 'https://investasi.purwakartakab.go.id/',
			tags: [
				{ name: 'Codeigniter 4', icon: SiCodeigniter, color: '#FF5722', url: 'codeigniter.com' },
				{ name: 'Bootstrap', icon: SiBootstrap, color: '#BB86FC', url: 'bootstrap.com' },
				{ name: 'Leaflet', icon: SiLeaflet, color: '#76FF03', url: 'leafletjs.com' }
			],
			content: `
			<h3>Ikhtisar Proyek</h3>
			<p>Platform ini dikembangkan untuk DPMPTSP Purwakarta untuk mempermudah pengelolaan dan pemantauan proyek investasi. Memberikan sistem terpusat untuk memantau kemajuan proyek dan memvisualisasikan distribusi investasi.</p>
			<h3>Fitur Utama</h3>
			<ul>
				<li><strong>Manajemen Proyek:</strong> Fungsi CRUD lengkap (Create, Read, Update, Delete) untuk data proyek investasi.</li>
				<li><strong>Pencarian dan Filter Lanjutan:</strong> Memudahkan pengguna menemukan proyek berdasarkan kategori, lokasi, dan status.</li>
				<li><strong>Visualisasi Data Ganda:</strong> Data investasi dapat dilihat dalam tabel terstruktur atau di peta interaktif.</li>
				<li><strong>Autentikasi Pengguna:</strong> Sistem login aman untuk mengontrol akses fitur admin.</li>
			</ul>`
		},
		{
			id: '6',
			slug: 'purbakesa',
			title: 'Purbakesa',
			description:
				'Platform untuk Purwakarta sebagai sistem analisa dan kendali kesehatan, dibangun menggunakan CodeIgniter 3.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/purbakesa/purbakesa-login.png`,
			imagesUrl: [
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/purbakesa/purbakesa-login.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/purbakesa/purbakesa-dashboard.png`
			],
			demoUrl: 'https://www.purbakesa.purwakartakab.go.id/',
			tags: [
				{
					name: 'CodeIgniter 3',
					icon: SiCodeigniter,
					color: '#FF5722',
					url: 'https://codeigniter.com'
				},
				{ name: 'Bootstrap', icon: SiBootstrap, color: '#7952B3', url: 'https://getbootstrap.com' },
				{ name: 'Leaflet', icon: SiLeaflet, color: '#76FF03', url: 'https://leafletjs.com' }
			],
			content: `
		<h3>Ikhtisar Proyek</h3>
		<p>
			Purbakesa adalah platform analisa dan kendali kesehatan yang dikembangkan untuk Dinas Kesehatan Kabupaten Purwakarta.
			Sistem ini membantu dalam pengelolaan data kesehatan, ketersediaan obat, fasilitas layanan, serta integrasi data BPJS secara real-time.
		</p>

		<h3>Fitur Utama</h3>
		<ul>
			<li><strong>Dashboard Statistik:</strong> Menampilkan data obat, rumah sakit, puskesmas, pasien, dan keuangan secara dinamis.</li>
			<li><strong>Bed Monitoring:</strong> Informasi ketersediaan tempat tidur dari sumber BPJS Kesehatan terintegrasi real-time.</li>
			<li><strong>E-Dinkes:</strong> Analisis top diagnosa dan kunjungan pasien.</li>
			<li><strong>PERBEKES:</strong> Monitoring ketersediaan obat dan vaksin IDL.</li>
			<li><strong>Keuangan:</strong> Modul pencatatan dan pelaporan keuangan kesehatan.</li>
			<li><strong>SDK:</strong> Manajemen SDM Keuangan.</li>
			<li><strong>Yankes:</strong> Layanan Keluarga Sehat, Mutu Gigi &amp; Mulut, Pembiayaan, dan Rujukan Primer.</li>
			<li><strong>P2P:</strong> Pemantauan Imunisasi, P2M, dan PTM.</li>
			<li><strong>Kesmas:</strong> Modul Gizi, Kesga, Kesling, Promkes, Posyandu, PHBS, dan Desa Siaga.</li>
			<li><strong>Jabang Tutuka:</strong> Modul layanan ibu dan anak.</li>
			<li><strong>Call Center:</strong> Penanganan rujukan dan non-rujukan.</li>
			<li><strong>Sistem Informasi Kesehatan:</strong> Redirect ke sistem eksternal terintegrasi.</li>
			<li><strong>Data Obat:</strong> Manajemen data obat, satuan, transaksi masuk/keluar, dan rekapitulasi.</li>
			<li><strong>Lokasi:</strong> Peta interaktif untuk Rumah Sakit, Puskesmas, Dokter, Bidan, dan tenaga medis lainnya.</li>
			<li><strong>Manajemen Pasien:</strong> Pengelolaan data pasien secara lengkap.</li>
			<li><strong>Manajemen Pengguna:</strong> Sistem login aman untuk mengatur akses dan hak admin.</li>
		</ul>
	`
		},
		{
			id: '7',
			slug: 'siperintis',
			title: 'Sistem Informasi Persetujuan Teknis',
			description:
				'Sebuah aplikasi web untuk menyederhanakan proses persetujuan teknis proyek konstruksi. Dibangun dengan Laravel dan TALL stack (Tailwind, Alpine.js, Livewire, Laravel), menyediakan platform terpusat untuk mengelola permintaan persetujuan secara efisien.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/siperintis/siperintis-applicant-app.png`,
			imagesUrl: [
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/siperintis/siperintis-applicant-app.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/siperintis/siperintis-login-page.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/siperintis/siperintis-dashboard-page.png`
			],
			demoUrl: 'https://siperintis.pratama.live/',
			tags: [
				{ name: 'Laravel', icon: SiLaravel, color: '#FF5555', url: 'laravel.com' },
				{ name: 'Filament', icon: SiFi, color: '#eb6b34', url: 'filamentphp.com' },
				{ name: 'Livewire', icon: SiLivewire, color: '#f582d2', url: 'laravel-livewire.com' },
				{ name: 'Tailwind CSS', icon: SiTailwindcss, color: '#5EEAD4', url: 'tailwindcss.com' }
			],
			content: `
			<h3>Ikhtisar Proyek</h3>
			<p>Siperintis dirancang untuk mendigitalkan dan menyederhanakan proses persetujuan teknis proyek konstruksi yang biasanya berbasis kertas. Sistem ini menciptakan alur kerja yang efisien dan transparan bagi pemohon dan tim review internal.</p>
			<h3>Fitur Utama</h3>
			<ul>
				<li><strong>Pengajuan Online:</strong> Pemohon dapat mengirim permintaan persetujuan teknis dan mengunggah dokumen melalui portal yang ramah pengguna.</li>
				<li><strong>Dashboard Admin:</strong> Panel admin kuat dengan Filament memungkinkan tim review mengelola, meninjau, dan memantau semua permintaan masuk.</li>
				<li><strong>UI Reaktif:</strong> Antarmuka dibangun dengan Livewire dan Alpine.js, memberikan pengalaman dinamis tanpa reload penuh halaman.</li>
				<li><strong>TALL Stack Modern:</strong> Memanfaatkan kekuatan penuh TALL stack untuk pengembangan aplikasi cepat dan robust.</li>
			</ul>`
		},
		{
			id: '8',
			pinned: true,
			slug: 'pratama-tech-solution',
			title: 'PT Pratama Solusi Teknologi',
			description:
				'Sebuah aplikasi web untuk software house terpercaya yang menyediakan layanan pengembangan aplikasi, sistem informasi, integrasi API, dan solusi teknologi inovatif untuk mendukung pertumbuhan bisnis dan instansi. Dibangun menggunakan SvelteKit, Drizzle-Kit, MySQL, dan Shadcn.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/pst/pst-landing.png`,
			imagesUrl: [
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/pst/pst-landing.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/pst/pst-landing-light.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/pst/pst-login.png`
			],
			demoUrl: 'https://pratamatechsolution.co.id/',
			tags: [
				{ name: 'SvelteKit', icon: SiSvelte, color: '#FC3D03', url: 'https://svelte.dev' },
				{ name: 'Drizzle-Kit', icon: SiDrizzle, color: '#03FC17', url: 'https://orm.drizzle.team' },
				{ name: 'MySQL', icon: SiMysql, color: '#52829C', url: 'https://www.mysql.com' },
				{
					name: 'Tailwind CSS',
					icon: SiTailwindcss,
					color: '#5EEAD4',
					url: 'https://tailwindcss.com'
				},
				{
					name: 'Shadcn UI',
					icon: SiShadcnui,
					color: '#B0420B',
					url: 'https://www.shadcn-svelte.com'
				},
				{ name: 'Vite', icon: SiVite, color: '#FCFC05', url: 'https://vite.dev' },
				{ name: 'Node.js', icon: SiNodedotjs, color: '#0AA105', url: 'https://nodejs.org' }
			],
			content: `
		<h3>Ikhtisar Proyek</h3>
		<p>
			Aplikasi ini dikembangkan untuk <strong>PT Pratama Solusi Teknologi</strong> sebagai sistem ERP internal dan portal resmi perusahaan.
			Platform ini berfungsi sebagai representasi digital perusahaan sekaligus fondasi awal pengembangan sistem manajemen internal
			seperti proyek, klien, keuangan, dan sumber daya manusia.
		</p>

		<h3>Fitur Utama</h3>
		<ul>
			<li><strong>Landing Page:</strong> Menampilkan profil perusahaan, layanan, portofolio, dan kontak dengan tampilan modern dan responsif.</li>
			<li><strong>ERP Management (On-Going):</strong> Modul manajemen internal untuk operasional software house, termasuk pengelolaan proyek, tim, dan klien.</li>
			<li><strong>Autentikasi dan Role Management:</strong> Sistem login aman dengan pembagian hak akses berbasis peran (role-based access).</li>
			<li><strong>Integrasi API:</strong> Struktur backend disiapkan untuk koneksi antar modul dan integrasi sistem pihak ketiga di masa depan.</li>
			<li><strong>Desain Modular:</strong> Menggunakan komponen UI dari Shadcn dan Tailwind CSS untuk menjaga konsistensi dan skalabilitas antarmuka.</li>
			<li><strong>Performa Optimal:</strong> Menggunakan Vite dan Node.js untuk memastikan kecepatan build dan pengalaman pengguna yang lancar.</li>
		</ul>
	`
		},
		{
			id: '9',
			slug: 'sidolih',
			title: 'Sistem Informasi Dokumen Lingkungan Hidup Kabupaten Purwakarta',
			description:
				'Sebuah sistem informasi komprehensif yang dikembangkan untuk Dinas Lingkungan Hidup Kabupaten Purwakarta. Platform ini berfungsi sebagai pusat arsip dan pengelolaan dokumen lingkungan hidup secara digital dan terintegrasi.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/sidolih/sidolih-login.png`,
			imagesUrl: [
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/sidolih/sidolih-login.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/sidolih/sidolih-dashboard.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/sidolih/sidolih-pelaporan.png`
			],
			demoUrl: 'https://siardlin.purwakartakab.go.id/',
			tags: [
				{ name: 'Laravel', icon: SiLaravel, color: '#FF5555', url: 'https://laravel.com' },
				{ name: 'Bootstrap', icon: SiBootstrap, color: '#7952B3', url: 'https://getbootstrap.com' },
				{ name: 'Leaflet', icon: SiLeaflet, color: '#76FF03', url: 'https://leafletjs.com' }
			],
			content: `
		<h3>Ikhtisar Proyek</h3>
		<p>
			SIDOLIH (Sistem Informasi Dokumen Lingkungan Hidup) merupakan platform digital yang dikembangkan untuk
			<strong>Dinas Lingkungan Hidup Kabupaten Purwakarta</strong>. Sistem ini dirancang untuk mengelola, mengarsipkan,
			dan memantau seluruh dokumen lingkungan hidup secara efisien dan terpusat.
		</p>

		<h3>Fitur Utama</h3>
		<ul>
			<li><strong>Pengajuan Dokumen Lingkungan Hidup:</strong> Fitur untuk mengajukan dokumen seperti UKL-UPL, Amdal, dan izin lingkungan lainnya secara online.</li>
			<li><strong>Pelaporan RKTL:</strong> Modul pelaporan kegiatan Rencana Kelola dan Pemantauan Lingkungan (RKTL) oleh perusahaan.</li>
			<li><strong>Pengarsipan Dokumen:</strong> Sistem pengarsipan digital untuk dokumen UKL-UPL, Amdal, dan hasil penilaian verifikasi.</li>
			<li><strong>Sinkronisasi Data:</strong> Integrasi API dengan data kecamatan dan desa untuk validasi lokasi kegiatan.</li>
			<li><strong>Manajemen Pengguna:</strong> Modul untuk mengatur akun, peran, dan hak akses pengguna aplikasi.</li>
			<li><strong>Pengaturan Aplikasi:</strong> Fitur untuk konfigurasi sistem seperti nama aplikasi, logo instansi, dan preferensi lainnya.</li>
		</ul>
	`
		},
		{
			id: '10',
			pinned: true,
			slug: 'geo-draw',
			title: 'GeoDraw',
			description:
				'GeoDraw adalah editor web sederhana untuk membuat dan melihat data GeoJSON secara interaktif, terinspirasi dari geojson.io. Pengguna dapat menggambar titik, garis, dan poligon di peta interaktif serta mendapatkan keluaran GeoJSON secara real-time.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/geo-draw/base.png`,
			demoUrl: 'https://geo-draw-ol.vercel.app/',
			repoUrl: 'https://github.com/mikeu-dev/geo-draw',
			tags: [
				{
					name: 'Next.js',
					icon: SiNextdotjs,
					color: '#171d26',
					url: 'https://nextjs.org/'
				},
				{
					name: 'React',
					icon: SiReact,
					color: '#42A5F5',
					url: 'https://react.dev/'
				},
				{
					name: 'Tailwind CSS',
					icon: SiTailwindcss,
					color: '#5EEAD4',
					url: 'https://tailwindcss.com/'
				},
				{
					name: 'OpenLayers',
					icon: SiOpenlayers,
					color: '#009688',
					url: 'https://openlayers.org/'
				},
				{
					name: 'Shadcn UI',
					icon: SiShadcnui,
					color: '#171d26',
					url: 'https://ui.shadcn.com/'
				}
			],
			content: `
		<h3>Ikhtisar Proyek</h3>
		<p>
			GeoDraw merupakan aplikasi berbasis web untuk membuat dan mengedit data <strong>GeoJSON</strong> secara visual. 
			Terinsipirasi oleh <em>geojson.io</em>, aplikasi ini memungkinkan pengguna menggambar <strong>titik (Point)</strong>, 
			<strong>garis (LineString)</strong>, dan <strong>poligon (Polygon)</strong> di atas peta interaktif 
			dengan hasil GeoJSON yang diperbarui secara real-time.
		</p>

		<h3>Fitur Utama</h3>
		<ul>
			<li><strong>Peta Interaktif:</strong> Navigasi, pan, dan zoom pada peta dasar dari OpenStreetMap.</li>
			<li><strong>Alat Menggambar:</strong> Membuat titik, garis, dan poligon secara langsung di peta.</li>
			<li><strong>Edit & Hapus:</strong> Memodifikasi atau menghapus objek yang telah dibuat.</li>
			<li><strong>Output Real-time:</strong> GeoJSON diperbarui otomatis setiap kali pengguna menggambar atau mengedit objek.</li>
			<li><strong>Validasi AI:</strong> Memeriksa struktur GeoJSON dengan alat validasi bertenaga AI.</li>
			<li><strong>Salin ke Clipboard:</strong> Menyalin hasil GeoJSON dengan sekali klik.</li>
			<li><strong>Desain Responsif:</strong> Dapat digunakan di perangkat desktop maupun mobile.</li>
		</ul>
	`
		},
		{
			id: '11',
			pinned: true,
			slug: 'satu-peta',
			title: 'Satu Peta — Sistem Geospasial Kabupaten Purwakarta',
			description:
				'Sebuah sistem informasi geospasial komprehensif yang dikembangkan untuk Dinas Komunikasi dan Informatika (Diskominfo) Kabupaten Purwakarta. Platform inovatif ini menyajikan data spasial terintegrasi untuk mendukung pembangunan daerah dan layanan publik. Dengan antarmuka modern dan fitur interaktif, eksplorasi data spasial menjadi lebih intuitif dan menarik.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/satu-peta/satu-peta-landing.png`,
			imagesUrl: [
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/satu-peta/satu-peta-landing.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/satu-peta/satu-peta-map.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/satu-peta/satu-peta-login.png`,
				`https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/satu-peta/satu-peta-dashboard.png`
			],
			tags: [
				{ name: 'Laravel', icon: SiLaravel, color: '#FF5555', url: 'https://laravel.com' },
				{ name: 'Bootstrap', icon: SiBootstrap, color: '#BB86FC', url: 'https://getbootstrap.com' },
				{
					name: 'OpenLayers',
					icon: SiOpenlayers,
					color: '#009688',
					url: 'https://openlayers.org/'
				},
				{ name: 'MySQL', icon: SiMysql, color: '#52829C', url: 'https://www.mysql.com/' },
				{ name: 'Vite', icon: SiVite, color: '#FCFC05', url: 'https://vite.dev/' },
				{ name: 'Node.js', icon: SiNodedotjs, color: '#0AA105', url: 'https://nodejs.org/' }
			],
			content: `
		<h3>Ikhtisar Proyek</h3>
		<p>
			<strong>Satu Peta</strong> adalah platform web geospasial resmi yang dikembangkan untuk 
			<strong>Diskominfo Kabupaten Purwakarta</strong>. Sistem ini mengintegrasikan berbagai data spasial 
			untuk mendukung perencanaan pembangunan, infrastruktur, dan pelayanan publik. 
			Dengan tampilan modern serta alat peta interaktif, pengguna dapat menelusuri dan menganalisis data spasial 
			dengan cara yang lebih mudah dan menyenangkan.
		</p>

		<h3>Fitur Utama</h3>
		<ul>
			<li><strong>Eksplorasi Peta Interaktif:</strong> Navigasi peta yang responsif dengan fitur zoom, pan, dan kontrol interaktif untuk eksplorasi data spasial yang lancar.</li>
			<li><strong>Filter Spasial Canggih:</strong> 
				<ul>
					<li><strong>Bounding Box Query:</strong> Memfilter data berdasarkan area geografis yang dipilih.</li>
					<li><strong>Filter Dataset & Instansi:</strong> Akses cepat ke informasi berdasarkan kategori atau instansi terkait.</li>
				</ul>
			</li>
			<li><strong>Dashboard Manajemen Data:</strong> Kelola dataset peta, pengguna, artikel, pengaturan aplikasi, kategori, serta sinkronisasi data instansi dalam satu panel terpusat.</li>
			<li><strong>Desain Responsif:</strong> Dapat diakses dengan baik melalui perangkat desktop maupun mobile untuk pengalaman pengguna yang optimal.</li>
		</ul>
	`
		},
		{
			id: '12',
			pinned: true,
			slug: 'cubets',
			title: 'Cubets — Game Arena Kubus',
			description:
				'Game mini 3D berbasis Three.js dengan gaya neon cyberpunk dan efek cahaya futuristik. Pemain mengendalikan kubus bercahaya dan harus menghindari musuh di arena dinamis — mirip konsepnya dengan agar.io atau permainan bergaya snake.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/cubets/base.png`,
			repoUrl: 'https://github.com/mikeu-dev/cubets',
			demoUrl: 'https://cubets.vercel.app/',
			tags: [
				{
					name: 'TypeScript',
					icon: SiTypescript,
					color: '#048fd4',
					url: 'https://www.typescriptlang.org/'
				},
				{ name: 'Three.js', icon: SiThreedotjs, color: '#171d26', url: 'https://threejs.org/' },
				{ name: 'Vite', icon: SiVite, color: '#FCFC05', url: 'https://vite.dev/' },
				{ name: 'Node.js', icon: SiNodedotjs, color: '#0AA105', url: 'https://nodejs.org/' }
			],
			content: `
		<h3>Ikhtisar Proyek</h3>
		<p>
			<strong>Cubets</strong> adalah game web 3D ringan yang dibangun dengan <strong>Three.js</strong>, 
			menggabungkan visual neon bergaya cyberpunk dengan gameplay yang halus dan efek cahaya yang futuristik. 
			Pemain mengendalikan kubus bercahaya di arena 2D, menghindari musuh yang muncul secara acak sambil mengumpulkan skor dan naik level.
		</p>

		<h3>Fitur Utama</h3>
		<ul>
			<li><strong>Efek Neon Glow:</strong> Visual futuristik dengan <em>UnrealBloomPass</em>.</li>
			<li><strong>Kontrol Pemain:</strong> Pergerakan 2D halus menggunakan tombol WASD atau panah.</li>
			<li><strong>Musuh Dinamis:</strong> Musuh muncul secara acak dengan jumlah maksimum yang dapat diatur.</li>
			<li><strong>Sistem Skor & Level:</strong> Dapatkan poin, naik level, dan nikmati transisi efek neon saat meningkat.</li>
			<li><strong>Arsitektur Modular:</strong> Komponen terpisah seperti player, enemy, collision, skor, dan transisi.</li>
			<li><strong>Pola Desain yang Diterapkan:</strong>
				<ul>
					<li>Composition Root</li>
					<li>Event-Driven Visual Pattern</li>
					<li>Observable State Pattern</li>
					<li>UI Overlay Pattern</li>
					<li>State Gate Pattern</li>
				</ul>
			</li>
		</ul>
	`
		}
	]
};
