import React, { useEffect, useState, useMemo } from "react";
import { Container, Row, Col, Card, Button, Form, Spinner, Badge, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function UserDashboard({ view }) {
  const [stores, setStores] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("ASC");
  
  // Settings state
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    if(!token) navigate("/login");
    else fetchData();
  }, [search, sortField, sortOrder, token]);

  async function fetchData() {
    try {
        const sRes = await fetch(`http://43.204.232.198:4002/api/stores?q=${search}&sort=${sortField}&order=${sortOrder}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const sData = await sRes.json();
        setStores(sData.stores || []);

        const rRes = await fetch(`http://43.204.232.198:4002/api/ratings`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const rData = await rRes.json();
        setRatings(rData.ratings || []);
    } catch(e) { console.error(e); }
  }

  // Derived state for personal ratings
  const myRatings = useMemo(() => {
      const map = {};
      ratings.forEach(r => { if(r.userId === user.id) map[r.storeId] = r.value; });
      return map;
  }, [ratings, user.id]);

  // Derived state for store average
  const storeAvg = useMemo(() => {
     const map = {};
     stores.forEach(s => {
         const rs = ratings.filter(r => r.storeId === s.id);
         map[s.id] = rs.length ? (rs.reduce((a,b)=>a+b.value,0)/rs.length).toFixed(1) : "N/A";
     });
     return map;
  }, [stores, ratings]);

  const handleRate = async (storeId, val) => {
      try {
          const res = await fetch("http://43.204.232.198:4002/api/ratings", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({ storeId, value: val })
          });
          if(res.ok) fetchData(); // refresh
      } catch(e) { console.error(e); }
  }

  const handlePasswordUpdate = async (e) => {
      e.preventDefault();
      if(!newPassword) return;
      setLoading(true);
      try {
          const res = await fetch("http://43.204.232.198:4002/api/auth/user/update-password", {
              method: "PUT",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({ password: newPassword })
          });
          const data = await res.json();
          if(res.ok) {
              alert(data.message || "Password Updated!");
              setNewPassword("");
          } else {
              alert(data.message || "Failed to update password");
          }
      } catch(e) { console.error(e); alert("Error updating password"); }
      finally { setLoading(false); }
  }

  return (
    <div className="pb-5">
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
            <h2 className="text-white fw-bold mb-1 fs-3 fs-md-2">
                {view === 'ratings' ? "My Ratings" : view === 'settings' ? "Settings" : "Explore Stores"}
            </h2>
            <p className="text-muted mb-4 small text-md-start">
                {view === 'ratings' ? "Stores you have rated" : view === 'settings' ? "Manage your account security" : "Rate your favorite places"}
            </p>

            {/* Filters - Hide on Settings View */}
            {!view || view === 'ratings' ? (
                <>
                <div className="glass-pane p-3 mb-4 d-flex flex-column flex-md-row gap-3">
                <Form.Control placeholder="Search stores..." value={search} onChange={e=>setSearch(e.target.value)} className="input-glass" style={{ backgroundColor: "white", color: "#333", borderColor: "#ced4da" }}/>
                <div className="d-flex gap-2">
                    <Form.Select value={sortField} onChange={e=>setSortField(e.target.value)} className="input-glass" style={{minWidth: '150px', backgroundColor: "white", color: "#333", borderColor: "#ced4da" }}>
                        <option value="name" style={{color: 'black'}}>Name</option>
                        <option value="address" style={{color: 'black'}}>Address</option>
                        <option value="rating" style={{color: 'black'}}>Rating</option>
                    </Form.Select>
                    <Button 
                        variant="outline-secondary" 
                        onClick={() => setSortOrder(prev => prev === "ASC" ? "DESC" : "ASC")}
                        className="input-glass d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: "white", borderColor: "#ced4da", minWidth: '50px' }}
                    >
                        {sortOrder === "ASC" ? "↑" : "↓"}
                    </Button>
                </div>
            </div>
            </>
            ) : null}

            {/* Stores Grid */}
            {(!view || view === 'ratings') && (
            <Row className="g-4">
                {stores.filter(store => !view || (view === 'ratings' && myRatings[store.id])).map((store, i) => (
                    <Col md={6} lg={4} key={store.id}>
                        <motion.div 
                            initial={{opacity:0}} animate={{opacity:1}} transition={{delay: i*0.05}}
                            className="glass-pane h-100 d-flex flex-column p-0 overflow-hidden"
                            whileHover={{y:-5}}
                        >
                            <div className="p-3 p-md-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h5 className="text-white fw-bold mb-0">{store.name}</h5>
                                    {storeAvg[store.id] !== "N/A" && <Badge bg="warning" text="dark">⭐ {storeAvg[store.id]}</Badge>}
                                </div>
                                <p className="text-muted small mb-3">{store.address}</p>
                            </div>
                            
                            <div className="p-3 bg-dark bg-opacity-25 border-top border-secondary border-opacity-25">
                                <div className="d-flex align-items-center justify-content-between">
                                    <span className="text-sm text-white-50">Your Rating:</span>
                                    <div className="d-flex gap-1 bg-black bg-opacity-20 rounded p-1">
                                        {[1,2,3,4,5].map(star => (
                                            <motion.button 
                                                key={star}
                                                whileHover={{scale:1.2}}
                                                whileTap={{scale:0.9}}
                                                className={`btn btn-sm p-0 px-1 border-0 ${myRatings[store.id] >= star ? 'text-warning' : 'text-secondary'}`}
                                                onClick={() => handleRate(store.id, star)}
                                            >
                                                ★
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </Col>
                ))}
            </Row>
            )}

            {/* Settings View */}
            {view === 'settings' && (
                <div className="glass-pane p-3 p-md-4 w-100" style={{maxWidth: '500px'}}>
                    <h5 className="text-white mb-3">Security</h5>
                    <Form onSubmit={handlePasswordUpdate}>
                        <Form.Group className="mb-3">
                            <InputGroup>
                                <Form.Control 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="New Password" 
                                    value={newPassword} 
                                    onChange={e=>setNewPassword(e.target.value)} 
                                    className="input-glass border-end-0" 
                                    style={{ backgroundColor: "white", color: "#333", borderColor: "#ced4da" }}
                                    minLength={6}
                                    required
                                />
                                <Button 
                                    variant="outline-secondary"
                                    className="input-glass border-start-0"
                                    style={{ backgroundColor: "white", color: "#666", borderColor: "#ced4da" }}
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
                            <Form.Text className="text-muted">Password must be at least 6 characters.</Form.Text>
                        </Form.Group>
                        <Button type="submit" className="btn-primary-custom w-100" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : "Update Password"}
                        </Button>
                    </Form>
                </div>
            )}
        </motion.div>
    </div>
  )
}
