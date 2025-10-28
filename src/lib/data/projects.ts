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
			title: 'Jatiluhur D.I. Irrigation Management Unit',
			description:
				'A web-based information system for the Jatiluhur Irrigation Management Unit. This platform provides essential irrigation data, features an interactive mapping system for monitoring channels, and includes a public complaint submission feature.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/upi-jatiluhur/base.jpg`,
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
			slug: 'investasi-purwakarta',
			title: 'Purwakarta Investment',
			description:
				'A platform for managing and monitoring investment projects in the Purwakarta region. It features project management tools, advanced search/filtering, and data visualization in both table and map formats, all built on the CodeIgniter 4 framework.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/investasi-purwakarta/base.jpg`,
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
			title: 'Technical Approval Information System',
			description:
				'A web application to streamline the technical approval process for construction projects. Built with Laravel and the TALL stack (Tailwind, Alpine.js, Livewire, Laravel), it provides a centralized platform for managing approval requests efficiently.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/siperintis/siperintis-applicant-app.png`,
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
			slug: 'upi-jatiluhur',
			title: 'Unit Pengelolaan Irigasi D.I Jatiluhur',
			description:
				'Sebuah sistem informasi berbasis web untuk Unit Pengelolaan Irigasi Jatiluhur. Platform ini menyediakan data irigasi penting, sistem pemetaan interaktif untuk memantau saluran, dan fitur pengaduan publik.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/upi-jatiluhur/base.jpg`,
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
			slug: 'investasi-purwakarta',
			title: 'Investasi Purwakarta',
			description:
				'Platform untuk mengelola dan memantau proyek investasi di wilayah Purwakarta. Menyediakan alat manajemen proyek, pencarian/filter lanjutan, dan visualisasi data dalam format tabel dan peta, dibangun dengan CodeIgniter 4.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/investasi-purwakarta/base.jpg`,
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
			slug: 'siperintis',
			title: 'Sistem Informasi Persetujuan Teknis',
			description:
				'Sebuah aplikasi web untuk menyederhanakan proses persetujuan teknis proyek konstruksi. Dibangun dengan Laravel dan TALL stack (Tailwind, Alpine.js, Livewire, Laravel), menyediakan platform terpusat untuk mengelola permintaan persetujuan secara efisien.',
			thumbnailUrl: `https://raw.githubusercontent.com/${env.USER_REPO}/${env.GITHUB_REPO}/main/${env.PROJECTS_DIR}/siperintis/siperintis-applicant-app.png`,
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
		}
	]
};
