const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

// Configuración de Supabase
const supabaseUrl = 'https://bqnekvkahkyvsanarfdb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY; // Esta es la variable que configuraste en Render
const supabase = createClient(supabaseUrl, supabaseKey);

// Ruta de prueba inicial
app.get('/', (req, res) => {
    res.json({ mensaje: "Servidor de La Patrona activo y corriendo correctamente 🚀" });
});

// Ruta para registrar usuarios (esto es lo que faltaba)
app.post('/api/usuarios', async (req, res) => {
    try {
        const { cedula, nombre_completo, telefono, parroquia, password, rol } = req.body;
        
        const { data, error } = await supabase
            .from('usuarios')
            .insert([{ 
                cedula: cedula, 
                nombre_completo: nombre_completo, 
                telefono: telefono, 
                parroquia: parroquia, 
                password_hash: password,
                rol: rol 
            }]);

        if (error) throw error;

        res.json({ mensaje: "Usuario registrado con éxito en La Patrona", data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor activo y escuchando en el puerto ${PORT}`);
});
