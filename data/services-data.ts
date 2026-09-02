export interface ServiceItemData {
  id: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  title: string;
  subtitle?: string;
  shortDescription: string;
  iconName: string;
  badge?: string;
  image: string;
  imageAlt: string;
  capabilities: string[];
  detailedServices?: {
    groupTitle: string;
    items: string[];
  }[];
  cardCtaText: string;
  whatsappMessage: string;
}

export interface ServiceCategoryTab {
  id: string;
  slug: string;
  label: string;
  iconName: string;
}

export const SERVICE_CATEGORIES: ServiceCategoryTab[] = [
  { id: 'all', slug: 'all', label: 'All Services', iconName: 'Layers' },
  { id: 'networking', slug: 'networking', label: 'Networking', iconName: 'Network' },
  { id: 'internet', slug: 'internet', label: 'Internet Infrastructure', iconName: 'Globe' },
  { id: 'cisco', slug: 'cisco', label: 'Cisco', iconName: 'Cpu' },
  { id: 'mikrotik', slug: 'mikrotik', label: 'MikroTik', iconName: 'Router' },
  { id: 'servers', slug: 'servers', label: 'Servers', iconName: 'Server' },
  { id: 'it-support', slug: 'it-support', label: 'IT Support', iconName: 'Wrench' },
  { id: 'cybersecurity', slug: 'cybersecurity', label: 'Cybersecurity', iconName: 'ShieldCheck' },
  { id: 'wireless', slug: 'wireless', label: 'Wireless', iconName: 'Wifi' },
  { id: 'cabling', slug: 'cabling', label: 'Cabling', iconName: 'Cable' },
  { id: 'cctv', slug: 'cctv', label: 'CCTV', iconName: 'Video' },
  { id: 'digital-services', slug: 'digital-services', label: 'Digital Services', iconName: 'Code' },
];

