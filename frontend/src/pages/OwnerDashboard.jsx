import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Table, Form, Spinner, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function OwnerDashboard({ view }) {
  const [stores, setStores] = useState([]);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!token) navigate("/login");
    else fetchOwnerStores();
  }, [token]);

  async function fetchOwnerStores() {
    try {
      const res = await fetch("http://43.204.232.198:4002/api/stores/my-stores", {
         headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if(res.ok) {
         const detailedStores = await Promise.all(data.map(async (s) => {
             return await fetchStoreRatings(s, "value", "DESC");
         }));
         setStores(detailedStores);
      }
    } catch(e) { console.error(e); }
  }

  async function fetchStoreRatings(store, sortBy, order) {
      try {
          const rRes = await fetch(`http://43.204.232.198:4002/api/ratings/store/${store.id}/raters?sort=${sortBy}&order=${order}`, {
             headers: { Authorization: `Bearer ${token}` }
          });
          const raters = await rRes.json();
          const avg = raters.length ? (raters.reduce((a,b)=>a+b.value,0)/raters.length).toFixed(1) : "N/A";
          return { ...store, raters: rRes.ok ? raters : [], averageRating: avg, sortOption: `${sortBy}_${order}` };
      } catch(e) { console.error(e); return store; }
  }

  const handleSortChange = async (storeId, value) => {
      const [sortBy, order] = value.split("_");
      const storeIndex = stores.findIndex(s => s.id === storeId);
      if (storeIndex === -1) return;

      const updatedStore = await fetchStoreRatings(stores[storeIndex], sortBy, order);
      
      const newStores = [...stores];
      newStores[storeIndex] = updatedStore;
      setStores(newStores);
  }

  const handlePasswordUpdate = async (e) => {
      e.preventDefault();
      try {
          const res = await fetch("http://43.204.232.198:4002/api/owner/update-password", {
              method: "PUT",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({ password: newPassword })
          });
          if(res.ok) alert("Password Updated!");
          else alert("Failed");
      } catch(e) { console.error(e); }
  }

  return (
    <div className="pb-5">
      <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
        <h2 className="text-white fw-bold mb-1 fs-3 fs-md-2">{!view ? `Owner : ${user.name || 'Owner'}` : "Settings"}</h2>
        <p className="text-muted mb-4 small text-md-start">
            {!view ? `You have ${stores.length} stores under management` : "Manage your account security"}
        </p>

        {/* Stores List - Only on Dashboard */}
        {!view && (
            <Row className="gy-4">
                {stores.map((store, idx) => (
                    <Col xs={12} key={store.id}>
                        <motion.div 
                            initial={{opacity:0, y:20}} 
                            animate={{opacity:1, y:0}} 
                            transition={{delay: idx*0.1}}
                            className="glass-pane p-0 overflow-hidden"
                        >
                            <div className="p-3 p-md-4 border-bottom" style={{borderColor: 'rgba(255,255,255,0.1)'}}>
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                                    <div className="w-100">
                                        <h4 className="text-white mb-1">{store.name}</h4>
                                        <div className="d-flex align-items-center gap-3">
                                            <span className="text-muted small">{store.address}</span>
                                            <span className="badge bg-warning text-dark">⭐ {store.averageRating}</span>
                                        </div>
                                    </div>
                                    <Form.Select 
                                        className="input-glass w-100 w-md-auto" 
                                        size="sm"
                                        style={{ backgroundColor: "white", color: "#333", borderColor: "#ced4da" }}
                                        value={store.sortOption}
                                        onChange={(e) => handleSortChange(store.id, e.target.value)}
                                    >
                                        <option value="value_DESC" style={{color: 'black'}}>Highest Rated</option>
                                        <option value="value_ASC" style={{color: 'black'}}>Lowest Rated</option>
                                    </Form.Select>
                                </div>
                            </div>

                            {/* Raters Table */}
                            <div className="p-0">
                                <Table hover responsive style={{marginBottom: 0, color: '#94a3b8'}}>
                                    <thead className="bg-light bg-opacity-10">
                                        <tr>
                                            <th className="bg-transparent ps-4 text-white-50">Customer</th>
                                            <th className="bg-transparent text-white-50">Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {store.raters.length > 0 ? store.raters.map(r => (
                                            <tr key={r.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                                                <td className="bg-transparent ps-4">
                                                    <div className="text-white">{r.name}</div>
                                                    <small className="text-muted">{r.email}</small>
                                                </td>
                                                <td className="bg-transparent align-middle">
                                                    <span className="text-warning fw-bold">{r.value} / 5</span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="2" className="text-center p-4 text-muted">No ratings yet</td></tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </motion.div>
                    </Col>
                ))}
            </Row>
        )}
        
        {/* Password Update - Only on Settings View */}
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
                    </Form.Group>
                    <Button type="submit" className="btn-primary-custom w-100">Update Password</Button>
                </Form>
            </div>
        )}

      </motion.div>
    </div>
  );
}
