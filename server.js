const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

// Configuración de Supabase
const supabase = createClient(
    'https://bqnekvkahkyvsanarfdb.supabase.co', 
    'sb_publishable__VnYSSwPbXC5obSOXZc8uA_YuDu1XyI'
);
const SECRET_KEY = 'TuClaveSecretaSuperSegura'; 

// --- RUTA: LOGIN CON LOGS DE DEPURACIÓN ---
app.post('/api/login', async (req, res) => {
    const { cedula, password } = req.body;
    
    console.log("Intento de login para cedula:", cedula);

    const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('cedula', cedula)
        .single();

    if (error) {
        console.error("Error en Supabase:", error);
        return res.status(401).json({ mensaje: "Error de conexión con la BD" });
    }
    
    if (!usuario) {
        console.warn("Usuario no encontrado:", cedula);
        return res.status(401).json({ mensaje: "Cédula no registrada" });
    }

    // Verificación de password
    const coincide = await bcrypt.compare(password, usuario.password_hash);
    if (!coincide) {
        console.warn("Password incorrecto para:", cedula);
        return res.status(401).json({ mensaje: "Password incorrecto" });
    }

    const token = jwt.sign({ id: usuario.id_usuario }, SECRET_KEY, { expiresIn: '1h' });
    console.log("Login exitoso para:", cedula);
    res.json({ mensaje: "Login exitoso", token });
});

// --- RUTA: TRASPASOS (PROTEGIDA) ---
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ mensaje: "Token requerido" });
    
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ mensaje: "Token inválido" });
        req.usuarioId = decoded.id;
        next();
    });
};

app.post('/api/traspasos', verificarToken, async (req, res) => {
    const { id_bici, id_comprador } = req.body;
    const { data, error } = await supabase
        .from('traspasos')
        .insert([{ id_bici, id_vendedor: req.usuarioId, id_comprador }]);
        
    if (error) return res.status(400).json({ error: error.message });
    res.json({ mensaje: "Traspaso registrado" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