export const SERVICES_DATA: ServiceItemData[] = [
  // 1. Networking & Internet Infrastructure
  {
    id: 'network-design-architecture',
    slug: 'network-design-architecture',
    categorySlug: 'networking',
    categoryName: 'Networking',
    title: 'Network Design & Architecture',
    shortDescription:
      'High-performance LAN/WAN topology planning, VLAN segmentation, and enterprise infrastructure blueprints built for resilience and scalability.',
    iconName: 'Network',
    badge: 'Core Infrastructure',
    image: '/net2.jpg',
    imageAlt: 'Enterprise Network Architecture and Topology Planning',
    capabilities: [
      'LAN/WAN design & topology planning',
      'IP addressing, subnetting & VLAN architecture',
      'Network segmentation & traffic isolation',
      'Comprehensive network documentation & mapping',
    ],
    detailedServices: [
      {
        groupTitle: 'Engineering Deliverables',
        items: [
          'LAN/WAN design',
          'Network topology planning',
          'IP addressing',
          'VLAN architecture',
          'Subnetting',
          'Network segmentation',
          'Network documentation',
          'Infrastructure planning',
        ],
      },
    ],
    cardCtaText: 'Design My Network',
    whatsappMessage:
      'Hello ABS Network, I am interested in your Network Design & Architecture services. I would like to discuss my requirements.',
  },
  {
    id: 'office-network-installation',
    slug: 'office-network-installation',
    categorySlug: 'networking',
    categoryName: 'Networking',
    title: 'Office Network Installation',
    shortDescription:
      'End-to-end office networking rollout including rack assembly, patch panel dressing, switch configuration, and certified cable testing.',
    iconName: 'Building2',
    badge: 'On-Site Deployment',
    image: '/net1.jpg',
    imageAlt: 'Office Network Installation and Structured Rack Management',
    capabilities: [
      'Complete office network deployment',
      'Structured cabling, patch panels & rack setup',
      'Switch & access point installation',
      'Cable testing, labeling & clean management',
    ],
    detailedServices: [
      {
        groupTitle: 'Installation Scope',
        items: [
          'Complete office network deployment',
          'Structured cabling',
          'Network racks',
          'Patch panels',
          'Switch installation',
          'Access point installation',
          'Network testing',
          'Network labeling',
          'Cable management',
        ],
      },
    ],
    cardCtaText: 'Request Site Survey',
    whatsappMessage:
      'Hello ABS Network, I need complete Office Network Installation and deployment support.',
  },
  {
    id: 'internet-infrastructure',
    slug: 'internet-infrastructure',
    categorySlug: 'internet',
    categoryName: 'Internet Infrastructure',
    title: 'Internet Infrastructure & Multi-WAN',
    shortDescription:
      'Redundant ISP connectivity, dedicated fiber links, automated failover, dynamic load balancing, and bandwidth queue management.',
    iconName: 'Globe',
    badge: 'Zero Downtime',
    image: '/hero3.jpg',
    imageAlt: 'Enterprise Internet Infrastructure and Multi-WAN Failover',
    capabilities: [
      'ISP connectivity & dedicated fiber routing',
      'Multi-WAN load balancing & automatic failover',
      'Bandwidth management & traffic shaping',
      'Real-time network latency & uptime monitoring',
    ],
    detailedServices: [
      {
        groupTitle: 'Connectivity Features',
        items: [
          'Internet infrastructure design',
          'ISP connectivity',
          'Fiber connectivity',
          'Wireless links',
          'Failover internet',
          'Load balancing',
          'Bandwidth management',
          'Multi-WAN configuration',
          'Network monitoring',
        ],
      },
    ],
    cardCtaText: 'Optimize Internet',
    whatsappMessage:
      'Hello ABS Network, I am interested in your Internet Infrastructure and Multi-WAN failover solutions.',
  },
  {
    id: 'network-troubleshooting',
    slug: 'network-troubleshooting',
    categorySlug: 'networking',
    categoryName: 'Networking',
    title: 'Network Troubleshooting & Optimization',
    shortDescription:
      'Fast diagnosis and root-cause resolution for packet loss, DNS issues, IP conflicts, Wi-Fi interference, and bottlenecked throughput.',
    iconName: 'Activity',
    badge: 'Rapid Resolution',
    image: '/net.jpg',
    imageAlt: 'Network Troubleshooting and Packet Analysis',
    capabilities: [
      'Slow network & bandwidth bottleneck resolution',
      'Packet loss, DNS & DHCP conflict debugging',
      'Wi-Fi coverage & routing fault remediation',
      'Comprehensive throughput & latency tuning',
    ],
    detailedServices: [
      {
        groupTitle: 'Diagnostic Scope',
        items: [
          'Slow network troubleshooting',
          'Connectivity problems',
          'Packet loss',
          'DNS problems',
          'DHCP problems',
          'IP conflicts',
          'Wi-Fi problems',
          'Routing problems',
          'Network performance optimization',
        ],
      },
    ],
    cardCtaText: 'Fix My Network',
    whatsappMessage:
      'Hello ABS Network, I am facing network issues and need urgent network troubleshooting assistance.',
  },

  // 2. Cisco Networking Services
  {
    id: 'cisco-network-solutions',
    slug: 'cisco-network-solutions',
    categorySlug: 'cisco',
    categoryName: 'Cisco',
    title: 'Cisco Network Solutions',
    shortDescription:
      'Certified configuration and management for Cisco Catalyst switches, ISR/ASR routers, Inter-VLAN routing, OSPF, ACLs, and port security.',
    iconName: 'Cpu',
    badge: 'Certified Engineers',
    image: '/images/shop/switches.jpg',
    imageAlt: 'Cisco Router and Switch Enterprise Configuration',
    capabilities: [
      'Cisco switch & router configuration',
      'VLANs, 802.1Q trunks, access ports & Inter-VLAN routing',
      'Static routing, OSPF, EIGRP, NAT & ACL security',
      'STP, Port Security, device hardening & maintenance',
    ],
    detailedServices: [
      {
        groupTitle: 'Cisco Technologies',
        items: [
          'Cisco switch configuration',
          'Cisco router configuration',
          'VLAN configuration',
          'Trunk configuration',
          'Access ports',
          'Inter-VLAN routing',
          'DHCP configuration',
          'Static routing',
          'OSPF & EIGRP',
          'NAT & ACL configuration',
          'Port security & STP',
          'Cisco network optimization',
        ],
      },
    ],
    cardCtaText: 'Contact an Engineer',
    whatsappMessage:
      'Hello ABS Network, I am interested in Cisco networking services and router/switch configuration.',
  },

  // 3. MikroTik Services
  {
    id: 'mikrotik-network-solutions',
    slug: 'mikrotik-network-solutions',
    categorySlug: 'mikrotik',
    categoryName: 'MikroTik',
    title: 'MikroTik Network Solutions',
    shortDescription:
      'Expert RouterOS deployment for PPPoE servers, Hotspot gateways, multi-WAN PCC load balancing, VPN tunnels, and advanced firewall filters.',
    iconName: 'Router',
    badge: 'RouterOS Specialists',
    image: '/images/shop/routers.jpg',
    imageAlt: 'MikroTik RouterOS Configuration and Bandwidth Management',
    capabilities: [
      'RouterOS configuration, PPPoE server/client & DHCP',
      'Multi-WAN failover, PCC load balancing & policy routing',
      'Queue tree bandwidth management & hotspot portals',
      'Site-to-site WireGuard, IPsec & OpenVPN tunnels',
    ],
    detailedServices: [
      {
        groupTitle: 'MikroTik Capabilities',
        items: [
          'MikroTik router configuration',
          'RouterOS configuration',
          'PPPoE server & PPPoE client',
          'DHCP, NAT & Firewall filter rules',
          'VLAN & Routing table setup',
          'Bandwidth management & Simple/Tree queues',
          'Hotspot captive portal',
          'Load balancing & Failover Multi-WAN',
          'VPN & Remote access security',
          'Wireless configuration & ISP setups',
        ],
      },
    ],
    cardCtaText: 'Configure My Network',
    whatsappMessage:
      'Hello ABS Network, I am interested in MikroTik configuration and networking services.',
  },

  // 4. Windows Server & IT Administration
  {
    id: 'windows-server-administration',
    slug: 'windows-server-administration',
    categorySlug: 'servers',
    categoryName: 'Servers',
    title: 'Windows Server & Active Directory',
    shortDescription:
      'Enterprise Windows Server setup, Domain Controller migration, Group Policy enforcement, File/Print servers, IIS, and Microsoft 365 hybrid sync.',
    iconName: 'Server',
    badge: 'Systems Engineering',
    image: '/why.jpg',
    imageAlt: 'Windows Server and Active Directory Domain Management',
    capabilities: [
      'Windows Server installation, migration & patching',
      'Active Directory Domain Services & OU architecture',
      'Group Policy Objects (GPO) security & access rights',
      'DNS, DHCP, IIS web server & Remote Desktop Services',
    ],
    detailedServices: [
      {
        groupTitle: 'Administration Areas',
        items: [
          'Windows Server installation & migration',
          'Domain controller setup & AD migration',
          'User & Group management with OUs',
          'Group Policy (GPO) deployment',
          'Domain joining & Windows authentication',
          'File server, Print server, DHCP & DNS roles',
          'IIS and Remote Desktop Services (RDS)',
          'Microsoft 365 & hybrid cloud integration',
        ],
      },
    ],
    cardCtaText: 'Manage Windows Server',
    whatsappMessage:
      'Hello ABS Network, I am interested in Windows Server and Active Directory administration services.',
  },

  // 5. Linux Server Administration
  {
    id: 'linux-server-administration',
    slug: 'linux-server-administration',
    categorySlug: 'servers',
    categoryName: 'Servers',
    title: 'Linux Server Administration',
    shortDescription:
      'Hardened Linux deployments (Ubuntu, Debian, RHEL/Rocky), Nginx/Apache reverse proxies, Docker containerization, databases, and automated backups.',
    iconName: 'Terminal',
    badge: 'DevOps & SysAdmin',
    image: '/hero4.jpg',
    imageAlt: 'Linux Server Administration and Container Infrastructure',
    capabilities: [
      'Ubuntu, Debian & RHEL/CentOS server deployment',
      'Nginx, Apache, PHP-FPM, MySQL & PostgreSQL setup',
      'Docker containers, reverse proxy & SSL automation',
      'SSH hardening, UFW/iptables firewalls & backup cron',
    ],
    detailedServices: [
      {
        groupTitle: 'Linux Environments',
        items: [
          'Ubuntu Server & Debian configuration',
          'CentOS/RHEL-compatible environments',
          'SSH hardening & user permissions',
          'Nginx & Apache reverse proxies',
          'MySQL/MariaDB & PostgreSQL databases',
          'Docker containerization & stacks',
          'SSL certificates & automated renewal',
          'Server hardening, monitoring & backups',
        ],
      },
    ],
    cardCtaText: 'Setup Linux Server',
    whatsappMessage:
      'Hello ABS Network, I am interested in Linux Server Administration and deployment services.',
  },

  // 6. IT Technical Services for Offices
  {
    id: 'office-it-technical-services',
    slug: 'office-it-technical-services',
    categorySlug: 'it-support',
    categoryName: 'IT Support',
    title: 'Office IT & Technical Services',
    subtitle: 'Your On-Site IT Engineering Team',
    shortDescription:
      'Get professional technical assistance for your office network, computers, servers, internet, printers, and complete IT workplace infrastructure.',
    iconName: 'Wrench',
    badge: 'On-Site & Remote',
    image: '/why1.jpg',
    imageAlt: 'On-Site IT Engineering and Office Support',
    capabilities: [
      'Complete office IT hardware & software setup',
      'Computer, printer, scanner & peripheral configuration',
      'Hardware repairs, Windows troubleshooting & diagnostics',
      'Preventive IT maintenance & on-demand SLA support',
    ],
    detailedServices: [
      {
        groupTitle: 'Support Spectrum',
        items: [
          'Complete office IT setup',
          'Office network deployment',
          'Computer configuration',
          'Printer & scanner installation',
          'Wi-Fi & router setup',
          'User account setup & email configuration',
          'Software installation & licensing',
          'Hardware & Windows troubleshooting',
          'Preventive maintenance visits',
          'On-site & remote engineer dispatch',
        ],
      },
    ],
    cardCtaText: 'Get IT Support',
    whatsappMessage:
      'Hello ABS Network, I need technical IT support and on-site engineering for my office.',
  },

  // 7. Firewall & Cybersecurity
  {
    id: 'network-security-cybersecurity',
    slug: 'network-security-cybersecurity',
    categorySlug: 'cybersecurity',
    categoryName: 'Cybersecurity',
    title: 'Network Security & Cybersecurity',
    shortDescription:
      'Defense-in-depth infrastructure hardening, stateful firewall rules, VLAN isolation, secure VPNs, endpoint protection, and security auditing.',
    iconName: 'ShieldCheck',
    badge: 'Infrastructure Hardening',
    image: '/hero2.jpg',
    imageAlt: 'Network Security, Firewalls and Enterprise Hardening',
    capabilities: [
      'MikroTik & Cisco firewall rule configuration',
      'Network segmentation & secure VLAN boundaries',
      'Encrypted IPsec & WireGuard remote access VPNs',
      'Infrastructure security assessments & backup audits',
    ],
    detailedServices: [
      {
        groupTitle: 'Security Controls',
        items: [
          'Firewall configuration',
          'MikroTik firewall & Cisco security',
          'Network segmentation & VLAN security',
          'Access control policies',
          'Remote access & site-to-site VPNs',
          'Endpoint security & server hardening',
          'Secure enterprise Wi-Fi (WPA3/Enterprise)',
          'Security auditing & vulnerability assessments',
        ],
      },
    ],
    cardCtaText: 'Secure My Network',
    whatsappMessage:
      'Hello ABS Network, I am interested in your network security and cybersecurity services.',
  },

  // 8. Enterprise Wi-Fi & Wireless Solutions
  {
    id: 'enterprise-wifi-wireless',
    slug: 'enterprise-wifi-wireless',
    categorySlug: 'wireless',
    categoryName: 'Wireless',
    title: 'Enterprise Wi-Fi & Wireless',
    shortDescription:
      'Seamless roaming, high-density Access Point installation, RF heatmapping, captive guest portals, and high-throughput Point-to-Point links.',
    iconName: 'Wifi',
    badge: 'High Density',
    image: '/images/shop/abs-ac1200-ceiling-access-point.jpg',
    imageAlt: 'Enterprise Wi-Fi Access Points and Long Range Wireless Links',
    capabilities: [
      'High-density office & campus Wi-Fi deployment',
      'Seamless 802.11k/v/r roaming & RF channel optimization',
      'Guest Wi-Fi with isolated VLAN & bandwidth quotas',
      'Point-to-Point (PtP) & Point-to-Multipoint wireless links',
    ],
    detailedServices: [
      {
        groupTitle: 'Wireless Services',
        items: [
          'Office & enterprise Wi-Fi installation',
          'Ceiling AP deployment & PoE layout',
          'Wireless coverage planning & RF heatmaps',
          'Guest portal & isolated guest VLANs',
          'Point-to-Point wireless links',
          'Point-to-multipoint links for multi-building campuses',
          'Wireless troubleshooting & interference cleanup',
        ],
      },
    ],
    cardCtaText: 'Deploy Enterprise Wi-Fi',
    whatsappMessage:
      'Hello ABS Network, I am interested in your Enterprise Wi-Fi and Wireless Solutions.',
  },

  // 9. Structured Cabling & Physical Infrastructure
  {
    id: 'structured-cabling-infrastructure',
    slug: 'structured-cabling-infrastructure',
    categorySlug: 'cabling',
    categoryName: 'Cabling',
    title: 'Structured Cabling & Infrastructure',
    shortDescription:
      'Certified Cat6/Cat6A and singlemode/multimode fiber optic cabling, server rack assembly, patch panel dressing, and laser-precise labeling.',
    iconName: 'Cable',
    badge: 'Physical Plant',
    image: '/images/shop/fiber optics cable.jpg',
    imageAlt: 'Structured Cabling and Fiber Optic Infrastructure',
    capabilities: [
      'Cat5e, Cat6 & Cat6A high-bandwidth copper drops',
      'Fiber optic backbone splicing & patch panels',
      'Server room rack organization & vertical/horizontal wire management',
      'Fluke/OTDR cable testing, certification & labeling',
    ],
    detailedServices: [
      {
        groupTitle: 'Physical Layer Scope',
        items: [
          'Cat5e, Cat6 & Cat6A structured cabling',
          'Fiber optic infrastructure & termination',
          'Patch panels & keystone jack installation',
          'Network racks & server cabinets',
          'Cable management & tray routing',
          'Faceplates, keystone panels & labeling',
          'Cable testing, continuity & certification',
          'Server-room cabling revamp & cleanup',
        ],
      },
    ],
    cardCtaText: 'Quote Cabling Project',
    whatsappMessage:
      'Hello ABS Network, I am interested in Structured Cabling and physical network infrastructure.',
  },

  // 10. CCTV & Physical Security Networking
  {
    id: 'cctv-security-infrastructure',
    slug: 'cctv-security-infrastructure',
    categorySlug: 'cctv',
    categoryName: 'CCTV',
    title: 'CCTV & Security Infrastructure',
    shortDescription:
      'High-definition IP surveillance cameras, NVR/storage arrays, PoE switch infrastructure, remote mobile viewing, and biometric access control.',
    iconName: 'Video',
    badge: 'IP Surveillance',
    image: '/images/shop/rack&cabinet.jpg',
    imageAlt: 'IP CCTV Surveillance and Physical Security Networking',
    capabilities: [
      'IP CCTV camera placement & PoE network layout',
      'NVR storage calculation, RAID setup & configuration',
      'Encrypted remote viewing on mobile & desktop',
      'Access control & biometric security integration',
    ],
    detailedServices: [
      {
        groupTitle: 'Surveillance Tech',
        items: [
          'IP CCTV camera installation',
          'CCTV dedicated network setup',
          'NVR configuration & storage planning',
          'Remote viewing configuration',
          'PoE switch layout & power budgeting',
          'Access control infrastructure',
          'Security network architecture',
        ],
      },
    ],
    cardCtaText: 'Setup Surveillance',
    whatsappMessage:
      'Hello ABS Network, I am interested in CCTV and security surveillance infrastructure.',
  },

  // 11. Web & Digital Services
  {
    id: 'web-digital-services',
    slug: 'web-digital-services',
    categorySlug: 'digital-services',
    categoryName: 'Digital Services',
    title: 'Web & Digital Solutions',
    shortDescription:
      'High-performance corporate websites, bespoke web applications, UI/UX systems, technical SEO, and cloud DevOps deployment pipelines.',
    iconName: 'Code',
    badge: 'Digital Engineering',
    image: '/hero.jpg',
    imageAlt: 'Custom Web Development and Digital Solutions',
    capabilities: [
      'Corporate websites, landing pages & web apps',
      'UI/UX design systems & responsive interfaces',
      'Technical SEO, performance tuning & core web vitals',
      'DevOps, CI/CD automation & cloud server deployment',
    ],
    detailedServices: [
      {
        groupTitle: 'Digital Capabilities',
        items: [
          'Business & corporate websites',
          'Custom web applications & portals',
          'UI/UX design & interactive dashboards',
          'Technical SEO & speed optimization',
          'API integrations & business automation',
          'DevOps, CI/CD & Linux/Cloud deployment',
        ],
      },
    ],
    cardCtaText: 'Start Digital Project',
    whatsappMessage:
      'Hello ABS Network, I am interested in Web & Digital Solutions (Web Development, UI/UX, Custom Software).',
  },

  // 12. Managed IT Services
  {
    id: 'managed-it-network-support',
    slug: 'managed-it-network-support',
    categorySlug: 'it-support',
    categoryName: 'IT Support',
    title: 'Managed IT & Network Support',
    shortDescription:
      'Comprehensive monthly SLA retainers covering proactive 24/7 network monitoring, server patching, scheduled maintenance, and priority engineer response.',
    iconName: 'Headphones',
    badge: '24/7 SLA Support',
    image: '/hero1.jpg',
    imageAlt: 'Managed IT and Network Operations Support',
    capabilities: [
      '24/7 proactive network & server monitoring',
      'Preventive monthly maintenance & patch updates',
      'Guaranteed on-site & remote SLA response times',
      'IT consulting, capacity planning & disaster recovery',
    ],
    detailedServices: [
      {
        groupTitle: 'Retainer Scope',
        items: [
          'Monthly IT support retainers',
          'Network & server uptime monitoring',
          'Preventive maintenance schedules',
          'Remote & on-site priority support',
          'Infrastructure health audits',
          'Backup monitoring & verification',
          'Network performance tuning',
          'Strategic IT consulting',
        ],
      },
    ],
    cardCtaText: 'Talk to an IT Engineer',
    whatsappMessage:
      'Hello ABS Network, I am interested in Managed IT & Network Support retainers for my organization.',
  },
];

