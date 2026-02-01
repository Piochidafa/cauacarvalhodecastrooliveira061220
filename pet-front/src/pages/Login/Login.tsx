import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authFacade } from "../../services/facades/authFacade";

function Login() {
    const [username, setusername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();


    useEffect(() => {
        if (authFacade.isAuthenticated()) {
            navigate("/dashboard");
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await authFacade.login({ username, password });
            // console.log("Login realizado com sucesso:", response);
            
            // Disparar evento customizado para atualizar o menu
            window.dispatchEvent(new Event('authChange'));
            
            navigate("/");
        } catch (err: any) {
            setError(err.message || "Erro ao realizar login. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-shell">
            <div className="login-backdrop" />
            <div className="login-content">
                <div className="login-panel">
                    <div className="login-brand">
                        <span className="login-badge">Music Lib</span>
                        <h1 className="login-title">Bem-vindo de volta</h1>
                        <p className="login-subtitle">
                            Acesse seu painel e gerencie artistas, albuns e capas com rapidez.
                        </p>
                    </div>
                </div>

                <Card className="login-card">
                    <div className="login-card-header">
                        <h2>Entrar</h2>
                        <p>Use suas credenciais para continuar.</p>
                    </div>
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="login-field">
                            <label htmlFor="username">Usuario</label>
                            <InputText
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setusername(e.target.value)}
                                placeholder="Digite seu usuario"
                                required
                                className="w-full"
                            />
                        </div>

                        <div className="login-field">
                            <label htmlFor="password">Senha</label>
                            <Password
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Digite sua senha"
                                feedback={false}
                                toggleMask
                                required
                                style={{width: '60vh'}}
                                className="w-full"
                                inputClassName="w-full"
                            />
                        </div>

                        {error && (
                            <div className="login-error">
                                <i className="pi pi-exclamation-circle"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            label="Entrar"
                            icon="pi pi-sign-in"
                            loading={loading}
                            className="login-submit"
                        />
                    </form>
                </Card>
            </div>
        </div>
    );
}

export default Login;
