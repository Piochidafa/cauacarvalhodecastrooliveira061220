import { Navigate } from "react-router-dom";
import { authFacade } from "../services/facades/authFacade";

interface ProtectedRouteProps {
    children: React.ReactElement;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const isAuthenticated = authFacade.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