export const HOMEPAGE_FEATURED_SERVICES: ServiceItemData[] = [
  {
    id: 'home-net-infra',
    slug: 'network-design-architecture',
    categorySlug: 'networking',
    categoryName: 'Networking',
    title: 'Network Infrastructure',
    shortDescription:
      'Design, installation, configuration, optimization, and maintenance of business networks and structured physical environments.',
    iconName: 'Network',
    badge: 'Enterprise',
    image: '/net2.jpg',
    imageAlt: 'Business Network Infrastructure Design',
    capabilities: [
      'LAN/WAN & VLAN topology design',
      'Structured rack & switch deployment',
      'Zero-bottleneck network optimization',
    ],
    cardCtaText: 'Learn More',
    whatsappMessage:
      'Hello ABS Network, I am interested in your Network Infrastructure services.',
  },
  {
    id: 'home-inet-infra',
    slug: 'internet-infrastructure',
    categorySlug: 'internet',
    categoryName: 'Internet Infrastructure',
    title: 'Internet Infrastructure',
    shortDescription:
      'Complete internet and connectivity infrastructure for offices, organizations, and demanding commercial environments.',
    iconName: 'Globe',
    badge: 'Connectivity',
    image: '/hero3.jpg',
    imageAlt: 'Commercial Internet Infrastructure',
    capabilities: [
      'Dedicated fiber & ISP links',
      'Multi-WAN failover & load balancing',
      'Traffic shaping & queue management',
    ],
    cardCtaText: 'Learn More',
    whatsappMessage:
      'Hello ABS Network, I am interested in your Internet Infrastructure solutions.',
  },
  {
    id: 'home-server-admin',
    slug: 'windows-server-administration',
    categorySlug: 'servers',
    categoryName: 'Servers',
    title: 'Server Administration',
    shortDescription:
      'Windows Server, Active Directory, and Linux server administration, maintenance, monitoring, and fast troubleshooting.',
    iconName: 'Server',
    badge: 'SysAdmin',
    image: '/why.jpg',
    imageAlt: 'Windows and Linux Server Administration',
    capabilities: [
      'Active Directory & Domain Controllers',
      'Ubuntu, Debian & RHEL management',
      'Automated backup & patch management',
    ],
    cardCtaText: 'Learn More',
    whatsappMessage:
      'Hello ABS Network, I am interested in Server Administration services.',
  },
  {
    id: 'home-cisco-mikrotik',
    slug: 'cisco-network-solutions',
    categorySlug: 'cisco',
    categoryName: 'Cisco & MikroTik',
    title: 'Cisco & MikroTik',
    shortDescription:
      'Professional configuration and management of Cisco routers, switches, MikroTik routers, firewalls, and network equipment.',
    iconName: 'Cpu',
    badge: 'Hardware Experts',
    image: '/images/shop/switches.jpg',
    imageAlt: 'Cisco and MikroTik Router & Switch Configuration',
    capabilities: [
      'Catalyst switches & RouterOS setup',
      'OSPF, BGP, VLANs & QoS policies',
      'VPN tunnels & traffic security',
    ],
    cardCtaText: 'Learn More',
    whatsappMessage:
      'Hello ABS Network, I am interested in Cisco & MikroTik networking services.',
  },
  {
    id: 'home-it-support',
    slug: 'office-it-technical-services',
    categorySlug: 'it-support',
    categoryName: 'IT Support',
    title: 'IT Support & Technical Services',
    shortDescription:
      'On-site and remote technical support for offices, businesses, educational institutions, and healthcare organizations.',
    iconName: 'Wrench',
    badge: 'On-Site Team',
    image: '/why1.jpg',
    imageAlt: 'On-Site IT and Helpdesk Technical Support',
    capabilities: [
      'Computer, printer & network setup',
      'On-demand hardware troubleshooting',
      'Preventive maintenance schedules',
    ],
    cardCtaText: 'Learn More',
    whatsappMessage:
      'Hello ABS Network, I need technical IT support for my office.',
  },
  {
    id: 'home-cybersecurity',
    slug: 'network-security-cybersecurity',
    categorySlug: 'cybersecurity',
    categoryName: 'Cybersecurity',
    title: 'Cybersecurity',
    shortDescription:
      'Network security, firewall configuration, access control, endpoint protection, and infrastructure hardening.',
    iconName: 'ShieldCheck',
    badge: 'Protection',
    image: '/hero2.jpg',
    imageAlt: 'Network Security and Firewall Hardening',
    capabilities: [
      'Stateful firewall rules & NAT',
      'Network segmentation & isolation',
      'Secure remote access VPNs',
    ],
    cardCtaText: 'Learn More',
    whatsappMessage:
      'Hello ABS Network, I am interested in network security and cybersecurity services.',
  },
  {
    id: 'home-web-digital',
    slug: 'web-digital-services',
    categorySlug: 'digital-services',
    categoryName: 'Digital Solutions',
    title: 'Web & Digital Solutions',
    shortDescription:
      'Modern business websites, web applications, responsive user interfaces, and digital transformation services.',
    iconName: 'Code',
    badge: 'Digital',
    image: '/hero.jpg',
    imageAlt: 'Web & Digital Solutions for Business',
    capabilities: [
      'Modern web application engineering',
      'Responsive UI/UX & technical SEO',
      'Cloud deployment & API integrations',
    ],
    cardCtaText: 'Learn More',
    whatsappMessage:
      'Hello ABS Network, I am interested in your Web & Digital Solutions.',
  },
  {
    id: 'home-cctv-security',
    slug: 'cctv-security-infrastructure',
    categorySlug: 'cctv',
    categoryName: 'CCTV & Security',
    title: 'CCTV & Security Infrastructure',
    shortDescription:
      'Networked CCTV surveillance infrastructure, PoE switches, NVR storage arrays, and access control solutions.',
    iconName: 'Video',
    badge: 'Surveillance',
    image: '/images/shop/rack&cabinet.jpg',
    imageAlt: 'CCTV Surveillance & Security Networking',
    capabilities: [
      'IP camera placement & PoE switches',
      'NVR storage & RAID configuration',
      'Encrypted remote viewing setup',
    ],
    cardCtaText: 'Learn More',
    whatsappMessage:
      'Hello ABS Network, I am interested in CCTV and security surveillance infrastructure.',
  },
];

