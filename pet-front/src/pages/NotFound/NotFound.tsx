import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>404</h1>
            <p>Página não encontrada</p>
            <Link to="/">Voltar para Home</Link>
        </div>
    );
}

export default NotFound;
