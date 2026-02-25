import { NavLink } from 'react-router-dom'

function NavLinkButton({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `px-3 py-2 rounded-xl text-sm border ${isActive ? 'bg-white/15 text-white border-white/20' : 'bg-white/5 text-white/80 hover:text-white border-white/10 hover:bg-white/10'}`}
    >
      {children}
    </NavLink>
  )
}

export default NavLinkButton


