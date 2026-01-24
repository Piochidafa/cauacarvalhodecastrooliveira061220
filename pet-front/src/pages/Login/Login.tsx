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
            const response = await authFacade.login({ username, password });
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
        <div className="login-container">
            <Card title="Login" className="login-card">
                <form onSubmit={handleLogin} className="login-form">
                    <div className="field">
                        <label htmlFor="username">username</label>
                        <InputText
                            id="username"
                            type="username"
                            value={username}
                            onChange={(e) => setusername(e.target.value)}
                            placeholder="digite seu username"
                            required
                            className="w-full"
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="password">Senha</label>
                        <Password
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite sua senha"
                            feedback={false}
                            toggleMask
                            required
                            className="w-full"
                            inputClassName="w-full"
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            <i className="pi pi-exclamation-circle"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <Button
                        type="submit"
                        label="Entrar"
                        icon="pi pi-sign-in"
                        loading={loading}
                        className="w-full"
                    />
                </form>
            </Card>
        </div>
    );
}

export default Login;