export const WHY_CHOOSE_US_ITEMS = [
  {
    title: 'Experienced Technical Support',
    description: 'Professional assistance from certified network engineers and systems administrators.',
    iconName: 'Award',
  },
  {
    title: 'Business-Focused Solutions',
    description: 'Custom infrastructure engineered around your exact operational and business workflows.',
    iconName: 'Briefcase',
  },
  {
    title: 'End-to-End Infrastructure',
    description: 'From physical structured cabling to servers, routers, switches, and fiber internet.',
    iconName: 'Network',
  },
  {
    title: 'On-Site & Remote Support',
    description: 'Flexible technical assistance with rapid on-site dispatch and 24/7 remote NOC engineers.',
    iconName: 'Headphones',
  },
  {
    title: 'Reliable Technology',
    description: 'Uncompromising focus on stable, maintainable, resilient, and future-proof architectures.',
    iconName: 'ShieldCheck',
  },
  {
    title: 'One Technology Partner',
    description: 'Networking, servers, internet, IT support, cybersecurity, and digital under one roof.',
    iconName: 'CheckCircle2',
  },
];

export const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Understand',
    description: 'We analyze your business requirements, current bottlenecks, and technical scope.',
    iconName: 'Search',
  },
  {
    step: '02',
    title: 'Design',
    description: 'We architect the optimal network topology, equipment spec, and implementation roadmap.',
    iconName: 'Compass',
  },
  {
    step: '03',
    title: 'Deploy',
    description: 'Our engineers physically install, configure, test, and commission all systems.',
    iconName: 'Cpu',
  },
  {
    step: '04',
    title: 'Support',
    description: 'We provide proactive 24/7 NOC monitoring, maintenance, optimization, and SLAs.',
    iconName: 'LifeBuoy',
  },
];
