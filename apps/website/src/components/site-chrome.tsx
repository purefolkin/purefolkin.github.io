import Link from "next/link";
const links = [["Menu","/menu"],["Our food","/food-standards"],["Delivery","/delivery"],["About","/about"],["FAQ","/faq"]];
export function Header(){return <header className="site-header"><Link href="/" className="wordmark">PUREFOLK<span>Eat Pure. Live Pure.</span></Link><nav aria-label="Main navigation">{links.map(([label,href])=><Link key={href} href={href}>{label}</Link>)}</nav></header>}
export function Footer(){return <footer className="site-footer"><Link href="/" className="wordmark">PUREFOLK</Link><div><Link href="/contact">Contact</Link><Link href="/faq">FAQs</Link><Link href="/delivery">Delivery</Link></div><small>© {new Date().getFullYear()} Purefolk</small></footer>}
