import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Container, Form, Button, Alert, Spinner, InputGroup } from "react-bootstrap";

function Register() {
    const [form, setForm] = useState({ name: "", email: "", address: "", password: "", role: "USER" }); // Default role USER
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const {name, email, address, password, role} = form; // Include role if backend supports it

        try {
            const response = await fetch("http://43.204.232.198:4002/api/auth/register", {
                method: 'POST',
                headers: { "Content-Type": 'application/json' },
                body: JSON.stringify({ name, email, address, password, role }), // Sending role to backend if it accepts
            });
            const data = await response.json();

            console.log("Response:", data);

            if (!response.ok) {
                throw new Error(data.message || "Registration Failed");
            }

            // Auto-login or redirect
            navigate("/login");
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="orb orb-1" style={{ top: '10%', left: '80%' }}></div>
            <div className="orb orb-2" style={{ bottom: '10%', right: '80%' }}></div>

            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="glass-pane p-4 p-md-5 w-100"
                    style={{ maxWidth: "500px" }}
                >
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-white mb-2">Create Account</h2>
                        <p className="text-muted">Join RateIt today</p>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-white-50 small fw-semibold">Full Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="name" 
                                placeholder="John Doe" 
                                value={form.name} 
                                onChange={handleChange} 
                                className="input-glass"
                                style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", color: "white", borderColor: "rgba(148, 163, 184, 0.2)" }}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="text-white-50 small fw-semibold">Email Address</Form.Label>
                            <Form.Control 
                                type="email" 
                                name="email" 
                                placeholder="name@example.com" 
                                value={form.email} 
                                onChange={handleChange} 
                                className="input-glass"
                                style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", color: "white", borderColor: "rgba(148, 163, 184, 0.2)" }}
                                required
                            />
                        </Form.Group>



                        <Form.Group className="mb-3">
                            <Form.Label className="text-white-50 small fw-semibold">Address</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                name="address" 
                                rows={2} 
                                placeholder="City, Country" 
                                value={form.address} 
                                onChange={handleChange} 
                                className="input-glass"
                                style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", color: "white", borderColor: "rgba(148, 163, 184, 0.2)" }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4 mb-md-5">
                            <Form.Label className="text-white-50 small fw-semibold">Password</Form.Label>
                            <InputGroup>
                                <Form.Control 
                                    type={showPassword ? "text" : "password"}
                                    name="password" 
                                    placeholder="Create a strong password" 
                                    value={form.password} 
                                    onChange={handleChange} 
                                    className="input-glass border-end-0"
                                    style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", color: "white", borderColor: "rgba(148, 163, 184, 0.2)" }}
                                    required
                                />
                                <Button 
                                    variant="outline-secondary"
                                    className="input-glass border-start-0"
                                    style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", color: "rgba(148, 163, 184, 0.8)", borderColor: "rgba(148, 163, 184, 0.2)" }}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                                            <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                                            <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                                        </svg>
                                    )}
                                </Button>
                            </InputGroup>
                        </Form.Group>

                        <Button 
                            type="submit" 
                            className="btn-primary-custom w-100 py-3 mb-4"
                            disabled={loading}
                        >
                            {loading ? "Creating Account..." : "Register"}
                        </Button>

                        <div className="text-center">
                            <span className="text-muted">Already have an account? </span>
                            <Link to="/login" className="text-white text-decoration-none fw-medium">
                                Sign In
                            </Link>
                        </div>
                    </Form>
                </motion.div>
            </Container>
        </div>
    );
}

export default Register;
