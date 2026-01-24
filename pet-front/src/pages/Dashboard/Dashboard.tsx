import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { authFacade } from "../../services/facades/authFacade";

function Dashboard() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await authFacade.logout();
        navigate("/login");
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Dashboard</h1>
            <p>Área restrita - Usuário autenticado</p>
        </div>
    );
}

export default Dashboard;
