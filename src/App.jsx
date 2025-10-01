import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { User, Package, Settings, BarChart3, DollarSign, Clock, LogOut, Plus, Trash2, Edit } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function App() {
   const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
   const [filtroFechaFin, setFiltroFechaFin] = useState('');
   const [nominaFiltrada, setNominaFiltrada] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [activeView, setActiveView] = useState('login');
  
  const [empleados, setEmpleados] = useState([]);
  const [prendas, setPrendas] = useState([]);
  const [operaciones, setOperaciones] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formAsig, setFormAsig] = useState({ 
    empleado_id: '', 
    operacion_id: '', 
    cantidad: '', 
    talla: 'S',
    fecha: new Date().toISOString().split('T')[0]
  });

  const [formEmp, setFormEmp] = useState({ nombre: '', telefono: '' });
  const [formPrenda, setFormPrenda] = useState({ referencia: '', descripcion: '' });
  const [formOp, setFormOp] = useState({ nombre: '', costo: '', prenda_id: '' });
  const [editingOp, setEditingOp] = useState(null);
  const [editingEmp, setEditingEmp] = useState(null); 
  const [editingPrenda, setEditingPrenda] = useState(null);


  // Usuarios hardcodeados (en producción usar Supabase Auth)
  const usuarios = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'operario', password: 'operario123', role: 'basico' }
  ];

  // CARGAR DATOS
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [empRes, prendRes, opRes, asigRes] = await Promise.all([
        supabase.from('empleados').select('*').eq('activo', true).order('id'),
        supabase.from('prendas').select('*').eq('activo', true).order('id'),
        supabase.from('operaciones').select('*').eq('activo', true).order('id'),
        supabase.from('asignaciones').select('*').order('created_at', { ascending: false })
      ]);

      if (empRes.data) setEmpleados(empRes.data);
      if (prendRes.data) setPrendas(prendRes.data);
      if (opRes.data) setOperaciones(opRes.data);
      if (asigRes.data) setAsignaciones(asigRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar datos');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser) {
      cargarDatos();
    }
  }, [currentUser]);

  // LOGIN
  const handleLogin = () => {
    const user = usuarios.find(u => u.username === loginId && u.password === loginPass);
    if (user) {
      setCurrentUser(user);
      setActiveView(user.role === 'admin' ? 'dashboard' : 'empleadoView');
    } else {
      alert('Credenciales incorrectas');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginId('');
    setLoginPass('');
    setActiveView('login');
  };

  // CRUD EMPLEADOS
  const agregarEmpleado = async () => {
    if (!formEmp.nombre || !formEmp.telefono) {
      alert('Complete todos los campos');
      return;
    }

    if (editingEmp) {
      const { error } = await supabase.from('empleados').update(formEmp).eq('id', editingEmp.id);
      if (error) {
        alert('Error: ' + error.message);
      } else {
        alert('Empleado actualizado');
        setEditingEmp(null);
        setFormEmp({ nombre: '', telefono: '' });
        cargarDatos();
      }
    } else {
      const { error } = await supabase.from('empleados').insert([formEmp]);
      if (error) {
        alert('Error: ' + error.message);
      } else {
        alert('Empleado agregado');
        setFormEmp({ nombre: '', telefono: '' });
        cargarDatos();
      }
    }
  };

  const eliminarEmpleado = async (id) => {
    if (!confirm('¿Eliminar empleado?')) return;
    const { error } = await supabase.from('empleados').update({ activo: false }).eq('id', id);
    if (error) alert('Error: ' + error.message);
    else cargarDatos();
  };

  const editarEmpleado = (emp) => {
    setTimeout(() => {
      setEditingEmp(emp);
      setFormEmp({ nombre: emp.nombre, telefono: emp.telefono });
    }, 0);
  };

  const cancelarEdicionEmp = () => {
    setEditingEmp(null);
    setFormEmp({ nombre: '', telefono: '' });
  };

  // CRUD PRENDAS
  const agregarPrenda = async () => {
    if (!formPrenda.referencia) {
      alert('Ingrese la referencia');
      return;
    }

    if (editingPrenda) {
      const { error } = await supabase.from('prendas').update(formPrenda).eq('id', editingPrenda.id);
      if (error) {
        alert('Error: ' + error.message);
      } else {
        alert('Prenda actualizada');
        setEditingPrenda(null);
        setFormPrenda({ referencia: '', descripcion: '' });
        cargarDatos();
      }
    } else {
      const { error } = await supabase.from('prendas').insert([formPrenda]);
      if (error) {
        alert('Error: ' + error.message);
      } else {
        alert('Prenda agregada');
        setFormPrenda({ referencia: '', descripcion: '' });
        cargarDatos();
      }
    }
  };

  const eliminarPrenda = async (id) => {
    if (!confirm('¿Eliminar prenda?')) return;
    const { error } = await supabase.from('prendas').update({ activo: false }).eq('id', id);
    if (error) alert('Error: ' + error.message);
    else cargarDatos();
  };
  const editarPrenda = (prenda) => {
    setTimeout(() => {
      setEditingPrenda(prenda);
      setFormPrenda({ referencia: prenda.referencia, descripcion: prenda.descripcion });
    }, 0);
  };

  const cancelarEdicionPrenda = () => {
    setEditingPrenda(null);
    setFormPrenda({ referencia: '', descripcion: '' });
  };

  // CRUD OPERACIONES
  const agregarOperacion = async () => {
    if (!formOp.nombre || !formOp.costo || !formOp.prenda_id) {
      alert('Complete todos los campos');
      return;
    }
    
    const data = {
      nombre: formOp.nombre,
      costo: parseFloat(formOp.costo),
      prenda_id: parseInt(formOp.prenda_id)
    };

    if (editingOp) {
      const { error } = await supabase.from('operaciones').update(data).eq('id', editingOp.id);
      if (error) {
        alert('Error: ' + error.message);
      } else {
        alert('✓ Operación actualizada');
        setEditingOp(null);
        setFormOp({ nombre: '', costo: '', prenda_id: '' });
        cargarDatos();
      }
    } else {
      const { error } = await supabase.from('operaciones').insert([data]);
      if (error) {
        alert('Error: ' + error.message);
      } else {
        alert('✓ Operación agregada');
        setFormOp({ nombre: '', costo: '', prenda_id: '' });
        cargarDatos();
      }
    }
  };

  const editarOperacion = (op) => {
    setTimeout(() => {
      setEditingOp(op);
      setFormOp({ nombre: op.nombre, costo: op.costo, prenda_id: op.prenda_id });
    }, 0);
  };

  const cancelarEdicion = () => {
    setEditingOp(null);
    setFormOp({ nombre: '', costo: '', prenda_id: '' });
  };

  const eliminarOperacion = async (id) => {
    if (!confirm('¿Eliminar operación?')) return;
    const { error } = await supabase.from('operaciones').update({ activo: false }).eq('id', id);
    if (error) alert('Error: ' + error.message);
    else cargarDatos();
  };

  // CRUD ASIGNACIONES
  const asignarOperacion = async () => {
    if (!formAsig.empleado_id || !formAsig.operacion_id || !formAsig.cantidad) {
      alert('Complete todos los campos');
      return;
    }

    const operacion = operaciones.find(o => o.id === parseInt(formAsig.operacion_id));
    const monto = operacion.costo * parseInt(formAsig.cantidad);

    const data = {
      empleado_id: parseInt(formAsig.empleado_id),
      operacion_id: parseInt(formAsig.operacion_id),
      cantidad: parseInt(formAsig.cantidad),
      talla: formAsig.talla,
      fecha: formAsig.fecha,
      completado: false,
      monto: monto
    };

    const { error } = await supabase.from('asignaciones').insert([data]);
    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('✓ Operación asignada');
      setFormAsig({ 
        empleado_id: '', 
        operacion_id: '', 
        cantidad: '', 
        talla: 'S',
        fecha: new Date().toISOString().split('T')[0]
      });
      cargarDatos();
    }
  };

  const toggleCompletado = async (id, completado) => {
    const { error } = await supabase.from('asignaciones').update({ completado: !completado }).eq('id', id);
    if (error) alert('Error: ' + error.message);
    else cargarDatos();
  };

  const eliminarAsignacion = async (id) => {
    if (!confirm('¿Eliminar asignación?')) return;
    const { error } = await supabase.from('asignaciones').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else cargarDatos();
  };

  // CÁLCULOS
  const calcularNominaEmpleado = (empId) => {
    return asignaciones
      .filter(a => a.empleado_id === empId && a.completado)
      .reduce((sum, a) => sum + parseFloat(a.monto), 0);
  };

  const calcularNominaTotal = () => {
    return asignaciones
      .filter(a => a.completado)
      .reduce((sum, a) => sum + parseFloat(a.monto), 0);
  };

  const calcularNominaPorRango = (empId = null) => {
    if (!filtroFechaInicio || !filtroFechaFin) {
      return empId ? calcularNominaEmpleado(empId) : calcularNominaTotal();
    }

    const asignacionesFiltradas = asignaciones.filter(a => {
      if (!a.completado) return false;
      if (empId && a.empleado_id !== empId) return false;
      
      const fechaAsig = new Date(a.fecha);
      const fechaInicio = new Date(filtroFechaInicio);
      const fechaFin = new Date(filtroFechaFin);
      
      return fechaAsig >= fechaInicio && fechaAsig <= fechaFin;
    });

    return asignacionesFiltradas.reduce((sum, a) => sum + parseFloat(a.monto), 0);
  };

  const generarReporteNomina = () => {
    if (!filtroFechaInicio || !filtroFechaFin) {
      alert('Seleccione un rango de fechas');
      return;
    }

    const reporte = empleados.map(emp => {
      const asignacionesEmp = asignaciones.filter(a => {
        if (!a.completado || a.empleado_id !== emp.id) return false;
        const fechaAsig = new Date(a.fecha);
        const fechaInicio = new Date(filtroFechaInicio);
        const fechaFin = new Date(filtroFechaFin);
        return fechaAsig >= fechaInicio && fechaAsig <= fechaFin;
      });

      const totalPiezas = asignacionesEmp.reduce((sum, a) => sum + a.cantidad, 0);
      const totalMonto = asignacionesEmp.reduce((sum, a) => sum + parseFloat(a.monto), 0);
      const operacionesCompletadas = asignacionesEmp.length;

      return {
        id: emp.id,
        nombre: emp.nombre,
        operaciones: operacionesCompletadas,
        piezas: totalPiezas,
        monto: totalMonto
      };
    }).filter(r => r.monto > 0);

    setNominaFiltrada(reporte);
  };

  const setRangoRapido = (dias) => {
    const hoy = new Date();
    const inicio = new Date();
    inicio.setDate(hoy.getDate() - dias);
    
    setFiltroFechaInicio(inicio.toISOString().split('T')[0]);
    setFiltroFechaFin(hoy.toISOString().split('T')[0]);
  };

  const limpiarFiltros = () => {
    setFiltroFechaInicio('');
    setFiltroFechaFin('');
    setNominaFiltrada(null);
  };

  // DATOS PARA GRÁFICOS
  const getDatosGraficos = () => {
    const nominaPorEmpleado = empleados.map(emp => ({
      nombre: emp.nombre.split(' ')[0],
      nomina: calcularNominaEmpleado(emp.id)
    })).filter(d => d.nomina > 0).sort((a, b) => b.nomina - a.nomina).slice(0, 10);

    const produccionPorDia = asignaciones.reduce((acc, a) => {
      const fecha = a.fecha;
      if (!acc[fecha]) acc[fecha] = { fecha, completadas: 0, pendientes: 0 };
      if (a.completado) acc[fecha].completadas += a.cantidad;
      else acc[fecha].pendientes += a.cantidad;
      return acc;
    }, {});

    const datosProduccion = Object.values(produccionPorDia)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .slice(-7);

    const operacionesMasUsadas = operaciones.map(op => ({
      nombre: op.nombre,
      cantidad: asignaciones.filter(a => a.operacion_id === op.id).length
    })).filter(d => d.cantidad > 0).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);

    return { nominaPorEmpleado, datosProduccion, operacionesMasUsadas };
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // PANTALLA DE LOGIN
  if (activeView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Package className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Sistema de Producción</h1>
            <p className="text-gray-600 mt-2">Gestión de Confección</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Usuario"
            />
            <input
              type="password"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Contraseña"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Iniciar Sesión
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-600 bg-gray-50 p-4 rounded">
            <p className="font-semibold mb-2">Usuarios:</p>
            <p>Admin: admin / admin123</p>
            <p>Básico: operario / operario123</p>
          </div>
        </div>
      </div>
    );
  }

  // PANTALLA ROL BÁSICO
  if (activeView === 'empleadoView') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Panel Operario</h1>
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-600">
              <LogOut className="w-5 h-5" />Salir
            </button>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Asignar Operación</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={formAsig.empleado_id}
                onChange={(e) => setFormAsig({...formAsig, empleado_id: e.target.value})}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="">Empleado</option>
                {empleados.map(e => <option key={e.id} value={e.id}>ID:{e.id} {e.nombre}</option>)}
              </select>
              
              <select
                value={formAsig.operacion_id}
                onChange={(e) => setFormAsig({...formAsig, operacion_id: e.target.value})}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="">Operación</option>
                {operaciones.map(o => <option key={o.id} value={o.id}>{o.nombre} ${o.costo}</option>)}
              </select>
              
              <input
                type="number"
                value={formAsig.cantidad}
                onChange={(e) => setFormAsig({...formAsig, cantidad: e.target.value})}
                className="px-3 py-2 border rounded-lg"
                placeholder="Cantidad"
              />
              
              <select
                value={formAsig.talla}
                onChange={(e) => setFormAsig({...formAsig, talla: e.target.value})}
                className="px-3 py-2 border rounded-lg"
              >
                {['S','M','L','XL','2XL','3XL'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              
              <button
                onClick={asignarOperacion}
                disabled={loading}
                className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                Asignar
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Asignaciones Recientes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Empleado</th>
                    <th className="px-3 py-2 text-left">Operación</th>
                    <th className="px-3 py-2 text-left">Cant</th>
                    <th className="px-3 py-2 text-left">Talla</th>
                    <th className="px-3 py-2 text-left">Monto</th>
                    <th className="px-3 py-2 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {asignaciones.slice(0, 20).map(a => {
                    const emp = empleados.find(e => e.id === a.empleado_id);
                    const op = operaciones.find(o => o.id === a.operacion_id);
                    return (
                      <tr key={a.id} className="border-t">
                        <td className="px-3 py-2">{emp?.id}</td>
                        <td className="px-3 py-2">{emp?.nombre}</td>
                        <td className="px-3 py-2">{op?.nombre}</td>
                        <td className="px-3 py-2">{a.cantidad}</td>
                        <td className="px-3 py-2">{a.talla}</td>
                        <td className="px-3 py-2 font-bold">${parseFloat(a.monto).toLocaleString()}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${a.completado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {a.completado ? 'OK' : 'Pend'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const NavBtn = ({view, icon: Icon, label}) => (
    <button
      onClick={() => setActiveView(view)}
      className={`px-3 py-2 rounded text-sm ${activeView === view ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
    >
      <Icon className="w-4 h-4 inline mr-1" />{label}
    </button>
  );

  const graficos = getDatosGraficos();

  // PANTALLA ADMIN
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h1 className="text-2xl font-bold">Admin</h1>
            <div className="flex gap-2 flex-wrap">
              <NavBtn view="dashboard" icon={BarChart3} label="Dashboard" />
              <NavBtn view="asignar" icon={Plus} label="Asignar" />
              <NavBtn view="empleados" icon={User} label="Empleados" />
              <NavBtn view="prendas" icon={Package} label="Prendas" />
              <NavBtn view="operaciones" icon={Settings} label="Operaciones" />
              <NavBtn view="nomina" icon={DollarSign} label="Nómina" />
              <button onClick={handleLogout} className="px-3 py-2 rounded bg-red-600 text-white text-sm">
                <LogOut className="w-4 h-4 inline mr-1" />Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {loading && <div className="text-center py-4">Cargando...</div>}
        
        {activeView === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 text-sm">Empleados</p>
                    <p className="text-3xl font-bold">{empleados.length}</p>
                  </div>
                  <User className="w-10 h-10 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 text-sm">Pendientes</p>
                    <p className="text-3xl font-bold">{asignaciones.filter(a => !a.completado).length}</p>
                  </div>
                  <Clock className="w-10 h-10 text-yellow-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 text-sm">Completadas</p>
                    <p className="text-3xl font-bold">{asignaciones.filter(a => a.completado).length}</p>
                  </div>
                  <Package className="w-10 h-10 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 text-sm">Nómina</p>
                    <p className="text-2xl font-bold">${calcularNominaTotal().toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold mb-4">Top 10 Nómina por Empleado</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={graficos.nominaPorEmpleado}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="nomina" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold mb-4">Producción Últimos 7 Días</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={graficos.datosProduccion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="completadas" stroke="#82ca9d" name="Completadas" />
                    <Line type="monotone" dataKey="pendientes" stroke="#ffc658" name="Pendientes" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="font-bold mb-4">Nómina Detallada por Empleado</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {empleados.map(emp => {
                  const nomina = calcularNominaEmpleado(emp.id);
                  const asigs = asignaciones.filter(a => a.empleado_id === emp.id);
                  const comp = asigs.filter(a => a.completado).length;
                  return (
                    <div key={emp.id} className="p-3 bg-gray-50 rounded">
                      <p className="font-semibold text-sm">ID:{emp.id} {emp.nombre}</p>
                      <p className="text-xs text-gray-600 mt-1">OK:{comp}/{asigs.length}</p>
                      <p className="text-lg font-bold text-green-600 mt-1">${nomina.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold mb-4">Gestión de Asignaciones</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-left">ID Emp</th>
                      <th className="px-2 py-2 text-left">Empleado</th>
                      <th className="px-2 py-2 text-left">Operación</th>
                      <th className="px-2 py-2 text-left">Cant</th>
                      <th className="px-2 py-2 text-left">Talla</th>
                      <th className="px-2 py-2 text-left">Monto</th>
                      <th className="px-2 py-2 text-left">Estado</th>
                      <th className="px-2 py-2 text-left">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asignaciones.map(a => {
                      const emp = empleados.find(e => e.id === a.empleado_id);
                      const op = operaciones.find(o => o.id === a.operacion_id);
                      return (
                        <tr key={a.id} className="border-t hover:bg-gray-50">
                          <td className="px-2 py-2">{emp?.id}</td>
                          <td className="px-2 py-2">{emp?.nombre}</td>
                          <td className="px-2 py-2">{op?.nombre}</td>
                          <td className="px-2 py-2">{a.cantidad}</td>
                          <td className="px-2 py-2">{a.talla}</td>
                          <td className="px-2 py-2 font-bold">${parseFloat(a.monto).toLocaleString()}</td>
                          <td className="px-2 py-2">
                            <span className={`px-2 py-1 rounded text-xs ${a.completado ? 'bg-green-100' : 'bg-yellow-100'}`}>
                              {a.completado ? 'OK' : 'Pend'}
                            </span>
                          </td>
                          <td className="px-2 py-2">
                            <button
                              onClick={() => toggleCompletado(a.id, a.completado)}
                              className="bg-blue-600 text-white px-2 py-1 rounded mr-1 text-xs"
                            >
                              {a.completado ? '↺' : '✓'}
                            </button>
                            <button
                              onClick={() => eliminarAsignacion(a.id)}
                              className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                            >
                              <Trash2 className="w-3 h-3 inline" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeView === 'asignar' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Nueva Asignación</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={formAsig.empleado_id}
                onChange={(e) => setFormAsig({...formAsig, empleado_id: e.target.value})}
                className="px-3 py-2 border rounded"
              >
                <option value="">Empleado</option>
                {empleados.map(e => <option key={e.id} value={e.id}>ID:{e.id} {e.nombre}</option>)}
              </select>
              
              <select
                value={formAsig.operacion_id}
                onChange={(e) => setFormAsig({...formAsig, operacion_id: e.target.value})}
                className="px-3 py-2 border rounded"
              >
                <option value="">Operación</option>
                {operaciones.map(o => <option key={o.id} value={o.id}>{o.nombre} ${o.costo}</option>)}
              </select>
              
              <input
                type="number"
                value={formAsig.cantidad}
                onChange={(e) => setFormAsig({...formAsig, cantidad: e.target.value})}
                className="px-3 py-2 border rounded"
                placeholder="Cantidad"
              />
              
              <select
                value={formAsig.talla}
                onChange={(e) => setFormAsig({...formAsig, talla: e.target.value})}
                className="px-3 py-2 border rounded"
              >
              {['S','M','L','XL','2XL','3XL'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              
              <button
                onClick={asignarOperacion}
                disabled={loading}
                className="bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                Asignar
              </button>
            </div>
          </div>
        )}

        {activeView === 'empleados' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingEmp ? 'Editar Empleado' : 'Empleados'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                value={formEmp.nombre}
                onChange={(e) => setFormEmp({...formEmp, nombre: e.target.value})}
                className="px-3 py-2 border rounded"
                placeholder="Nombre"
              />
              <input
                value={formEmp.telefono}
                onChange={(e) => setFormEmp({...formEmp, telefono: e.target.value})}
                className="px-3 py-2 border rounded"
                placeholder="Teléfono"
              />
              <div className="flex gap-2">
                <button
                  onClick={agregarEmpleado}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {editingEmp ? 'Actualizar' : <><Plus className="w-4 h-4 inline mr-1" />Agregar</>}
                </button>
                {editingEmp && (
                  <button
                    onClick={cancelarEdicionEmp}
                    className="px-4 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Nombre</th>
                    <th className="px-3 py-2 text-left">Teléfono</th>
                    <th className="px-3 py-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empleados.map(e => (
                    <tr key={e.id} className="border-t">
                      <td className="px-3 py-2">{e.id}</td>
                      <td className="px-3 py-2">{e.nombre}</td>
                      <td className="px-3 py-2">{e.telefono}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => editarEmpleado(e)}
                          className="bg-yellow-600 text-white px-2 py-1 rounded text-xs mr-1"
                        >
                          <Edit className="w-3 h-3 inline" />
                        </button>
                        <button
                          onClick={() => eliminarEmpleado(e.id)}
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                        >
                          <Trash2 className="w-3 h-3 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'prendas' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingPrenda ? 'Editar Prenda' : 'Prendas'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                value={formPrenda.referencia}
                onChange={(e) => setFormPrenda({...formPrenda, referencia: e.target.value})}
                className="px-3 py-2 border rounded"
                placeholder="Referencia"
              />
              <input
                value={formPrenda.descripcion}
                onChange={(e) => setFormPrenda({...formPrenda, descripcion: e.target.value})}
                className="px-3 py-2 border rounded"
                placeholder="Descripción"
              />
              <div className="flex gap-2">
                <button
                  onClick={agregarPrenda}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {editingPrenda ? 'Actualizar' : <><Plus className="w-4 h-4 inline mr-1" />Agregar</>}
                </button>
                {editingPrenda && (
                  <button
                    onClick={cancelarEdicionPrenda}
                    className="px-4 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Referencia</th>
                    <th className="px-3 py-2 text-left">Descripción</th>
                    <th className="px-3 py-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {prendas.map(p => (
                    <tr key={p.id} className="border-t">
                      <td className="px-3 py-2">{p.id}</td>
                      <td className="px-3 py-2">{p.referencia}</td>
                      <td className="px-3 py-2">{p.descripcion}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => editarPrenda(p)}
                          className="bg-yellow-600 text-white px-2 py-1 rounded text-xs mr-1"
                        >
                          <Edit className="w-3 h-3 inline" />
                        </button>
                        <button
                          onClick={() => eliminarPrenda(p.id)}
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                        >
                          <Trash2 className="w-3 h-3 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'operaciones' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingOp ? 'Editar Operación' : 'Operaciones'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <input
                value={formOp.nombre}
                onChange={(e) => setFormOp({...formOp, nombre: e.target.value})}
                className="px-3 py-2 border rounded"
                placeholder="Nombre operación"
              />
              <input
                type="number"
                value={formOp.costo}
                onChange={(e) => setFormOp({...formOp, costo: e.target.value})}
                className="px-3 py-2 border rounded"
                placeholder="Costo"
              />
              <select
                value={formOp.prenda_id}
                onChange={(e) => setFormOp({...formOp, prenda_id: e.target.value})}
                className="px-3 py-2 border rounded"
              >
                <option value="">Seleccionar prenda</option>
                {prendas.map(p => <option key={p.id} value={p.id}>{p.referencia}</option>)}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={agregarOperacion}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {editingOp ? 'Actualizar' : <><Plus className="w-4 h-4 inline mr-1" />Agregar</>}
                </button>
                {editingOp && (
                  <button
                    onClick={cancelarEdicion}
                    className="px-4 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Operación</th>
                    <th className="px-3 py-2 text-left">Costo</th>
                    <th className="px-3 py-2 text-left">Prenda</th>
                    <th className="px-3 py-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {operaciones.map(o => {
                    const prenda = prendas.find(p => p.id === o.prenda_id);
                    return (
                      <tr key={o.id} className="border-t">
                        <td className="px-3 py-2">{o.id}</td>
                        <td className="px-3 py-2">{o.nombre}</td>
                        <td className="px-3 py-2 font-bold">${o.costo}</td>
                        <td className="px-3 py-2">{prenda?.referencia}</td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => editarOperacion(o)}
                            className="bg-yellow-600 text-white px-2 py-1 rounded text-xs mr-1"
                          >
                            <Edit className="w-3 h-3 inline" />
                          </button>
                          <button
                            onClick={() => eliminarOperacion(o.id)}
                            className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                          >
                            <Trash2 className="w-3 h-3 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {activeView === 'nomina' && (
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Cálculo de Nómina por Período</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Fecha Inicio</label>
                  <input
                    type="date"
                    value={filtroFechaInicio}
                    onChange={(e) => setFiltroFechaInicio(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Fecha Fin</label>
                  <input
                    type="date"
                    value={filtroFechaFin}
                    onChange={(e) => setFiltroFechaFin(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={generarReporteNomina}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    Calcular Nómina
                  </button>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={limpiarFiltros}
                    className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap mb-4">
                <p className="text-sm font-medium">Rangos rápidos:</p>
                <button onClick={() => setRangoRapido(7)} className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">Últimos 7 días</button>
                <button onClick={() => setRangoRapido(10)} className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">Últimos 10 días</button>
                <button onClick={() => setRangoRapido(15)} className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">Últimos 15 días</button>
                <button onClick={() => setRangoRapido(30)} className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">Último mes</button>
              </div>

              {filtroFechaInicio && filtroFechaFin && (
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm">
                    Período seleccionado: <strong>{new Date(filtroFechaInicio).toLocaleDateString()}</strong> al <strong>{new Date(filtroFechaFin).toLocaleDateString()}</strong>
                  </p>
                </div>
              )}
            </div>

            {nominaFiltrada && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Reporte de Nómina</h3>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total General</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${nominaFiltrada.reduce((sum, r) => sum + r.monto, 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Empleado</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Operaciones</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Piezas</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Monto a Pagar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {nominaFiltrada.map(r => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{r.id}</td>
                          <td className="px-4 py-3 font-medium">{r.nombre}</td>
                          <td className="px-4 py-3">{r.operaciones}</td>
                          <td className="px-4 py-3">{r.piezas}</td>
                          <td className="px-4 py-3 text-lg font-bold text-green-600">
                            ${r.monto.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold">
                      <tr>
                        <td colSpan="4" className="px-4 py-3 text-right">TOTAL:</td>
                        <td className="px-4 py-3 text-lg text-green-600">
                          ${nominaFiltrada.reduce((sum, r) => sum + r.monto, 0).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {!nominaFiltrada && (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Seleccione un rango de fechas y haga clic en "Calcular Nómina"</p>
              </div>
            )}
          </div>
        )}
    </div>
  );
}

export default App;