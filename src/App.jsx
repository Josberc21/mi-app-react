import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { User, Package, Settings, BarChart3, DollarSign, Clock, LogOut, Plus, Trash2, Edit } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
  const [filtroTaller, setFiltroTaller] = useState('hoy');
  const [cargandoArchivo, setCargandoArchivo] = useState(false);
  const [busquedaEmpleado, setBusquedaEmpleado] = useState('');
  const [busquedaPrenda, setBusquedaPrenda] = useState('');
  const [busquedaOperacion, setBusquedaOperacion] = useState('');
  const [busquedaAsignacion, setBusquedaAsignacion] = useState('');



  // Estado adicional para Pantalla Taller (no altera flujo existente)
  const [pantallaTaller, setPantallaTaller] = useState(false);

  useEffect(() => {
    let interval;
    if (activeView === 'taller') {
      interval = setInterval(() => {
        cargarDatos();
      }, 30000); // Actualiza cada 30 segundos
    }
    return () => clearInterval(interval);
  }, [activeView]);

  const [formAsig, setFormAsig] = useState({
    empleado_id: '',
    prenda_id: '',
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
  const descargarPlantillaOperaciones = () => {
    const plantilla = [
      {
        'Referencia Prenda': 'BUSO ALBATROS',
        'Descripción Prenda': 'Buso deportivo con capota',
        'Nombre Operación': 'CERRAR HOMBROS',
        'Costo': 120
      },
      {
        'Referencia Prenda': 'BUSO ALBATROS',
        'Descripción Prenda': 'Buso deportivo con capota',
        'Nombre Operación': 'MONTAR MANGAS',
        'Costo': 200
      },
      {
        'Referencia Prenda': 'CAMISA CASUAL',
        'Descripción Prenda': 'Camisa manga larga',
        'Nombre Operación': 'HACER CUELLO',
        'Costo': 150
      }
    ];

    const ws = XLSX.utils.json_to_sheet(plantilla);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Operaciones');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'Plantilla_Operaciones.xlsx');
    alert('✓ Plantilla descargada. Incluye columnas para crear prendas automáticamente.');
  };

  const cargarArchivoOperaciones = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setCargandoArchivo(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        alert('El archivo está vacío');
        setCargandoArchivo(false);
        return;
      }

      // Validar columnas requeridas
      const primeraFila = jsonData[0];
      if (!primeraFila['Referencia Prenda'] || !primeraFila['Nombre Operación'] || !primeraFila.Costo) {
        alert('El archivo debe tener las columnas:\n- Referencia Prenda\n- Descripción Prenda (opcional)\n- Nombre Operación\n- Costo');
        setCargandoArchivo(false);
        return;
      }

      let prendasCreadas = 0;
      let operacionesCreadas = 0;
      const errores = [];

      // Procesar cada fila
      for (let index = 0; index < jsonData.length; index++) {
        const row = jsonData[index];

        const refPrenda = row['Referencia Prenda']?.toString().trim();
        const descPrenda = row['Descripción Prenda']?.toString().trim() || '';
        const nombreOp = row['Nombre Operación']?.toString().trim();
        const costo = parseFloat(row.Costo);

        // Validar datos básicos
        if (!refPrenda || !nombreOp || isNaN(costo)) {
          errores.push(`Fila ${index + 2}: Datos incompletos o inválidos`);
          continue;
        }

        try {
          // Buscar si la prenda ya existe (case insensitive)
          let prenda = prendas.find(p =>
            p.referencia.toUpperCase() === refPrenda.toUpperCase()
          );

          // Si no existe, crearla
          if (!prenda) {
            const { data: nuevaPrenda, error: errorPrenda } = await supabase
              .from('prendas')
              .insert([{
                referencia: refPrenda.toUpperCase(),
                descripcion: descPrenda
              }])
              .select()
              .single();

            if (errorPrenda) {
              errores.push(`Fila ${index + 2}: Error al crear prenda "${refPrenda}"`);
              continue;
            }

            prenda = nuevaPrenda;
            prendas.push(nuevaPrenda); // Actualizar array local
            prendasCreadas++;
          }

          // Crear la operación
          const { error: errorOp } = await supabase
            .from('operaciones')
            .insert([{
              nombre: nombreOp,
              costo: costo,
              prenda_id: prenda.id
            }]);

          if (errorOp) {
            errores.push(`Fila ${index + 2}: Error al crear operación "${nombreOp}"`);
          } else {
            operacionesCreadas++;
          }

        } catch (error) {
          errores.push(`Fila ${index + 2}: ${error.message}`);
        }
      }

      // Recargar datos
      await cargarDatos();

      // Mostrar resumen
      let mensaje = `✓ CARGA COMPLETADA\n\n`;
      mensaje += `📦 Prendas creadas: ${prendasCreadas}\n`;
      mensaje += `⚙️ Operaciones creadas: ${operacionesCreadas}\n`;
      if (errores.length > 0) {
        mensaje += `\n⚠️ Errores (${errores.length}):\n${errores.slice(0, 5).join('\n')}`;
        if (errores.length > 5) {
          mensaje += `\n... y ${errores.length - 5} más`;
        }
      }
      alert(mensaje);

    } catch (error) {
      alert('Error al procesar el archivo: ' + error.message);
    } finally {
      setCargandoArchivo(false);
      event.target.value = '';
    }
  };
  // CRUD ASIGNACIONES
  const asignarOperacion = async () => {
    if (!formAsig.empleado_id || !formAsig.prenda_id || !formAsig.operacion_id || !formAsig.cantidad) {
      alert('Complete todos los campos');
      return;
    }

    const operacion = operaciones.find(o => o.id === parseInt(formAsig.operacion_id));
    const monto = operacion.costo * parseInt(formAsig.cantidad);

    const data = {
      empleado_id: parseInt(formAsig.empleado_id),
      prenda_id: parseInt(formAsig.prenda_id),
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
        prenda_id: '',
        operacion_id: '',
        cantidad: '',
        talla: 'S',
        fecha: new Date().toISOString().split('T')[0]
      });
      cargarDatos();
    }
  };

  const toggleCompletado = async (id, completado) => {
    const updates = { completado: !completado };

    // Si se está marcando como completado, agregar fecha de terminación
    if (!completado) {
      updates.fecha_terminado = new Date().toISOString().split('T')[0];
    } else {
      // Si se está revirtiendo, quitar fecha de terminación
      updates.fecha_terminado = null;
    }

    const { error } = await supabase.from('asignaciones').update(updates).eq('id', id);
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
      if (!a.completado || !a.fecha_terminado) return false;
      if (empId && a.empleado_id !== empId) return false;

      const fechaTerm = new Date(a.fecha_terminado);
      const fechaInicio = new Date(filtroFechaInicio);
      const fechaFin = new Date(filtroFechaFin);

      return fechaTerm >= fechaInicio && fechaTerm <= fechaFin;
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
        if (!a.completado || !a.fecha_terminado || a.empleado_id !== emp.id) return false;
        const fechaTerm = new Date(a.fecha_terminado);
        const fechaInicio = new Date(filtroFechaInicio);
        const fechaFin = new Date(filtroFechaFin);
        return fechaTerm >= fechaInicio && fechaTerm <= fechaFin;
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

  const exportarNominaExcel = () => {
    if (!nominaFiltrada || nominaFiltrada.length === 0) {
      alert('No hay datos de nómina para exportar. Primero calcula la nómina.');
      return;
    }

    // Crear hoja resumen
    const datosResumen = nominaFiltrada.map(emp => ({
      'ID Empleado': emp.id,
      'Nombre': emp.nombre,
      'Operaciones Completadas': emp.operaciones,
      'Piezas Totales': emp.piezas,
      'Total a Pagar': emp.monto
    }));

    // Crear hoja detallada
    const datosDetalle = [];
    nominaFiltrada.forEach(emp => {
      const asignacionesEmp = asignaciones.filter(a => {
        if (!a.completado || !a.fecha_terminado || a.empleado_id !== emp.id) return false;
        const fechaTerm = new Date(a.fecha_terminado);
        const fechaInicio = new Date(filtroFechaInicio);
        const fechaFin = new Date(filtroFechaFin);
        return fechaTerm >= fechaInicio && fechaTerm <= fechaFin;
      });

      asignacionesEmp.forEach(a => {
        const op = operaciones.find(o => o.id === a.operacion_id);
        const prenda = prendas.find(p => p.id === a.prenda_id);
        datosDetalle.push({
          'ID Empleado': emp.id,
          'Nombre Empleado': emp.nombre,
          'Fecha Asignada': new Date(a.fecha).toLocaleDateString(),
          'Fecha Terminada': a.fecha_terminado ? new Date(a.fecha_terminado).toLocaleDateString() : '-',
          'Prenda': prenda?.referencia || '-',
          'Operación': op?.nombre || '-',
          'Talla': a.talla,
          'Cantidad': a.cantidad,
          'Valor Unitario': op?.costo || 0,
          'Subtotal': a.monto
        });
      });
    });

    // Crear libro de Excel
    const wb = XLSX.utils.book_new();

    const wsResumen = XLSX.utils.json_to_sheet(datosResumen);
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    const wsDetalle = XLSX.utils.json_to_sheet(datosDetalle);
    XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle');

    // Agregar hoja de totales
    const totalGeneral = nominaFiltrada.reduce((sum, emp) => sum + emp.monto, 0);
    const wsTotales = XLSX.utils.json_to_sheet([
      { 'Concepto': 'Período', 'Valor': `${new Date(filtroFechaInicio).toLocaleDateString()} - ${new Date(filtroFechaFin).toLocaleDateString()}` },
      { 'Concepto': 'Total Empleados', 'Valor': nominaFiltrada.length },
      { 'Concepto': 'Total Operaciones', 'Valor': nominaFiltrada.reduce((sum, e) => sum + e.operaciones, 0) },
      { 'Concepto': 'Total Piezas', 'Valor': nominaFiltrada.reduce((sum, e) => sum + e.piezas, 0) },
      { 'Concepto': 'TOTAL A PAGAR', 'Valor': totalGeneral }
    ]);
    XLSX.utils.book_append_sheet(wb, wsTotales, 'Totales');

    // Descargar
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const nombreArchivo = `Nomina_${filtroFechaInicio}_${filtroFechaFin}.xlsx`;
    saveAs(blob, nombreArchivo);

    alert(`Nómina exportada exitosamente: ${nombreArchivo}`);
  };
  // FUNCIONES DE FILTRADO
  const empleadosFiltrados = empleados.filter(e =>
    e.nombre.toLowerCase().includes(busquedaEmpleado.toLowerCase()) ||
    e.id.toString().includes(busquedaEmpleado) ||
    e.telefono.includes(busquedaEmpleado)
  );

  const prendasFiltradas = prendas.filter(p =>
    p.referencia.toLowerCase().includes(busquedaPrenda.toLowerCase()) ||
    (p.descripcion && p.descripcion.toLowerCase().includes(busquedaPrenda.toLowerCase())) ||
    p.id.toString().includes(busquedaPrenda)
  );

  const operacionesFiltradas = operaciones.filter(o => {
    const prenda = prendas.find(p => p.id === o.prenda_id);
    return (
      o.nombre.toLowerCase().includes(busquedaOperacion.toLowerCase()) ||
      o.id.toString().includes(busquedaOperacion) ||
      (prenda && prenda.referencia.toLowerCase().includes(busquedaOperacion.toLowerCase()))
    );
  });

  const asignacionesFiltradas = asignaciones.filter(a => {
    const emp = empleados.find(e => e.id === a.empleado_id);
    const op = operaciones.find(o => o.id === a.operacion_id);
    const prenda = prendas.find(p => p.id === a.prenda_id);

    return (
      (emp && emp.nombre.toLowerCase().includes(busquedaAsignacion.toLowerCase())) ||
      (emp && emp.id.toString().includes(busquedaAsignacion)) ||
      (op && op.nombre.toLowerCase().includes(busquedaAsignacion.toLowerCase())) ||
      (prenda && prenda.referencia.toLowerCase().includes(busquedaAsignacion.toLowerCase())) ||
      a.talla.toLowerCase().includes(busquedaAsignacion.toLowerCase())
    );
  });

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
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Empleado</label>
                <select
                  value={formAsig.empleado_id}
                  onChange={(e) => setFormAsig({ ...formAsig, empleado_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Seleccione</option>
                  {empleados.map(emp => (
                    <option key={emp.id} value={emp.id}>ID:{emp.id} {emp.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prenda</label>
                <select
                  value={formAsig.prenda_id}
                  onChange={(e) => setFormAsig({ ...formAsig, prenda_id: e.target.value, operacion_id: '' })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Seleccione</option>
                  {prendas.map(p => (
                    <option key={p.id} value={p.id}>{p.referencia}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operación</label>
                <select
                  value={formAsig.operacion_id}
                  onChange={(e) => setFormAsig({ ...formAsig, operacion_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!formAsig.prenda_id}
                >
                  <option value="">Seleccione</option>
                  {operaciones
                    .filter(op => op.prenda_id === parseInt(formAsig.prenda_id))
                    .map(op => (
                      <option key={op.id} value={op.id}>{op.nombre} - ${op.costo}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                <input
                  type="number"
                  value={formAsig.cantidad}
                  onChange={(e) => setFormAsig({ ...formAsig, cantidad: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Talla</label>
                <select
                  value={formAsig.talla}
                  onChange={(e) => setFormAsig({ ...formAsig, talla: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {['S', 'M', 'L', 'XL', '2XL', '3XL'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={asignarOperacion}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
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
                      <th className="px-3 py-2 text-left">Prenda</th>
                      <th className="px-3 py-2 text-left">Operación</th>
                      <th className="px-3 py-2 text-left">Cant</th>
                      <th className="px-3 py-2 text-left">Talla</th>
                      <th className="px-3 py-2 text-left">Monto</th>
                      <th className="px-3 py-2 text-left">Estado</th>
                      <th className="px-3 py-2 text-left">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asignaciones.slice(0, 50).map(a => {
                      const emp = empleados.find(e => e.id === a.empleado_id);
                      const prenda = prendas.find(p => p.id === a.prenda_id);
                      const op = operaciones.find(o => o.id === a.operacion_id);
                      return (
                        <tr key={a.id} className="border-t">
                          <td className="px-3 py-2">{emp?.id}</td>
                          <td className="px-3 py-2">{emp?.nombre}</td>
                          <td className="px-3 py-2">{prenda?.referencia}</td>
                          <td className="px-3 py-2">{op?.nombre}</td>
                          <td className="px-3 py-2">{a.cantidad}</td>
                          <td className="px-3 py-2">{a.talla}</td>
                          <td className="px-3 py-2 font-bold">${parseFloat(a.monto).toLocaleString()}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded text-xs ${a.completado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {a.completado ? 'OK' : 'Pend'}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => toggleCompletado(a.id, a.completado)}
                              disabled={loading}
                              className={`px-3 py-1 rounded text-xs font-semibold ${a.completado
                                ? 'bg-gray-500 text-white hover:bg-gray-600'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                } disabled:bg-gray-300`}
                            >
                              {a.completado ? 'Revertir' : 'Completar'}
                            </button>
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
      </div>
    );
  }

  const NavBtn = ({ view, icon: Icon, label }) => (
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
              <NavBtn view="taller" icon={BarChart3} label="Pantalla Taller" />
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
                      <th className="px-3 py-2 text-left">Prenda</th>
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
                      const prenda = prendas.find(p => p.id === a.prenda_id);
                      return (
                        <tr key={a.id} className="border-t hover:bg-gray-50">
                          <td className="px-2 py-2">{emp?.id}</td>
                          <td className="px-2 py-2">{emp?.nombre}</td>
                          <td className="px-3 py-2">{prenda?.referencia}</td>
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
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Empleado</label>
                <select
                  value={formAsig.empleado_id}
                  onChange={(e) => setFormAsig({ ...formAsig, empleado_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Seleccione</option>
                  {empleados.map(emp => (
                    <option key={emp.id} value={emp.id}>ID:{emp.id} {emp.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prenda</label>
                <select
                  value={formAsig.prenda_id}
                  onChange={(e) => setFormAsig({ ...formAsig, prenda_id: e.target.value, operacion_id: '' })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Seleccione</option>
                  {prendas.map(p => (
                    <option key={p.id} value={p.id}>{p.referencia}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operación</label>
                <select
                  value={formAsig.operacion_id}
                  onChange={(e) => setFormAsig({ ...formAsig, operacion_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!formAsig.prenda_id}
                >
                  <option value="">Seleccione</option>
                  {operaciones
                    .filter(op => op.prenda_id === parseInt(formAsig.prenda_id))
                    .map(op => (
                      <option key={op.id} value={op.id}>{op.nombre} - ${op.costo}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                <input
                  type="number"
                  value={formAsig.cantidad}
                  onChange={(e) => setFormAsig({ ...formAsig, cantidad: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Talla</label>
                <select
                  value={formAsig.talla}
                  onChange={(e) => setFormAsig({ ...formAsig, talla: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {['S', 'M', 'L', 'XL', '2XL', '3XL'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={asignarOperacion}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  Asignar
                </button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'empleados' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingEmp ? 'Editar Empleado' : 'Empleados'}
            </h2>
            <div className="mb-4">
              <input
                type="text"
                value={busquedaEmpleado}
                onChange={(e) => setBusquedaEmpleado(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="🔍 Buscar por ID, nombre o teléfono..."
              />
              {busquedaEmpleado && (
                <p className="text-sm text-gray-600 mt-2">
                  Mostrando {empleadosFiltrados.length} de {empleados.length} empleados
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                value={formEmp.nombre}
                onChange={(e) => setFormEmp({ ...formEmp, nombre: e.target.value })}
                className="px-3 py-2 border rounded"
                placeholder="Nombre"
              />
              <input
                value={formEmp.telefono}
                onChange={(e) => setFormEmp({ ...formEmp, telefono: e.target.value })}
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
                  {empleadosFiltrados.map(e => (
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

            {/* CAMPO DE BÚSQUEDA */}
            <div className="mb-4">
              <input
                type="text"
                value={busquedaPrenda}
                onChange={(e) => setBusquedaPrenda(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="🔍 Buscar por ID, referencia o descripción..."
              />
              {busquedaPrenda && (
                <p className="text-sm text-gray-600 mt-2">
                  Mostrando {prendasFiltradas.length} de {prendas.length} prendas
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                value={formPrenda.referencia}
                onChange={(e) => setFormPrenda({ ...formPrenda, referencia: e.target.value })}
                className="px-3 py-2 border rounded"
                placeholder="Referencia"
              />
              <input
                value={formPrenda.descripcion}
                onChange={(e) => setFormPrenda({ ...formPrenda, descripcion: e.target.value })}
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
                  {prendasFiltradas.map(p => (
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingOp ? 'Editar Operación' : 'Operaciones'}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={descargarPlantillaOperaciones}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-2"
                >
                  📥 Descargar Plantilla Excel
                </button>
                <label className={`px-4 py-2 rounded text-sm cursor-pointer flex items-center gap-2 ${cargandoArchivo
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}>
                  {cargandoArchivo ? '⏳ Cargando...' : '📤 Cargar Excel Masivo'}
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={cargarArchivoOperaciones}
                    disabled={cargandoArchivo}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Carga Masiva Inteligente:</strong> Si una prenda no existe en el sistema,
                se creará automáticamente al cargar las operaciones.
              </p>
            </div>
            {/* CAMPO DE BÚSQUEDA */}
            <div className="mb-4">
              <input
                type="text"
                value={busquedaOperacion}
                onChange={(e) => setBusquedaOperacion(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="🔍 Buscar por ID, nombre de operación o referencia de prenda..."
              />
              {busquedaOperacion && (
                <p className="text-sm text-gray-600 mt-2">
                  Mostrando {operacionesFiltradas.length} de {operaciones.length} operaciones
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <input
                value={formOp.nombre}
                onChange={(e) => setFormOp({ ...formOp, nombre: e.target.value })}
                className="px-3 py-2 border rounded"
                placeholder="Nombre operación"
              />
              <input
                type="number"
                value={formOp.costo}
                onChange={(e) => setFormOp({ ...formOp, costo: e.target.value })}
                className="px-3 py-2 border rounded"
                placeholder="Costo"
              />
              <select
                value={formOp.prenda_id}
                onChange={(e) => setFormOp({ ...formOp, prenda_id: e.target.value })}
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
                  {operacionesFiltradas.map(o => {
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

      {activeView === 'taller' && (() => {
        const hoy = new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

        const filtrarAsignacionesPorPeriodo = () => {
          const hoyDate = new Date();
          hoyDate.setHours(0, 0, 0, 0);

          switch (filtroTaller) {
            case 'hoy':
              return asignaciones.filter(a => {
                const fechaAsig = new Date(a.fecha);
                fechaAsig.setHours(0, 0, 0, 0);
                return fechaAsig.getTime() === hoyDate.getTime();
              });
            case 'ayer':
              const ayer = new Date(hoyDate);
              ayer.setDate(ayer.getDate() - 1);
              return asignaciones.filter(a => {
                const fechaAsig = new Date(a.fecha);
                fechaAsig.setHours(0, 0, 0, 0);
                return fechaAsig.getTime() === ayer.getTime();
              });
            case '5dias':
              const hace5 = new Date(hoyDate);
              hace5.setDate(hace5.getDate() - 5);
              return asignaciones.filter(a => {
                const fechaAsig = new Date(a.fecha);
                return fechaAsig >= hace5 && fechaAsig <= hoyDate;
              });
            case '10dias':
              const hace10 = new Date(hoyDate);
              hace10.setDate(hace10.getDate() - 10);
              return asignaciones.filter(a => {
                const fechaAsig = new Date(a.fecha);
                return fechaAsig >= hace10 && fechaAsig <= hoyDate;
              });
            case '15dias':
              const hace15 = new Date(hoyDate);
              hace15.setDate(hace15.getDate() - 15);
              return asignaciones.filter(a => {
                const fechaAsig = new Date(a.fecha);
                return fechaAsig >= hace15 && fechaAsig <= hoyDate;
              });
            case 'mes':
              const hace30 = new Date(hoyDate);
              hace30.setDate(hace30.getDate() - 30);
              return asignaciones.filter(a => {
                const fechaAsig = new Date(a.fecha);
                return fechaAsig >= hace30 && fechaAsig <= hoyDate;
              });
            case 'todo':
            default:
              return asignaciones;
          }
        };

        const asignacionesFiltradas = filtrarAsignacionesPorPeriodo();
        const pendientesFiltradas = asignacionesFiltradas.filter(a => !a.completado);
        const completadasFiltradas = asignacionesFiltradas.filter(a => a.completado);

        const obtenerTituloPeriodo = () => {
          switch (filtroTaller) {
            case 'hoy': return 'HOY';
            case 'ayer': return 'AYER';
            case '5dias': return 'ÚLTIMOS 5 DÍAS';
            case '10dias': return 'ÚLTIMOS 10 DÍAS';
            case '15dias': return 'ÚLTIMOS 15 DÍAS';
            case 'mes': return 'ÚLTIMO MES';
            case 'todo': return 'HISTÓRICO COMPLETO';
            default: return 'PERÍODO';
          }
        };

        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-4xl font-bold mb-2">PANEL DE PRODUCCIÓN</h1>
                  <p className="text-xl opacity-90 capitalize">{hoy}</p>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold">{hora}</p>
                  <button
                    onClick={() => setActiveView('dashboard')}
                    className="mt-2 px-4 py-2 bg-red-600 rounded hover:bg-red-700 text-sm"
                  >
                    Salir Pantalla Completa
                  </button>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <p className="text-lg font-semibold">Período: {obtenerTituloPeriodo()}</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setFiltroTaller('hoy')}
                      className={`px-4 py-2 rounded font-semibold transition-all ${filtroTaller === 'hoy' ? 'bg-blue-500 scale-105' : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                        }`}
                    >
                      Hoy
                    </button>
                    <button
                      onClick={() => setFiltroTaller('ayer')}
                      className={`px-4 py-2 rounded font-semibold transition-all ${filtroTaller === 'ayer' ? 'bg-blue-500 scale-105' : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                        }`}
                    >
                      Ayer
                    </button>
                    <button
                      onClick={() => setFiltroTaller('5dias')}
                      className={`px-4 py-2 rounded font-semibold transition-all ${filtroTaller === '5dias' ? 'bg-blue-500 scale-105' : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                        }`}
                    >
                      5 Días
                    </button>
                    <button
                      onClick={() => setFiltroTaller('10dias')}
                      className={`px-4 py-2 rounded font-semibold transition-all ${filtroTaller === '10dias' ? 'bg-blue-500 scale-105' : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                        }`}
                    >
                      10 Días
                    </button>
                    <button
                      onClick={() => setFiltroTaller('15dias')}
                      className={`px-4 py-2 rounded font-semibold transition-all ${filtroTaller === '15dias' ? 'bg-blue-500 scale-105' : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                        }`}
                    >
                      15 Días
                    </button>
                    <button
                      onClick={() => setFiltroTaller('mes')}
                      className={`px-4 py-2 rounded font-semibold transition-all ${filtroTaller === 'mes' ? 'bg-blue-500 scale-105' : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                        }`}
                    >
                      Mes
                    </button>
                    <button
                      onClick={() => setFiltroTaller('todo')}
                      className={`px-4 py-2 rounded font-semibold transition-all ${filtroTaller === 'todo' ? 'bg-blue-500 scale-105' : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                        }`}
                    >
                      Todo
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white bg-opacity-10 rounded-lg p-6">
                  <p className="text-sm opacity-80 mb-2">TOTAL</p>
                  <p className="text-5xl font-bold">{asignacionesFiltradas.length}</p>
                </div>
                <div className="bg-yellow-500 bg-opacity-20 rounded-lg p-6">
                  <p className="text-sm opacity-80 mb-2">PENDIENTES</p>
                  <p className="text-5xl font-bold">{pendientesFiltradas.length}</p>
                </div>
                <div className="bg-green-500 bg-opacity-20 rounded-lg p-6">
                  <p className="text-sm opacity-80 mb-2">COMPLETADAS</p>
                  <p className="text-5xl font-bold">{completadasFiltradas.length}</p>
                </div>
                <div className="bg-purple-500 bg-opacity-20 rounded-lg p-6">
                  <p className="text-sm opacity-80 mb-2">PRODUCTIVIDAD</p>
                  <p className="text-5xl font-bold">
                    {asignacionesFiltradas.length > 0 ? Math.round((completadasFiltradas.length / asignacionesFiltradas.length) * 100) : 0}%
                  </p>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-6">
                <h2 className="text-3xl font-bold mb-4 flex items-center">
                  <Clock className="w-8 h-8 mr-3" /> OPERACIONES PENDIENTES
                </h2>
                {pendientesFiltradas.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                    {pendientesFiltradas.map(a => {
                      const emp = empleados.find(e => e.id === a.empleado_id);
                      const op = operaciones.find(o => o.id === a.operacion_id);
                      const prenda = prendas.find(p => p.id === op?.prenda_id);
                      return (
                        <div key={a.id} className="bg-yellow-500 bg-opacity-20 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className="text-2xl font-bold">ID: {emp?.id} - {emp?.nombre}</p>
                              <p className="text-xl opacity-90 mt-1">{op?.nombre}</p>
                              <p className="text-xl opacity-90 mt-1">{prenda?.referencia}</p>
                              <p className="text-sm opacity-70 mt-1">Fecha: {new Date(a.fecha).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold">{a.cantidad} und</p>
                              <p className="text-lg opacity-90">Talla: {a.talla}</p>
                            </div>
                            <div className="ml-6 text-right">
                              <p className="text-sm opacity-80">Valor</p>
                              <p className="text-3xl font-bold text-yellow-300">${parseFloat(a.monto).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-2xl opacity-60 py-8">No hay operaciones pendientes en este período</p>
                )}
              </div>

              <div className="bg-white bg-opacity-10 rounded-lg p-6">
                <h2 className="text-3xl font-bold mb-4 flex items-center">
                  <BarChart3 className="w-8 h-8 mr-3" /> ÚLTIMAS COMPLETADAS
                </h2>
                {completadasFiltradas.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {completadasFiltradas.slice(0, 10).map(a => {
                      const emp = empleados.find(e => e.id === a.empleado_id);
                      const op = operaciones.find(o => o.id === a.operacion_id);
                      const prenda = prendas.find(p => p.id === op?.prenda_id);
                      return (
                        <div key={a.id} className="bg-green-500 bg-opacity-20 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-lg font-bold">ID: {emp?.id} - {emp?.nombre}</p>
                              <p className="text-sm opacity-90">{op?.nombre} • {a.cantidad} und • {a.talla}</p>
                              <p className="text-sm opacity-90 mt-1">{prenda?.referencia}</p>
                              <p className="text-xs opacity-70 mt-1">{new Date(a.fecha).toLocaleDateString()}</p>
                            </div>
                            <p className="text-xl font-bold text-green-300">${parseFloat(a.monto).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-2xl opacity-60 py-8">No hay operaciones completadas en este período</p>
                )}
              </div>

              <div className="mt-6 text-center opacity-60">
                <p className="text-sm">Actualización automática cada 30 segundos</p>
              </div>
            </div>
          </div>
        );
      })()}


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
                <h3 className="text-xl font-bold">Reporte de Nómina Detallado</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={exportarNominaExcel}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                  >
                    📊 Exportar a Excel
                  </button>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total General del Período</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${nominaFiltrada.reduce((sum, r) => sum + r.monto, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

//////
              {nominaFiltrada.map(emp => {
                const asignacionesDetalle = asignaciones.filter(a => {
                  if (!a.completado || a.empleado_id !== emp.id) return false;
                  const fechaAsig = new Date(a.fecha);
                  const fechaInicio = new Date(filtroFechaInicio);
                  const fechaFin = new Date(filtroFechaFin);
                  return fechaAsig >= fechaInicio && fechaAsig <= fechaFin;
                });

                return (
                  <div key={emp.id} className="mb-6 border rounded-lg overflow-hidden">
                    {/* Header del empleado */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm opacity-90">Empleado ID: {emp.id}</p>
                          <h4 className="text-2xl font-bold">{emp.nombre}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-sm opacity-90">Total a Pagar</p>
                          <p className="text-3xl font-bold">${emp.monto.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-4 text-sm">
                        <span className="bg-white bg-opacity-20 px-3 py-1 rounded">
                          {emp.operaciones} operaciones
                        </span>
                        <span className="bg-white bg-opacity-20 px-3 py-1 rounded">
                          {emp.piezas} piezas totales
                        </span>
                      </div>
                    </div>

                    {/* Detalle de operaciones */}
                    <div className="bg-white">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Fecha Asignada</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Fecha Terminada</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Operación</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Talla</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Cantidad</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Valor Unit.</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {asignacionesDetalle.map(a => {
                            const op = operaciones.find(o => o.id === a.operacion_id);
                            return (
                              <tr key={a.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm">{new Date(a.fecha).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-sm font-medium text-green-600">
                                  {a.fecha_terminado ? new Date(a.fecha_terminado).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium">{op?.nombre}</td>
                                <td className="px-4 py-3 text-sm">{a.talla}</td>
                                <td className="px-4 py-3 text-sm font-semibold">{a.cantidad}</td>
                                <td className="px-4 py-3 text-sm">${op?.costo.toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm font-bold text-green-600">
                                  ${parseFloat(a.monto).toLocaleString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan="5" className="px-4 py-3 text-right font-bold">
                              TOTAL {emp.nombre}:
                            </td>
                            <td className="px-4 py-3 font-bold text-lg text-green-600">
                              ${emp.monto.toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })}

              {/* Total general */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg opacity-90">TOTAL GENERAL PERÍODO</p>
                    <p className="text-sm opacity-75">
                      Del {new Date(filtroFechaInicio).toLocaleDateString()} al {new Date(filtroFechaFin).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-5xl font-bold">
                    ${nominaFiltrada.reduce((sum, r) => sum + r.monto, 0).toLocaleString()}
                  </p>
                </div>
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
