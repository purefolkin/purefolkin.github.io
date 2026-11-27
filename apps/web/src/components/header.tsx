import Link from "next/link";
export function Header() {
  return <header className="header"><Link className="brand" href="/">PUREFOLK<span>Eat Pure. Live Pure. Fresh Cooked.</span></Link><nav aria-label="Main navigation"><Link href="/menu">Menu</Link><Link href="/delivery">Delivery</Link></nav></header>;
}
export function Footer() {
  return <footer className="footer"><span>© {new Date().getFullYear()} Purefolk</span><span>Thoughtful food. Honest choices.</span></footer>;
}
