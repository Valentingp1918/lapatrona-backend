server.js
const express = require('express');
const { createClient } = require('@supabase/supabase-client');

const app = express();
app.use(express.json());

// Conexión directa con tu Supabase
const supabaseUrl = 'https://bqnekvkahkyvsanarfdb.supabase.co';
const supabaseKey = 'TU_LLAVE_ANON_DE_SUPABASE'; // <-- Reemplaza esto con tu clave larga 'anon public'
const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/', (req, res) => {
    res.json({ mensaje: "Servidor de La Patrona activo y corriendo correctamente 🚀" });
});

app.post('/api/usuarios', async (req, res) => {
    const { cedula, nombre_completo, telefono, parroquia, password, rol } = req.body;

    if (!cedula || !nombre_completo || !password) {
        return res.status(400).json({ error: "Cédula, nombre y contraseña son obligatorios." });
    }

    try {
        const { data, error } = await supabase
            .from('usuarios')
            .insert([
                { 
                    cedula, 
                    nombre_completo, 
                    telefono, 
                    parroquia, 
                    password_hash: password, 
                    rol: rol || 'ciclista' 
                }
            ])
            .select();

        if (error) throw error;

        res.status(201).json({ mensaje: "Usuario registrado con éxito en La Patrona", usuario: data[0] });
    } catch (error) {
        res.status(500).json({ error: "Error en el registro", detalles: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
