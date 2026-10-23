import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

function useForm(initial) {
  const [form, setForm] = useState(initial);
  const bind = (name) => ({ name, value: form[name], onChange: (e) => setForm({ ...form, [name]: e.target.value }) });
  return [form, bind];
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, bind] = useForm({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(form.email, form.password);
      const staff = user.rol === 'admin' || user.rol === 'empleado';
      navigate(location.state?.from || (staff ? '/admin' : '/tienda'), { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <Logo />
        <h1>Ingresar</h1>
        <label>Email<input className="input" type="email" required autoComplete="email" {...bind('email')} /></label>
        <label>Contraseña<input className="input" type="password" required autoComplete="current-password" {...bind('password')} /></label>
        {error && <p className="alert alert-error">{error}</p>}
        <button className="btn btn-lg btn-block">Ingresar</button>
        <p className="muted small center">
          ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
        </p>
        <details className="demo-users">
          <summary>Usuarios de prueba</summary>
          <ul className="small">
            <li><b>Admin:</b> admin@boxbox.com / Admin123!</li>
            <li><b>Empleado:</b> empleado@boxbox.com / Empleado123!</li>
            <li><b>Cliente:</b> cliente@boxbox.com / Cliente123!</li>
          </ul>
        </details>
      </form>
    </div>
  );
}

export function Registro() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, bind] = useForm({ nombre: '', apellido: '', email: '', password: '', confirm: '', telefono: '', direccion: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden');
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password))
      return setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
    try {
      const { confirm, ...data } = form;
      await register(data);
      navigate('/tienda', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <Logo />
        <h1>Crear cuenta</h1>
        <div className="row-2">
          <label>Nombre<input className="input" required {...bind('nombre')} /></label>
          <label>Apellido<input className="input" required {...bind('apellido')} /></label>
        </div>
        <label>Email<input className="input" type="email" required autoComplete="email" {...bind('email')} /></label>
        <div className="row-2">
          <label>Contraseña<input className="input" type="password" required autoComplete="new-password" {...bind('password')} /></label>
          <label>Repetir contraseña<input className="input" type="password" required autoComplete="new-password" {...bind('confirm')} /></label>
        </div>
        <p className="muted small">Mínimo 8 caracteres, con mayúscula, minúscula y número.</p>
        <div className="row-2">
          <label>Teléfono<input className="input" {...bind('telefono')} /></label>
          <label>Dirección<input className="input" {...bind('direccion')} /></label>
        </div>
        {error && <p className="alert alert-error">{error}</p>}
        <button className="btn btn-lg btn-block">Registrarme</button>
        <p className="muted small center">
          ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
        </p>
      </form>
    </div>
  );
}
