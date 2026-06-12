const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

// CONFIGURACIÓN - REEMPLAZA CON TUS DATOS DE SUPABASE
const supabase = createClient('https://xyz.supabase.co', 'sb_publishable__VnYSSwPbXC5obSOXZc8uA_YuDu1XyI);
const SECRET_KEY = 'TuClaveSecretaSuperSegura'; 

// --- MIDDLEWARE DE SEGURIDAD ---
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ mensaje: "Token requerido" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ mensaje: "Token inválido" });
        req.usuarioId = decoded.id;
        next();
    });
};

// --- RUTA: LOGIN ---
app.post('/api/login', async (req, res) => {
    const { cedula, password } = req.body;
    
    const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('cedula', cedula)
        .single();

    if (error || !usuario) return res.status(401).json({ mensaje: "Usuario no encontrado" });

    const coincide = await bcrypt.compare(password, usuario.password_hash);
    if (!coincide) return res.status(401).json({ mensaje: "Contraseña incorrecta" });

    const token = jwt.sign({ id: usuario.id_usuario }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ mensaje: "Login exitoso", token });
});

// --- RUTA: TRASPASO (Protegida) ---
app.post('/api/traspasos', verificarToken, async (req, res) => {
    const { id_bici, id_comprador } = req.body;
    const id_vendedor = req.usuarioId; 

    const { data, error } = await supabase
        .from('traspasos')
        .insert([{ id_bici, id_vendedor, id_comprador }]);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ mensaje: "Traspaso de La Patrona completado con éxito" });
});

// --- RUTA: HISTORIAL ---
app.get('/api/traspasos/:id_bici', async (req, res) => {
    const { id_bici } = req.params;
    const { data, error } = await supabase
        .from('traspasos')
        .select(`id_traspaso, fecha_traspaso, vendedor:usuarios!traspasos_id_vendedor_fkey(nombre_completo), comprador:usuarios!traspasos_id_comprador_fkey(nombre_completo)`)
        .eq('id_bici', id_bici);
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
