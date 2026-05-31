import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Badge, Accordion, Spinner, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import adminService from "../services/adminService";

export default function AdminDashboard({ view }) {
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  
  // Form state
  const [form, setForm] = useState({ name: "", email: "", password: "", address: "", role: "USER" });
  const [storeForm, setStoreForm] = useState({ name: "", address: "", ownerId: "" });
  const [editingStoreId, setEditingStoreId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userFilter, setUserFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [userSort, setUserSort] = useState({ field: "name", order: "ASC" });
  const [storeSort, setStoreSort] = useState({ field: "name", order: "ASC" });

  const navigate = useNavigate();
  const userFormRef = useRef(null);
  const storeFormRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchStores();
  }, [userFilter, storeFilter, userSort, storeSort, view]); 

  // --- API Calls using adminService ---

  async function fetchStats() {
    try {
      const res = await adminService.getStats();
      setStats(res.data);
    } catch(e) { console.error(e) }
  }

  async function fetchUsers() {
    try {
      const params = {
        q: userFilter,
        sort: userSort.field,
        order: userSort.order
      };
      const res = await adminService.getUsers(params);
      setUsers(res.data.rows || res.data || []);
    } catch(e) { console.error(e) }
  }

  async function fetchStores() {
    try {
      const params = {
        q: storeFilter,
        sort: storeSort.field,
        order: storeSort.order
      };
      const res = await adminService.getStores(params);
      setStores(res.data.rows || res.data || []);
    } catch(e) { console.error(e) }
  }

  // --- Handlers ---
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!validateUserForm()) return;
    setSubmitting(true);
    try {
        let res;
        const userData = { ...form, role: form.role.toUpperCase() };
        
        if (editingUserId) {
            res = await adminService.updateUser(editingUserId, userData);
        } else {
            res = await adminService.createUser(userData);
        }
        
        // Success handling
        alert(editingUserId ? "User Updated!" : "User Created!");
        setForm({ name: "", email: "", password: "", address: "", role: "USER" });
        setEditingUserId(null);
        fetchUsers();
        fetchStats();
        
    } catch(err) { 
        console.error(err); 
        const msg = err.response?.data?.error || "Failed";
        alert(msg);
    } finally { setSubmitting(false); }
  }

  const handleDeleteUser = async (id) => {
    if(!window.confirm("Delete user?")) return;
    try {
        await adminService.deleteUser(id);
        fetchUsers(); 
        fetchStats(); 
    } catch(e) { console.error(e); }
  }

  const handleSubmitStore = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        const storeData = { ...storeForm, ownerId: Number(storeForm.ownerId) };
        let res;

        if (editingStoreId) {
            res = await adminService.updateStore(editingStoreId, storeData);
        } else {
            res = await adminService.createStore(storeData);
        }

        alert(editingStoreId ? "Store Updated!" : "Store Created!");
        setStoreForm({ name: "", address: "", ownerId: "" });
        setEditingStoreId(null);
        fetchStores();
        fetchStats();
        
    } catch(e) { 
        console.error(e); 
        const msg = e.response?.data?.error || "Failed";
        alert(msg);
    } finally { setSubmitting(false); }
  }

  const handleDeleteStore = async (id) => {
    if(!window.confirm("Delete store?")) return;
    try {
        await adminService.deleteStore(id);
        fetchStores(); 
        fetchStats(); 
    } catch(e) { console.error(e); }
  }

  const validateUserForm = () => {
    const e = {};
    if(!form.name) e.name = "Required";
    if(!form.email) e.email = "Required";
    if(!editingUserId && !form.password) e.password = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // --- Helpers ---
  const roleBadge = (role) => {
    const colors = { ADMIN: "primary", OWNER: "warning", USER: "info" };
    return <Badge bg={colors[role] || "secondary"}>{role}</Badge>;
  }

  const fadeInUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="pb-5">
      <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
        <h2 className="text-white fw-bold mb-1">Welcome {user.name} </h2>
        <p className="text-muted mb-4">Manage the platform ecosystem</p>

        {/* Stats Row */}
        {!view && (
           <Row className="mb-4 mb-md-5 g-3 g-md-4">
             {[
               { title: "Total Users", val: stats.totalUsers, color: "text-primary" },
               { title: "Total Stores", val: stats.totalStores, color: "text-success" },
               { title: "Total Ratings", val: stats.totalRatings, color: "text-warning" },
             ].map((item, i) => (
               <Col xs={6} md={4} key={i}>
                 <motion.div whileHover={{ y: -5 }} className="glass-pane p-3 p-md-4 text-center h-100">
                    <h6 className="text-muted text-uppercase small fw-bold mb-2">{item.title}</h6>
                    <h2 className={`fw-bold fs-2 display-md-5 mb-0 ${item.color}`}>{item.val}</h2>
                 </motion.div>
               </Col>
             ))}
           </Row>
        )}

        {/* Render Views based on route or show overview */}
        
        {/* USERS SECTION */}
        {(view === 'users' || !view) && (
            <div className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="text-white fw-bold">Manage Users</h4>
                    {!view && <Button variant="link" className="text-decoration-none text-primary" onClick={() => navigate('/admin/users')}>View All &rarr;</Button>}
                </div>

                <Row className="gy-4">
                  {/* User Form */}
                  <Col lg={4}>
                    <div ref={userFormRef} className="glass-pane p-3 p-md-4">
                        <h5 className="text-white mb-3">{editingUserId ? "Edit User" : "Add User"}</h5>
                        <Form onSubmit={handleAddUser}>
                            <Form.Group className="mb-3">
                                <Form.Control placeholder="Full Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="input-glass mb-2" style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", color: "white", borderColor: "rgba(148, 163, 184, 0.2)" }}/>
                                {errors.name && <small className="text-danger">{errors.name}</small>}
                                <Form.Control placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="input-glass mb-2" style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", color: "white", borderColor: "rgba(148, 163, 184, 0.2)" }}/>
                                <InputGroup className="mb-2">
                                    <Form.Control 
                                        placeholder="Password" 
                                        type={showPassword ? "text" : "password"} 
                                        value={form.password} 
                                        onChange={e=>setForm({...form, password:e.target.value})} 
                                        className="input-glass border-end-0" 
                                        style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", color: "white", borderColor: "rgba(148, 163, 184, 0.2)" }}
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
                                <Form.Control placeholder="Address" as="textarea" rows={2} value={form.address} onChange={e=>setForm({...form, address:e.target.value})} className="input-glass mb-2" style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", color: "white", borderColor: "rgba(148, 163, 184, 0.2)" }}/>
                                <Form.Select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="input-glass mb-3" style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", color: "white", borderColor: "rgba(148, 163, 184, 0.2)" }}>
                                    <option value="USER" style={{color: 'black'}}>User</option>
                                    <option value="OWNER" style={{color: 'black'}}>Owner</option>
                                    <option value="ADMIN" style={{color: 'black'}}>Admin</option>
                                </Form.Select>
                                <Button type="submit" className="btn-primary-custom w-100" disabled={submitting}>
                                    {submitting ? <Spinner size="sm"/> : (editingUserId ? "Update" : "Add User")}
                                </Button>
                                {editingUserId && (
                                    <Button 
                                        className="w-100 mt-2"
                                        style={{ 
                                            backgroundColor: "rgba(244, 63, 94, 0.2)", 
                                            color: "#fda4af", 
                                            border: "1px solid rgba(244, 63, 94, 0.3)",
                                        }}
                                        onClick={() => { setEditingUserId(null); setForm({ name: "", email: "", password: "", address: "", role: "USER" }); }}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </Form.Group>
                        </Form>
                    </div>
                  </Col>

                  {/* Users Table */}
                  <Col lg={8}>
                    <div className="glass-pane p-3 p-md-4 overflow-hidden">
                        <div className="mb-3 d-flex flex-column flex-md-row gap-3">
                            <Form.Control placeholder="Search users..." value={userFilter} onChange={e=>setUserFilter(e.target.value)} className="input-glass" style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", color: "white", borderColor: "rgba(148, 163, 184, 0.2)" }}/>
                            <Form.Select 
                                value={userSort.field} 
                                onChange={e => setUserSort({ ...userSort, field: e.target.value })}
                                className="input-glass w-auto text-center" 
                                style={{ 
                                    backgroundColor: "rgba(15, 23, 42, 0.6)", 
                                    color: "white", 
                                    borderColor: "rgba(148, 163, 184, 0.2)",
                                    appearance: 'none',
                                    backgroundImage: 'none',
                                    paddingRight: '0.75rem' // Adjust padding since arrow is gone
                                }}
                            >
                                <option value="name" style={{color: 'black'}}>Name</option>
                                <option value="email" style={{color: 'black'}}>Email</option>
                                <option value="address" style={{color: 'black'}}>Address</option>
                                <option value="role" style={{color: 'black'}}>Role</option>
                            </Form.Select>
                            <Button 
                                variant="outline-light"
                                className="input-glass"
                                style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", borderColor: "rgba(148, 163, 184, 0.2)" }}
                                onClick={() => setUserSort({ ...userSort, order: userSort.order === 'ASC' ? 'DESC' : 'ASC' })}
                            >
                                {userSort.order === 'ASC' ? '↑' : '↓'}
                            </Button>
                        </div>
                        <Table responsive hover className="text-nowrap" style={{color: '#cbd5e1'}}>
                            <thead>
                                <tr style={{borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                                    <th className="bg-transparent text-white">Name</th>
                                    <th className="bg-transparent text-white">Email</th>
                                    <th className="bg-transparent text-white">Address</th>
                                    <th className="bg-transparent text-white">Role</th>
                                    <th className="bg-transparent text-white text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.slice(0, view ? users.length : 5).map(u => (
                                    <tr key={u.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                                        <td className="bg-transparent text-white-2">{u.name}</td>
                                        <td className="bg-transparent text-white-2">{u.email}</td>
                                        <td className="bg-transparent text-white-2">{u.address || "-"}</td>
                                        <td className="bg-transparent text-white-2">{roleBadge(u.role)}</td>
                                        <td className="bg-transparent text-end">
                                            <Button 
                                                size="sm" 
                                                className="me-2 border-0 fw-medium shadow-sm" 
                                                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}
                                                onClick={() => { setForm(u); setEditingUserId(u.id); userFormRef.current?.scrollIntoView({behavior:'smooth'}); }}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                className="border-0 fw-medium shadow-sm" 
                                                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: 'white' }}
                                                onClick={() => handleDeleteUser(u.id)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                  </Col>
                </Row>
            </div>
        )}

        {/* STORES SECTION */}
        {(view === 'stores' || !view) && (
            <div>
                 <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="text-white fw-bold">Manage Stores</h4>
                    {!view && <Button variant="link" className="text-decoration-none text-primary" onClick={() => navigate('/admin/stores')}>View All &rarr;</Button>}
                </div>
                
                <Row className="gy-4">
                  {/* Store Form */}
                  <Col lg={4}>
                    <div ref={storeFormRef} className="glass-pane p-3 p-md-4">
                        <h5 className="text-white mb-3">{editingStoreId ? "Edit Store" : "Add Store"}</h5>
                        <Form onSubmit={handleSubmitStore}>
                            <Form.Control placeholder="Store Name" value={storeForm.name} onChange={e=>setStoreForm({...storeForm, name:e.target.value})} className="input-glass mb-2" style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", color: "white", borderColor: "rgba(148, 163, 184, 0.2)" }} required/>
                            <Form.Control placeholder="Address" value={storeForm.address} onChange={e=>setStoreForm({...storeForm, address:e.target.value})} className="input-glass mb-2" style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", color: "white", borderColor: "rgba(148, 163, 184, 0.2)" }} required/>
                            <Form.Select value={storeForm.ownerId} onChange={e=>setStoreForm({...storeForm, ownerId:e.target.value})} className="input-glass mb-3" style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", color: "white", borderColor: "rgba(148, 163, 184, 0.2)" }} required>
                                <option value="" style={{color: 'black'}}>Select Owner</option>
                                {users.filter(u=>u.role==="OWNER").map(u=>(<option key={u.id} value={u.id} style={{color: 'black'}}>{u.email}</option>))}
                            </Form.Select>
                            <Button type="submit" className="btn-primary-custom w-100" disabled={submitting}>
                                {submitting ? <Spinner size="sm"/> : (editingStoreId ? "Update" : "Add Store")}
                            </Button>
                             {editingStoreId && (
                                <Button 
                                    className="w-100 mt-2"
                                    style={{ 
                                        backgroundColor: "rgba(244, 63, 94, 0.2)", 
                                        color: "#fda4af", 
                                        border: "1px solid rgba(244, 63, 94, 0.3)",
                                    }}
                                    onClick={() => { setEditingStoreId(null); setStoreForm({ name: "", address: "", ownerId: "" }); }}
                                >
                                    Cancel
                                </Button>
                             )}
                        </Form>
                    </div>
                  </Col>

                  {/* Stores Table */}
                  <Col lg={8}>
                     <div className="glass-pane p-3 p-md-4 overflow-hidden">
                        <div className="mb-3 d-flex flex-column flex-md-row gap-3">
                            <Form.Control placeholder="Search stores..." value={storeFilter} onChange={e=>setStoreFilter(e.target.value)} className="input-glass" style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", color: "white", borderColor: "rgba(148, 163, 184, 0.2)" }}/>
                            <Form.Select 
                                value={storeSort.field} 
                                onChange={e => setStoreSort({ ...storeSort, field: e.target.value })}
                                className="input-glass w-auto text-center" 
                                style={{ 
                                    backgroundColor: "rgba(15, 23, 42, 0.6)", 
                                    color: "white", 
                                    borderColor: "rgba(148, 163, 184, 0.2)",
                                    appearance: 'none',
                                    backgroundImage: 'none',
                                    paddingRight: '0.75rem'
                                }}
                            >
                                <option value="name" style={{color: 'black'}}>Name</option>
                                <option value="email" style={{color: 'black'}}>Owner Email</option>
                                <option value="rating" style={{color: 'black'}}>Rating</option>
                                <option value="address" style={{color: 'black'}}>Address</option>
                            </Form.Select>
                            <Button 
                                variant="outline-light"
                                className="input-glass"
                                style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", borderColor: "rgba(148, 163, 184, 0.2)" }}
                                onClick={() => setStoreSort({ ...storeSort, order: storeSort.order === 'ASC' ? 'DESC' : 'ASC' })}
                            >
                                {storeSort.order === 'ASC' ? '↑' : '↓'}
                            </Button>
                        </div>
                        <Table responsive hover className="text-nowrap" style={{color: '#cbd5e1'}}>
                            <thead>
                                <tr style={{borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                                    <th className="bg-transparent text-white">Store</th>
                                    <th className="bg-transparent text-white">Owner</th>
                                    <th className="bg-transparent text-white">Address</th>
                                    <th className="bg-transparent text-white">Rating</th>
                                    <th className="bg-transparent text-white text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stores.slice(0, view ? stores.length : 5).map(s => (
                                    <tr key={s.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                                        <td className="bg-transparent text-white-2 fw-medium">{s.name}</td>
                                        <td className="bg-transparent text-white-2">{s.owner?.email || "N/A"}</td>
                                        <td className="bg-transparent text-white-2">{s.address}</td>
                                        <td className="bg-transparent text-white-2 fw-bold">{s.rating || "-"}</td>
                                        <td className="bg-transparent text-end">
                                            <Button 
                                                size="sm" 
                                                className="me-2 border-0 fw-medium shadow-sm" 
                                                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}
                                                onClick={() => { setStoreForm({name:s.name, address:s.address, ownerId: s.owner?.id}); setEditingStoreId(s.id); storeFormRef.current?.scrollIntoView({behavior:'smooth'}); }}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                className="border-0 fw-medium shadow-sm" 
                                                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: 'white' }}
                                                onClick={() => handleDeleteStore(s.id)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                     </div>
                  </Col>
                </Row>
            </div>
        )}

      </motion.div>
    </div>
  );
}
