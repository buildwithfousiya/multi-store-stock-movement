import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">
          <span>StockFlow</span>
        </Link>
      </div>

      <div className="navbar-right">
        <span className="user-badge">
          {user.name}
        </span>
        <button onClick={handleLogout} className="logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
