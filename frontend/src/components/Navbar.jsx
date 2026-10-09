import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                Agricultural Trial Evidence
            </div>

            <div className="navbar-links">
                <Link to="/">Dashboard</Link>
                <Link to="/trials">Trials</Link>
            </div>
        </nav>
    );
}

export default Navbar;